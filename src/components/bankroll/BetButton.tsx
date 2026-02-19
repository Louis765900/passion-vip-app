'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CircleDollarSign, Calculator, Check, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Match, SafeTicket, FunTicket, calculateKellyStake } from '@/types'

interface BetButtonProps {
  match: Match
  ticket: SafeTicket | FunTicket
  ticketType: 'safe' | 'fun'
  confidence: number
}

export function BetButton({ match, ticket, ticketType, confidence }: BetButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [customStake, setCustomStake] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bankrollBalance, setBankrollBalance] = useState(100)

  // Charger la bankroll depuis le serveur au montage
  useEffect(() => {
    async function fetchBankroll() {
      try {
        const response = await fetch('/api/user/bets')
        if (response.ok) {
          const data = await response.json()
          setBankrollBalance(data.bankroll || 100)
        }
      } catch (error) {
        console.log('[BetButton] Using default bankroll')
      }
    }
    fetchBankroll()
  }, [])

  const safeOdds = ticket.odds_estimated ?? 1.5
  const kellySuggestion = calculateKellyStake(bankrollBalance, confidence, safeOdds)
  const suggestedStake = Math.max(1, Math.round(kellySuggestion))

  const stake = parseFloat(customStake) || suggestedStake
  const canAfford = stake <= bankrollBalance

  const handlePlaceBet = async () => {
    if (!canAfford) {
      toast.error('Bankroll insuffisante', {
        description: `Il vous faut ${stake}EUR mais vous avez ${Math.round(bankrollBalance)}EUR`
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Enregistrer le pari sur le serveur uniquement
      const response = await fetch('/api/user/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: match.id,
          fixtureId: match.fixtureId,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          league: match.league,
          date: match.date,
          ticketType,
          market: ticket.market,
          selection: ticket.selection,
          odds: safeOdds,
          stake,
          potentialWin: stake * safeOdds
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de l\'enregistrement')
      }

      // Mettre a jour la bankroll locale
      setBankrollBalance(prev => prev - stake)

      toast.success('Pari enregistre !', {
        description: `${stake}EUR sur ${ticket.selection} @ ${safeOdds}`,
        icon: <Check className="w-4 h-4" />
      })
    } catch (error) {
      console.error('[BetButton] Erreur:', error)
      toast.error('Erreur', {
        description: error instanceof Error ? error.message : 'Impossible d\'enregistrer le pari'
      })
    } finally {
      setIsSubmitting(false)
      setShowConfirm(false)
      setCustomStake('')
    }
  }

  return (
    <>
      <motion.button
        onClick={() => { setCustomStake(suggestedStake.toString()); setShowConfirm(true) }}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
          transition-all duration-200
          ${ticketType === 'safe'
            ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30'
            : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30'
          }
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <CircleDollarSign className="w-4 h-4" />
        J'ai parie
      </motion.button>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm bg-dark-800 rounded-2xl border border-white/10 p-6"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white mb-4">Confirmer le pari</h3>

              {/* Match Info */}
              <div className="p-3 bg-dark-700 rounded-xl mb-4">
                <p className="text-sm font-medium text-white">
                  {match.homeTeam} vs {match.awayTeam}
                </p>
                <p className="text-xs text-white/50 mt-1">{ticket.market}</p>
                <p className="text-sm text-neon-green font-semibold mt-1">
                  {ticket.selection} @ {safeOdds}
                </p>
              </div>

              {/* Kelly Suggestion */}
              <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-4">
                <Calculator className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-blue-300">Mise Kelly conseillée</p>
                  <p className="text-sm font-semibold text-white">{suggestedStake}EUR</p>
                </div>
              </div>

              {/* Stake Input */}
              <div className="mb-4">
                <label className="block text-sm text-white/70 mb-2">Votre mise</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={customStake}
                    onChange={(e) => setCustomStake(e.target.value)}
                    className="flex-1 px-3 py-2 bg-dark-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-green/50"
                    min="1"
                    max={bankrollBalance}
                  />
                  <span className="text-white/50">EUR</span>
                </div>
                <p className="text-xs text-white/40 mt-1">
                  Bankroll disponible: {Math.round(bankrollBalance)}EUR
                </p>
              </div>

              {/* Warning if can't afford */}
              {!canAfford && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <p className="text-sm text-red-300">Bankroll insuffisante</p>
                </div>
              )}

              {/* Potential Win */}
              <div className="p-3 bg-neon-green/10 border border-neon-green/30 rounded-xl mb-6">
                <p className="text-xs text-neon-green/70">Gain potentiel</p>
                <p className="text-xl font-bold text-neon-green">
                  {(stake * safeOdds).toFixed(2)}EUR
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2 text-white/70 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <motion.button
                  onClick={handlePlaceBet}
                  disabled={!canAfford || isSubmitting}
                  className={`
                    flex-1 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2
                    ${canAfford && !isSubmitting
                      ? 'bg-neon-green text-dark-900 hover:bg-neon-green/90'
                      : 'bg-dark-600 text-white/30 cursor-not-allowed'
                    }
                  `}
                  whileHover={canAfford && !isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={canAfford && !isSubmitting ? { scale: 0.98 } : {}}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    'Confirmer'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
