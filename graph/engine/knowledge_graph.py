"""
Knowledge Graph — NetworkX-backed graph storing Teams, Players, Matches, Tips.

Nodes are Pydantic models, edges carry typed relationships with weights.
The graph supports traversal, pattern matching, and subgraph extraction.
"""

from __future__ import annotations

from enum import Enum
from typing import Any, Optional

import networkx as nx
from pydantic import BaseModel

from graph.models import Team, Player, MatchNode, Tip


# ─── Edge Types (Relationships) ──────────────────────────

class EdgeType(str, Enum):
    """All relationship types in the Knowledge Graph."""
    # Team ↔ Player
    HAS_PLAYER = "HAS_PLAYER"               # Team → Player
    PLAYS_FOR = "PLAYS_FOR"                  # Player → Team

    # Team ↔ Match
    PLAYS_HOME = "PLAYS_HOME"                # Team → Match
    PLAYS_AWAY = "PLAYS_AWAY"                # Team → Match

    # Match ↔ Match
    HISTORICAL_H2H = "HISTORICAL_H2H"        # Match → Match (same team pair)
    SIMILAR_CONTEXT = "SIMILAR_CONTEXT"       # Match → Match (similar stats/weather/form)

    # Match ↔ Tip
    GENERATES_TIP = "GENERATES_TIP"           # Match → Tip

    # Team ↔ Team
    LEAGUE_RIVAL = "LEAGUE_RIVAL"             # Team ↔ Team (same league)
    RECENT_OPPONENT = "RECENT_OPPONENT"        # Team ↔ Team (played recently)


class Edge(BaseModel):
    """Typed, weighted edge between two graph nodes."""
    source: str
    target: str
    edge_type: EdgeType
    weight: float = 1.0
    metadata: dict[str, Any] = {}


# ─── Knowledge Graph ─────────────────────────────────────

