// ==========================================
// TYPES NEWSLETTER
// ==========================================

export interface NewsletterSubscriber {
  email: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  preferences: NewsletterPreferences;
  lastSentAt?: string;
}

export interface NewsletterPreferences {
  dailyPredictions: boolean;
  weeklyRecap: boolean;
  specialOffers: boolean;
  productUpdates: boolean;
}

export interface NewsletterCampaign {
  id: string;
  subject: string;
  html: string;
  text: string;
  sentAt?: string;
  recipients: number;
  opens?: number;
  clicks?: number;
}

export interface SubscribeRequest {
  email: string;
  preferences?: Partial<NewsletterPreferences>;
}

export interface SubscribeResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// ==========================================
// TEMPLATES EMAIL
// ==========================================

export interface DailyPredictionEmailData {
  predictions: Array<{
    homeTeam: string;
    awayTeam: string;
    pick: string;
    odds: number;
    aiConfidence: number;
    league: string;
  }>;
  stats: {
    winRate: number;
    roi: number;
  };
  date: string;
}

export interface WeeklyRecapEmailData {
  weekNumber: number;
  predictionsCount: number;
  wins: number;
  losses: number;
  roi: number;
  bestPrediction: {
    match: string;
    pick: string;
    odds: number;
  } | null;
}
