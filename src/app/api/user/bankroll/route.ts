import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { Redis } from '@upstash/redis'

export const dynamic = 'force-dynamic'

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_KV_REST_API_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN

/**
 * GET - Recuperer l'etat de la bankroll
 */
export async function GET() {
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

    const pipeline = redis.pipeline()
    pipeline.get(`user:${userEmail}:bankroll`)
    pipeline.get(`user:${userEmail}:bankroll:initial`)
    pipeline.get(`user:${userEmail}:bankroll:locked`)

    const results = await pipeline.exec()
    const balance = results[0] ? parseFloat(String(results[0])) : null
    const initialBalance = results[1] ? parseFloat(String(results[1])) : null
    const locked = results[2] === true || results[2] === 'true'

    return NextResponse.json({
      success: true,
      balance: balance ?? 100,
      initialBalance: initialBalance ?? 100,
      locked,
      roi: initialBalance && initialBalance > 0
        ? (((balance ?? 100) - initialBalance) / initialBalance * 100)
        : 0
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur inconnue'
    console.error('[USER BANKROLL] GET error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

/**
 * POST - Configurer la bankroll initiale (une seule fois)
 */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies()
    const session = cookieStore.get('vip_session')?.value
    const userEmail = cookieStore.get('user_email')?.value

    if (!session || !userEmail) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const { amount, lock } = await req.json()

    if (!amount || typeof amount !== 'number' || amount < 10 || amount > 100000) {
      return NextResponse.json({ error: 'Montant invalide (10-100000 EUR)' }, { status: 400 })
    }

    if (!redisUrl || !redisToken) {
      return NextResponse.json({ error: 'Configuration Redis manquante' }, { status: 500 })
    }

    const redis = new Redis({ url: redisUrl, token: redisToken })

    // Verifier si la bankroll est deja verrouillee
    const isLocked = await redis.get(`user:${userEmail}:bankroll:locked`)
    if (isLocked === true || isLocked === 'true') {
      return NextResponse.json(
        { error: 'La bankroll est deja configuree et ne peut plus etre modifiee' },
        { status: 403 }
      )
    }

    // Configurer la bankroll
    const pipeline = redis.pipeline()
    pipeline.set(`user:${userEmail}:bankroll`, amount)
    pipeline.set(`user:${userEmail}:bankroll:initial`, amount)
    if (lock) {
      pipeline.set(`user:${userEmail}:bankroll:locked`, 'true')
    }
    await pipeline.exec()

    console.log(`[USER BANKROLL] Set to ${amount} EUR for ${userEmail} (locked: ${!!lock})`)

    return NextResponse.json({
      success: true,
      balance: amount,
      initialBalance: amount,
      locked: !!lock
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur inconnue'
    console.error('[USER BANKROLL] POST error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
