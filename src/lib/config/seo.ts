import { Metadata } from 'next';
import { SITE_CONFIG, DEFAULT_KEYWORDS } from '@/lib/types/blog';

export const DEFAULT_METADATA: Metadata = {
  title: {
    default: `${SITE_CONFIG.name} - Pronostics Football IA Gratuits`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: DEFAULT_KEYWORDS,
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  robots: 'index, follow',
  metadataBase: new URL(SITE_CONFIG.url),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} - Pronostics Football IA Gratuits`,
    description: SITE_CONFIG.description,
    images: [{
      url: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
      width: 1200,
      height: 630,
      alt: SITE_CONFIG.name,
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: SITE_CONFIG.twitter,
    creator: SITE_CONFIG.twitter,
    title: `${SITE_CONFIG.name} - Pronostics Football IA Gratuits`,
    description: SITE_CONFIG.description,
    images: [`${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export function generateMetadata({
  title,
  description,
  keywords,
  ogImage,
  canonical,
  noIndex,
}: {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
}): Metadata {
  return {
    title: `${title} | ${SITE_CONFIG.name}`,
    description,
    keywords: keywords ? [...DEFAULT_KEYWORDS, ...keywords] : DEFAULT_KEYWORDS,
    alternates: {
      canonical: canonical || '/',
    },
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      type: 'website',
      locale: 'fr_FR',
      url: canonical ? `${SITE_CONFIG.url}${canonical}` : SITE_CONFIG.url,
      siteName: SITE_CONFIG.name,
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      images: [{
        url: ogImage ? `${SITE_CONFIG.url}${ogImage}` : `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
        width: 1200,
        height: 630,
        alt: title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      site: SITE_CONFIG.twitter,
      creator: SITE_CONFIG.twitter,
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      images: [ogImage ? `${SITE_CONFIG.url}${ogImage}` : `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`],
    },
  };
}
