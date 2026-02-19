import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { Redis } from '@upstash/redis'
import { ServerBet } from '@/types'

export const dynamic = 'force-dynamic'

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_KV_REST_API_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN
const footballKey = process.env.API_FOOTBALL_KEY
const footballHost = process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io'

interface FixtureResult {
  fixture: {
    id: number
    status: { short: string }
  }
  teams: {
    home: { name: string; winner: boolean | null }
    away: { name: string; winner: boolean | null }
  }
  goals: { home: number | null; away: number | null }
  score: {
    fulltime: { home: number | null; away: number | null }
  }
}

/**
 * Determine si un pari est gagne ou perdu a partir du resultat du match
 */
function determineBetResult(bet: ServerBet, match: FixtureResult): 'won' | 'lost' | 'pending' {
  const status = match.fixture.status.short
  if (!['FT', 'AET', 'PEN'].includes(status)) {
    return 'pending'
  }

  const homeGoals = match.goals.home ?? 0
  const awayGoals = match.goals.away ?? 0
  const market = bet.market.toLowerCase()
  const selection = bet.selection.toLowerCase()

  // BTTS (les deux equipes marquent)
  if (market.includes('btts') || market.includes('deux equipes marquent') || market.includes('les deux')) {
    const bttsYes = homeGoals > 0 && awayGoals > 0
    if (selection.includes('oui') || selection.includes('yes')) {
      return bttsYes ? 'won' : 'lost'
    }
    if (selection.includes('non') || selection.includes('no')) {
      return !bttsYes ? 'won' : 'lost'
    }
  }

  // Over/Under
  const totalGoals = homeGoals + awayGoals
  if (market.includes('over') || market.includes('plus de')) {
    const line = parseFloat(market.match(/[\d.]+/)?.[0] || '2.5')
    return totalGoals > line ? 'won' : 'lost'
  }
  if (market.includes('under') || market.includes('moins de')) {
    const line = parseFloat(market.match(/[\d.]+/)?.[0] || '2.5')
    return totalGoals < line ? 'won' : 'lost'
  }

  // Double Chance
  if (market.includes('double chance')) {
    const homeWon = match.teams.home.winner
    const awayWon = match.teams.away.winner
    const isDraw = !homeWon && !awayWon

    if (selection.includes('1x') || (selection.includes(match.teams.home.name.toLowerCase().slice(0, 4)) && selection.includes('nul'))) {
      return (homeWon || isDraw) ? 'won' : 'lost'
    }
    if (selection.includes('x2') || (selection.includes(match.teams.away.name.toLowerCase().slice(0, 4)) && selection.includes('nul'))) {
      return (awayWon || isDraw) ? 'won' : 'lost'
    }
    if (selection.includes('12')) {
      return (homeWon || awayWon) ? 'won' : 'lost'
    }
  }

  // 1N2 (resultat exact)
  const homeWon = match.teams.home.winner
  const awayWon = match.teams.away.winner

  if (selection === '1' || selection.includes(match.teams.home.name.toLowerCase().slice(0, 5))) {
    return homeWon ? 'won' : 'lost'
  }
  if (selection === '2' || selection.includes(match.teams.away.name.toLowerCase().slice(0, 5))) {
    return awayWon ? 'won' : 'lost'
  }
  if (selection === 'n' || selection === 'x' || selection.includes('nul') || selection.includes('draw')) {
    return (!homeWon && !awayWon) ? 'won' : 'lost'
  }

  // Aucun pattern ne matche - retourner 'pending' pour declencher le fallback Perplexity
  return 'pending'
}

/**
 * Verifie un seul pari via Perplexity AI
 */
async function verifyBetWithPerplexity(bet: ServerBet): Promise<'won' | 'lost' | 'pending'> {
  const perplexityKey = process.env.PERPLEXITY_API_KEY
  if (!perplexityKey) {
    console.log(`[CHECK] Pas de clé Perplexity disponible pour ${bet.homeTeam} vs ${bet.awayTeam}`)
    return 'pending'
  }

  try {
    console.log(`[CHECK] Fallback Perplexity pour ${bet.homeTeam} vs ${bet.awayTeam}`)
    
    const prompt = `Tu es un expert en paris sportifs. Verifie si ce pari est gagne ou perdu.

Match: ${bet.homeTeam} vs ${bet.awayTeam}
Date du match: ${bet.date || bet.createdAt?.split('T')[0] || 'inconnu'}
Type de pari: ${bet.market}
Selection: ${bet.selection}

Recherche le resultat reel du match et determine si le pari est gagne ou perdu.
IMPORTANT: Reponds UNIQUEMENT avec un JSON valide, sans texte avant ou apres:
{"result": "WON"} si le pari est gagne
{"result": "LOST"} si le pari est perdu
{"result": "PENDING"} si le match n'est pas encore termine ou si tu n'es pas sur`

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 100
      })
    })

    if (!response.ok) {
      console.log(`[CHECK] Perplexity API error: ${response.status}`)
      return 'pending'
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''
    const jsonMatch = content.match(/\{[^}]+\}/)

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      console.log(`[CHECK] Perplexity result for ${bet.homeTeam} vs ${bet.awayTeam}: ${parsed.result}`)
      if (parsed.result === 'WON') return 'won'
      if (parsed.result === 'LOST') return 'lost'
    } else {
      console.log(`[CHECK] Perplexity: pas de JSON valide dans la réponse`)
    }
  } catch (err) {
    console.error(`[CHECK] Perplexity error for ${bet.homeTeam} vs ${bet.awayTeam}:`, err)
  }

  return 'pending'
}

