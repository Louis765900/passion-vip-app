// src/app/api/stats/bankroll/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
        const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;
        if (!redisUrl || !redisToken) throw new Error("Redis environment variables are not set.");

        const cookieStore = cookies();
        const session = cookieStore.get('vip_session')?.value;
        const userEmail = cookieStore.get('user_email')?.value;

        if (!session || !userEmail) {
            return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
        }

        const redis = new Redis({ url: redisUrl, token: redisToken });

        // Recuperer la bankroll actuelle pour le point de depart
        const currentBankrollRaw = await redis.get(`user:${userEmail}:bankroll`);
        const currentBankroll = currentBankrollRaw ? parseFloat(String(currentBankrollRaw)) : 100;

        // Fetch the last 100 entries from the user's bankroll history
        const history: string[] = await redis.lrange(`user:${userEmail}:bankroll:history`, 0, 99);

        if (!history || history.length === 0) {
            // Return a default starting point if no history exists
            return NextResponse.json([
                { date: new Date().toISOString().split('T')[0], bankroll: 100 },
                { date: new Date().toISOString().split('T')[0], bankroll: currentBankroll }
            ]);
        }

        // Data is stored with LPUSH, so it's in reverse chronological order. Reverse it back.
        const formattedHistory = history.map(item => JSON.parse(item)).reverse();

        return NextResponse.json(formattedHistory);

    } catch (error: any) {
        console.error("Error fetching bankroll history:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
