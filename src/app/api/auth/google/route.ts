import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export const dynamic = 'force-dynamic'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// GET - Initier le flux OAuth Google
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get('code')

  // Si pas de code, rediriger vers Google OAuth
  if (!code) {
    if (!GOOGLE_CLIENT_ID) {
      return NextResponse.json({ error: 'Google OAuth non configure' }, { status: 500 })
    }

    const redirectUri = `${APP_URL}/api/auth/google`
    const scope = encodeURIComponent('email profile')
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`

    return NextResponse.redirect(googleAuthUrl)
  }

  // Sinon, traiter le callback avec le code
  try {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return NextResponse.redirect(`${APP_URL}/login?error=config`)
    }

    // Echanger le code contre un token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${APP_URL}/api/auth/google`,
      }),
    })

    if (!tokenResponse.ok) {
      console.error('[Google OAuth] Token error:', await tokenResponse.text())
      return NextResponse.redirect(`${APP_URL}/login?error=token`)
    }

    const tokenData = await tokenResponse.json()

    // Recuperer les infos utilisateur
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    if (!userResponse.ok) {
      return NextResponse.redirect(`${APP_URL}/login?error=userinfo`)
    }

    const userData = await userResponse.json()
    const email = userData.email
    const name = userData.name || email.split('@')[0]

    // Verifier/creer l'utilisateur dans Redis
    const redisUrl = process.env.UPSTASH_REDIS_REST_KV_REST_API_URL
    const redisToken = process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN

    if (redisUrl && redisToken) {
      const redis = new Redis({ url: redisUrl, token: redisToken })

      // Verifier si l'utilisateur existe deja
      let existingUser = await redis.get(`user:${email}`)

      if (!existingUser) {
        // Creer un nouvel utilisateur VIP (OAuth = auto-VIP pour l'instant)
        const newUser = {
          email,
          name,
          role: 'vip',
          provider: 'google',
          createdAt: new Date().toISOString(),
        }
        await redis.set(`user:${email}`, JSON.stringify(newUser))

        // Initialiser la bankroll
        await redis.set(`user:${email}:bankroll`, 100)
        await redis.set(`user:${email}:bets`, JSON.stringify([]))
      }
    }

    // Creer la session
    const sessionToken = `google_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const response = NextResponse.redirect(`${APP_URL}/`)

    // Definir les cookies
    response.cookies.set('vip_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    })

    response.cookies.set('user_email', email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    response.cookies.set('user_role', 'vip', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    console.log(`[Google OAuth] User logged in: ${email}`)

    return response

  } catch (error) {
    console.error('[Google OAuth] Error:', error)
    return NextResponse.redirect(`${APP_URL}/login?error=server`)
  }
}
