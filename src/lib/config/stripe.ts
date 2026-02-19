import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('[Stripe] Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27.acacia',
    })
  : null;

// Price IDs for predefined amounts (create these in Stripe Dashboard)
export const STRIPE_PRICE_IDS = {
  COFFEE: process.env.STRIPE_PRICE_COFFEE || '',      // 2€
  SUPPORTER: process.env.STRIPE_PRICE_SUPPORTER || '', // 5€
  FAN: process.env.STRIPE_PRICE_FAN || '',           // 10€
  VIP: process.env.STRIPE_PRICE_VIP || '',           // 20€
  LEGEND: process.env.STRIPE_PRICE_LEGEND || '',      // 50€
};

export const DONATION_AMOUNTS = [2, 5, 10, 20, 50] as const;

export function getPriceIdForAmount(amount: number): string | null {
  switch (amount) {
    case 2:
      return STRIPE_PRICE_IDS.COFFEE;
    case 5:
      return STRIPE_PRICE_IDS.SUPPORTER;
    case 10:
      return STRIPE_PRICE_IDS.FAN;
    case 20:
      return STRIPE_PRICE_IDS.VIP;
    case 50:
      return STRIPE_PRICE_IDS.LEGEND;
    default:
      return null;
  }
}
