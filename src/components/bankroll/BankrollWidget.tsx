'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wallet, TrendingUp, TrendingDown, Lock } from 'lucide-react'

interface ServerBankrollData {
  balance: number
  initialBalance: number
  locked: boolean
  roi: number
}

// Helper to check if user is logged in
function isUserLoggedIn(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.includes('vip_session=')
}

export function BankrollWidget() {
  const [data, setData] = useState<ServerBankrollData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Don't fetch if user is not logged in
    if (!isUserLoggedIn()) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function fetchBankroll() {
      try {
        const response = await fetch('/api/user/bankroll')
        if (!response.ok) {
          // Non connecte ou erreur - ne pas afficher le widget
          setIsLoading(false)
          return
        }
        const result = await response.json()
        if (!cancelled) {
          setData({
            balance: result.balance ?? 100,
            initialBalance: result.initialBalance ?? 100,
            locked: result.locked ?? false,
            roi: result.roi ?? 0
          })
        }
      } catch {
        // Erreur reseau - ne pas afficher
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchBankroll()
    return () => { cancelled = true }
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-dark-700/50 rounded-lg animate-pulse">
        <div className="w-20 h-4 bg-dark-600 rounded" />
      </div>
    )
  }

  // Non connecte ou erreur
  if (!data) return null

  const isPositive = data.roi >= 0

  return (
    <motion.div
      className="flex items-center gap-3 px-4 py-2 bg-dark-700/80 backdrop-blur-sm rounded-xl border border-white/10"
      whileHover={{ scale: 1.02 }}
    >
      {/* Bankroll Amount */}
      <div className="flex items-center gap-2">
        <Wallet className="w-4 h-4 text-amber-500" />
        <span className="text-white font-semibold flex items-center gap-1">
          {Math.round(data.balance)}€
          {data.locked && <Lock className="w-3 h-3 text-white/30" />}
        </span>
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
          {data.roi >= 0 ? '+' : ''}{data.roi.toFixed(1)}%
        </span>
      </div>
    </motion.div>
  )
}
