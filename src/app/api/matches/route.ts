import { NextRequest, NextResponse } from 'next/server'
import { Match, LeagueGroup, DateFilter } from '@/types'
import { getTodayMatches, getPriorityMatches } from '@/services/football'

// Ordre de priorité des ligues pour le tri
const LEAGUE_PRIORITY: string[] = [
  'Champions League',
  'UEFA Champions League',
  'Europa League',
  'UEFA Europa League',
  'Ligue 1',
  'Premier League',
  'La Liga',
  'Serie A',
  'Bundesliga',
]

/**
 * Formate la date courte pour l'affichage
 */
function formatDateShort(filter: DateFilter): string {
  const today = new Date()

  let targetDate: Date
  switch (filter) {
    case 'tomorrow':
      targetDate = new Date(today)
      targetDate.setDate(today.getDate() + 1)
      break
    case 'day-after':
      targetDate = new Date(today)
      targetDate.setDate(today.getDate() + 2)
      break
    case 'today':
    default:
      targetDate = today
  }

  return targetDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Groupe les matchs par ligue
 */
function groupMatchesByLeague(matches: Match[]): LeagueGroup[] {
  const grouped: Record<string, Match[]> = {}

  for (const match of matches) {
    if (!grouped[match.league]) {
      grouped[match.league] = []
    }
    grouped[match.league].push(match)
  }

  // Convertir en tableau et trier par priorité
  const leagueGroups: LeagueGroup[] = Object.entries(grouped).map(([league, matches]) => ({
    league,
    matches: matches.sort((a, b) => {
      // Trier par timestamp si disponible, sinon par time string
      if (a.timestamp && b.timestamp) {
        return a.timestamp - b.timestamp
      }
      return a.time.localeCompare(b.time)
    }),
  }))

  // Trier les ligues par priorité
  leagueGroups.sort((a, b) => {
    const aIndex = LEAGUE_PRIORITY.findIndex(l => a.league.includes(l))
    const bIndex = LEAGUE_PRIORITY.findIndex(l => b.league.includes(l))

    if (aIndex !== -1 && bIndex === -1) return -1
    if (aIndex === -1 && bIndex !== -1) return 1
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex

    return a.league.localeCompare(b.league)
  })

  return leagueGroups
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateFilter = (searchParams.get('date') || 'today') as DateFilter
    const priorityOnly = searchParams.get('priority') === 'true'

    const shortDate = formatDateShort(dateFilter)

    console.log('='.repeat(60))
    console.log('⚽ MATCHES API - API-Football Request')
    console.log('='.repeat(60))
    console.log(`📅 Filter: ${dateFilter}`)
    console.log(`🎯 Priority only: ${priorityOnly}`)

    // Note: Pour l'instant, API-Football ne supporte que "today"
    // Pour tomorrow/day-after, on pourrait étendre le service
    if (dateFilter !== 'today') {
      console.log('⚠️ API-Football: seul "today" est supporté pour le moment')
      return NextResponse.json({
        success: true,
        date: shortDate,
        total: 0,
        leagues: [],
        message: 'Seuls les matchs du jour sont disponibles avec API-Football',
      })
    }

    // Récupérer les matchs depuis API-Football
    const matches = priorityOnly
      ? await getPriorityMatches()
      : await getTodayMatches()

    if (matches.length === 0) {
      console.log('⚠️ Aucun match trouvé')
      return NextResponse.json({
        success: true,
        date: shortDate,
        total: 0,
        leagues: [],
        message: 'Aucun match trouvé pour aujourd\'hui',
      })
    }

    // Enrichir les matchs avec la date formatée
    const enrichedMatches: Match[] = matches.map((m) => ({
      ...m,
      date: shortDate,
    }))

    // Grouper par ligue
    const leagues = groupMatchesByLeague(enrichedMatches)

    console.log('='.repeat(60))
    console.log(`📊 TOTAL: ${enrichedMatches.length} matchs trouvés`)
    leagues.forEach(lg => {
      console.log(`   🏆 ${lg.league}: ${lg.matches.length} match(es)`)
    })
    console.log('='.repeat(60))

    return NextResponse.json({
      success: true,
      date: shortDate,
      total: enrichedMatches.length,
      leagues,
    })

  } catch (error) {
    console.error('❌ Matches API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur serveur',
        leagues: [],
      },
      { status: 500 }
    )
  }
}
