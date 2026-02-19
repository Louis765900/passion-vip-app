"""
Data Ingestion Service — Fetches data from TheSportsDB and the PronoScope
site API, then converts it into graph-ready node dicts.

This bridges the external APIs with the KnowledgeGraph.
"""

from __future__ import annotations

import logging
from datetime import date
from typing import Any, Optional

import httpx

logger = logging.getLogger("shannon.ingestion")

# ─── API Configuration ────────────────────────────────────

THESPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json"
THESPORTSDB_KEY = "123"
THESPORTSDB_URL = f"{THESPORTSDB_BASE}/{THESPORTSDB_KEY}"

PRONOSPORT_BASE = "https://pronoscope.vercel.app/api"

WEATHERAPI_BASE = "http://api.weatherapi.com/v1"
WEATHERAPI_KEY = "fcd009de0dc94dc5b08194357261102"

NOMINATIM_BASE = "https://nominatim.openstreetmap.org"
NOMINATIM_HEADERS = {"User-Agent": "ShannonGraph/1.0 (contact@pronoscope.app)"}


class DataIngestionService:
    """
    Async service that fetches and normalizes data from external APIs
    into graph-compatible node dictionaries.
    """

    def __init__(self, client: httpx.AsyncClient | None = None) -> None:
        self._client = client or httpx.AsyncClient(timeout=30.0)
        self._owns_client = client is None

    async def close(self) -> None:
        if self._owns_client:
            await self._client.aclose()

    # ─── TheSportsDB ─────────────────────────────────

    async def search_team(self, team_name: str) -> Optional[dict[str, Any]]:
        """Search TheSportsDB for a team, return normalized Team dict."""
        try:
            resp = await self._client.get(
                f"{THESPORTSDB_URL}/searchteams.php",
                params={"t": team_name},
            )
            resp.raise_for_status()
            data = resp.json()
            teams = data.get("teams")
            if not teams:
                return None

            t = teams[0]
            return {
                "id": t["idTeam"],
                "name": t["strTeam"],
                "short_name": t.get("strTeamShort"),
                "league": t.get("strLeague", ""),
                "country": t.get("strCountry", ""),
                "stadium": t.get("strStadium"),
                "stadium_capacity": _safe_int(t.get("intStadiumCapacity")),
                "badge_url": t.get("strTeamBadge"),
            }
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                logger.warning("TheSportsDB rate limit hit")
            raise
        except Exception as e:
            logger.error(f"Error searching team '{team_name}': {e}")
            return None

    async def get_next_events(self, team_id: str) -> list[dict[str, Any]]:
        """Get upcoming matches for a team from TheSportsDB."""
        try:
            resp = await self._client.get(
                f"{THESPORTSDB_URL}/eventsnext.php",
                params={"id": team_id},
            )
            resp.raise_for_status()
            data = resp.json()
            events = data.get("events") or []

            return [
                {
                    "id": e["idEvent"],
                    "home_team_id": e.get("idHomeTeam", ""),
                    "away_team_id": e.get("idAwayTeam", ""),
                    "league": e.get("strLeague", ""),
                    "match_date": e.get("dateEvent", str(date.today())),
                    "kick_off": (e.get("strTime") or "")[:5] or None,
                    "status": "NS",
                }
                for e in events
            ]
        except Exception as e:
            logger.error(f"Error fetching next events for team {team_id}: {e}")
            return []

    async def get_last_events(self, team_id: str) -> list[dict[str, Any]]:
        """Get past matches for a team from TheSportsDB (for H2H / form)."""
        try:
            resp = await self._client.get(
                f"{THESPORTSDB_URL}/eventslast.php",
                params={"id": team_id},
            )
            resp.raise_for_status()
            data = resp.json()
            events = data.get("results") or []

            return [
                {
                    "id": e["idEvent"],
                    "home_team_id": e.get("idHomeTeam", ""),
                    "away_team_id": e.get("idAwayTeam", ""),
                    "league": e.get("strLeague", ""),
                    "match_date": e.get("dateEvent", str(date.today())),
                    "kick_off": (e.get("strTime") or "")[:5] or None,
                    "status": "FT",
                    "home_score": _safe_int(e.get("intHomeScore")),
                    "away_score": _safe_int(e.get("intAwayScore")),
                    "is_historical": True,
                }
                for e in events
            ]
        except Exception as e:
            logger.error(f"Error fetching last events for team {team_id}: {e}")
            return []

    async def get_league_table(self, league_id: str) -> list[dict[str, Any]]:
        """Get standings from TheSportsDB, returns list sorted by rank."""
        try:
            resp = await self._client.get(
                f"{THESPORTSDB_URL}/lookuptable.php",
                params={"l": league_id},
            )
            resp.raise_for_status()
            data = resp.json()
            table = data.get("table") or []

            return [
                {
                    "team_name": row.get("strTeam", ""),
                    "badge_url": row.get("strTeamBadge"),
                    "ranking": _safe_int(row.get("intRank")),
                    "points": _safe_int(row.get("intPoints")),
                    "played": _safe_int(row.get("intPlayed")),
                    "wins": _safe_int(row.get("intWin")),
                    "draws": _safe_int(row.get("intDraw")),
                    "losses": _safe_int(row.get("intLoss")),
                    "goals_for": _safe_int(row.get("intGoalsFor")),
                    "goals_against": _safe_int(row.get("intGoalsAgainst")),
                }
                for row in table
            ]
        except Exception as e:
            logger.error(f"Error fetching league table {league_id}: {e}")
            return []

    # ─── PronoScope Site API ──────────────────────────

    async def get_site_matches(self, date_filter: str = "today") -> list[dict[str, Any]]:
        """Fetch matches from the PronoScope API."""
        try:
            resp = await self._client.get(
                f"{PRONOSPORT_BASE}/matches",
                params={"date": date_filter, "priority": "true"},
            )
            resp.raise_for_status()
            data = resp.json()

            if not data.get("success"):
                return []

            matches = []
            for league_group in data.get("leagues", []):
                for m in league_group.get("matches", []):
                    matches.append({
                        "id": str(m.get("id", "")),
                        "home_team_id": "",  # Resolved via TheSportsDB search
                        "away_team_id": "",
                        "league": m.get("league", league_group.get("league", "")),
                        "match_date": m.get("date", str(date.today())),
                        "kick_off": m.get("time"),
                        "status": m.get("status", "NS"),
                        "_home_team_name": m.get("homeTeam", ""),
                        "_away_team_name": m.get("awayTeam", ""),
                        "_home_team_logo": m.get("homeTeamLogo"),
                        "_away_team_logo": m.get("awayTeamLogo"),
                    })
            return matches
        except Exception as e:
            logger.error(f"Error fetching site matches: {e}")
            return []

    # ─── WeatherAPI ──────────────────────────────────

    async def get_weather(self, city: str) -> Optional[dict[str, Any]]:
        """Get current weather for a city, returns venue-compatible dict."""
        try:
            resp = await self._client.get(
                f"{WEATHERAPI_BASE}/current.json",
                params={"key": WEATHERAPI_KEY, "q": city},
            )
            resp.raise_for_status()
            data = resp.json()
            current = data.get("current", {})
            condition_text = current.get("condition", {}).get("text", "").lower()

            # Map WeatherAPI condition to our enum
            weather = "clear"
            if "rain" in condition_text or "drizzle" in condition_text:
                weather = "rainy"
            elif "snow" in condition_text:
                weather = "snowy"
            elif "cloud" in condition_text or "overcast" in condition_text:
                weather = "cloudy"
            elif "thunder" in condition_text or "storm" in condition_text:
                weather = "stormy"

            return {
                "temperature_c": current.get("temp_c"),
                "weather": weather,
                "wind_kph": current.get("wind_kph"),
                "humidity_pct": current.get("humidity"),
            }
        except Exception as e:
            logger.error(f"Error fetching weather for '{city}': {e}")
            return None

    # ─── Nominatim Geocoding ─────────────────────────

    async def geocode(self, query: str) -> Optional[dict[str, float]]:
        """Geocode a location string to lat/lon."""
        try:
            resp = await self._client.get(
                f"{NOMINATIM_BASE}/search",
                params={"q": query, "format": "json", "limit": "1"},
                headers=NOMINATIM_HEADERS,
            )
            resp.raise_for_status()
            results = resp.json()
            if not results:
                return None
            return {
                "latitude": float(results[0]["lat"]),
                "longitude": float(results[0]["lon"]),
            }
        except Exception as e:
            logger.error(f"Error geocoding '{query}': {e}")
            return None

    # ─── Full Match Enrichment ───────────────────────

    async def enrich_match(self, match_data: dict[str, Any]) -> dict[str, Any]:
        """
        Full enrichment pipeline for a match:
        1. Resolve team IDs via TheSportsDB
        2. Fetch weather for the venue city
        3. Geocode the stadium
        4. Build complete venue context
        """
        home_name = match_data.pop("_home_team_name", "")
        away_name = match_data.pop("_away_team_name", "")
        match_data.pop("_home_team_logo", None)
        match_data.pop("_away_team_logo", None)

        home_team = None
        away_team = None

        # Resolve teams
        if home_name:
            home_team = await self.search_team(home_name)
            if home_team:
                match_data["home_team_id"] = home_team["id"]
        if away_name:
            away_team = await self.search_team(away_name)
            if away_team:
                match_data["away_team_id"] = away_team["id"]

        # Weather + Geo for venue
        stadium = None
        city = None
        if home_team:
            stadium = home_team.get("stadium")
            city = home_team.get("country")  # Fallback

        if stadium:
            geo = await self.geocode(f"{stadium}, {city or ''}")
            weather = await self.get_weather(stadium) if stadium else None

            venue = {
                "stadium": stadium,
                "city": city,
                "country": home_team.get("country") if home_team else None,
            }
            if geo:
                venue.update(geo)
            if weather:
                venue.update(weather)

            match_data["venue"] = venue

        return {
            "match": match_data,
            "home_team": home_team,
            "away_team": away_team,
        }


# ─── Helpers ──────────────────────────────────────────────

def _safe_int(val: Any) -> Optional[int]:
    if val is None:
        return None
    try:
        return int(val)
    except (ValueError, TypeError):
        return None
