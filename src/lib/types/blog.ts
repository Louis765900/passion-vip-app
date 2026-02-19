// ==========================================
// TYPES BLOG ET SEO
// ==========================================

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorAvatar?: string;
  coverImage?: string;
  tags: string[];
  category: BlogCategory;
  publishedAt: string;
  updatedAt?: string;
  readingTime: number;
  views: number;
  featured: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export type BlogCategory = 
  | 'GUIDE' 
  | 'ANALYSE' 
  | 'STRATEGIE' 
  | 'ACTUALITE' 
  | 'OUTILS';

export const BLOG_CATEGORIES: Record<BlogCategory, {
  label: string;
  description: string;
  color: string;
}> = {
  GUIDE: {
    label: 'Guide',
    description: 'Guides pratiques pour débuter et progresser',
    color: '#3B82F6',
  },
  ANALYSE: {
    label: 'Analyse',
    description: 'Analyses techniques et tactiques',
    color: '#10B981',
  },
  STRATEGIE: {
    label: 'Stratégie',
    description: 'Stratégies de betting avancées',
    color: '#F59E0B',
  },
  ACTUALITE: {
    label: 'Actualité',
    description: 'News et actualités du football',
    color: '#EF4444',
  },
  OUTILS: {
    label: 'Outils',
    description: 'Outils et ressources pour parier mieux',
    color: '#8B5CF6',
  },
};

export interface BlogPostMeta {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  coverImage?: string;
  tags: string[];
  category: BlogCategory;
  publishedAt: string;
  readingTime: number;
  views: number;
  featured: boolean;
}

// ==========================================
// SEO TYPES
// ==========================================

export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonical?: string;
  noIndex?: boolean;
  structuredData?: Record<string, unknown>;
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  twitter: string;
  email: string;
  phone: string;
}

export const SITE_CONFIG: SiteConfig = {
  name: 'PronoScope',
  description: 'Pronostics football IA gratuits et transparents. Analyses basées sur les données, pas sur l\'intuition. 57.9% de réussite, +12.4% ROI.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://pronoscope.vercel.app',
  ogImage: '/og-image.jpg',
  twitter: '@PronoScope',
  email: 'contact@lapassion-vip.fr',
  phone: '+33-9-74-75-13-13',
};

export const DEFAULT_KEYWORDS = [
  'pronostic foot gratuit',
  'analyse match football',
  'pronostic ligue 1',
  'value betting',
  'pronostic champions league',
  'analyse IA football',
  'pari sportif responsable',
  'statistiques football',
  'xG expected goals',
  'bankroll management',
  'pronostic premier league',
  'pronostic la liga',
  'pronostic serie a',
  'pronostic bundesliga',
  'conseil pari sportif',
];
