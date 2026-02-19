import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/config/stripe';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    );
  }

  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('[Stripe Webhook] Verification failed:', err.message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle events
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Update donation status in Redis
        try {
          const { Redis } = await import('@upstash/redis');
          const redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
          });

          const donationId = `donation:${session.id}`;
          const donation = await redis.get(donationId);

          if (donation) {
            await redis.set(donationId, {
              ...donation as object,
              status: 'COMPLETED',
              completedAt: new Date().toISOString(),
            });

            // Add to donors list
            const metadata = session.metadata;
            if (metadata) {
              const donorData = {
                id: `donor:${Date.now()}`,
                name: metadata.isAnonymous === 'true' ? 'Anonyme' : (metadata.userName || metadata.userEmail || 'Donateur'),
                tier: metadata.tier,
                badge: metadata.tier?.toLowerCase() || 'coffee',
                totalDonated: parseInt(metadata.amount || '0'),
                message: metadata.message || null,
                isAnonymous: metadata.isAnonymous === 'true',
                createdAt: new Date().toISOString(),
              };

              await redis.lpush('donors:list', JSON.stringify(donorData));
            }
          }
        } catch (error) {
          console.error('[Stripe Webhook] Failed to update Redis:', error);
        }

        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        try {
          const { Redis } = await import('@upstash/redis');
          const redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
          });

          const donationId = `donation:${session.id}`;
          const donation = await redis.get(donationId);

          if (donation) {
            await redis.set(donationId, {
              ...donation as object,
              status: 'FAILED',
            });
          }
        } catch (error) {
          console.error('[Stripe Webhook] Failed to update expired session:', error);
        }

        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook] Processing error:', error);
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
}
