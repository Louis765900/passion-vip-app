import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/config/stripe';
import { getTierByAmount, CreateDonationRequest } from '@/lib/types/donation';

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { success: false, error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const body: CreateDonationRequest = await req.json();
    const { amount, message, isAnonymous, userId, userEmail, userName } = body;

    // Validation
    if (!amount || amount < 1 || amount > 1000) {
      return NextResponse.json(
        { success: false, error: 'Montant invalide' },
        { status: 400 }
      );
    }

    const tier = getTierByAmount(amount);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Don PronoScope - ${tier}`,
              description: message || 'Soutien au projet PronoScope',
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/soutenir?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/soutenir?canceled=true`,
      metadata: {
        userId: userId || 'anonymous',
        userEmail: userEmail || '',
        userName: userName || '',
        tier,
        message: message || '',
        isAnonymous: String(isAnonymous),
        amount: String(amount),
      },
    });

    // Store donation in Redis (pending status)
    // This will be updated by the webhook
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });

      const donationId = `donation:${session.id}`;
      await redis.set(donationId, {
        id: donationId,
        userId: userId || null,
        userEmail: userEmail || null,
        userName: userName || null,
        amount,
        tier,
        status: 'PENDING',
        message: message || null,
        isAnonymous,
        stripeSessionId: session.id,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[Donations] Failed to store in Redis:', error);
      // Continue - webhook will handle it
    }

    // Return checkout URL for client-side redirect
    return NextResponse.json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url,
    });
  } catch (error: any) {
    console.error('[Donations] Create error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
