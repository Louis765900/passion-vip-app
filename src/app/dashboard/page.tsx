import { Suspense } from 'react'
import { Trophy, TrendingUp, Shield, AlertTriangle } from 'lucide-react'
import { Toaster } from 'sonner'
import { Header, VipConfidenceCard, DashboardClient, PredictionTracker } from '@/components'
import { DashboardSkeleton } from '@/components/LoadingSkeleton'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff'
          }
        }}
      />
      <Header />

      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        {/* Hero Section */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-3">
            <Trophy className="w-6 h-6 md:w-8 md:h-8 text-neon-green" />
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
              La Passion <span className="text-neon-green">VIP</span>
            </h1>
          </div>
          <p className="text-sm md:text-base text-white/60 max-w-2xl mx-auto px-2">
            Analyses professionnelles et pronostics VIP generes par IA.
            Tickets SAFE et FUN avec gestion de bankroll integree.
          </p>

          {/* Badges - Fonctionnalites */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Value Betting IA</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Gestion Bankroll</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-xs text-red-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>18+ Jeu responsable</span>
            </div>
          </div>
        </div>

        {/* Carte VIP Confiance */}
        <div className="my-8">
          <Suspense fallback={<DashboardSkeleton />}>
            <VipConfidenceCard />
          </Suspense>
        </div>

        {/* Dashboard Client (Matchs) */}
        <DashboardClient />

        {/* Section Performance Tracking */}
        <section className="mt-12 md:mt-16">
          <PredictionTracker variant="compact" showBadge={true} />
        </section>

        {/* Section Informative */}
        <section className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="p-5 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold">Analyse IA Avancee</h3>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Notre IA analyse en temps reel les statistiques, la forme des equipes, les cotes et identifie les meilleures opportunites.
            </p>
          </div>

          <div className="p-5 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-white font-semibold">Gestion Bankroll</h3>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Tickets SAFE (5% bankroll) et FUN (1-2%) avec calcul Kelly Criterion integre pour une gestion optimale de votre capital.
            </p>
          </div>

          <div className="p-5 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-white font-semibold">Value Betting</h3>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Identification des cotes surcotees avec calcul de l'Expected Value (EV) pour maximiser vos gains sur le long terme.
            </p>
          </div>
        </section>

      </main>
    </div>
  )
}
