// ==========================================
// CONSTANTS
// ==========================================

export const APP_NAME = 'PronoScope';
export const APP_TAGLINE = 'Pronostics Football IA';
export const APP_DESCRIPTION = 'Analyses et pronostics de football basés sur l\'intelligence artificielle. 100% gratuit, 100% transparent.';

// Contact
export const CONTACT_EMAIL = 'contact@lapassion-vip.fr';
export const HELP_PHONE = '09 74 75 13 13';
export const HELP_PHONE_INTL = '+33-9-74-75-13-13';

// Social
export const SOCIAL_LINKS = {
  tiktok: '@pronoscope',
  instagram: '@pronoscope',
  twitter: '@PronoScope',
  youtube: 'PronoScope',
  discord: 'discord.gg/pronoscope',
};

// Stats
export const DEFAULT_STATS = {
  winRate: 57.9,
  roi: 12.4,
  totalAnalyses: 250,
  totalUsers: 500,
  monthlyVisitors: 2000,
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Cache durations (in seconds)
export const CACHE_DURATION = {
  short: 60,        // 1 minute
  medium: 300,      // 5 minutes
  long: 3600,       // 1 hour
  day: 86400,       // 24 hours
};

// Local storage keys
export const STORAGE_KEYS = {
  ageVerified: 'age_verified',
  ageVerifiedDate: 'age_verified_date',
  userSettings: 'user_settings',
  bankroll: 'bankroll_data',
  lastVisit: 'last_visit',
  cookieConsent: 'cookie_consent',
};

// Age verification
export const AGE_VERIFICATION_DAYS = 365; // 1 year

// Donation
export const MIN_DONATION_AMOUNT = 1;
export const MAX_DONATION_AMOUNT = 1000;

// Betting
export const MAX_STAKE_PERCENTAGE = 10;
export const DEFAULT_KELLY_FRACTION = 0.25;

// API
export const API_TIMEOUT = 30000; // 30 seconds
export const MAX_RETRIES = 3;
