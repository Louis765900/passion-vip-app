'use client';

import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight, Trophy, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

const recentResults = [
  {
    match: 'PSG vs Monaco',
    competition: 'Ligue 1',
    pick: 'Plus de 2.5 buts',
    odds: 1.75,
    result: 'win',
    score: '3-1',
    date: '28 Jan 2026',
    confidence: 78,
  },
  {
    match: 'Liverpool vs Arsenal',
    competition: 'Premier League',
    pick: 'BTTS Oui',
    odds: 1.85,
    result: 'win',
    score: '2-2',
    date: '27 Jan 2026',
    confidence: 72,
  },
  {
    match: 'Real Madrid vs Atletico',
    competition: 'La Liga',
    pick: 'Moins de 3.5 buts',
    odds: 1.65,
    result: 'loss',
    score: '4-2',
    date: '26 Jan 2026',
    confidence: 65,
  },
  {
    match: 'Bayern vs Dortmund',
    competition: 'Bundesliga',
    pick: 'Bayern gagne',
    odds: 1.55,
    result: 'win',
    score: '2-0',
    date: '25 Jan 2026',
    confidence: 82,
  },
];

export function RecentResults() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-4"
          >
            <Trophy className="w-4 h-4" />
            Derniers Résultats
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
          >
            Notre <span className="text-green-400">Track Record</span> récent
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-xl mx-auto"
          >
            Transparence totale : voici nos dernières analyses avec leurs résultats.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentResults.map((result, index) => (
            <motion.div
              key={result.match}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'p-5 rounded-xl',
                'bg-slate-800/50 border border-slate-700/50',
                'hover:border-slate-600/50',
                'transition-all duration-300'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500">{result.date}</span>
                <div
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold',
                    result.result === 'win'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  )}
                >
                  {result.result === 'win' ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {result.result === 'win' ? 'GAGNÉ' : 'PERDU'}
                </div>
              </div>

              {/* Match */}
              <h3 className="font-semibold text-white mb-1">{result.match}</h3>
              <p className="text-xs text-slate-500 mb-3">{result.competition}</p>

              {/* Pick */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Pick</span>
                  <span className="text-sm text-white">{result.pick}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Cote</span>
                  <span className="text-sm font-bold text-amber-400">@{result.odds}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Score</span>
                  <span className="text-sm text-white">{result.score}</span>
                </div>
              </div>

              {/* Confidence bar */}
              <div className="mt-4 pt-3 border-t border-slate-700/50">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500">Confiance IA</span>
                  <span className="text-slate-300">{result.confidence}%</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      result.result === 'win' ? 'bg-green-500' : 'bg-red-500'
                    )}
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View all link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <Link
            href="/pronostics"
            className={cn(
              'inline-flex items-center gap-2 px-6 py-3 rounded-xl',
              'bg-slate-800 text-white font-medium',
              'border border-slate-700 hover:border-amber-500/50',
              'transition-all duration-200'
            )}
          >
            Voir tout l&apos;historique
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
