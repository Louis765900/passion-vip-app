import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'A Propos - PronoScope | Notre Mission et Methodologie',
  description: 'Decouvrez notre mission, nos valeurs et notre methodologie d\'analyse basee sur l\'intelligence artificielle. Transparence, gratuite et rigueur au service des passionnes de football.',
  keywords: ['a propos', 'pronoscope', 'methodologie', 'analyse ia', 'pronostics gratuits', 'transparence'],
  openGraph: {
    title: 'A Propos - PronoScope',
    description: 'Notre mission : fournir des analyses sportives de qualite, accessibles a tous, basees sur les donnees.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'PronoScope',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://pronoscope.vercel.app/a-propos',
  },
};

export default function AProposLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
