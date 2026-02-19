// ==========================================
// EXPORTS TYPES
// ==========================================

export * from './donation';
export * from './blog';
export * from './newsletter';

// ==========================================
// TYPES PREDICTIONS (complement)
// ==========================================

export type PredictionType = 'SAFE' | 'FUN' | 'SNIPER';
export type PredictionStatus = 'GAGNE' | 'PERDU' | 'EN_COURS' | 'ANNULE';
export type Sport = 'FOOTBALL' | 'BASKETBALL' | 'TENNIS';

export interface Prediction {
  id: string;
  type: PredictionType;
  sport: Sport;
  competition: string;
  competitionLogo?: string;
  date: string;
  time: string;
  homeTeam: string;
  homeTeamLogo?: string;
  awayTeam: string;
  awayTeamLogo?: string;
  pick: string;
  pickDetails?: string;
  odds: number;
  status: PredictionStatus;
  score?: string;
  aiConfidence: number;
  aiAnalysis?: string;
  stats?: MatchStats;
  createdAt: string;
  updatedAt: string;
  isVip?: boolean;
  isFeatured?: boolean;
}

export interface MatchStats {
  homeForm: string;
  awayForm: string;
  homeXg: number;
  awayXg: number;
  homePossession: number;
  awayPossession: number;
  homeShots: number;
  awayShots: number;
  h2h: string;
  injuries?: string[];
  suspensions?: string[];
}

// ==========================================
// TYPES UTILISATEURS (complement)
// ==========================================

export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  bankroll: Bankroll;
  stats: UserStats;
  preferences: UserPreferences;
  createdAt: string;
  lastLoginAt?: string;
  donorBadge?: import('./donation').DonorBadge;
}

export interface Bankroll {
  current: number;
  initial: number;
  currency: 'EUR';
  lastUpdated: string;
}

export interface UserStats {
  totalBets: number;
  wins: number;
  losses: number;
  pending: number;
  winRate: number;
  roi: number;
  bestStreak: number;
  currentStreak: number;
}

export interface UserPreferences {
  notifications: NotificationPrefs;
  display: DisplayPrefs;
  privacy: PrivacyPrefs;
}

export interface NotificationPrefs {
  email: boolean;
  push: boolean;
  dailyTip: boolean;
  resultAlerts: boolean;
  marketing: boolean;
}

export interface DisplayPrefs {
  theme: 'dark' | 'light' | 'system';
  oddsFormat: 'decimal' | 'fractional' | 'american';
  language: 'fr' | 'en';
}

export interface PrivacyPrefs {
  showProfile: boolean;
  showStats: boolean;
  allowAnalytics: boolean;
}

// ==========================================
// STATS GLOBALES
// ==========================================

export interface GlobalStats {
  winRate: number;
  roi: number;
  totalPredictions: number;
  totalUsers: number;
  totalDonations: number;
  currentStreak: number;
  bestStreak: number;
  thisMonth: MonthlyStats;
  lastMonth: MonthlyStats;
}

export interface MonthlyStats {
  predictions: number;
  wins: number;
  losses: number;
  roi: number;
}

// ==========================================
// API RESPONSES
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface FilterOptions {
  status?: PredictionStatus | 'TOUS';
  type?: PredictionType | 'TOUS';
  competition?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}
