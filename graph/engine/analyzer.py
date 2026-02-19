"""
MatchAnalyzer — The agentic reasoning loop.

Takes a target match, populates the graph with relevant data,
traverses it to find patterns, and outputs a Tip with a full
ReasoningPath explaining WHY the prediction was made.
"""

from __future__ import annotations

import logging
from typing import Any

from graph.models import MatchNode, Team, Tip
from graph.engine.knowledge_graph import KnowledgeGraph, EdgeType
from graph.engine.reasoning import ReasoningEngine, ReasoningContext

logger = logging.getLogger("shannon.analyzer")


class MatchAnalyzer:
    """
    Agentic loop:
    1. Receive match data (from site API or manual input)
    2. Populate the KnowledgeGraph with teams, players, H2H
    3. Traverse the graph collecting signals
    4. Run the ReasoningEngine to synthesize a prediction
    5. Return a Tip with full reasoning path
    """

    def __init__(self, kg: KnowledgeGraph | None = None) -> None:
        self.kg = kg or KnowledgeGraph()
        self.reasoning = ReasoningEngine()

    # ─── Graph Population ────────────────────────────

    def ingest_team(self, team_data: dict[str, Any]) -> str:
        """Ingest raw team data dict into the graph. Returns node_id."""
        team = Team(**team_data)
        return self.kg.add_team(team)

    def ingest_match(self, match_data: dict[str, Any]) -> str:
        """Ingest raw match data dict into the graph. Returns node_id."""
        match = MatchNode(**match_data)
        return self.kg.add_match(match)

    def ingest_historical_matches(
        self,
        matches: list[dict[str, Any]],
        home_team_id: str,
        away_team_id: str,
    ) -> list[str]:
        """Ingest H2H historical matches and link them."""
        node_ids = []
        for m in matches:
            m["is_historical"] = True
            nid = self.ingest_match(m)
            node_ids.append(nid)

        # Link H2H matches to each other
        for i, nid_a in enumerate(node_ids):
            for nid_b in node_ids[i + 1:]:
                self.kg.link(nid_a, nid_b, EdgeType.HISTORICAL_H2H, weight=0.8)
                self.kg.link(nid_b, nid_a, EdgeType.HISTORICAL_H2H, weight=0.8)

        return node_ids

    # ─── Analysis Pipeline ───────────────────────────

    def analyze(
        self,
        match_id: str,
        home_team: dict[str, Any],
        away_team: dict[str, Any],
        h2h_history: list[dict[str, Any]] | None = None,
        home_players: list[dict[str, Any]] | None = None,
        away_players: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        """
        Full analysis pipeline for a single match.

        Args:
            match_id: Node ID of the match already in the graph (e.g. "match:12345")
            home_team: Team dict for the home side
            away_team: Team dict for the away side
            h2h_history: List of historical match dicts
            home_players: List of home team player dicts
            away_players: List of away team player dicts

        Returns:
            {
                "tip": Tip model dict,
                "reasoning": ReasoningContext summary,
                "graph_stats": graph statistics,
                "similar_matches": top similar matches found,
            }
        """
        logger.info(f"Analyzing match {match_id}")

        # Step 1: Ensure teams are in the graph
        home_nid = self.ingest_team(home_team)
        away_nid = self.ingest_team(away_team)

        # Step 2: Ingest H2H if provided
        if h2h_history:
            self.ingest_historical_matches(
                h2h_history,
                home_team["id"],
                away_team["id"],
            )

        # Step 3: Ingest players
        if home_players:
            from graph.models import Player
            for p in home_players:
                player = Player(**p)
                self.kg.add_player(player)
        if away_players:
            from graph.models import Player
            for p in away_players:
                player = Player(**p)
                self.kg.add_player(player)

        # Step 4: Get match context from graph
        match_context = self.kg.get_match_context(match_id)
        match_data = self.kg.get_node_data(match_id)

        # Step 5: Run reasoning engine
        ctx = ReasoningContext()

        self.reasoning.analyze_team_form(ctx, home_team, "home")
        self.reasoning.analyze_team_form(ctx, away_team, "away")

        # H2H analysis from graph
        h2h_match_ids = self.kg.get_h2h_matches(home_nid, away_nid)
        h2h_data = [self.kg.get_node_data(mid) for mid in h2h_match_ids if self.kg.get_node_data(mid)]
        self.reasoning.analyze_h2h(ctx, h2h_data, home_team["id"])

        # Player analysis
        self.reasoning.analyze_players(
            ctx,
            match_context.get("home_players", []),
            home_team["name"],
            "home",
        )
        self.reasoning.analyze_players(
            ctx,
            match_context.get("away_players", []),
            away_team["name"],
            "away",
        )

        # Venue & Weather
        if match_data:
            self.reasoning.analyze_venue_weather(ctx, match_data)

        # Step 6: Synthesize prediction
        synthesis = self.reasoning.synthesize(ctx)

        # Step 7: Map direction to 1X2 selection
        selection_map = {"home": "1", "draw": "N", "away": "2"}
        selection = selection_map[synthesis["direction"]]

        # Step 8: Find similar historical matches
        similar = self.kg.find_similar_matches(match_id, top_k=5)
        similar_details = []
        for sim_id, sim_score in similar:
            sim_data = self.kg.get_node_data(sim_id)
            if sim_data:
                similar_details.append({
                    "match_id": sim_id,
                    "score": round(sim_score, 2),
                    "result": sim_data.get("result"),
                    "home_score": sim_data.get("home_score"),
                    "away_score": sim_data.get("away_score"),
                })

        # Step 9: Build Tip
        raw_match_id = match_id.replace("match:", "")
        tip = Tip(
            match_id=raw_match_id,
            market="1X2",
            selection=selection,
            confidence=synthesis["confidence"],
            reasoning_path=ctx.steps,
        )
        self.kg.add_tip(tip)

        logger.info(
            f"Analysis complete: {selection} ({synthesis['confidence']:.1f}% confidence) "
            f"— {len(ctx.steps)} reasoning steps"
        )

        return {
            "tip": tip.model_dump(),
            "synthesis": synthesis,
            "reasoning_steps": [s.model_dump() for s in ctx.steps],
            "similar_matches": similar_details,
            "graph_stats": self.kg.stats(),
        }

    # ─── Quick Analysis (minimal data) ───────────────

    def quick_analyze(
        self,
        match_data: dict[str, Any],
        home_team: dict[str, Any],
        away_team: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Simplified analysis with minimal data.
        Ingests the match + teams and runs the reasoning loop.
        """
        match_nid = self.ingest_match(match_data)
        return self.analyze(
            match_id=match_nid,
            home_team=home_team,
            away_team=away_team,
        )
