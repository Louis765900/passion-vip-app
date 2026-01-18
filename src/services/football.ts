import { Match } from '@/types'

const API_HOST = process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io'
const API_KEY = process.env.API_FOOTBALL_KEY || ''

// Leagues prioritaires (IDs API-Football)
const PRIORITY_LEAGUES = [
  39,   // Premier League
  140,  // La Liga
  135,  // Serie A
  78,   // Bundesliga
  61,   // Ligue 1
  2,    // Champions League
  3,    // Europa League
  848,  // Conference League
  15,   // FIFA World Cup
]

interface APIFixture {
  fixture: {
    id: number
    date: string
    timestamp: number
    status: {
      short: string
      long: string
    }
  }
  league: {
    id: number
    name: string
    country: string
    logo: string
  }
  teams: {
    home: {
      id: number
      name: string
      logo: string
    }
    away: {
      id: number
      name: string
      logo: string
    }
  }
  goals: {
    home: number | null
    away: number | null
  }
}

interface APIResponse {
  response: APIFixture[]
  errors: Record<string, string>
  results: number
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris'
  })
}

export async function getTodayMatches(): Promise<Match[]> {
  if (!API_KEY) {
    console.error('API_FOOTBALL_KEY is not configured')
    return []
  }

  const today = formatDate(new Date())

  try {
    const response = await fetch(
      `https://${API_HOST}/fixtures?date=${today}`,
      {
        method: 'GET',
        headers: {
          'x-apisports-key': API_KEY,
          'x-apisports-host': API_HOST,
        },
        next: { revalidate: 300 } // Cache 5 minutes
      }
    )

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`)
      return []
    }

    const data: APIResponse = await response.json()

    if (data.errors && Object.keys(data.errors).length > 0) {
      console.error('API Errors:', data.errors)
      return []
    }

    // Filtrer et transformer les matchs
    const matches: Match[] = data.response
      .filter((fixture) => {
        // Garder uniquement les matchs pas encore joués ou en cours
        const status = fixture.fixture.status.short
        return ['NS', 'TBD', '1H', 'HT', '2H', 'ET', 'P', 'LIVE'].includes(status)
      })
      .map((fixture) => ({
        id: fixture.fixture.id.toString(),
        homeTeam: fixture.teams.home.name,
        awayTeam: fixture.teams.away.name,
        homeTeamLogo: fixture.teams.home.logo,
        awayTeamLogo: fixture.teams.away.logo,
        league: fixture.league.name,
        leagueLogo: fixture.league.logo,
        date: fixture.fixture.date.split('T')[0],
        time: formatTime(fixture.fixture.date),
        timestamp: fixture.fixture.timestamp,
        status: fixture.fixture.status.short,
        isPriority: PRIORITY_LEAGUES.includes(fixture.league.id),
      }))
      // Trier : ligues prioritaires d'abord, puis par heure
      .sort((a, b) => {
        if (a.isPriority && !b.isPriority) return -1
        if (!a.isPriority && b.isPriority) return 1
        return a.timestamp - b.timestamp
      })

    return matches
  } catch (error) {
    console.error('Error fetching matches:', error)
    return []
  }
}

export async function getMatchesByLeague(leagueId: number): Promise<Match[]> {
  if (!API_KEY) {
    console.error('API_FOOTBALL_KEY is not configured')
    return []
  }

  const today = formatDate(new Date())

  try {
    const response = await fetch(
      `https://${API_HOST}/fixtures?league=${leagueId}&date=${today}`,
      {
        method: 'GET',
        headers: {
          'x-apisports-key': API_KEY,
          'x-apisports-host': API_HOST,
        },
        next: { revalidate: 300 }
      }
    )

    if (!response.ok) {
      return []
    }

    const data: APIResponse = await response.json()

    return data.response
      .filter((fixture) => {
        const status = fixture.fixture.status.short
        return ['NS', 'TBD', '1H', 'HT', '2H', 'ET', 'P', 'LIVE'].includes(status)
      })
      .map((fixture) => ({
        id: fixture.fixture.id.toString(),
        homeTeam: fixture.teams.home.name,
        awayTeam: fixture.teams.away.name,
        homeTeamLogo: fixture.teams.home.logo,
        awayTeamLogo: fixture.teams.away.logo,
        league: fixture.league.name,
        leagueLogo: fixture.league.logo,
        date: fixture.fixture.date.split('T')[0],
        time: formatTime(fixture.fixture.date),
        timestamp: fixture.fixture.timestamp,
        status: fixture.fixture.status.short,
        isPriority: PRIORITY_LEAGUES.includes(fixture.league.id),
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
  } catch (error) {
    console.error('Error fetching league matches:', error)
    return []
  }
}

// Récupérer uniquement les ligues prioritaires
export async function getPriorityMatches(): Promise<Match[]> {
  if (!API_KEY) {
    console.error('API_FOOTBALL_KEY is not configured')
    return []
  }

  const today = formatDate(new Date())

  try {
    // Faire les appels en parallèle pour chaque ligue prioritaire
    const promises = PRIORITY_LEAGUES.map(leagueId =>
      fetch(
        `https://${API_HOST}/fixtures?league=${leagueId}&date=${today}`,
        {
          method: 'GET',
          headers: {
            'x-apisports-key': API_KEY,
            'x-apisports-host': API_HOST,
          },
          next: { revalidate: 300 }
        }
      ).then(res => res.ok ? res.json() : { response: [] })
    )

    const results = await Promise.all(promises)

    const allMatches: Match[] = results
      .flatMap((data: APIResponse) => data.response || [])
      .filter((fixture) => {
        const status = fixture.fixture.status.short
        return ['NS', 'TBD', '1H', 'HT', '2H', 'ET', 'P', 'LIVE'].includes(status)
      })
      .map((fixture) => ({
        id: fixture.fixture.id.toString(),
        homeTeam: fixture.teams.home.name,
        awayTeam: fixture.teams.away.name,
        homeTeamLogo: fixture.teams.home.logo,
        awayTeamLogo: fixture.teams.away.logo,
        league: fixture.league.name,
        leagueLogo: fixture.league.logo,
        date: fixture.fixture.date.split('T')[0],
        time: formatTime(fixture.fixture.date),
        timestamp: fixture.fixture.timestamp,
        status: fixture.fixture.status.short,
        isPriority: true,
      }))
      .sort((a, b) => a.timestamp - b.timestamp)

    return allMatches
  } catch (error) {
    console.error('Error fetching priority matches:', error)
    return []
  }
}
