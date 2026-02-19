"""
Reasoning Engine — Builds explainable reasoning paths by traversing the graph.

The engine walks from a target match outward, collecting insights from
connected nodes (teams, players, H2H history, weather) and assigns
weighted scores to each step.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from graph.models import ReasoningStep, FormResult, InjuryStatus


@dataclass
class ReasoningContext:
    """Accumulates insights during graph traversal."""
    steps: list[ReasoningStep] = field(default_factory=list)
    confidence_factors: list[float] = field(default_factory=list)
    signals: dict[str, Any] = field(default_factory=dict)

    def add_step(self, source_node: str, insight: str, weight: float = 0.5) -> None:
        self.steps.append(ReasoningStep(
            source_node=source_node,
            insight=insight,
            weight=min(max(weight, 0.0), 1.0),
        ))
        self.confidence_factors.append(weight)

    @property
    def overall_confidence(self) -> float:
        """Weighted average of all confidence factors, scaled to 0-100."""
        if not self.confidence_factors:
            return 50.0
        weighted = sum(self.confidence_factors) / len(self.confidence_factors)
        return round(weighted * 100, 1)


class ReasoningEngine:
    """
    Traverses the Knowledge Graph to build a reasoning path for a match.

    Pipeline:
    1. Analyze home team form
    2. Analyze away team form
    3. Check H2H history
    4. Check key player availability
    5. Factor in venue & weather
    6. Synthesize into prediction signal
    """

    def analyze_team_form(
        self,
        ctx: ReasoningContext,
        team_data: dict[str, Any] | None,
        role: str,  # "home" or "away"
    ) -> None:
        if not team_data:
            return

        node_id = f"team:{team_data['id']}"
        name = team_data["name"]
        form = team_data.get("form", [])
        ranking = team_data.get("ranking")
        stats = team_data.get("stats")

        # Form analysis
        if form:
            recent = form[:5]
            wins = sum(1 for r in recent if r == FormResult.WIN.value)
            losses = sum(1 for r in recent if r == FormResult.LOSS.value)
            form_str = "".join(recent)

            if wins >= 4:
                ctx.add_step(node_id, f"{name} ({role}) en excellente forme: {form_str} ({wins}V/5)", 0.85)
                ctx.signals[f"{role}_form"] = "excellent"
            elif wins >= 3:
                ctx.add_step(node_id, f"{name} ({role}) en bonne forme: {form_str} ({wins}V/5)", 0.7)
                ctx.signals[f"{role}_form"] = "good"
            elif losses >= 4:
                ctx.add_step(node_id, f"{name} ({role}) en très mauvaise forme: {form_str} ({losses}D/5)", 0.8)
                ctx.signals[f"{role}_form"] = "terrible"
            else:
                ctx.add_step(node_id, f"{name} ({role}) forme mitigée: {form_str}", 0.4)
                ctx.signals[f"{role}_form"] = "mixed"

        # Ranking
        if ranking:
            ctx.add_step(node_id, f"{name} classé {ranking}e du championnat", 0.3)
            ctx.signals[f"{role}_ranking"] = ranking

        # Stats
        if stats:
            attack = stats.get("attack_rating", 50)
            defense = stats.get("defense_rating", 50)
            if attack > 75:
                ctx.add_step(node_id, f"{name} attaque puissante (rating: {attack}/100)", 0.6)
            if defense > 75:
                ctx.add_step(node_id, f"{name} défense solide (rating: {defense}/100)", 0.6)

    def analyze_h2h(
        self,
        ctx: ReasoningContext,
        h2h_matches: list[dict[str, Any]],
        home_team_id: str,
    ) -> None:
        if not h2h_matches:
            ctx.add_step("graph:h2h", "Aucun historique H2H trouvé", 0.2)
            return

        home_wins = 0
        away_wins = 0
        draws = 0
        total_goals = 0

        for m in h2h_matches:
            hs = m.get("home_score")
            aws = m.get("away_score")
            if hs is None or aws is None:
                continue
            total_goals += hs + aws
            if m.get("home_team_id") == home_team_id:
                if hs > aws:
                    home_wins += 1
                elif hs < aws:
                    away_wins += 1
                else:
                    draws += 1
            else:
                if aws > hs:
                    home_wins += 1
                elif aws < hs:
                    away_wins += 1
                else:
                    draws += 1

        total = home_wins + away_wins + draws
        if total == 0:
            return

        avg_goals = round(total_goals / total, 1)

        ctx.add_step(
            "graph:h2h",
            f"H2H ({total} matchs): {home_wins}V-{draws}N-{away_wins}D, moy. {avg_goals} buts/match",
            0.7,
        )
        ctx.signals["h2h_home_wins"] = home_wins
        ctx.signals["h2h_away_wins"] = away_wins
        ctx.signals["h2h_avg_goals"] = avg_goals

        if avg_goals > 2.5:
            ctx.add_step("graph:h2h", f"Tendance buts élevés dans les confrontations ({avg_goals}/match)", 0.6)
            ctx.signals["h2h_high_scoring"] = True

    def analyze_players(
        self,
        ctx: ReasoningContext,
        players: list[dict[str, Any]],
        team_name: str,
        role: str,
    ) -> None:
        if not players:
            return

        key_absent = [
            p for p in players
            if p.get("injury_status") in (InjuryStatus.OUT.value, InjuryStatus.SUSPENDED.value)
            and p.get("importance") == "High"
        ]
        doubtful = [
            p for p in players
            if p.get("injury_status") == InjuryStatus.DOUBTFUL.value
            and p.get("importance") == "High"
        ]

        if key_absent:
            names = ", ".join(p["name"] for p in key_absent)
            ctx.add_step(
                f"team:{players[0]['team_id']}",
                f"{team_name}: absences majeures — {names}",
                0.75,
            )
            ctx.signals[f"{role}_key_absences"] = len(key_absent)

        if doubtful:
            names = ", ".join(p["name"] for p in doubtful)
            ctx.add_step(
                f"team:{players[0]['team_id']}",
                f"{team_name}: joueurs incertains — {names}",
                0.4,
            )

    def analyze_venue_weather(
        self,
        ctx: ReasoningContext,
        match_data: dict[str, Any],
    ) -> None:
        venue = match_data.get("venue")
        if not venue:
            return

        stadium = venue.get("stadium")
        city = venue.get("city")
        temp = venue.get("temperature_c")
        weather = venue.get("weather")
        wind = venue.get("wind_kph")
        rain = venue.get("rain_chance_pct")

        node_id = f"match:{match_data['id']}"

        if stadium and city:
            ctx.add_step(node_id, f"Lieu: {stadium}, {city}", 0.2)

        if temp is not None:
            if temp < 5:
                ctx.add_step(node_id, f"Conditions froides ({temp}°C) — peut affecter le jeu", 0.4)
                ctx.signals["cold_weather"] = True
            elif temp > 32:
                ctx.add_step(node_id, f"Chaleur extrême ({temp}°C) — risque de fatigue", 0.4)
                ctx.signals["hot_weather"] = True

        if rain and rain > 60:
            ctx.add_step(node_id, f"Forte probabilité de pluie ({rain}%) — terrain glissant", 0.5)
            ctx.signals["rainy"] = True

        if wind and wind > 40:
            ctx.add_step(node_id, f"Vent fort ({wind} km/h) — jeu long perturbé", 0.4)
            ctx.signals["windy"] = True

    def synthesize(self, ctx: ReasoningContext) -> dict[str, Any]:
        """
        Read accumulated signals and produce a prediction direction.

        Returns:
            {
                "direction": "home" | "away" | "draw",
                "confidence": float (0-100),
                "key_factors": list[str],
            }
        """
        home_score = 0.0
        away_score = 0.0

        # Form signals
        form_map = {"excellent": 2.0, "good": 1.0, "mixed": 0.0, "terrible": -2.0}
        home_score += form_map.get(ctx.signals.get("home_form", "mixed"), 0)
        away_score += form_map.get(ctx.signals.get("away_form", "mixed"), 0)

        # Ranking advantage
        hr = ctx.signals.get("home_ranking")
        ar = ctx.signals.get("away_ranking")
        if hr and ar:
            if hr < ar:
                home_score += 0.5
            elif ar < hr:
                away_score += 0.5

        # H2H
        h2h_hw = ctx.signals.get("h2h_home_wins", 0)
        h2h_aw = ctx.signals.get("h2h_away_wins", 0)
        if h2h_hw > h2h_aw:
            home_score += 1.0
        elif h2h_aw > h2h_hw:
            away_score += 1.0

        # Key absences penalize
        home_score -= ctx.signals.get("home_key_absences", 0) * 0.8
        away_score -= ctx.signals.get("away_key_absences", 0) * 0.8

        # Home advantage baseline
        home_score += 0.4

        # Determine direction
        diff = home_score - away_score
        if diff > 1.5:
            direction = "home"
        elif diff < -1.5:
            direction = "away"
        else:
            direction = "draw" if abs(diff) < 0.5 else ("home" if diff > 0 else "away")

        # Key factors summary
        key_factors = [s.insight for s in ctx.steps if s.weight >= 0.6]

        return {
            "direction": direction,
            "confidence": ctx.overall_confidence,
            "home_score": round(home_score, 2),
            "away_score": round(away_score, 2),
            "key_factors": key_factors[:5],
        }
