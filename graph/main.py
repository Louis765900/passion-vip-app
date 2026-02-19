"""
Shannon Knowledge Graph — FastAPI Entry Point

Endpoints:
  GET  /health              Health check + graph stats
  POST /analyze             Full match analysis with reasoning path
  POST /analyze/quick       Quick analysis from team names only
  GET  /graph/stats         Graph node/edge statistics
  POST /ingest/team         Ingest a team into the graph
  POST /ingest/match        Ingest a match into the graph
  GET  /site/matches        Fetch today's matches from PronoScope
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from graph.engine.knowledge_graph import KnowledgeGraph
from graph.engine.analyzer import MatchAnalyzer
from graph.services.ingestion import DataIngestionService

logger = logging.getLogger("shannon")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")

# ─── Shared State ─────────────────────────────────────────

kg = KnowledgeGraph()
analyzer = MatchAnalyzer(kg)
ingestion: DataIngestionService | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global ingestion
    ingestion = DataIngestionService()
    logger.info("Shannon Knowledge Graph started")
    yield
    await ingestion.close()
    logger.info("Shannon Knowledge Graph stopped")


# ─── App ──────────────────────────────────────────────────

app = FastAPI(
    title="Shannon Knowledge Graph",
    description="Graph-based intelligence engine for sports betting predictions",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://pronoscope.vercel.app",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request/Response Models ─────────────────────────────

class TeamInput(BaseModel):
    id: str
    name: str
    league: str = ""
    country: str = ""
    form: list[str] = Field(default_factory=list, description="W/D/L list")
    ranking: int | None = None
    stadium: str | None = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": "133604",
                "name": "Paris Saint-Germain",
                "league": "Ligue 1",
                "country": "France",
                "form": ["W", "W", "D", "W", "L"],
                "ranking": 1,
            }
        }


class MatchInput(BaseModel):
    id: str
    home_team_id: str
    away_team_id: str
    league: str = ""
    match_date: str = Field(description="YYYY-MM-DD")
    kick_off: str | None = None
    status: str = "NS"
    venue: dict[str, Any] | None = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": "98765",
                "home_team_id": "133604",
                "away_team_id": "133610",
                "league": "Ligue 1",
                "match_date": "2026-02-15",
                "kick_off": "21:00",
            }
        }


class AnalyzeRequest(BaseModel):
    match: MatchInput
    home_team: TeamInput
    away_team: TeamInput
    h2h_history: list[dict[str, Any]] = Field(default_factory=list)
    home_players: list[dict[str, Any]] = Field(default_factory=list)
    away_players: list[dict[str, Any]] = Field(default_factory=list)


class QuickAnalyzeRequest(BaseModel):
    home_team_name: str = Field(description="e.g. 'Paris Saint-Germain'")
    away_team_name: str = Field(description="e.g. 'Olympique de Marseille'")
    league: str = ""
    match_date: str = Field(default="", description="YYYY-MM-DD (optional)")

    class Config:
        json_schema_extra = {
            "example": {
                "home_team_name": "Paris Saint-Germain",
                "away_team_name": "Olympique de Marseille",
                "league": "Ligue 1",
            }
        }


# ─── Routes ──────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "engine": "Shannon Knowledge Graph v0.1.0",
        "graph": kg.stats(),
    }


@app.get("/graph/stats")
async def graph_stats():
    return kg.stats()


@app.post("/ingest/team")
async def ingest_team(team: TeamInput):
    node_id = analyzer.ingest_team(team.model_dump())
    return {"node_id": node_id, "graph_stats": kg.stats()}


@app.post("/ingest/match")
async def ingest_match(match: MatchInput):
    node_id = analyzer.ingest_match(match.model_dump())
    return {"node_id": node_id, "graph_stats": kg.stats()}


@app.post("/analyze")
async def analyze_match(req: AnalyzeRequest):
    """Full analysis with all provided data."""
    # Ingest match into graph first
    match_nid = analyzer.ingest_match(req.match.model_dump())

    result = analyzer.analyze(
        match_id=match_nid,
        home_team=req.home_team.model_dump(),
        away_team=req.away_team.model_dump(),
        h2h_history=req.h2h_history or None,
        home_players=req.home_players or None,
        away_players=req.away_players or None,
    )

    return result


@app.post("/analyze/quick")
async def quick_analyze(req: QuickAnalyzeRequest):
    """
    Quick analysis from team names only.
    Fetches team data from TheSportsDB automatically.
    """
    if not ingestion:
        raise HTTPException(503, "Ingestion service not ready")

    # Step 1: Resolve teams via TheSportsDB
    home_team = await ingestion.search_team(req.home_team_name)
    if not home_team:
        raise HTTPException(404, f"Team not found: {req.home_team_name}")

    away_team = await ingestion.search_team(req.away_team_name)
    if not away_team:
        raise HTTPException(404, f"Team not found: {req.away_team_name}")

    # Step 2: Fetch H2H (last events for both teams)
    home_history = await ingestion.get_last_events(home_team["id"])
    away_history = await ingestion.get_last_events(away_team["id"])

    # Extract form from recent results
    home_form = _extract_form(home_history, home_team["id"])
    away_form = _extract_form(away_history, away_team["id"])
    home_team["form"] = home_form
    away_team["form"] = away_form

    # Step 3: Build match node
    from datetime import date as date_type
    match_data = {
        "id": f"quick_{home_team['id']}_{away_team['id']}",
        "home_team_id": home_team["id"],
        "away_team_id": away_team["id"],
        "league": req.league or home_team.get("league", ""),
        "match_date": req.match_date or str(date_type.today()),
        "status": "NS",
    }

    # Step 4: Weather for home stadium
    if home_team.get("stadium"):
        weather = await ingestion.get_weather(home_team["stadium"])
        if weather:
            match_data["venue"] = {
                "stadium": home_team["stadium"],
                "city": home_team.get("country"),
                **weather,
            }

    # Step 5: Find H2H matches between the two teams
    h2h_matches = [
        m for m in home_history
        if m.get("away_team_id") == away_team["id"] or m.get("home_team_id") == away_team["id"]
    ]

    # Step 6: Run analysis
    match_nid = analyzer.ingest_match(match_data)
    result = analyzer.analyze(
        match_id=match_nid,
        home_team=home_team,
        away_team=away_team,
        h2h_history=h2h_matches or None,
    )

    return result


@app.get("/site/matches")
async def get_site_matches(date: str = "today"):
    """Proxy to fetch matches from the PronoScope site API."""
    if not ingestion:
        raise HTTPException(503, "Ingestion service not ready")

    matches = await ingestion.get_site_matches(date)
    return {
        "count": len(matches),
        "matches": matches,
    }


@app.post("/site/analyze")
async def analyze_site_match(match_index: int = 0, date: str = "today"):
    """
    Fetch a match from the PronoScope site and run full analysis.
    """
    if not ingestion:
        raise HTTPException(503, "Ingestion service not ready")

    matches = await ingestion.get_site_matches(date)
    if not matches:
        raise HTTPException(404, "No matches found for this date")
    if match_index >= len(matches):
        raise HTTPException(400, f"match_index {match_index} out of range (0-{len(matches) - 1})")

    raw_match = matches[match_index]
    enriched = await ingestion.enrich_match(raw_match)

    if not enriched["home_team"] or not enriched["away_team"]:
        raise HTTPException(422, "Could not resolve both teams via TheSportsDB")

    match_nid = analyzer.ingest_match(enriched["match"])
    result = analyzer.analyze(
        match_id=match_nid,
        home_team=enriched["home_team"],
        away_team=enriched["away_team"],
    )

    return result


# ─── Helpers ──────────────────────────────────────────────

def _extract_form(history: list[dict[str, Any]], team_id: str) -> list[str]:
    """Extract W/D/L form from historical matches."""
    form = []
    for m in history[:5]:
        hs = m.get("home_score")
        aws = m.get("away_score")
        if hs is None or aws is None:
            continue
        is_home = m.get("home_team_id") == team_id
        if is_home:
            if hs > aws:
                form.append("W")
            elif hs < aws:
                form.append("L")
            else:
                form.append("D")
        else:
            if aws > hs:
                form.append("W")
            elif aws < hs:
                form.append("L")
            else:
                form.append("D")
    return form