/**
 * Met a jour un pari et la bankroll dans Redis
 */
async function settleBet(
  redis: Redis,
  userEmail: string,
  bets: ServerBet[],
  bet: ServerBet,
  result: 'won' | 'lost',
  viaPerplexity: boolean
): Promise<boolean> {
  const betIndex = bets.findIndex(b => b.id === bet.id)
  if (betIndex === -1) return false

  const wonAmount = result === 'won' ? bet.potentialWin : 0
  
  console.log(`[CHECK] Settlement: ${bet.homeTeam} vs ${bet.awayTeam} -> ${result.toUpperCase()}, win: ${wonAmount.toFixed(2)}€ (viaPerplexity: ${viaPerplexity})`)

  bets[betIndex] = {
    ...bets[betIndex],
    status: result,
    settledAt: new Date().toISOString(),
    perplexityVerified: viaPerplexity
  }

  // Mettre a jour la bankroll
  const currentBankrollRaw = await redis.get(`user:${userEmail}:bankroll`)
  let currentBankroll = currentBankrollRaw ? parseFloat(String(currentBankrollRaw)) : 100

  if (result === 'won') {
    currentBankroll += bet.potentialWin
    currentBankroll = Math.round(currentBankroll * 100) / 100
    console.log(`[CHECK] Bankroll updated: +${bet.potentialWin.toFixed(2)}€ -> ${currentBankroll.toFixed(2)}€`)
  } else {
    console.log(`[CHECK] Bankroll unchanged (loss): ${currentBankroll.toFixed(2)}€`)
  }

  await redis.set(`user:${userEmail}:bankroll`, currentBankroll)

  // Enregistrer l'historique de la bankroll
  await redis.lpush(`user:${userEmail}:bankroll:history`, JSON.stringify({
    date: new Date().toISOString().split('T')[0],
    bankroll: currentBankroll
  }))

  await redis.del(`pending_user_bet:${bet.id}`)

  return true
}

/**
 * POST - Verifier automatiquement les paris en cours d'un utilisateur
 * Strategie: API Football d'abord, puis fallback Perplexity si necessaire
 */
