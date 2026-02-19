'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Target,
  Trophy,
  CheckCircle2,
  XCircle,
  Filter,
  Calendar,
  ArrowRight,
  Gift,
  AlertTriangle
} from 'lucide-react';

// Statistiques globales (placeholder - a remplacer par donnees API)
const globalStats = {
  totalPronos: 247,
  wins: 143,
  losses: 104,
  successRate: 57.9,
  roi: 12.4,
  avgOdds: 1.82,
  bestMonth: 'Decembre 2025',
  bestMonthRate: 68,
};

// Liste des pronostics (placeholder - a remplacer par donnees API)
const pronosticsList = [
  { id: 1, date: '29 Jan 2026', match: 'Man City vs Chelsea', competition: 'Premier League', prediction: 'Plus de 2.5 buts', odds: 1.65, result: 'pending', score: '-' },
  { id: 2, date: '28 Jan 2026', match: 'PSG vs Monaco', competition: 'Ligue 1', prediction: 'Plus de 2.5 buts', odds: 1.75, result: 'won', score: '3-1' },
  { id: 3, date: '28 Jan 2026', match: 'Bayern vs Dortmund', competition: 'Bundesliga', prediction: 'BTTS Oui', odds: 1.70, result: 'won', score: '2-1' },
  { id: 4, date: '27 Jan 2026', match: 'Liverpool vs Arsenal', competition: 'Premier League', prediction: 'BTTS Oui', odds: 1.85, result: 'won', score: '2-2' },
  { id: 5, date: '27 Jan 2026', match: 'Juventus vs Inter', competition: 'Serie A', prediction: 'Moins de 2.5 buts', odds: 2.10, result: 'lost', score: '3-2' },
  { id: 6, date: '26 Jan 2026', match: 'Real Madrid vs Atletico', competition: 'La Liga', prediction: 'Moins de 3.5 buts', odds: 1.65, result: 'lost', score: '4-2' },
  { id: 7, date: '26 Jan 2026', match: 'Marseille vs Lyon', competition: 'Ligue 1', prediction: 'Plus de 1.5 buts', odds: 1.40, result: 'won', score: '2-1' },
  { id: 8, date: '25 Jan 2026', match: 'Man United vs Tottenham', competition: 'Premier League', prediction: 'BTTS Oui', odds: 1.75, result: 'won', score: '2-3' },
  { id: 9, date: '25 Jan 2026', match: 'Barcelona vs Sevilla', competition: 'La Liga', prediction: 'Plus de 2.5 buts', odds: 1.80, result: 'won', score: '4-1' },
  { id: 10, date: '24 Jan 2026', match: 'AC Milan vs Napoli', competition: 'Serie A', prediction: 'Moins de 2.5 buts', odds: 2.00, result: 'lost', score: '2-2' },
  { id: 11, date: '24 Jan 2026', match: 'Leipzig vs Leverkusen', competition: 'Bundesliga', prediction: 'BTTS Oui', odds: 1.65, result: 'won', score: '3-2' },
  { id: 12, date: '23 Jan 2026', match: 'Chelsea vs Newcastle', competition: 'Premier League', prediction: 'Plus de 1.5 buts', odds: 1.45, result: 'won', score: '2-0' },
  { id: 13, date: '23 Jan 2026', match: 'Lens vs Lille', competition: 'Ligue 1', prediction: 'Moins de 2.5 buts', odds: 1.90, result: 'won', score: '1-0' },
  { id: 14, date: '22 Jan 2026', match: 'Real Sociedad vs Athletic', competition: 'La Liga', prediction: 'BTTS Oui', odds: 1.95, result: 'lost', score: '0-1' },
  { id: 15, date: '22 Jan 2026', match: 'Roma vs Lazio', competition: 'Serie A', prediction: 'Plus de 2.5 buts', odds: 1.85, result: 'won', score: '3-1' },
  { id: 16, date: '21 Jan 2026', match: 'Aston Villa vs Brighton', competition: 'Premier League', prediction: 'Plus de 1.5 buts', odds: 1.50, result: 'won', score: '2-1' },
  { id: 17, date: '21 Jan 2026', match: 'Monaco vs Nice', competition: 'Ligue 1', prediction: 'BTTS Oui', odds: 1.80, result: 'lost', score: '2-0' },
  { id: 18, date: '20 Jan 2026', match: 'Stuttgart vs Frankfurt', competition: 'Bundesliga', prediction: 'Plus de 2.5 buts', odds: 1.70, result: 'won', score: '3-2' },
  { id: 19, date: '20 Jan 2026', match: 'Villarreal vs Valencia', competition: 'La Liga', prediction: 'Moins de 2.5 buts', odds: 2.05, result: 'won', score: '1-1' },
  { id: 20, date: '19 Jan 2026', match: 'Atalanta vs Fiorentina', competition: 'Serie A', prediction: 'Plus de 2.5 buts', odds: 1.75, result: 'lost', score: '1-1' },
];

// Filtres disponibles
const filterOptions = [
  { value: 'all', label: 'Tous' },
  { value: 'won', label: 'Gagnes' },
  { value: 'lost', label: 'Perdus' },
  { value: 'pending', label: 'En cours' },
];

