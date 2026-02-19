import { NextRequest, NextResponse } from 'next/server';
import { subscribeToNewsletter } from '@/lib/config/newsletter';
import { isValidEmail } from '@/lib/utils/validators';

export async function POST(req: NextRequest) {
  try {
    const { email, preferences } = await req.json();

    // Validation
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Adresse email invalide' },
        { status: 400 }
      );
    }

    // Subscribe to newsletter
    const result = await subscribeToNewsletter(email, {
      FNAME: preferences?.firstName || '',
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Erreur lors de l\'inscription' },
        { status: 500 }
      );
    }

    // Store in Redis for tracking
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });

      await redis.set(`newsletter:${email}`, {
        email,
        subscribedAt: new Date().toISOString(),
        preferences: preferences || {},
      });

      // Increment subscriber count
      await redis.incr('newsletter:subscribers:count');
    } catch (error) {
      console.warn('[Newsletter] Redis not available');
    }

    return NextResponse.json({
      success: true,
      message: 'Inscription réussie !',
    });
  } catch (error: any) {
    console.error('[Newsletter] Subscribe error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get subscriber count from Redis
    let count = 0;

    try {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });

      const stored = await redis.get('newsletter:subscribers:count');
      count = stored ? parseInt(stored as string) : 0;
    } catch (error) {
      console.warn('[Newsletter] Redis not available');
    }

    return NextResponse.json({
      success: true,
      count,
    });
  } catch (error: any) {
    console.error('[Newsletter] Get count error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
