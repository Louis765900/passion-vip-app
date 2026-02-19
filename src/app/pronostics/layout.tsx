import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Record - PronoScope | Historique des Pronostics',
  description: 'Consultez notre track record complet et transparent. Tous nos pronostics football passes avec leurs resultats : victoires et defaites, sans cherry-picking.',
  keywords: ['track record', 'historique pronostics', 'resultats', 'statistiques', 'performances', 'pronostics football'],
  openGraph: {
    title: 'Track Record - PronoScope',
    description: 'Notre historique complet de pronostics. Transparence totale sur nos resultats passes.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'PronoScope',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://pronoscope.vercel.app/pronostics',
  },
};

export default function PronosticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
