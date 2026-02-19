import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - PronoScope | Guides et Analyses Football',
  description: 'Guides, analyses et actualites pour ameliorer vos connaissances en paris sportifs. Contenu educatif gratuit sur l\'analyse football, les statistiques et les strategies.',
  keywords: ['blog football', 'guides paris sportifs', 'analyse football', 'xg expected goals', 'statistiques football', 'conseils'],
  openGraph: {
    title: 'Blog - PronoScope',
    description: 'Guides et analyses pour ameliorer vos connaissances en paris sportifs.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'PronoScope',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://pronoscope.vercel.app/blog',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
