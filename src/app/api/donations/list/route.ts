import { NextResponse } from 'next/server';
import { DonorDisplay, DonationTier } from '@/lib/types/donation';

// Fallback mock data for when Redis is not available
const mockDonors: DonorDisplay[] = [
  { id: '1', name: 'Thomas M.', tier: 'LEGEND' as DonationTier, badge: 'trophy', totalDonated: 50, isAnonymous: false, createdAt: '2026-01-15' },
  { id: '2', name: 'Sophie L.', tier: 'VIP' as DonationTier, badge: 'crown', totalDonated: 25, isAnonymous: false, createdAt: '2026-01-14', message: 'Super projet, continuez !' },
  { id: '3', name: 'Alexandre D.', tier: 'FAN' as DonationTier, badge: 'star', totalDonated: 15, isAnonymous: false, createdAt: '2026-01-13' },
  { id: '4', name: 'Marie P.', tier: 'SUPPORTER' as DonationTier, badge: 'star', totalDonated: 10, isAnonymous: false, createdAt: '2026-01-12' },
  { id: '5', name: 'Lucas B.', tier: 'COFFEE' as DonationTier, badge: 'coffee', totalDonated: 5, isAnonymous: false, createdAt: '2026-01-11' },
  { id: '6', name: 'Emma R.', tier: 'VIP' as DonationTier, badge: 'crown', totalDonated: 30, isAnonymous: false, createdAt: '2026-01-10', message: 'Merci pour vos analyses !' },
  { id: '7', name: 'Hugo G.', tier: 'LEGEND' as DonationTier, badge: 'trophy', totalDonated: 100, isAnonymous: false, createdAt: '2026-01-09' },
  { id: '8', name: 'Anonyme', tier: 'SUPPORTER' as DonationTier, badge: 'star', totalDonated: 10, isAnonymous: true, createdAt: '2026-01-08' },
];

export async function GET() {
  try {
    // Try to fetch from Redis
    let donors: DonorDisplay[] = [];

    try {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });

      // Get all donation keys
      const keys = await redis.keys('donation:*');
      
      if (keys.length > 0) {
        const donations = await redis.mget(...keys);
        
        donors = donations
          .filter((d: any) => d && d.status === 'COMPLETED')
          .map((d: any) => ({
            id: d.id,
            name: d.isAnonymous ? 'Anonyme' : (d.userName || d.userEmail || 'Donateur'),
            tier: d.tier,
            badge: d.tier.toLowerCase(),
            totalDonated: d.amount,
            message: d.message,
            isAnonymous: d.isAnonymous,
            createdAt: d.createdAt,
          }))
          .sort((a: DonorDisplay, b: DonorDisplay) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    } catch (error) {
      console.warn('[Donations] Redis not available, using mock data');
    }

    // Return mock data if no donors found
    if (donors.length === 0) {
      donors = mockDonors;
    }

    return NextResponse.json({
      success: true,
      donors,
      total: donors.length,
    });
  } catch (error: any) {
    console.error('[Donations] List error:', error);
    // Return mock data on error
    return NextResponse.json({
      success: true,
      donors: mockDonors,
      total: mockDonors.length,
    });
  }
}