export default function PronosticsPage() {
  const [filter, setFilter] = useState('all');

  const filteredPronos = pronosticsList.filter(p => {
    if (filter === 'all') return true;
    return p.result === filter;
  });

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'won':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-3 h-3" />
            GAGNE
          </span>
        );
      case 'lost':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold">
            <XCircle className="w-3 h-3" />
            PERDU
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold">
            <Calendar className="w-3 h-3" />
            EN COURS
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour a l'accueil
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <BarChart3 className="w-6 h-6 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Track Record</h1>
          </div>
          <p className="text-gray-400">
            Historique complet et transparent de tous nos pronostics.
          </p>
        </motion.div>

        {/* Statistiques globales */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 bg-white/5 border border-white/10 rounded-xl text-center">
              <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold text-green-400">{globalStats.successRate}%</div>
              <div className="text-xs text-gray-400">Taux de reussite</div>
            </div>
            <div className="p-5 bg-white/5 border border-white/10 rounded-xl text-center">
              <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold text-blue-400">+{globalStats.roi}%</div>
              <div className="text-xs text-gray-400">ROI Global</div>
            </div>
            <div className="p-5 bg-white/5 border border-white/10 rounded-xl text-center">
              <BarChart3 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold text-purple-400">{globalStats.totalPronos}</div>
              <div className="text-xs text-gray-400">Total pronostics</div>
            </div>
            <div className="p-5 bg-white/5 border border-white/10 rounded-xl text-center">
              <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold text-amber-400">{globalStats.wins}</div>
              <div className="text-xs text-gray-400">Victoires</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="text-sm text-gray-300">
                <span className="text-white font-medium">{globalStats.wins}</span> victoires sur{' '}
                <span className="text-white font-medium">{globalStats.totalPronos}</span> pronostics |
                Cote moyenne : <span className="text-amber-400 font-medium">{globalStats.avgOdds}</span>
              </div>
              <div className="text-sm text-gray-400">
                Meilleur mois : <span className="text-green-400 font-medium">{globalStats.bestMonth}</span> ({globalStats.bestMonthRate}%)
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-2 text-center">
            * Statistiques calculees sur les 12 derniers mois. Les performances passees ne garantissent pas les resultats futurs.
          </p>
        </motion.section>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6 flex items-center gap-3"
        >
          <Filter className="w-4 h-4 text-gray-400" />
          <div className="flex gap-2">
            {filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === option.value
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Liste des pronostics */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            {/* Header tableau */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-white/5 border-b border-white/10 text-xs text-gray-400 font-medium">
              <div className="col-span-2">Date</div>
              <div className="col-span-3">Match</div>
              <div className="col-span-2">Competition</div>
              <div className="col-span-2">Prediction</div>
              <div className="col-span-1">Cote</div>
              <div className="col-span-1">Score</div>
              <div className="col-span-1">Resultat</div>
            </div>

            {/* Lignes */}
            {filteredPronos.map((prono, index) => (
              <motion.div
                key={prono.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 + index * 0.02 }}
                className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${
                  index === filteredPronos.length - 1 ? 'border-b-0' : ''
                }`}
              >
                {/* Version mobile */}
                <div className="md:hidden space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{prono.date}</span>
                    {getResultBadge(prono.result)}
                  </div>
                  <div className="font-medium text-white">{prono.match}</div>
                  <div className="text-xs text-gray-500">{prono.competition}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-300">{prono.prediction}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-amber-400 font-bold">{prono.odds}</span>
                      <span className="text-white font-medium">{prono.score}</span>
                    </div>
                  </div>
                </div>

                {/* Version desktop */}
                <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-2 text-sm text-gray-400">{prono.date}</div>
                  <div className="col-span-3 font-medium text-white">{prono.match}</div>
                  <div className="col-span-2 text-sm text-gray-400">{prono.competition}</div>
                  <div className="col-span-2 text-sm text-gray-300">{prono.prediction}</div>
                  <div className="col-span-1 text-amber-400 font-bold">{prono.odds}</div>
                  <div className="col-span-1 text-white font-medium">{prono.score}</div>
                  <div className="col-span-1">{getResultBadge(prono.result)}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredPronos.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              Aucun pronostic ne correspond aux filtres selectionnes.
            </div>
          )}
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10 p-6 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-xl text-center"
        >
          <h2 className="text-xl font-bold text-white mb-3">
            Acces Gratuit aux Analyses Detaillees
          </h2>
          <p className="text-gray-400 text-sm mb-4 max-w-lg mx-auto">
            Creez un compte gratuit pour acceder aux analyses completes, aux niveaux de confiance et aux outils de gestion de bankroll.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all"
          >
            <Gift className="w-5 h-5" />
            Creer mon Compte Gratuit
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.section>

        {/* Disclaimer */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-200/80">
              <strong className="text-red-300">Avertissement :</strong> Ces pronostics sont fournis a titre informatif uniquement.
              Les performances passees ne garantissent pas les resultats futurs. Le jeu comporte des risques.
              <span className="font-bold ml-1">18+ uniquement.</span>
              <a href="tel:0974751313" className="ml-2 underline">Aide : 09 74 75 13 13</a>
            </div>
          </div>
        </motion.section>

        {/* Footer navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 pt-6 border-t border-white/10"
        >
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <Link href="/a-propos" className="hover:text-white transition-colors">A propos</Link>
            <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions legales</Link>
            <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
            <Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialite</Link>
            <Link href="/jeu-responsable" className="hover:text-white transition-colors">Jeu responsable</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
