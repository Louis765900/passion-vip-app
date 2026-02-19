// ==========================================
// CONFIGURATION CENTRALISÉE DES APIs EXTERNES
// ==========================================

export const API_CONFIG = {
  /** TheSportsDB — données équipes/événements (clé gratuite: 123) */
  theSportsDB: {
    baseUrl: 'https://www.thesportsdb.com/api/v1/json',
    apiKey: process.env.THESPORTSDB_API_KEY || '123',
    get url() {
      return `${this.baseUrl}/${this.apiKey}`
    },
    rateLimit: {
      maxRequestsPerMinute: 100,
      retryAfterMs: 60_000,
    },
  },

  /** API-Football — fixtures, scores en live */
  apiFootball: {
    host: process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io',
    apiKey: process.env.API_FOOTBALL_KEY || '',
  },

  /** Football-Data.org — données complémentaires */
  footballData: {
    baseUrl: 'https://api.football-data.org/v4',
    apiKey: process.env.FOOTBALL_DATA_API_KEY || '',
  },

  /** WeatherAPI — météo actuelle + prévisions (Business Trial) */
  weatherApi: {
    baseUrl: 'http://api.weatherapi.com/v1',
    apiKey: process.env.WEATHERAPI_KEY || '',
    trialExpiry: '2026-02-25',
  },

  /** Open-Meteo — météo gratuite par coordonnées GPS */
  openMeteo: {
    baseUrl: 'https://api.open-meteo.com/v1',
  },

  /** QuickChart — génération de graphiques Chart.js en images */
  quickChart: {
    baseUrl: 'https://quickchart.io/chart',
  },

  /** REST Countries — informations pays, drapeaux, coordonnées */
  restCountries: {
    baseUrl: 'https://restcountries.com/v3.1',
  },

  /** Nominatim (OpenStreetMap) — géocodage stades/villes */
  nominatim: {
    baseUrl: 'https://nominatim.openstreetmap.org',
    userAgent: 'PronoScope/1.0 (contact@pronoscope.fr)',
    email: 'contact@lapassion-vip.fr',
    rateLimit: {
      maxRequestsPerSecond: 1,
    },
  },

  /** GROQ — LLM pour analyse IA */
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
  },

  /** Perplexity — recherche IA */
  perplexity: {
    apiKey: process.env.PERPLEXITY_API_KEY || '',
  },

  /** Google Gemini — raisonnement avancé */
  gemini: {
    apiKey: process.env.GOOGLE_AI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  },
}

export type ApiServiceName = keyof typeof API_CONFIG
