import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PronoSport AI - Pronostics Football Intelligents',
  description: 'Analyses et pronostics de football en temps réel propulsés par l\'intelligence artificielle',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased text-white">
        {children}
      </body>
    </html>
  )
}
