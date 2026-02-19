'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, Lock, Check, AlertTriangle } from 'lucide-react'

const BANKROLL_SETUP_KEY = 'bankroll_setup_done'

const PRESET_AMOUNTS = [50, 100, 200, 500, 1000]

export function BankrollSetupPopup() {
  const [showPopup, setShowPopup] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verifier si la bankroll a deja ete configuree localement
    const setupDone = localStorage.getItem(BANKROLL_SETUP_KEY)
    if (setupDone) return

    async function checkBankroll() {
      try {
        // D'abord verifier si l'utilisateur est connecte (endpoint leger)
        const authCheck = await fetch('/api/auth/login')
        if (!authCheck.ok) return // Pas connecte, pas de popup

        // Verifier si la bankroll est deja verrouilee cote serveur
        const bankrollResponse = await fetch('/api/user/bankroll')
        if (bankrollResponse.ok) {
          const bankrollData = await bankrollResponse.json()
          if (bankrollData.locked) {
            localStorage.setItem(BANKROLL_SETUP_KEY, 'true')
            return
          }
        }

        // Sinon, afficher le popup de configuration
        setShowPopup(true)
      } catch {
        // En cas d'erreur, ne pas afficher le popup
      }
    }

    // Delai pour laisser le popup 18+ apparaitre d'abord
    const timer = setTimeout(checkBankroll, 2000)
    return () => clearTimeout(timer)
  }, [])

  const getAmount = (): number => {
    if (selectedAmount) return selectedAmount
    const parsed = parseFloat(customAmount)
    return isNaN(parsed) ? 0 : parsed
  }

  const handleConfirm = async () => {
    const amount = getAmount()
    if (amount < 10) {
      setError('Le montant minimum est de 10 EUR')
      return
    }
    if (amount > 100000) {
      setError('Le montant maximum est de 100 000 EUR')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/user/bankroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, lock: true })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la configuration')
      }

      // Sauvegarder en local aussi
      localStorage.setItem(BANKROLL_SETUP_KEY, 'true')
      setShowPopup(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsSubmitting(false)
    }
  }

  const amount = getAmount()

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-dark-800 rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-neon-green/10 to-green-500/10 p-6 text-center border-b border-white/10">
              <div className="w-16 h-16 mx-auto mb-4 bg-neon-green/20 rounded-full flex items-center justify-center">
                <Wallet className="w-8 h-8 text-neon-green" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Configurez votre Bankroll
              </h2>
              <p className="text-white/60 text-sm mt-2">
                Choisissez votre capital de depart pour les paris
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Lock notice */}
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-5">
                <Lock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  Ce montant sera <strong>definitif</strong> et ne pourra plus etre modifie.
                  Il evoluera uniquement en fonction de vos gains et pertes.
                </p>
              </div>

              {/* Preset amounts */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setSelectedAmount(preset)
                      setCustomAmount('')
                      setError(null)
                    }}
                    className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                      selectedAmount === preset
                        ? 'bg-neon-green text-dark-900 shadow-lg shadow-neon-green/20'
                        : 'bg-dark-700 text-white/70 hover:bg-dark-600 hover:text-white border border-white/10'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="mb-5">
                <label className="block text-sm text-white/70 mb-2">Ou entrez un montant personnalise</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value)
                      setSelectedAmount(null)
                      setError(null)
                    }}
                    placeholder="Ex: 250"
                    className="flex-1 px-4 py-3 bg-dark-700 border border-white/10 rounded-xl text-white focus:outline-none focus:border-neon-green/50 focus:ring-2 focus:ring-neon-green/20 transition-all"
                    min="10"
                    max="100000"
                  />
                  <span className="text-white/50 font-medium">EUR</span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {/* Summary */}
              {amount >= 10 && (
                <div className="p-4 bg-neon-green/10 border border-neon-green/30 rounded-xl mb-6">
                  <p className="text-xs text-neon-green/70">Votre bankroll de depart</p>
                  <p className="text-3xl font-bold text-neon-green mt-1">
                    {amount.toLocaleString('fr-FR')} EUR
                  </p>
                  <p className="text-xs text-white/40 mt-2">
                    Mise SAFE conseillee: {Math.round(amount * 0.05)} EUR (5%) |
                    Mise FUN: {Math.round(amount * 0.02)} EUR (2%)
                  </p>
                </div>
              )}

              {/* Confirm */}
              <motion.button
                onClick={handleConfirm}
                disabled={amount < 10 || isSubmitting}
                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                  amount >= 10 && !isSubmitting
                    ? 'bg-neon-green text-dark-900 hover:bg-neon-green/90'
                    : 'bg-dark-600 text-white/30 cursor-not-allowed'
                }`}
                whileHover={amount >= 10 && !isSubmitting ? { scale: 1.01 } : {}}
                whileTap={amount >= 10 && !isSubmitting ? { scale: 0.99 } : {}}
              >
                {isSubmitting ? (
                  <span>Configuration en cours...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Confirmer ma bankroll
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