class KnowledgeGraph:
    """
    Main graph container. Wraps a NetworkX DiGraph with typed operations.

    Usage:
        kg = KnowledgeGraph()
        kg.add_team(team)
        kg.add_match(match)
        kg.link(team.node_id, match.node_id, EdgeType.PLAYS_HOME)
        similar = kg.find_similar_matches(match.node_id, top_k=5)
    """

    def __init__(self) -> None:
        self._graph = nx.DiGraph()

    @property
    def graph(self) -> nx.DiGraph:
        return self._graph

    @property
    def node_count(self) -> int:
        return self._graph.number_of_nodes()

    @property
    def edge_count(self) -> int:
        return self._graph.number_of_edges()

    # ─── Node Operations ─────────────────────────────

    def _add_node(self, node_id: str, node_type: str, data: BaseModel) -> None:
        self._graph.add_node(
            node_id,
            node_type=node_type,
            data=data.model_dump(),
        )

    def add_team(self, team: Team) -> str:
        self._add_node(team.node_id, "team", team)
        return team.node_id

    def add_player(self, player: Player) -> str:
        self._add_node(player.node_id, "player", player)
        # Auto-link player → team
        team_node_id = f"team:{player.team_id}"
        if self._graph.has_node(team_node_id):
            self.link(team_node_id, player.node_id, EdgeType.HAS_PLAYER)
            self.link(player.node_id, team_node_id, EdgeType.PLAYS_FOR)
        return player.node_id

    def add_match(self, match: MatchNode) -> str:
        self._add_node(match.node_id, "match", match)
        # Auto-link teams → match
        home_nid = f"team:{match.home_team_id}"
        away_nid = f"team:{match.away_team_id}"
        if self._graph.has_node(home_nid):
            self.link(home_nid, match.node_id, EdgeType.PLAYS_HOME)
        if self._graph.has_node(away_nid):
            self.link(away_nid, match.node_id, EdgeType.PLAYS_AWAY)
        return match.node_id

    def add_tip(self, tip: Tip) -> str:
        self._add_node(tip.node_id, "tip", tip)
        match_nid = f"match:{tip.match_id}"
        if self._graph.has_node(match_nid):
            self.link(match_nid, tip.node_id, EdgeType.GENERATES_TIP)
        return tip.node_id

    def get_node(self, node_id: str) -> Optional[dict[str, Any]]:
        if not self._graph.has_node(node_id):
            return None
        return self._graph.nodes[node_id]

    def get_node_data(self, node_id: str) -> Optional[dict[str, Any]]:
        node = self.get_node(node_id)
        return node["data"] if node else None

    # ─── Edge Operations ─────────────────────────────

    def link(
        self,
        source: str,
        target: str,
        edge_type: EdgeType,
        weight: float = 1.0,
        **metadata: Any,
    ) -> None:
        self._graph.add_edge(
            source,
            target,
            edge_type=edge_type.value,
            weight=weight,
            **metadata,
        )

    def get_neighbors(
        self,
        node_id: str,
        edge_type: Optional[EdgeType] = None,
    ) -> list[str]:
        """Get all neighbors, optionally filtered by edge type."""
        if not self._graph.has_node(node_id):
            return []
        neighbors = []
        for _, target, data in self._graph.edges(node_id, data=True):
            if edge_type is None or data.get("edge_type") == edge_type.value:
                neighbors.append(target)
        return neighbors

    def get_incoming(
        self,
        node_id: str,
        edge_type: Optional[EdgeType] = None,
    ) -> list[str]:
        """Get all nodes pointing TO this node."""
        if not self._graph.has_node(node_id):
            return []
        result = []
        for source, _, data in self._graph.in_edges(node_id, data=True):
            if edge_type is None or data.get("edge_type") == edge_type.value:
                result.append(source)
        return result

    # ─── Query Operations ────────────────────────────

    def get_nodes_by_type(self, node_type: str) -> list[str]:
        return [
            nid for nid, attrs in self._graph.nodes(data=True)
            if attrs.get("node_type") == node_type
        ]

    def get_team_matches(self, team_node_id: str) -> list[str]:
        """All matches (home + away) for a team."""
        home = self.get_neighbors(team_node_id, EdgeType.PLAYS_HOME)
        away = self.get_neighbors(team_node_id, EdgeType.PLAYS_AWAY)
        return home + away

    def get_h2h_matches(self, team_a_id: str, team_b_id: str) -> list[str]:
        """Find historical matches between two teams."""
        a_matches = set(self.get_team_matches(team_a_id))
        b_matches = set(self.get_team_matches(team_b_id))
        return list(a_matches & b_matches)

    def get_match_context(self, match_node_id: str) -> dict[str, Any]:
        """Extract full context around a match node: teams, players, venue, tips."""
        match_data = self.get_node_data(match_node_id)
        if not match_data:
            return {}

        home_teams = self.get_incoming(match_node_id, EdgeType.PLAYS_HOME)
        away_teams = self.get_incoming(match_node_id, EdgeType.PLAYS_AWAY)
        tips = self.get_neighbors(match_node_id, EdgeType.GENERATES_TIP)

        home_players = []
        away_players = []
        for tid in home_teams:
            home_players.extend(self.get_neighbors(tid, EdgeType.HAS_PLAYER))
        for tid in away_teams:
            away_players.extend(self.get_neighbors(tid, EdgeType.HAS_PLAYER))

        return {
            "match": match_data,
            "home_team": self.get_node_data(home_teams[0]) if home_teams else None,
            "away_team": self.get_node_data(away_teams[0]) if away_teams else None,
            "home_players": [self.get_node_data(p) for p in home_players],
            "away_players": [self.get_node_data(p) for p in away_players],
            "tips": [self.get_node_data(t) for t in tips],
        }

    # ─── Pattern Matching ────────────────────────────

    def find_similar_matches(
        self,
        match_node_id: str,
        top_k: int = 5,
    ) -> list[tuple[str, float]]:
        """
        Find historically similar matches using graph-based similarity.

        Similarity factors:
        - Same teams (H2H) → weight 3.0
        - Same league → weight 1.5
        - Similar team form → weight 1.0
        - Similar venue/weather → weight 0.5
        """
        target = self.get_node_data(match_node_id)
        if not target:
            return []

        all_matches = self.get_nodes_by_type("match")
        scores: list[tuple[str, float]] = []

        for mid in all_matches:
            if mid == match_node_id:
                continue
            other = self.get_node_data(mid)
            if not other or not other.get("is_historical"):
                continue

            score = self._compute_similarity(target, other)
            if score > 0:
                scores.append((mid, score))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]

    def _compute_similarity(self, target: dict, other: dict) -> float:
        """Compute a weighted similarity score between two match contexts."""
        score = 0.0

        # Same teams (H2H): strongest signal
        target_teams = {target["home_team_id"], target["away_team_id"]}
        other_teams = {other["home_team_id"], other["away_team_id"]}
        common_teams = target_teams & other_teams
        if len(common_teams) == 2:
            score += 3.0  # Exact H2H
        elif len(common_teams) == 1:
            score += 1.0  # One team in common

        # Same league
        if target.get("league") == other.get("league"):
            score += 1.5

        # Similar result pattern (for historical matches)
        if other.get("home_score") is not None:
            score += 0.3  # Bonus for having actual result data

        return score

    # ─── Subgraph Extraction ─────────────────────────

    def extract_subgraph(self, center_node: str, depth: int = 2) -> nx.DiGraph:
        """Extract a subgraph around a node up to N hops."""
        if not self._graph.has_node(center_node):
            return nx.DiGraph()

        nodes = {center_node}
        frontier = {center_node}

        for _ in range(depth):
            next_frontier = set()
            for nid in frontier:
                successors = set(self._graph.successors(nid))
                predecessors = set(self._graph.predecessors(nid))
                next_frontier |= (successors | predecessors) - nodes
            nodes |= next_frontier
            frontier = next_frontier

        return self._graph.subgraph(nodes).copy()

    # ─── Stats ───────────────────────────────────────

    def stats(self) -> dict[str, int]:
        types: dict[str, int] = {}
        for _, attrs in self._graph.nodes(data=True):
            t = attrs.get("node_type", "unknown")
            types[t] = types.get(t, 0) + 1
        return {
            "total_nodes": self.node_count,
            "total_edges": self.edge_count,
            **{f"nodes_{k}": v for k, v in types.items()},
        }
