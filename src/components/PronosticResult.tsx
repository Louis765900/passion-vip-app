'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, TrendingUp, TrendingDown, AlertTriangle, Target,
  Brain, Users, Zap, Shield, Ticket, BarChart3, FileText,
  CheckCircle2, DollarSign, Percent, Cloud, Gavel
} from 'lucide-react'
import { Match, PronosticResponse, getTeamColor, getTeamInitials } from '@/types'
import { RadarStats, H2HBar, EVGauge } from './charts'
import { BetButton } from './bankroll'
import { ShareButton } from './social'
import { ChatWidget } from './chat'

interface PronosticResultProps {
  match: Match
  pronostic: PronosticResponse
  onClose: () => void
}

type TabId = 'synthese' | 'stats' | 'tickets'

function TeamLogo({ teamName, size = 'sm' }: { teamName: string; size?: 'sm' | 'lg' }) {
  const initials = getTeamInitials(teamName)
  const color = getTeamColor(teamName)
  const sizeClass = size === 'lg' ? 'w-10 h-10 md:w-12 md:h-12 text-base md:text-lg' : 'w-6 h-6 md:w-8 md:h-8 text-[10px] md:text-xs'

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  )
}

export default function PronosticResult({ match, pronostic, onClose }: PronosticResultProps) {
  const [activeTab, setActiveTab] = useState<TabId>('synthese')

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'synthese', label: 'Synthese', icon: <FileText className="w-4 h-4" /> },
    { id: 'stats', label: 'Stats Pro', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'tickets', label: 'Tickets VIP', icon: <Ticket className="w-4 h-4" /> },
  ]

  const getSelectionLabel = (selection: '1' | 'N' | '2') => {
    if (selection === '1') return match.homeTeam
    if (selection === '2') return match.awayTeam
    return 'Match Nul'
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center md:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card rounded-t-2xl md:rounded-2xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-dark-800/95 backdrop-blur-md border-b border-white/10 p-4 md:p-6">
            <div className="flex items-start justify-between gap-3 mb-3 md:mb-4">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <div className="p-1.5 md:p-2 bg-neon-green/20 rounded-lg md:rounded-xl flex-shrink-0">
                  <Brain className="w-5 h-5 md:w-6 md:h-6 text-neon-green" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base md:text-xl font-bold text-white">
                    Analyse La Passion VIP
                  </h2>
                  <div className="flex items-center gap-1.5 md:gap-2 mt-1 flex-wrap">
                    <TeamLogo teamName={match.homeTeam} />
                    <span className="text-white/60 text-xs md:text-sm truncate max-w-[80px] md:max-w-none">{match.homeTeam}</span>
                    <span className="text-white/40 text-[10px] md:text-xs">vs</span>
                    <span className="text-white/60 text-xs md:text-sm truncate max-w-[80px] md:max-w-none">{match.awayTeam}</span>
                    <TeamLogo teamName={match.awayTeam} />
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2 rounded-lg font-medium text-xs md:text-sm transition-all whitespace-nowrap flex-shrink-0 min-h-[40px]
                    ${activeTab === tab.id
                      ? 'bg-neon-green text-dark-900'
                      : 'bg-dark-600 text-white/70 hover:bg-dark-500'
                    }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'synthese' && (
                <motion.div
                  key="synthese"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4 md:space-y-6"
                >
                  {/* Contexte */}
                  <div className="bg-dark-700/50 rounded-xl p-4 md:p-5">
                    <h3 className="text-xs md:text-sm font-semibold text-neon-green mb-2 md:mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      CONTEXTE DU MATCH
                    </h3>
                    <p className="text-sm md:text-base text-white/80 leading-relaxed">
                      {pronostic.analysis.context}
                    </p>
                  </div>

                  {/* Prediction Principale */}
                  <div className="bg-gradient-to-r from-neon-green/10 to-green-600/10 border border-neon-green/30 rounded-xl p-4 md:p-5">
                    <h3 className="text-xs md:text-sm font-semibold text-white/70 mb-3 md:mb-4 flex items-center gap-2">
                      <Target className="w-4 h-4 text-neon-green" />
                      PREDICTION PRINCIPALE (1N2)
                    </h3>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-xl md:text-3xl font-bold text-neon-green">
                          {getSelectionLabel(pronostic.predictions.main_market.selection)}
                        </span>
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2">
                          <span className="text-white/60 text-xs md:text-sm">
                            Probabilite: <span className="text-white font-medium">{pronostic.predictions.main_market.probability_percent}%</span>
                          </span>
                          <span className="text-white/60 text-xs md:text-sm">
                            Fair Odds: <span className="text-neon-green font-medium">{pronostic.predictions.main_market.fair_odds.toFixed(2)}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-left sm:text-center">
                        <div className="text-2xl md:text-4xl font-bold text-white">
                          {pronostic.predictions.score_exact}
                        </div>
                        <span className="text-[10px] md:text-xs text-white/50">Score Predit</span>
                      </div>
                    </div>
                  </div>

                  {/* Probabilites secondaires */}
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="bg-dark-700/50 rounded-xl p-3 md:p-4 text-center">
                      <div className="text-xl md:text-2xl font-bold text-yellow-400">
                        {pronostic.predictions.btts_prob}%
                      </div>
                      <span className="text-[10px] md:text-xs text-white/60">BTTS (Les 2 marquent)</span>
                    </div>
                    <div className="bg-dark-700/50 rounded-xl p-3 md:p-4 text-center">
                      <div className="text-xl md:text-2xl font-bold text-blue-400">
                        {pronostic.predictions.over_2_5_prob}%
                      </div>
                      <span className="text-[10px] md:text-xs text-white/60">Over 2.5 Buts</span>
                    </div>
                  </div>

                  {/* Meteo et Arbitre */}
                  {(pronostic.analysis.weather || pronostic.analysis.referee_tendency) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      {pronostic.analysis.weather && (
                        <div className="bg-dark-700/50 rounded-xl p-3 md:p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Cloud className="w-4 h-4 text-blue-400" />
                            <span className="text-xs md:text-sm font-medium text-white/70">Meteo</span>
                          </div>
                          <p className="text-xs md:text-sm text-white/80">{pronostic.analysis.weather}</p>
                        </div>
                      )}
                      {pronostic.analysis.referee_tendency && (
                        <div className="bg-dark-700/50 rounded-xl p-3 md:p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Gavel className="w-4 h-4 text-purple-400" />
                            <span className="text-xs md:text-sm font-medium text-white/70">Arbitre</span>
                          </div>
                          <p className="text-xs md:text-sm text-white/80">{pronostic.analysis.referee_tendency}</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'stats' && (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4 md:space-y-6"
                >
                  {/* Radar Chart */}
                  <RadarStats
                    homeTeam={match.homeTeam}
                    awayTeam={match.awayTeam}
                    homeStats={pronostic.analysis.home_team_stats}
                    awayStats={pronostic.analysis.away_team_stats}
                  />

                  {/* H2H History Bar */}
                  <H2HBar
                    history={pronostic.analysis.h2h_history}
                    homeTeam={match.homeTeam}
                    awayTeam={match.awayTeam}
                  />

                  {/* Key Stats */}
                  <div className="bg-dark-700/50 rounded-xl p-4 md:p-5">
                    <h3 className="text-xs md:text-sm font-semibold text-white/70 mb-3 md:mb-4 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-neon-green" />
                      STATISTIQUES CLES
                    </h3>
                    <div className="space-y-2 md:space-y-3">
                      {pronostic.analysis.key_stats.map((stat, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2.5 md:p-3 bg-dark-600/50 rounded-lg gap-2"
                        >
                          <span className="text-xs md:text-sm text-white/80 min-w-0 truncate">{stat.label}</span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="font-medium text-white text-xs md:text-sm">{stat.value}</span>
                            {stat.impact === 'positive' && (
                              <TrendingUp className="w-4 h-4 text-green-400" />
                            )}
                            {stat.impact === 'negative' && (
                              <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                            {stat.impact === 'neutral' && (
                              <div className="w-4 h-4 rounded-full bg-gray-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Absents */}
                  <div className="bg-dark-700/50 rounded-xl p-4 md:p-5">
                    <h3 className="text-xs md:text-sm font-semibold text-white/70 mb-3 md:mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4 text-orange-400" />
                      JOUEURS ABSENTS
                    </h3>
                    {pronostic.analysis.missing_players.length > 0 ? (
                      <div className="space-y-2">
                        {pronostic.analysis.missing_players.map((player, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2.5 md:p-3 bg-dark-600/50 rounded-lg gap-2"
                          >
                            <div className="flex items-center gap-2 md:gap-3 min-w-0">
                              <AlertTriangle
                                className={`w-4 h-4 flex-shrink-0 ${
                                  player.importance === 'High'
                                    ? 'text-red-400'
                                    : player.importance === 'Medium'
                                    ? 'text-yellow-400'
                                    : 'text-gray-400'
                                }`}
                              />
                              <div className="min-w-0">
                                <span className="text-white font-medium text-xs md:text-sm truncate block">{player.player}</span>
                                <span className="text-white/50 text-[10px] md:text-xs">({player.team})</span>
                              </div>
                            </div>
                            <span
                              className={`px-2 py-1 text-[10px] md:text-xs rounded-full flex-shrink-0 ${
                                player.importance === 'High'
                                  ? 'bg-red-500/20 text-red-300'
                                  : player.importance === 'Medium'
                                  ? 'bg-yellow-500/20 text-yellow-300'
                                  : 'bg-gray-500/20 text-gray-300'
                              }`}
                            >
                              {player.importance}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/50 text-xs md:text-sm">Aucune absence majeure signalee</p>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'tickets' && (
                <motion.div
                  key="tickets"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4 md:space-y-6"
                >
                  {/* EV Gauge for Fun Ticket */}
                  {pronostic.vip_tickets.fun.ev_value && (
                    <EVGauge
                      evValue={pronostic.vip_tickets.fun.ev_value}
                      label="Expected Value - Ticket FUN"
                    />
                  )}

                  {/* Ticket SAFE */}
                  <div className="bg-gradient-to-br from-green-900/30 to-green-800/10 border-2 border-green-500/50 rounded-xl p-4 md:p-6">
                    <div className="flex items-start justify-between gap-3 mb-3 md:mb-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1.5 md:p-2 bg-green-500/20 rounded-lg flex-shrink-0">
                          <Shield className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-base md:text-lg font-bold text-green-400">TICKET SAFE</h3>
                          <span className="text-[10px] md:text-xs text-white/50">Confiance elevee - Bankroll 5%</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-green-400">
                          <Percent className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="text-xl md:text-2xl font-bold">{pronostic.vip_tickets.safe.confidence}%</span>
                        </div>
                        <span className="text-[10px] md:text-xs text-white/50">Confiance</span>
                      </div>
                    </div>

                    <div className="bg-dark-800/50 rounded-lg p-3 md:p-4 mb-3 md:mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60 text-xs md:text-sm">Marche</span>
                        <span className="text-white font-medium text-xs md:text-sm">{pronostic.vip_tickets.safe.market}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60 text-xs md:text-sm">Selection</span>
                        <span className="text-green-400 font-bold text-base md:text-lg">{pronostic.vip_tickets.safe.selection}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-xs md:text-sm">Cote estimee</span>
                        <span className="text-neon-green font-bold text-lg md:text-xl">{pronostic.vip_tickets.safe.odds_estimated.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 mb-3 md:mb-4">
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-white/80 text-xs md:text-sm">{pronostic.vip_tickets.safe.reason}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 md:pt-4 border-t border-green-500/30">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-white/60 text-xs md:text-sm">{pronostic.vip_tickets.safe.bankroll_percent}% bankroll</span>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <ShareButton match={match} pronostic={pronostic} ticketType="safe" />
                        <BetButton
                          match={match}
                          ticket={pronostic.vip_tickets.safe}
                          ticketType="safe"
                          confidence={pronostic.vip_tickets.safe.confidence}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ticket FUN */}
                  <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border-2 border-purple-500/50 rounded-xl p-4 md:p-6">
                    <div className="flex items-start justify-between gap-3 mb-3 md:mb-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1.5 md:p-2 bg-purple-500/20 rounded-lg flex-shrink-0">
                          <Zap className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-base md:text-lg font-bold text-purple-400">TICKET FUN</h3>
                          <span className="text-[10px] md:text-xs text-white/50">Value Bet - Bankroll 1-2%</span>
                        </div>
                      </div>
                      {pronostic.vip_tickets.fun.ev_value && (
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center gap-1 text-purple-400">
                            <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="text-xl md:text-2xl font-bold">+{pronostic.vip_tickets.fun.ev_value.toFixed(1)}%</span>
                          </div>
                          <span className="text-[10px] md:text-xs text-white/50">Expected Value</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-dark-800/50 rounded-lg p-3 md:p-4 mb-3 md:mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60 text-xs md:text-sm">Marche</span>
                        <span className="text-white font-medium text-xs md:text-sm">{pronostic.vip_tickets.fun.market}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60 text-xs md:text-sm">Selection</span>
                        <span className="text-purple-400 font-bold text-base md:text-lg">{pronostic.vip_tickets.fun.selection}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-xs md:text-sm">Cote estimee</span>
                        <span className="text-neon-green font-bold text-lg md:text-xl">{pronostic.vip_tickets.fun.odds_estimated.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 mb-3 md:mb-4">
                      <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <p className="text-white/80 text-xs md:text-sm">{pronostic.vip_tickets.fun.risk_analysis}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 md:pt-4 border-t border-purple-500/30">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-purple-400" />
                        <span className="text-white/60 text-xs md:text-sm">{pronostic.vip_tickets.fun.bankroll_percent}% bankroll</span>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <ShareButton match={match} pronostic={pronostic} ticketType="fun" />
                        <BetButton
                          match={match}
                          ticket={pronostic.vip_tickets.fun}
                          ticketType="fun"
                          confidence={60}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="bg-dark-700/30 rounded-lg p-3 md:p-4 border border-white/10">
                    <p className="text-white/50 text-[10px] md:text-xs text-center leading-relaxed">
                      Les pronostics sont fournis a titre indicatif. Pariez de maniere responsable.
                      Ne misez jamais plus que ce que vous pouvez vous permettre de perdre.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Chat Widget */}
          <ChatWidget match={match} pronostic={pronostic} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
