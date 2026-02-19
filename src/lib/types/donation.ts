// ==========================================
// TYPES DONS ET SYSTÈME DE SUPPORT
// ==========================================

export type DonationTier = 'COFFEE' | 'SUPPORTER' | 'FAN' | 'VIP' | 'LEGEND';
export type DonationStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Donation {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  amount: number;
  currency: 'EUR';
  tier: DonationTier;
  status: DonationStatus;
  message?: string;
  isAnonymous: boolean;
  paymentMethod: 'card' | 'paypal' | 'crypto';
  stripePaymentIntentId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface DonorBadge {
  tier: DonationTier;
  totalDonated: number;
  since: string;
  expiresAt?: string;
}

export interface DonorDisplay {
  id: string;
  name: string;
  tier: DonationTier;
  badge: string;
  totalDonated: number;
  message?: string;
  isAnonymous: boolean;
  createdAt: string;
}

export const DONATION_TIERS: Record<DonationTier, {
  name: string;
  minAmount: number;
  maxAmount?: number;
  badge: string;
  emoji: string;
  benefits: string[];
  duration: string;
  color: string;
}> = {
  COFFEE: {
    name: 'Un Café',
    minAmount: 2,
    maxAmount: 4.99,
    badge: 'coffee',
    emoji: '☕',
    benefits: ['Badge Supporter', 'Remerciement public'],
    duration: '7 jours',
    color: '#8B4513',
  },
  SUPPORTER: {
    name: 'Supporter',
    minAmount: 5,
    maxAmount: 9.99,
    badge: 'star',
    emoji: '🌟',
    benefits: ['Badge Fan', 'Mention sur le mur des donateurs', 'Accès Discord VIP'],
    duration: '30 jours',
    color: '#F59E0B',
  },
  FAN: {
    name: 'Fan',
    minAmount: 10,
    maxAmount: 19.99,
    badge: 'star',
    emoji: '⭐',
    benefits: ['Badge VIP Donator', 'Newsletter exclusive', 'Analyses approfondies'],
    duration: '90 jours',
    color: '#8B5CF6',
  },
  VIP: {
    name: 'VIP',
    minAmount: 20,
    maxAmount: 49.99,
    badge: 'crown',
    emoji: '👑',
    benefits: ['Badge Légende', 'Page donateurs dédiée', 'Accès bêta fonctionnalités'],
    duration: 'Permanent',
    color: '#F59E0B',
  },
  LEGEND: {
    name: 'Légende',
    minAmount: 50,
    badge: 'trophy',
    emoji: '🏆',
    benefits: ['Tous les avantages VIP', 'Call 1:1 avec l\'équipe', 'Input sur les nouvelles fonctionnalités'],
    duration: 'Permanent',
    color: '#FFD700',
  },
};

export const DONATION_AMOUNTS = [2, 5, 10, 20, 50] as const;

export function getTierByAmount(amount: number): DonationTier {
  if (amount >= 50) return 'LEGEND';
  if (amount >= 20) return 'VIP';
  if (amount >= 10) return 'FAN';
  if (amount >= 5) return 'SUPPORTER';
  return 'COFFEE';
}

// ==========================================
// API RESPONSES
// ==========================================

export interface CreateDonationRequest {
  amount: number;
  message?: string;
  isAnonymous: boolean;
  userId?: string;
  userEmail?: string;
  userName?: string;
}

export interface CreateDonationResponse {
  success: boolean;
  clientSecret?: string;
  donationId?: string;
  error?: string;
}

export interface GetDonorsResponse {
  success: boolean;
  donors: DonorDisplay[];
  total: number;
  error?: string;
}
