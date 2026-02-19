import { API_CONFIG } from '@/lib/config/apis'

// ==========================================
// TheSportsDB Service (V1 - Clé 123)
// ==========================================

const config = API_CONFIG.theSportsDB

export interface SportsDBTeam {
  idTeam: string
  strTeam: string
  strTeamShort: string
  strAlternate: string
  strLeague: string
  strStadium: string
  strStadiumThumb: string
  strStadiumLocation: string
  intStadiumCapacity: string
  strCountry: string
  strTeamBadge: string
  strTeamBanner: string
  strDescriptionFR: string | null
  strDescriptionEN: string | null
}

export interface SportsDBEvent {
  idEvent: string
  strEvent: string
  strLeague: string
  strHomeTeam: string
  strAwayTeam: string
  dateEvent: string
  strTime: string
  strTimestamp: string
  strThumb: string | null
  strStatus: string | null
  intHomeScore: string | null
  intAwayScore: string | null
  strHomeTeamBadge: string
  strAwayTeamBadge: string
}

export interface SportsDBStanding {
  idStanding: string
  strTeam: string
  strTeamBadge: string
  intPlayed: string
  intWin: string
  intDraw: string
  intLoss: string
  intGoalsFor: string
  intGoalsAgainst: string
  intGoalDifference: string
  intPoints: string
  intRank: string
}

class TheSportsDBError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public isRateLimit: boolean = false
  ) {
    super(message)
    this.name = 'TheSportsDBError'
  }
}

async function fetchSportsDB<T>(endpoint: string): Promise<T> {
  const url = `${config.url}/${endpoint}`

  const response = await fetch(url, {
    next: { revalidate: 300 },
  })

  if (response.status === 429) {
    throw new TheSportsDBError(
      `Rate limit atteint. Réessayez dans ${config.rateLimit.retryAfterMs / 1000}s.`,
      429,
      true
    )
  }

  if (!response.ok) {
    throw new TheSportsDBError(
      `TheSportsDB API error: ${response.status} ${response.statusText}`,
      response.status
    )
  }

  return response.json()
}

/**
 * Recherche une équipe par nom
 */
export async function searchTeam(teamName: string): Promise<SportsDBTeam[]> {
  const data = await fetchSportsDB<{ teams: SportsDBTeam[] | null }>(
    `searchteams.php?t=${encodeURIComponent(teamName)}`
  )
  return data.teams || []
}

/**
 * Prochains matchs d'une équipe (par ID)
 */
export async function getNextEvents(teamId: string): Promise<SportsDBEvent[]> {
  const data = await fetchSportsDB<{ events: SportsDBEvent[] | null }>(
    `eventsnext.php?id=${teamId}`
  )
  return data.events || []
}

/**
 * Classement d'une ligue (par ID)
 */
export async function getLeagueTable(leagueId: string): Promise<SportsDBStanding[]> {
  const data = await fetchSportsDB<{ table: SportsDBStanding[] | null }>(
    `lookuptable.php?l=${leagueId}`
  )
  return data.table || []
}

/**
 * Derniers résultats d'une équipe (par ID)
 */
export async function getLastEvents(teamId: string): Promise<SportsDBEvent[]> {
  const data = await fetchSportsDB<{ results: SportsDBEvent[] | null }>(
    `eventslast.php?id=${teamId}`
  )
  return data.results || []
}

/**
 * Détails d'une équipe par ID
 */
export async function getTeamById(teamId: string): Promise<SportsDBTeam | null> {
  const data = await fetchSportsDB<{ teams: SportsDBTeam[] | null }>(
    `lookupteam.php?id=${teamId}`
  )
  return data.teams?.[0] || null
}

/**
 * Détails d'un événement par ID
 */
export async function getEventById(eventId: string): Promise<SportsDBEvent | null> {
  const data = await fetchSportsDB<{ events: SportsDBEvent[] | null }>(
    `lookupevent.php?id=${eventId}`
  )
  return data.events?.[0] || null
}

/**
 * Extraire la forme W/D/L depuis les derniers résultats
 */
export function extractForm(events: SportsDBEvent[], teamId: string): string[] {
  const form: string[] = []
  for (const e of events.slice(0, 5)) {
    const hs = e.intHomeScore ? parseInt(e.intHomeScore) : null
    const as_ = e.intAwayScore ? parseInt(e.intAwayScore) : null
    if (hs === null || as_ === null) continue

    const isHome = e.strHomeTeam === teamId || events[0]?.strHomeTeam === e.strHomeTeam
    if (isHome) {
      form.push(hs > as_ ? 'W' : hs < as_ ? 'L' : 'D')
    } else {
      form.push(as_ > hs ? 'W' : as_ < hs ? 'L' : 'D')
    }
  }
  return form
}

/**
 * Test de connectivité TheSportsDB
 */
export async function testConnection(): Promise<{ ok: boolean; message: string; data?: unknown }> {
  try {
    const teams = await searchTeam('Paris Saint-Germain')
    return {
      ok: true,
      message: `Connecté - ${teams.length} résultat(s) pour "Paris Saint-Germain"`,
      data: teams[0] ? { id: teams[0].idTeam, name: teams[0].strTeam } : null,
    }
  } catch (error) {
    if (error instanceof TheSportsDBError && error.isRateLimit) {
      return { ok: false, message: `Rate limit (429): ${error.message}` }
    }
    return { ok: false, message: `Erreur: ${error instanceof Error ? error.message : String(error)}` }
  }
}
