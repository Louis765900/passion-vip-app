import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export const dynamic = 'force-dynamic'

let redis: Redis | null = null
try {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_KV_REST_API_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN
  if (redisUrl && redisToken) {
    redis = new Redis({ url: redisUrl, token: redisToken })
  }
} catch {
  // Redis non configuré
}

interface BetRecord {
  id: string
  match: string
  date: string
  market: string
  selection: string
  odds: number
  stake: number
  potentialWin: number
  result: 'won' | 'lost' | 'pending'
  profit: number
}

interface TodayStats {
  total: number
  won: number
  lost: number
  pending: number
  win_rate: number
}

interface AggregatedStats {
  total: number
  won: number
  lost: number
  pending: number
  win_rate: number
  roi: number
  streak: number
  streak_type: 'win' | 'loss'
  today: TodayStats
  by_market: { market: string; total: number; won: number; roi: number }[]
  last_30_days: { total: number; won: number; win_rate: number }
}

function emptyStats(): AggregatedStats {
  return {
    total: 0,
    won: 0,
    lost: 0,
    pending: 0,
    win_rate: 0,
    roi: 0,
    streak: 0,
    streak_type: 'win',
    today: { total: 0, won: 0, lost: 0, pending: 0, win_rate: 0 },
    by_market: [],
    last_30_days: { total: 0, won: 0, win_rate: 0 },
  }
}

function computeStats(bets: BetRecord[], today: string): AggregatedStats {
  const settled = bets.filter(b => b.result !== 'pending')
  const won = settled.filter(b => b.result === 'won')
  const lost = settled.filter(b => b.result === 'lost')
  const pending = bets.filter(b => b.result === 'pending')

  const totalStaked = settled.reduce((sum, b) => sum + b.stake, 0)
  const totalProfit = settled.reduce((sum, b) => sum + b.profit, 0)
  const roi = totalStaked > 0 ? parseFloat(((totalProfit / totalStaked) * 100).toFixed(1)) : 0
  const win_rate = settled.length > 0 ? parseFloat(((won.length / settled.length) * 100).toFixed(1)) : 0

  // Série en cours (derniers paris résolus)
  let streak = 0
  let streak_type: 'win' | 'loss' = 'win'
  for (const bet of settled) {
    if (streak === 0) {
      streak_type = bet.result === 'won' ? 'win' : 'loss'
      streak = 1
    } else if ((bet.result === 'won' && streak_type === 'win') || (bet.result === 'lost' && streak_type === 'loss')) {
      streak++
    } else {
      break
    }
  }

  // Stats du jour
  const todayBets = bets.filter(b => (b.date || '').startsWith(today))
  const todaySettled = todayBets.filter(b => b.result !== 'pending')
  const todayWon = todayBets.filter(b => b.result === 'won').length
  const todayLost = todayBets.filter(b => b.result === 'lost').length
  const todayPending = todayBets.filter(b => b.result === 'pending').length
  const todayWinRate = todaySettled.length > 0
    ? parseFloat(((todayWon / todaySettled.length) * 100).toFixed(1))
    : 0

  // 30 derniers jours
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  const last30 = settled.filter(b => new Date(b.date) >= cutoff)
  const last30Won = last30.filter(b => b.result === 'won').length
  const last30WinRate = last30.length > 0
    ? parseFloat(((last30Won / last30.length) * 100).toFixed(1))
    : 0

  // Par marché
  const marketMap = new Map<string, { total: number; won: number; staked: number; profit: number }>()
  for (const bet of settled) {
    const key = bet.market || 'Autre'
    const s = marketMap.get(key) || { total: 0, won: 0, staked: 0, profit: 0 }
    s.total++
    if (bet.result === 'won') s.won++
    s.staked += bet.stake
    s.profit += bet.profit
    marketMap.set(key, s)
  }
  const by_market = Array.from(marketMap.entries()).map(([market, s]) => ({
    market,
    total: s.total,
    won: s.won,
    roi: s.staked > 0 ? parseFloat(((s.profit / s.staked) * 100).toFixed(1)) : 0,
  }))

  return {
    total: bets.length,
    won: won.length,
    lost: lost.length,
    pending: pending.length,
    win_rate,
    roi,
    streak,
    streak_type,
    today: {
      total: todayBets.length,
      won: todayWon,
      lost: todayLost,
      pending: todayPending,
      win_rate: todayWinRate,
    },
    by_market,
    last_30_days: { total: last30.length, won: last30Won, win_rate: last30WinRate },
  }
}

export async function GET(_request: NextRequest) {
  try {
    if (!redis) {
      return NextResponse.json({ success: true, data: emptyStats(), is_empty: true })
    }

    const today = new Date().toISOString().split('T')[0]

    // Agréger tous les paris de tous les utilisateurs
    const userBetKeys = await redis.keys('user:*:bets')
    const allBets: BetRecord[] = []

    for (const key of userBetKeys) {
      const raw = await redis.get(key)
      if (!raw) continue
      const bets = typeof raw === 'string' ? JSON.parse(raw) : raw
      if (!Array.isArray(bets)) continue

      for (const bet of bets) {
        const result: 'won' | 'lost' | 'pending' =
          bet.status === 'won' ? 'won' :
          bet.status === 'lost' ? 'lost' : 'pending'

        const stake = parseFloat(bet.stake) || 0
        const potentialWin = parseFloat(bet.potentialWin) || 0
        const profit =
          result === 'won' ? parseFloat((potentialWin - stake).toFixed(2)) :
          result === 'lost' ? -stake : 0

        allBets.push({
          id: bet.id || key,
          match: `${bet.homeTeam || '?'} vs ${bet.awayTeam || '?'}`,
          date: (bet.date || today).split('T')[0],
          market: bet.market || 'Paris',
          selection: bet.selection || '',
          odds: parseFloat(bet.odds) || 1,
          stake,
          potentialWin,
          result,
          profit,
        })
      }
    }

    const is_empty = allBets.length === 0
    const data = is_empty ? emptyStats() : computeStats(allBets, today)

    return NextResponse.json({
      success: true,
      data,
      is_empty,
      generated_at: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Stats predictions error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
