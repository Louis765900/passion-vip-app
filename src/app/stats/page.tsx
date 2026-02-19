'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  TrendingUp,
  Trophy,
  BarChart3,
  Calendar,
  ChevronRight,
  AlertTriangle,
  Phone,
  Shield,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { PredictionTracker } from '@/components/PredictionTracker';

interface MonthlyPerformance {
  month: string;
  predictions: number;
  won: number;
  roi: number;
}

interface PredictionStats {
  total_predictions: number;
  won: number;
  lost: number;
  pending: number;
  win_rate: number;
  roi: number;
  total_profit: number;
  streak: number;
  streak_type: 'win' | 'loss';
  by_market: {
    market: string;
    total: number;
    won: number;
    roi: number;
  }[];
  monthly_performance: MonthlyPerformance[];
}

export default function StatsPage() {
  const [stats, setStats] = useState<PredictionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats/predictions');
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="min-h-screen bg-dark-900 py-8 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neon-green/10 border border-neon-green/30 rounded-full mb-4"
          >
            <BarChart3 className="w-4 h-4 text-neon-green" />
            <span className="text-neon-green text-sm font-medium">Statistiques Publiques</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-white mb-3"
          >
            Historique des <span className="text-neon-green">Performances</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 max-w-2xl mx-auto"
          >
            Transparence totale sur nos resultats. Toutes nos predictions sont trackees et verifiables.
          </motion.p>
        </div>

        {/* Stats principales */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="p-5 bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl text-center">
              <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{stats.win_rate}%</div>
              <div className="text-xs text-white/50 mt-1">Taux de Reussite</div>
            </div>

            <div className="p-5 bg-gradient-to-br from-neon-green/10 to-green-600/5 border border-neon-green/20 rounded-xl text-center">
              <TrendingUp className="w-8 h-8 text-neon-green mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">+{stats.roi}%</div>
              <div className="text-xs text-white/50 mt-1">ROI Global</div>
            </div>

            <div className="p-5 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl text-center">
              <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{stats.total_predictions}</div>
              <div className="text-xs text-white/50 mt-1">Predictions Totales</div>
            </div>

            <div className="p-5 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl text-center">
              <Zap className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{stats.streak}</div>
              <div className="text-xs text-white/50 mt-1">
                Serie {stats.streak_type === 'win' ? 'Victoires' : 'Defaites'}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tracker complet */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-10"
        >
          <PredictionTracker variant="full" showBadge={true} />
        </motion.section>

        {/* Performance mensuelle */}
        {stats && stats.monthly_performance.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-10"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Performance Mensuelle
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs text-white/50 uppercase py-3 px-4">Mois</th>
                    <th className="text-center text-xs text-white/50 uppercase py-3 px-4">Predictions</th>
                    <th className="text-center text-xs text-white/50 uppercase py-3 px-4">Gagnees</th>
                    <th className="text-center text-xs text-white/50 uppercase py-3 px-4">Win Rate</th>
                    <th className="text-right text-xs text-white/50 uppercase py-3 px-4">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.monthly_performance.map((month, index) => (
                    <motion.tr
                      key={month.month}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-4 text-white font-medium">{formatMonth(month.month)}</td>
                      <td className="py-4 px-4 text-center text-white/70">{month.predictions}</td>
                      <td className="py-4 px-4 text-center text-green-400 font-medium">{month.won}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2 py-1 bg-white/5 rounded text-white/70 text-sm">
                          {month.predictions > 0 ? Math.round((month.won / month.predictions) * 100) : 0}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`font-bold ${month.roi >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                          {month.roi >= 0 ? '+' : ''}{month.roi}%
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center mb-10"
        >
          <div className="p-6 bg-gradient-to-r from-neon-green/10 via-green-500/5 to-neon-green/10 border border-neon-green/20 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-2">
              Rejoignez PronoScope
            </h3>
            <p className="text-white/60 text-sm mb-4">
              Acces a toutes nos analyses detaillees et pronostics en temps reel
            </p>
            <Link
              href="/vip"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-green to-green-500 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-neon-green/20 transition-all"
            >
              Decouvrir l'offre VIP
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Avertissement legal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="p-4 bg-amber-900/20 border border-amber-500/20 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm text-amber-200/80">
              <p>
                <strong className="text-amber-300">Avertissement :</strong> Les performances passees ne garantissent pas les resultats futurs.
                Ces statistiques sont fournies a titre informatif uniquement.
              </p>
              <p>
                Jouer comporte des risques : endettement, isolement, dependance.
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Appelez le <a href="tel:0974751313" className="text-amber-300 underline font-medium">09 74 75 13 13</a> (appel non surtaxe)
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
