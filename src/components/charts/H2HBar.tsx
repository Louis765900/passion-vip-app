'use client'

import { motion } from 'framer-motion'
import { H2HResult, H2HHistory } from '@/types'

interface H2HBarProps {
  history: H2HHistory
  homeTeam: string
  awayTeam: string
}

// Supporte W/D/L (anglais) ET V/N/D (français) renvoyés par l'IA
const RESULT_CONFIG: Record<string, { color: string; label: string }> = {
  W: { color: 'bg-green-500', label: 'V' },
  V: { color: 'bg-green-500', label: 'V' },
  D: { color: 'bg-orange-500', label: 'N' },
  N: { color: 'bg-orange-500', label: 'N' },
  L: { color: 'bg-red-500', label: 'D' },
}
const RESULT_FALLBACK = { color: 'bg-gray-600', label: '?' }

export function H2HBar({ history, homeTeam, awayTeam }: H2HBarProps) {
  return (
    <div className="bg-dark-800/50 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-white/80 mb-3 text-center">
        Historique H2H (5 derniers)
      </h4>

      {/* Visual Results Bar */}
      <div className="flex justify-center gap-2 mb-4">
        {(history?.results ?? []).map((result, index) => {
          const cfg = RESULT_CONFIG[result] ?? RESULT_FALLBACK
          return (
          <motion.div
            key={index}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center
              font-bold text-white shadow-lg
              ${cfg.color}
            `}
            title={`Match ${index + 1}: ${
              result === 'W' || result === 'V' ? `Victoire ${homeTeam}` :
              result === 'L' ? `Victoire ${awayTeam}` : 'Match Nul'
            }`}
          >
            {cfg.label}
          </motion.div>
        )})}

      </div>

      {/* Stats Summary */}
      <div className="flex justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-white/70">
            {homeTeam}: <span className="text-white font-semibold">{history.home_wins}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-white/70">
            Nuls: <span className="text-white font-semibold">{history.draws}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-white/70">
            {awayTeam}: <span className="text-white font-semibold">{history.away_wins}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
