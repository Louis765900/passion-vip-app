'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Target,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Shield,
  Zap,
  Phone,
  Globe,
  Search,
  Calculator,
} from 'lucide-react';
import { Match } from '@/types';

// ============================================================
// Phase config aligné avec le serveur (7 phases)
// ============================================================

type PhaseName = 'context' | 'stats_advanced' | 'odds_analysis' | 'value_detection' | 'kelly_risk' | 'final_pro' | 'review_critical';

interface PhaseConfig {
  icon: any;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const PHASE_CONFIG: Record<PhaseName, PhaseConfig> = {
  context: { icon: Globe, label: 'Contexte & Environnement', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30' },
  stats_advanced: { icon: BarChart3, label: 'Stats Avancées & xG', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
  odds_analysis: { icon: TrendingUp, label: 'Analyse des Cotes', color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
  value_detection: { icon: Search, label: 'Détection de Value', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30' },
  kelly_risk: { icon: Calculator, label: 'Kelly & Risque', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30' },
  final_pro: { icon: Target, label: 'Pronostic Final', color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30' },
  review_critical: { icon: Shield, label: 'Relecture Critique', color: 'text-rose-400', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/30' },
};

const PHASE_ORDER: PhaseName[] = [
  'context', 'stats_advanced', 'odds_analysis',
  'value_detection', 'kelly_risk', 'final_pro', 'review_critical',
];

interface StreamingAnalysisProps {
  match: Match;
  onClose?: () => void;
}

// ============================================================
// Sub-components
// ============================================================

function ConfidenceBadge({ value }: { value: number }) {
  const getColor = () => {
    if (value >= 75) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (value >= 50) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getColor()}`}>
      {value}%
    </span>
  );
}

function ProgressBar({ value, color = 'bg-neon-green' }: { value: number; color?: string }) {
  return (
    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`h-full ${color} rounded-full`}
      />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 text-white/50">
      <span className="w-2 h-2 bg-current rounded-full typing-dot" />
      <span className="w-2 h-2 bg-current rounded-full typing-dot" />
      <span className="w-2 h-2 bg-current rounded-full typing-dot" />
    </div>
  );
}

function StatCard({ label, value, color = 'text-white' }: { label: string; value: any; color?: string }) {
  return (
    <div className="text-center p-2.5 bg-white/5 rounded-lg">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-white/50 mt-0.5">{label}</div>
    </div>
  );
}

// ============================================================
// Phase Renderers
// ============================================================

function RenderContext({ data, match }: { data: any; match: Match }) {
  if (!data) return null;
  return (
    <div className="space-y-3">
      {data.injuries?.length > 0 && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <h5 className="text-xs text-red-400 uppercase mb-2 font-semibold">Blessures / Absences</h5>
          <ul className="space-y-1">
            {data.injuries.map((inj: string, i: number) => (
              <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                <span className="text-red-400">•</span>{inj}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.weather && (
          <div className="p-3 bg-white/5 rounded-lg">
            <h5 className="text-xs text-white/50 uppercase mb-1">Météo</h5>
            <p className="text-sm text-white/80">{data.weather}</p>
          </div>
        )}
        {data.referee && (
          <div className="p-3 bg-white/5 rounded-lg">
            <h5 className="text-xs text-white/50 uppercase mb-1">Arbitre</h5>
            <p className="text-sm text-white/80">{data.referee.name} ({data.referee.style})</p>
            <p className="text-xs text-white/50 mt-1">{data.referee.avg_cards_per_game} cartons/match</p>
          </div>
        )}
      </div>
      {data.motivation && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-white/5 rounded-lg">
            <h5 className="text-xs text-white/50 uppercase mb-1">{match.homeTeam}</h5>
            <p className="text-sm text-white/80">{data.motivation.home}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <h5 className="text-xs text-white/50 uppercase mb-1">{match.awayTeam}</h5>
            <p className="text-sm text-white/80">{data.motivation.away}</p>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {data.motivation?.derby && <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">Derby</span>}
        {data.motivation?.title_race && <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full border border-amber-500/30">Course au titre</span>}
        {data.motivation?.relegation_battle && <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30">Maintien</span>}
      </div>
      {data.news_impact && <p className="text-sm text-white/60 italic">{data.news_impact}</p>}
    </div>
  );
}

function RenderStatsAdvanced({ data, match }: { data: any; match: Match }) {
  if (!data) return null;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 bg-white/5 rounded-lg">
          <h5 className="text-xs text-white/50 uppercase mb-2">Forme {match.homeTeam}</h5>
          <p className="text-sm text-white/80 mb-2">{data.home_form_advanced?.last_5}</p>
          <ProgressBar value={data.home_form_advanced?.adjusted_form_score || 0} color="bg-blue-500" />
          <p className="text-[10px] text-white/40 mt-1">Score ajusté: {data.home_form_advanced?.adjusted_form_score}/100</p>
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          <h5 className="text-xs text-white/50 uppercase mb-2">Forme {match.awayTeam}</h5>
          <p className="text-sm text-white/80 mb-2">{data.away_form_advanced?.last_5}</p>
          <ProgressBar value={data.away_form_advanced?.adjusted_form_score || 0} color="bg-red-500" />
          <p className="text-[10px] text-white/40 mt-1">Score ajusté: {data.away_form_advanced?.adjusted_form_score}/100</p>
        </div>
      </div>
      {data.h2h_analysis && (
        <div className="p-3 bg-white/5 rounded-lg">
          <h5 className="text-xs text-white/50 uppercase mb-1">Confrontations directes</h5>
          <p className="text-sm text-white/80">{data.h2h_analysis.summary}</p>
          <p className="text-xs text-white/50 mt-1">Moy. buts: {data.h2h_analysis.avg_goals}</p>
        </div>
      )}
      {data.advanced_metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label={`xG ${match.homeTeam?.split(' ')[0]}`} value={data.advanced_metrics.home_xg_avg} color="text-blue-400" />
          <StatCard label={`xG ${match.awayTeam?.split(' ')[0]}`} value={data.advanced_metrics.away_xg_avg} color="text-red-400" />
          <StatCard label="xGA Dom" value={data.advanced_metrics.home_xga_avg} color="text-cyan-400" />
          <StatCard label="xGA Ext" value={data.advanced_metrics.away_xga_avg} color="text-orange-400" />
        </div>
      )}
      {data.team_strengths && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard label="Attaque Dom" value={data.team_strengths.home_attack} color="text-blue-400" />
          <StatCard label="Défense Dom" value={data.team_strengths.home_defense} color="text-blue-400" />
          <StatCard label="Coups arrêtés" value={data.team_strengths.home_set_pieces} color="text-blue-400" />
          <StatCard label="Attaque Ext" value={data.team_strengths.away_attack} color="text-red-400" />
          <StatCard label="Défense Ext" value={data.team_strengths.away_defense} color="text-red-400" />
          <StatCard label="Coups arrêtés" value={data.team_strengths.away_set_pieces} color="text-red-400" />
        </div>
      )}
      {data.key_insights?.length > 0 && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h5 className="text-xs text-blue-400 uppercase mb-2 font-semibold">Points clés</h5>
          <ul className="space-y-1">
            {data.key_insights.map((insight: string, i: number) => (
              <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                <Zap className="w-3 h-3 text-blue-400 flex-shrink-0 mt-1" />{insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function RenderOddsAnalysis({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="space-y-4">
      {data.current_market && (
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-white">{data.current_market.home}</div>
            <div className="text-[10px] text-white/50 mt-1">Cote 1</div>
            <div className="text-xs text-blue-400 mt-0.5">{data.current_market.implied_prob_home}%</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-white">{data.current_market.draw}</div>
            <div className="text-[10px] text-white/50 mt-1">Cote N</div>
            <div className="text-xs text-gray-400 mt-0.5">{data.current_market.implied_prob_draw}%</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-white">{data.current_market.away}</div>
            <div className="text-[10px] text-white/50 mt-1">Cote 2</div>
            <div className="text-xs text-red-400 mt-0.5">{data.current_market.implied_prob_away}%</div>
          </div>
        </div>
      )}
      {data.our_estimated_probabilities && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <h5 className="text-xs text-amber-400 uppercase mb-2 font-semibold">Notre estimation vs Bookmaker</h5>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-amber-400">{data.our_estimated_probabilities.home}%</div>
              <div className="text-[10px] text-white/50">1</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-400">{data.our_estimated_probabilities.draw}%</div>
              <div className="text-[10px] text-white/50">N</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-400">{data.our_estimated_probabilities.away}%</div>
              <div className="text-[10px] text-white/50">2</div>
            </div>
          </div>
          <div className="text-center mt-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              data.our_estimated_probabilities.confidence_level === 'high' ? 'bg-green-500/20 text-green-400' :
              data.our_estimated_probabilities.confidence_level === 'medium' ? 'bg-amber-500/20 text-amber-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              Confiance: {data.our_estimated_probabilities.confidence_level}
            </span>
          </div>
        </div>
      )}
      {data.margin_analysis?.sharp_money_indicator && (
        <p className="text-sm text-white/60 italic">{data.margin_analysis.sharp_money_indicator}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.asian_handicap && (
          <div className="p-3 bg-white/5 rounded-lg">
            <h5 className="text-xs text-white/50 uppercase mb-1">Handicap Asiatique</h5>
            <p className="text-sm text-white/80">{data.asian_handicap.line} | {data.asian_handicap.home_odds} / {data.asian_handicap.away_odds}</p>
            {data.asian_handicap.value_side && <p className="text-xs text-amber-400 mt-1">Value: {data.asian_handicap.value_side}</p>}
          </div>
        )}
        {data.over_under && (
          <div className="p-3 bg-white/5 rounded-lg">
            <h5 className="text-xs text-white/50 uppercase mb-1">Over/Under {data.over_under.line}</h5>
            <p className="text-sm text-white/80">Over: {data.over_under.over_odds} | Under: {data.over_under.under_odds}</p>
            {data.over_under.value_side && <p className="text-xs text-amber-400 mt-1">Value: {data.over_under.value_side}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function RenderValueDetection({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="space-y-4">
      {data.value_opportunities?.map((opp: any, i: number) => (
        <div key={i} className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white">{opp.selection}</span>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
              +{opp.value_percentage}% EV
            </span>
          </div>
          <div className="text-xs text-white/60 mb-1">{opp.market} | Cote: {opp.bookmaker_odds}</div>
          <div className="text-xs text-white/50">
            Proba estimée: {(opp.our_probability * 100).toFixed(1)}% vs implicite: {(opp.implied_probability * 100).toFixed(1)}%
          </div>
          {opp.reasoning && <p className="text-xs text-emerald-300/70 mt-2 italic">{opp.reasoning}</p>}
          <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
            opp.confidence === 'high' ? 'bg-green-500/20 text-green-400' :
            opp.confidence === 'medium' ? 'bg-amber-500/20 text-amber-400' :
            'bg-red-500/20 text-red-400'
          }`}>{opp.confidence}</span>
        </div>
      ))}
      {data.best_value && (
        <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            <span className="text-sm text-white/80">Meilleure Value</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-amber-400">{data.best_value.selection}</span>
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full">+{data.best_value.value_pct}%</span>
          </div>
        </div>
      )}
      {data.bias_analysis?.recommended_action && (
        <p className="text-sm text-white/60 italic">{data.bias_analysis.recommended_action}</p>
      )}
    </div>
  );
}

function RenderKellyRisk({ data }: { data: any }) {
  if (!data) return null;
  const riskLevel = data.risk_assessment?.risk_level || 'medium';
  const getRiskBarColor = () => {
    if (riskLevel === 'very_low' || riskLevel === 'low') return 'bg-green-500';
    if (riskLevel === 'medium') return 'bg-amber-500';
    return 'bg-red-500';
  };
  const getRiskColor = () => {
    if (riskLevel === 'very_low' || riskLevel === 'low') return 'text-green-400';
    if (riskLevel === 'medium') return 'text-amber-400';
    return 'text-red-400';
  };
  return (
    <div className="space-y-4">
      {data.risk_assessment && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-white/50 text-sm">Niveau de risque:</span>
              <span className={`ml-2 font-bold uppercase ${getRiskColor()}`}>{riskLevel.replace(/_/g, ' ')}</span>
            </div>
            <div className="text-right">
              <span className="text-white/50 text-sm">Score:</span>
              <span className="ml-2 text-xl font-bold text-white">{data.risk_assessment.overall_risk_score}/100</span>
            </div>
          </div>
          <ProgressBar value={data.risk_assessment.overall_risk_score || 0} color={getRiskBarColor()} />
        </>
      )}
      {data.staking_plan && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white/5 rounded-lg text-center">
            <div className="text-2xl font-bold text-neon-green">{data.staking_plan.recommended_bet_size}%</div>
            <div className="text-[10px] text-white/50">Mise Recommandée</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg text-center">
            <div className="text-2xl font-bold text-amber-400">{data.staking_plan.max_bet_size}%</div>
            <div className="text-[10px] text-white/50">Mise Maximum</div>
          </div>
        </div>
      )}
      {data.kelly_calculations?.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs text-white/50 uppercase">Calculs Kelly</h5>
          {data.kelly_calculations.map((k: any, i: number) => (
            <div key={i} className="p-2 bg-white/5 rounded-lg flex items-center justify-between">
              <span className="text-sm text-white/80">{k.selection}</span>
              <div className="text-right">
                <span className="text-sm font-bold text-amber-400">{k.recommended_stake_percent}%</span>
                <span className="text-[10px] text-white/40 ml-1">(Kelly: {(k.full_kelly * 100).toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {data.risk_factors?.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs text-white/50 uppercase">Facteurs de risque</h5>
          <ul className="space-y-1">
            {data.risk_factors.map((rf: any, i: number) => (
              <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                <span className="text-amber-400">•</span>
                <div>
                  <span>{rf.factor}</span>
                  {rf.mitigation && <p className="text-xs text-white/40 mt-0.5">{rf.mitigation}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {data.staking_plan?.kelly_justification && (
        <p className="text-xs text-white/50 italic">{data.staking_plan.kelly_justification}</p>
      )}
    </div>
  );
}

function RenderFinalPro({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="space-y-5">
      {data.executive_summary && (
        <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-semibold">Verdict</h4>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: data.executive_summary.confidence_stars || 0 }).map((_, i) => (
                <span key={i} className="text-amber-400 text-sm">★</span>
              ))}
              {Array.from({ length: 5 - (data.executive_summary.confidence_stars || 0) }).map((_, i) => (
                <span key={i} className="text-white/20 text-sm">★</span>
              ))}
            </div>
          </div>
          <p className="text-sm text-white/90">{data.executive_summary.one_sentence_verdict}</p>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full">
              EV: {data.executive_summary.expected_value_rating}
            </span>
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full">
              {data.executive_summary.risk_appetite_match}
            </span>
          </div>
        </div>
      )}

      {data.main_bet && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400 font-bold text-sm uppercase">Pari Principal</span>
          </div>
          <div className="text-xl font-bold text-white mb-1">{data.main_bet.selection}</div>
          <div className="text-sm text-white/60">{data.main_bet.market}</div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-amber-500/20">
            <span className="text-xs text-white/50">Cote: {data.main_bet.odds}</span>
            <span className="text-xs text-amber-400 font-medium">Mise: {data.main_bet.stake_percent}% | {data.main_bet.roi_projection}</span>
          </div>
          {data.main_bet.reasoning && <p className="text-xs text-white/50 mt-2 italic">{data.main_bet.reasoning}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.safe_ticket && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-bold text-sm uppercase">Ticket SAFE</span>
              </div>
              <ConfidenceBadge value={data.safe_ticket.confidence || 0} />
            </div>
            <div className="text-xl font-bold text-white mb-1">{data.safe_ticket.selection}</div>
            <div className="text-sm text-white/60">{data.safe_ticket.market}</div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-green-500/20">
              <span className="text-xs text-white/50">Cote: {data.safe_ticket.odds}</span>
              <span className="text-xs text-green-400 font-medium">Mise: {data.safe_ticket.stake_percent}%</span>
            </div>
          </div>
        )}
        {data.speculative_ticket && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="text-amber-400 font-bold text-sm uppercase">Ticket FUN</span>
              </div>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full border border-amber-500/30">
                +{data.speculative_ticket.value_percentage}% EV
              </span>
            </div>
            <div className="text-xl font-bold text-white mb-1">{data.speculative_ticket.selection}</div>
            <div className="text-sm text-white/60">{data.speculative_ticket.market}</div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-amber-500/20">
              <span className="text-xs text-white/50">Cote: {data.speculative_ticket.odds}</span>
              <span className="text-xs text-amber-400 font-medium">Mise: {data.speculative_ticket.stake_percent}%</span>
            </div>
            {data.speculative_ticket.caveat && (
              <p className="text-xs text-amber-200/60 mt-2 italic">{data.speculative_ticket.caveat}</p>
            )}
          </div>
        )}
      </div>

      <div className="text-center py-3">
        <span className="text-white/50 text-sm">Score prédit: </span>
        <span className="text-2xl font-bold text-white">{data.score_prediction}</span>
        {data.both_teams_to_score !== undefined && (
          <span className="ml-3 text-xs text-white/50">BTTS: {data.both_teams_to_score ? 'Oui' : 'Non'}</span>
        )}
      </div>

      {data.combination_suggestions?.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs text-white/50 uppercase">Combinés suggérés</h5>
          {data.combination_suggestions.map((combo: any, i: number) => (
            <div key={i} className="p-2 bg-white/5 rounded-lg flex items-center justify-between">
              <span className="text-sm text-white/80">{combo.description}</span>
              <span className="text-xs text-amber-400 font-medium">~{combo.estimated_odds}</span>
            </div>
          ))}
        </div>
      )}

      {data.bias_warnings?.length > 0 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <h5 className="text-xs text-amber-400 uppercase mb-2 font-semibold">Biais identifiés</h5>
          {data.bias_warnings.map((bw: any, i: number) => (
            <div key={i} className="text-xs text-amber-200/70 mb-1">
              <span className="font-medium text-amber-300">{bw.bias_type}:</span> {bw.description}
            </div>
          ))}
        </div>
      )}

      {data.final_message && (
        <p className="text-sm text-white/70 leading-relaxed italic border-l-2 border-purple-500/50 pl-3">
          {data.final_message}
        </p>
      )}
    </div>
  );
}

function RenderReviewCritical({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className={`text-4xl font-black ${
            data.final_grade?.startsWith('A') ? 'text-green-400' :
            data.final_grade?.startsWith('B') ? 'text-blue-400' :
            data.final_grade?.startsWith('C') ? 'text-amber-400' : 'text-red-400'
          }`}>{data.final_grade}</div>
          <div className="text-xs text-white/50">Note Finale</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.strengths?.length > 0 && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <h5 className="text-xs text-green-400 uppercase mb-2 font-semibold">Forces</h5>
            <ul className="space-y-1">
              {data.strengths.map((s: string, i: number) => (
                <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0 mt-1" />{s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {data.weaknesses?.length > 0 && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <h5 className="text-xs text-red-400 uppercase mb-2 font-semibold">Faiblesses</h5>
            <ul className="space-y-1">
              {data.weaknesses.map((w: string, i: number) => (
                <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                  <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0 mt-1" />{w}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {data.alternative_scenarios?.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs text-white/50 uppercase">Scénarios alternatifs</h5>
          {data.alternative_scenarios.map((sc: any, i: number) => (
            <div key={i} className="p-2 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white/80">{sc.scenario}</span>
                <span className="text-xs text-amber-400">{sc.probability}%</span>
              </div>
              <p className="text-xs text-white/50">{sc.impact_on_bets}</p>
            </div>
          ))}
        </div>
      )}
      {data.suggested_adjustments?.length > 0 && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h5 className="text-xs text-blue-400 uppercase mb-2 font-semibold">Ajustements suggérés</h5>
          <ul className="space-y-1">
            {data.suggested_adjustments.map((adj: string, i: number) => (
              <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                <span className="text-blue-400">→</span>{adj}
              </li>
            ))}
          </ul>
        </div>
      )}
      {data.second_look_verdict && (
        <p className="text-sm text-white/70 italic border-l-2 border-rose-500/50 pl-3">{data.second_look_verdict}</p>
      )}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function StreamingAnalysis({ match, onClose }: StreamingAnalysisProps) {
  const [phases, setPhases] = useState<Record<string, 'pending' | 'loading' | 'complete'>>(
    Object.fromEntries(PHASE_ORDER.map(p => [p, 'pending']))
  );
  const [data, setData] = useState<Record<string, any>>({});
  const [expandedPhases, setExpandedPhases] = useState<string[]>(['final_pro']);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePhase = (phase: string) => {
    setExpandedPhases(prev =>
      prev.includes(phase) ? prev.filter(p => p !== phase) : [...prev, phase]
    );
  };

  const startAnalysis = useCallback(async () => {
    setError(null);
    setIsComplete(false);
    setPhases(Object.fromEntries(PHASE_ORDER.map(p => [p, 'pending'])));
    setData({});

    try {
      const response = await fetch('/api/pronostic/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match }),
      });

      if (!response.ok) throw new Error('Erreur de connexion');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Stream non disponible');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            if (jsonStr) {
              try {
                const event = JSON.parse(jsonStr);

                if (event.type === 'phase_start') {
                  setPhases(prev => ({ ...prev, [event.phase]: 'loading' }));
                }

                if (event.type === 'phase_data') {
                  setData(prev => ({ ...prev, [event.phase]: event.data }));
                }

                if (event.type === 'phase_end') {
                  setPhases(prev => ({ ...prev, [event.phase]: 'complete' }));
                  setExpandedPhases(prev =>
                    prev.includes(event.phase) ? prev : [...prev, event.phase]
                  );
                }

                if (event.type === 'complete') {
                  setIsComplete(true);
                }
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Streaming error:', err);
      setError('Erreur lors de l\'analyse. Veuillez réessayer.');
    }
  }, [match]);

  useEffect(() => {
    startAnalysis();
  }, [startAnalysis]);

  const renderPhaseContent = (phase: string) => {
    const phaseData = data[phase];
    if (!phaseData) return null;
    switch (phase) {
      case 'context': return <RenderContext data={phaseData} match={match} />;
      case 'stats_advanced': return <RenderStatsAdvanced data={phaseData} match={match} />;
      case 'odds_analysis': return <RenderOddsAnalysis data={phaseData} />;
      case 'value_detection': return <RenderValueDetection data={phaseData} />;
      case 'kelly_risk': return <RenderKellyRisk data={phaseData} />;
      case 'final_pro': return <RenderFinalPro data={phaseData} />;
      case 'review_critical': return <RenderReviewCritical data={phaseData} />;
      default: return null;
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-red-400">{error}</p>
        <button
          onClick={startAnalysis}
          className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">
          Analyse IA: {match.homeTeam} vs {match.awayTeam}
        </h3>
        {isComplete && (
          <div className="flex items-center gap-1.5 text-amber-400 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Complète</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {PHASE_ORDER.map((phase) => {
          const config = PHASE_CONFIG[phase];
          const Icon = config.icon;
          const status = phases[phase];
          const isExpanded = expandedPhases.includes(phase);
          const hasData = !!data[phase];

          return (
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border overflow-hidden transition-all ${config.borderColor} ${config.bgColor}`}
            >
              <button
                onClick={() => hasData && togglePhase(phase)}
                disabled={!hasData}
                className="w-full flex items-center justify-between p-4 text-left disabled:cursor-default"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.bgColor}`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{config.label}</h4>
                    {status === 'loading' && (
                      <span className="text-xs text-white/50">Analyse en cours...</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {status === 'pending' && <span className="text-xs text-white/30">En attente</span>}
                  {status === 'loading' && (
                    <div className="flex items-center gap-2">
                      <TypingIndicator />
                      <Loader2 className="w-4 h-4 text-white/50 animate-spin" />
                    </div>
                  )}
                  {status === 'complete' && (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
                    </>
                  )}
                </div>
              </button>
              <AnimatePresence>
                {isExpanded && hasData && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-white/5 pt-4">
                      {renderPhaseContent(phase)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <div className="p-3 bg-amber-900/20 border border-amber-500/20 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-amber-200/80 leading-relaxed">
            <p>Jouer comporte des risques : endettement, isolement, dépendance.</p>
            <p className="flex items-center gap-1.5 mt-1">
              <Phone className="w-3 h-3" />
              <a href="tel:0974751313" className="text-amber-300 underline">09 74 75 13 13</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StreamingAnalysis;
