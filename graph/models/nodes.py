"""
Pydantic Node Models — Graph vertices for the Knowledge Graph.

Each node type maps to a real-world entity that the MatchAnalyzer
traverses when building reasoning paths.
"""

from __future__ import annotations

from datetime import date, datetime, timezone
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, computed_field


# ─── Enums ───────────────────────────────────────────────

class FormResult(str, Enum):
    WIN = "W"
    DRAW = "D"
    LOSS = "L"


class InjuryStatus(str, Enum):
    FIT = "fit"
    DOUBTFUL = "doubtful"
    OUT = "out"
    SUSPENDED = "suspended"


class TipOutcome(str, Enum):
    PENDING = "pending"
    WON = "won"
    LOST = "lost"
    VOID = "void"


class WeatherCondition(str, Enum):
    CLEAR = "clear"
    CLOUDY = "cloudy"
    RAINY = "rainy"
    SNOWY = "snowy"
    WINDY = "windy"
    STORMY = "stormy"


# ─── Team Node ───────────────────────────────────────────

class TeamStats(BaseModel):
    """Aggregated performance metrics for a team."""
    attack_rating: float = Field(ge=0, le=100, description="Offensive strength 0-100")
    defense_rating: float = Field(ge=0, le=100, description="Defensive strength 0-100")
    goals_scored_avg: float = Field(ge=0, description="Avg goals scored per match")
    goals_conceded_avg: float = Field(ge=0, description="Avg goals conceded per match")
    possession_avg: float = Field(ge=0, le=100, description="Avg possession %")
    xg_for: float = Field(ge=0, default=0, description="Expected goals for (xG)")
    xg_against: float = Field(ge=0, default=0, description="Expected goals against (xGA)")


class Team(BaseModel):
    """
    Team node — represents a football club with its current form and stats.
    Node ID pattern: team:{sportsdb_id}
    """
    id: str = Field(description="TheSportsDB team ID")
    name: str
    short_name: Optional[str] = None
    league: str
    country: str
    stadium: Optional[str] = None
    stadium_capacity: Optional[int] = None
    badge_url: Optional[str] = None
    form: list[FormResult] = Field(default_factory=list, max_length=10, description="Last N results")
    ranking: Optional[int] = None
    points: Optional[int] = None
    stats: Optional[TeamStats] = None

    @computed_field
    @property
    def node_id(self) -> str:
        return f"team:{self.id}"

    @computed_field
    @property
    def form_score(self) -> float:
        """Weighted form score (recent matches count more). 0-100 scale."""
        if not self.form:
            return 50.0
        weights = [1.0 + 0.3 * i for i in range(len(self.form))]
        weights.reverse()  # Most recent = highest weight
        values = {"W": 3.0, "D": 1.0, "L": 0.0}
        total = sum(values[r.value] * w for r, w in zip(self.form, weights))
        max_total = sum(3.0 * w for w in weights)
        return round((total / max_total) * 100, 1) if max_total > 0 else 50.0


# ─── Player Node ─────────────────────────────────────────

class PlayerPerformance(BaseModel):
    """Season-level performance metrics."""
    goals: int = 0
    assists: int = 0
    minutes_played: int = 0
    matches_played: int = 0
    yellow_cards: int = 0
    red_cards: int = 0
    rating_avg: Optional[float] = Field(None, ge=0, le=10, description="Avg match rating 0-10")


class Player(BaseModel):
    """
    Player node — individual athlete with injury/fitness status.
    Node ID pattern: player:{sportsdb_id}
    """
    id: str
    name: str
    team_id: str = Field(description="FK to Team.id")
    position: str = Field(description="GK, DEF, MID, FWD")
    nationality: Optional[str] = None
    age: Optional[int] = None
    injury_status: InjuryStatus = InjuryStatus.FIT
    injury_detail: Optional[str] = None
    importance: str = Field(default="Medium", description="High / Medium / Low — impact on team")
    performance: Optional[PlayerPerformance] = None

    @computed_field
    @property
    def node_id(self) -> str:
        return f"player:{self.id}"

    @computed_field
    @property
    def is_available(self) -> bool:
        return self.injury_status == InjuryStatus.FIT


# ─── Match Node ──────────────────────────────────────────

class MatchVenue(BaseModel):
    """Venue + weather context for a match."""
    stadium: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    temperature_c: Optional[float] = None
    weather: Optional[WeatherCondition] = None
    wind_kph: Optional[float] = None
    humidity_pct: Optional[float] = None
    rain_chance_pct: Optional[float] = None


class MatchOdds(BaseModel):
    """Bookmaker odds snapshot."""
    home_win: Optional[float] = None
    draw: Optional[float] = None
    away_win: Optional[float] = None
    over_2_5: Optional[float] = None
    btts_yes: Optional[float] = None


class MatchNode(BaseModel):
    """
    Match node — a fixture with full context (venue, weather, odds).
    Node ID pattern: match:{fixture_id}
    """
    id: str = Field(description="Fixture ID (from API-Football or TheSportsDB)")
    home_team_id: str
    away_team_id: str
    league: str
    match_date: date
    kick_off: Optional[str] = None  # HH:MM
    status: str = Field(default="NS", description="NS, LIVE, FT, etc.")
    venue: Optional[MatchVenue] = None
    odds: Optional[MatchOdds] = None
    # Results (filled post-match)
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    is_historical: bool = False

    @computed_field
    @property
    def node_id(self) -> str:
        return f"match:{self.id}"

    @computed_field
    @property
    def is_finished(self) -> bool:
        return self.home_score is not None and self.away_score is not None

    @computed_field
    @property
    def result(self) -> Optional[str]:
        if not self.is_finished:
            return None
        if self.home_score > self.away_score:
            return "home_win"
        elif self.home_score < self.away_score:
            return "away_win"
        return "draw"


# ─── Tip Node ────────────────────────────────────────────

class ReasoningStep(BaseModel):
    """One step in the explainable reasoning path."""
    source_node: str = Field(description="Node ID traversed (e.g. team:1234)")
    insight: str = Field(description="What was learned from this node")
    weight: float = Field(ge=0, le=1.0, default=0.5, description="Importance of this step")


class Tip(BaseModel):
    """
    Tip node — a generated prediction with full reasoning trace.
    Node ID pattern: tip:{match_id}_{market}
    """
    match_id: str
    market: str = Field(description="1X2, BTTS, Over/Under 2.5, etc.")
    selection: str = Field(description="The predicted outcome (e.g. '1', 'Yes', 'Over 2.5')")
    confidence: float = Field(ge=0, le=100, description="Confidence score 0-100")
    odds_estimated: Optional[float] = None
    ev_score: Optional[float] = Field(None, description="Expected Value: (prob * odds) - 1")
    reasoning_path: list[ReasoningStep] = Field(default_factory=list)
    outcome: TipOutcome = TipOutcome.PENDING
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @computed_field
    @property
    def node_id(self) -> str:
        return f"tip:{self.match_id}_{self.market}"

    @computed_field
    @property
    def reasoning_summary(self) -> str:
        if not self.reasoning_path:
            return "No reasoning path available."
        steps = [f"  [{s.weight:.0%}] {s.insight}" for s in self.reasoning_path]
        return f"Reasoning ({len(steps)} steps):\n" + "\n".join(steps)
