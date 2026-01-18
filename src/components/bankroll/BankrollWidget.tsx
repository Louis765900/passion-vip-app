'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, TrendingUp, TrendingDown, Settings, X, History } from 'lucide-react'
import { useBankroll } from '@/hooks/useBankroll'

export function BankrollWidget() {
  const {
    bankroll,
    isLoaded,
    roi,
    profitLoss,
    pendingBets,
    setInitialBankroll,
    settleBet
  } = useBankroll()

  const [isEditing, setIsEditing] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleEditStart = () => {
    setEditValue(bankroll.balance.toString())
    setIsEditing(true)
  }

  const handleEditConfirm = () => {
    const value = parseFloat(editValue)
    if (!isNaN(value) && value >= 0) {
      setInitialBankroll(value)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleEditConfirm()
    if (e.key === 'Escape') setIsEditing(false)
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-dark-700/50 rounded-lg animate-pulse">
        <div className="w-20 h-4 bg-dark-600 rounded" />
      </div>
    )
  }

  const isPositive = profitLoss >= 0

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Main Widget */}
        <motion.div
          className="flex items-center gap-3 px-4 py-2 bg-dark-700/80 backdrop-blur-sm rounded-xl border border-white/10"
          whileHover={{ scale: 1.02 }}
        >
          {/* Bankroll Amount */}
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-neon-green" />
            {isEditing ? (
              <div className="flex items-center gap-1">
                <input
                  ref={inputRef}
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleEditConfirm}
                  className="w-20 px-2 py-0.5 bg-dark-600 border border-neon-green/50 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-neon-green"
                  min="0"
                  step="10"
                />
                <span className="text-white/50 text-sm">EUR</span>
              </div>
            ) : (
              <button
                onClick={handleEditStart}
                className="text-white font-semibold hover:text-neon-green transition-colors"
              >
                {bankroll.balance.toFixed(0)}EUR
              </button>
            )}
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-white/20" />

          {/* ROI */}
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
            </span>
          </div>
        </motion.div>

        {/* History Button */}
        {pendingBets.length > 0 && (
          <motion.button
            onClick={() => setShowHistory(true)}
            className="relative p-2 bg-dark-700/80 backdrop-blur-sm rounded-lg border border-white/10 hover:border-neon-green/50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <History className="w-4 h-4 text-white/70" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-green text-dark-900 text-[10px] font-bold rounded-full flex items-center justify-center">
              {pendingBets.length}
            </span>
          </motion.button>
        )}
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-dark-800 rounded-2xl border border-white/10 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-lg font-bold text-white">Paris en cours</h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>

              {/* Bets List */}
              <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                {pendingBets.length === 0 ? (
                  <p className="text-center text-white/50 py-8">Aucun pari en cours</p>
                ) : (
                  pendingBets.map(bet => (
                    <div
                      key={bet.id}
                      className="p-3 bg-dark-700 rounded-xl border border-white/5"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {bet.homeTeam} vs {bet.awayTeam}
                          </p>
                          <p className="text-xs text-white/50">{bet.league}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          bet.ticketType === 'safe'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {bet.ticketType.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-white/70 mb-2">
                        {bet.market}: <span className="text-white">{bet.selection}</span>
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-white/50">
                          Mise: <span className="text-white">{bet.stake}EUR</span> @ {bet.odds}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => settleBet(bet.id, true)}
                            className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                          >
                            Gagne
                          </button>
                          <button
                            onClick={() => settleBet(bet.id, false)}
                            className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                          >
                            Perdu
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
