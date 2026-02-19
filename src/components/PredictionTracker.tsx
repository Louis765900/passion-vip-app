'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Target,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Zap,
  AlertTriangle,
  CalendarDays,
} from 'lucide-react';

interface TodayStats {
  total: number;
  won: number;
  lost: number;
  pending: number;
  win_rate: number;
}

interface RealStats {
  total: number;
  won: number;
  lost: number;
  pending: number;
  win_rate: number;
  roi: number;
  streak: number;
  streak_type: 'win' | 'loss';
  today: TodayStats;
  by_market: { market: string; total: number; won: number; roi: number }[];
  last_30_days: { total: number; won: number; win_rate: number };
}

interface PredictionTrackerProps {
  variant?: 'compact' | 'full';
  showBadge?: boolean;
}

function TrustBadge({ winRate, roi }: { winRate: number; roi: number }) {
  const level = winRate >= 65 ? 'gold' : winRate >= 55 ? 'silver' : 'bronze';
  const colors = {
    gold: 'from-yellow-400 to-amber-600 text-black',
    silver: 'from-gray-300 to-gray-500 text-black',
    bronze: 'from-amber-600 to-amber-800 text-white',
  };
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${colors[level]}`}
    >
      <Award className="w-5 h-5" />
      <div className="text-sm font-bold">
        <span className="uppercase">{level}</span>
        <span className="mx-2">|</span>
        <span>{winRate}% Win</span>
        <span className="mx-2">|</span>
        <span>{roi >= 0 ? '+' : ''}{roi}% ROI</span>
      </div>
    </motion.div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-6">
      <BarChart3 className="w-8 h-8 text-white/20 mx-auto mb-2" />
      <p className="text-sm text-white/50">{message}</p>
    </div>
  );
}

export function PredictionTracker({ variant = 'full', showBadge = true }: PredictionTrackerProps) {
  const [stats, setStats] = useState<RealStats | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setFetchError(false);
      try {
        const res = await fetch('/api/stats/predictions');
        if (!res.ok) throw new Error('API error');
        const result = await res.json();
        if (result.success && result.data) {
          setStats(result.data as RealStats);
          setIsEmpty(result.is_empty === true);
        } else {
          setFetchError(true);
        }
      } catch {
        setFetchError(true);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-white/5 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
        <BarChart3 className="w-8 h-8 text-white/30 mx-auto mb-2" />
        <p className="text-sm text-white/50">Statistiques indisponibles pour le moment.</p>
      </div>
    );
  }

  const today = stats?.today ?? { total: 0, won: 0, lost: 0, pending: 0, win_rate: 0 };
  const settledTotal = (stats?.won ?? 0) + (stats?.lost ?? 0);

  // ── VERSION COMPACTE ──
  if (variant === 'compact') {
    return (
      <div className="p-4 bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-neon-green" />
            Suivi des Performances
          </h3>
          {showBadge && !isEmpty && settledTotal >= 10 && stats && (
            <TrustBadge winRate={stats.win_rate} roi={stats.roi} />
          )}
        </div>

        {/* Section "Aujourd'hui" — toujours affichée */}
        <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-1.5 mb-2">
            <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Aujourd'hui</span>
          </div>
          {today.total === 0 ? (
            <p className="text-xs text-white/40">Aucun pari placé aujourd'hui.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span className="text-base font-bold text-amber-400">{today.pending}</span>
                </div>
                <div className="text-[10px] text-white/40">En cours</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                  <span className="text-base font-bold text-green-400">{today.won}</span>
                </div>
                <div className="text-[10px] text-white/40">Gagnés</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1">
                  <XCircle className="w-3 h-3 text-red-400" />
                  <span className="text-base font-bold text-red-400">{today.lost}</span>
                </div>
                <div className="text-[10px] text-white/40">Perdus</div>
              </div>
            </div>
          )}
        </div>

        {/* Stats globales — seulement si données réelles */}
        {isEmpty || settledTotal < 5 ? (
          <EmptyState message="Les statistiques globales apparaîtront après vos premiers paris résolus." />
        ) : (
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-xl font-bold text-amber-400">{stats?.win_rate}%</div>
              <div className="text-[10px] text-white/50">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-neon-green">{(stats?.roi ?? 0) >= 0 ? '+' : ''}{stats?.roi}%</div>
              <div className="text-[10px] text-white/50">ROI</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{stats?.won}/{settledTotal}</div>
              <div className="text-[10px] text-white/50">Gagnés</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-amber-400">{stats?.streak}</div>
              <div className="text-[10px] text-white/50">Série {stats?.streak_type === 'win' ? 'V' : 'D'}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── VERSION COMPLÈTE ──
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-neon-green" />
            Suivi des Performances
          </h2>
          {!isEmpty && (
            <p className="text-sm text-white/50 mt-1">
              {stats?.total ?? 0} paris suivis · {settledTotal} résolus
            </p>
          )}
        </div>
        {showBadge && !isEmpty && settledTotal >= 10 && stats && (
          <TrustBadge winRate={stats.win_rate} roi={stats.roi} />
        )}
      </div>

      {/* Aujourd'hui */}
      <div className="p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-xl">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-amber-400" />
          Aujourd'hui
        </h3>
        {today.total === 0 ? (
          <p className="text-sm text-white/40">Aucun pari placé aujourd'hui.</p>
        ) : (
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{today.total}</div>
              <div className="text-xs text-white/50">Paris</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">{today.pending}</div>
              <div className="text-xs text-white/50">En cours</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{today.won}</div>
              <div className="text-xs text-white/50">Gagnés</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">{today.lost}</div>
              <div className="text-xs text-white/50">Perdus</div>
            </div>
          </div>
        )}
        {today.total > 0 && (today.won + today.lost) > 0 && (
          <div className="mt-3 pt-3 border-t border-amber-500/10 text-center">
            <span className="text-sm text-white/60">Win rate du jour : </span>
            <span className="text-sm font-bold text-amber-400">{today.win_rate}%</span>
          </div>
        )}
      </div>

      {/* Stats globales */}
      {isEmpty || settledTotal < 5 ? (
        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
          <EmptyState message="Les statistiques globales apparaîtront après vos premiers paris résolus." />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 w-fit mb-2">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-white">{stats?.win_rate}%</div>
              <div className="text-xs text-white/50 mt-1">Taux de réussite</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="p-2 rounded-lg bg-neon-green/20 text-neon-green w-fit mb-2">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-white">{(stats?.roi ?? 0) >= 0 ? '+' : ''}{stats?.roi}%</div>
              <div className="text-xs text-white/50 mt-1">ROI</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 w-fit mb-2">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-white">{stats?.won}<span className="text-sm text-white/40">/{settledTotal}</span></div>
              <div className="text-xs text-white/50 mt-1">Paris gagnés</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className={`p-2 rounded-lg w-fit mb-2 ${stats?.streak_type === 'win' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                {stats?.streak_type === 'win' ? <Zap className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              </div>
              <div className="text-2xl font-bold text-white">{stats?.streak}</div>
              <div className="text-xs text-white/50 mt-1">Série {stats?.streak_type === 'win' ? 'victoires' : 'défaites'}</div>
            </motion.div>
          </div>

          {/* 30 derniers jours */}
          {(stats?.last_30_days.total ?? 0) > 0 && (
            <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                30 Derniers Jours
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{stats?.last_30_days.total}</div>
                  <div className="text-xs text-white/50">Paris</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-400">{stats?.last_30_days.win_rate}%</div>
                  <div className="text-xs text-white/50">Win Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{stats?.last_30_days.won}</div>
                  <div className="text-xs text-white/50">Gagnés</div>
                </div>
              </div>
            </div>
          )}

          {/* Par marché */}
          {(stats?.by_market.length ?? 0) > 0 && (
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Performance par Marché
              </h3>
              <div className="space-y-3">
                {stats?.by_market.map((market, index) => {
                  const winPct = market.total > 0 ? Math.round((market.won / market.total) * 100) : 0;
                  return (
                    <div key={market.market} className="flex items-center gap-4">
                      <div className="w-28 text-sm text-white/70 truncate">{market.market}</div>
                      <div className="flex-1">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${winPct}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className="h-full bg-gradient-to-r from-neon-green to-amber-500 rounded-full"
                          />
                        </div>
                      </div>
                      <div className="w-12 text-right text-sm text-amber-400 font-medium">{winPct}%</div>
                      <div className="w-16 text-right text-sm">
                        <span className={market.roi >= 0 ? 'text-neon-green' : 'text-red-400'}>
                          {market.roi >= 0 ? '+' : ''}{market.roi}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-200/80 leading-relaxed">
          Les performances passées ne préjugent pas des performances futures.
          Statistiques basées sur vos paris réels. Pariez de manière responsable.
        </p>
      </div>
    </div>
  );
}

export default PredictionTracker;