export async function POST() {
  try {
    const cookieStore = cookies()
    const session = cookieStore.get('vip_session')?.value
    const userEmail = cookieStore.get('user_email')?.value

    if (!session || !userEmail) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    if (!redisUrl || !redisToken) {
      return NextResponse.json({ error: 'Configuration Redis manquante' }, { status: 500 })
    }

    const redis = new Redis({ url: redisUrl, token: redisToken })

    // Recuperer les paris de l'utilisateur
    const betsRaw = await redis.get(`user:${userEmail}:bets`)
    const bets: ServerBet[] = betsRaw
      ? (typeof betsRaw === 'string' ? JSON.parse(betsRaw) : betsRaw as ServerBet[])
      : []

    const pendingBets = bets.filter(b => b.status === 'pending')

    console.log(`[CHECK BETS] ${userEmail}: ${pendingBets.length} paris en attente`)

    if (pendingBets.length === 0) {
      return NextResponse.json({ success: true, checked: 0, updated: 0 })
    }

    let updatedCount = 0
    const updates: string[] = []

    for (const bet of pendingBets) {
      try {
        let matchData: FixtureResult | null = null
        let result: 'won' | 'lost' | 'pending' = 'pending'
        let usedPerplexity = false

        // ===== ETAPE 1: Essayer API Football =====
        if (footballKey) {
          // Methode 1: par fixtureId
          if (bet.fixtureId) {
            console.log(`[CHECK] Recherche par fixtureId: ${bet.fixtureId}`)
            const response = await fetch(
              `https://${footballHost}/fixtures?id=${bet.fixtureId}`,
              { headers: { 'x-apisports-key': footballKey } }
            )
            if (response.ok) {
              const data = await response.json()
              matchData = data.response?.[0] || null
              if (matchData) {
                console.log(`[CHECK] Match trouvé par fixtureId: ${matchData.teams.home.name} vs ${matchData.teams.away.name}`)
              }
            }
          }

          // Methode 2: recherche par date et equipes
          if (!matchData && bet.date) {
            const dateStr = bet.date.split('T')[0]
            console.log(`[CHECK] Recherche par date: ${dateStr}, équipe: ${bet.homeTeam}`)
            const response = await fetch(
              `https://${footballHost}/fixtures?date=${dateStr}&search=${encodeURIComponent(bet.homeTeam)}`,
              { headers: { 'x-apisports-key': footballKey } }
            )
            if (response.ok) {
              const data = await response.json()
              matchData = data.response?.find((m: FixtureResult) =>
                m.teams.home.name.toLowerCase().includes(bet.homeTeam.toLowerCase().slice(0, 5)) ||
                m.teams.away.name.toLowerCase().includes(bet.awayTeam.toLowerCase().slice(0, 5))
              ) || null
              if (matchData) {
                console.log(`[CHECK] Match trouvé par recherche home: ${matchData.teams.home.name} vs ${matchData.teams.away.name}`)
              }
            }
          }

          // Methode 3: recherche par equipe away si home n'a rien donne
          if (!matchData && bet.date) {
            const dateStr = bet.date.split('T')[0]
            console.log(`[CHECK] Recherche par date: ${dateStr}, équipe: ${bet.awayTeam}`)
            const response = await fetch(
              `https://${footballHost}/fixtures?date=${dateStr}&search=${encodeURIComponent(bet.awayTeam)}`,
              { headers: { 'x-apisports-key': footballKey } }
            )
            if (response.ok) {
              const data = await response.json()
              matchData = data.response?.find((m: FixtureResult) =>
                m.teams.home.name.toLowerCase().includes(bet.homeTeam.toLowerCase().slice(0, 5)) ||
                m.teams.away.name.toLowerCase().includes(bet.awayTeam.toLowerCase().slice(0, 5))
              ) || null
              if (matchData) {
                console.log(`[CHECK] Match trouvé par recherche away: ${matchData.teams.home.name} vs ${matchData.teams.away.name}`)
              }
            }
          }

          // Analyser le resultat via pattern matching
          if (matchData) {
            result = determineBetResult(bet, matchData)
            console.log(`[CHECK] Résultat determineBetResult: ${result} (status: ${matchData.fixture.status.short})`)

            // Si le match est termine mais le pattern ne matche pas -> fallback Perplexity
            const matchFinished = ['FT', 'AET', 'PEN'].includes(matchData.fixture.status.short)
            if (result === 'pending' && matchFinished) {
              console.log(`[CHECK] Pattern non reconnu pour ${bet.homeTeam} vs ${bet.awayTeam} (market: ${bet.market}, selection: ${bet.selection}) -> fallback Perplexity`)
              result = await verifyBetWithPerplexity(bet)
              usedPerplexity = true
            }
          } else {
            console.log(`[CHECK] Match non trouvé dans API Football pour ${bet.homeTeam} vs ${bet.awayTeam}`)
          }
        } else {
          console.log(`[CHECK] Pas de clé API Football, fallback direct Perplexity`)
        }

        // ===== ETAPE 2: Si pas de match trouve ou pas de cle API Football -> Perplexity =====
        if (result === 'pending') {
          console.log(`[CHECK] Fallback Perplexity pour ${bet.homeTeam} vs ${bet.awayTeam} (matchData: ${matchData ? 'oui' : 'non'}, result: ${result})`)
          result = await verifyBetWithPerplexity(bet)
          usedPerplexity = true
        }

        // ===== ETAPE 3: Mettre a jour si resultat determine =====
        if (result === 'won' || result === 'lost') {
          const viaPerplexity = usedPerplexity || !matchData || !['FT', 'AET', 'PEN'].includes(matchData?.fixture?.status?.short || '')
          const settled = await settleBet(redis, userEmail, bets, bet, result, viaPerplexity)
          if (settled) {
            updatedCount++
            updates.push(`${bet.homeTeam} vs ${bet.awayTeam}: ${result.toUpperCase()}${viaPerplexity ? ' (IA)' : ''}`)
          }
        } else {
          updates.push(`${bet.homeTeam} vs ${bet.awayTeam}: en attente`)
        }
      } catch (err) {
        console.error(`[CHECK] Error checking bet ${bet.id}:`, err)
        updates.push(`${bet.homeTeam} vs ${bet.awayTeam}: erreur de verification`)
      }
    }

    // Sauvegarder les paris mis a jour
    if (updatedCount > 0) {
      await redis.set(`user:${userEmail}:bets`, JSON.stringify(bets))
      console.log(`[CHECK BETS] ${userEmail}: ${updatedCount}/${pendingBets.length} mis à jour, bankroll mise à jour`)
    }

    return NextResponse.json({
      success: true,
      checked: pendingBets.length,
      updated: updatedCount,
      details: updates
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur inconnue'
    console.error('[CHECK BETS] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
