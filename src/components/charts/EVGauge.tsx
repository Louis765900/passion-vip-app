'use client'

import { motion } from 'framer-motion'

interface EVGaugeProps {
  evValue: number // Expected Value en pourcentage
  label?: string
}

export function EVGauge({ evValue, label = 'Expected Value' }: EVGaugeProps) {
  // Normaliser la valeur EV (-20% à +20% typiquement)
  const normalizedValue = Math.min(Math.max(evValue, -20), 20)
  // Convertir en pourcentage de la jauge (0 = -20%, 100 = +20%)
  const gaugePercent = ((normalizedValue + 20) / 40) * 100

  // Déterminer la couleur basée sur l'EV
  const getColor = () => {
    if (evValue >= 5) return '#39ff14' // Vert néon - Excellente value
    if (evValue >= 0) return '#fbbf24' // Jaune - Value neutre
    return '#ef4444' // Rouge - Pas de value
  }

  const isHighValue = evValue >= 5

  return (
    <div className="bg-dark-800/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-white/80">{label}</h4>
        <motion.span
          className={`text-lg font-bold ${
            isHighValue ? 'text-neon-green' : evValue >= 0 ? 'text-yellow-400' : 'text-red-400'
          }`}
          animate={isHighValue ? {
            textShadow: ['0 0 10px #39ff14', '0 0 20px #39ff14', '0 0 10px #39ff14']
          } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {evValue > 0 ? '+' : ''}{evValue.toFixed(1)}%
        </motion.span>
      </div>

      {/* Gauge Container */}
      <div className="relative h-8 bg-dark-700 rounded-full overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, #ef4444 0%, #fbbf24 50%, #39ff14 100%)',
            opacity: 0.3
          }}
        />

        {/* Marker line at 0% (center) */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/50 z-10" />

        {/* Value indicator */}
        <motion.div
          className="absolute top-1 bottom-1 left-1 rounded-full"
          style={{
            backgroundColor: getColor(),
            boxShadow: isHighValue ? `0 0 15px ${getColor()}` : 'none',
          }}
          initial={{ width: 0 }}
          animate={{
            width: `calc(${gaugePercent}% - 8px)`,
            boxShadow: isHighValue
              ? [`0 0 10px ${getColor()}`, `0 0 25px ${getColor()}`, `0 0 10px ${getColor()}`]
              : 'none'
          }}
          transition={{
            width: { duration: 0.8, ease: 'easeOut' },
            boxShadow: { duration: 1, repeat: Infinity }
          }}
        />

        {/* Labels */}
        <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-medium">
          <span className="text-red-400/70">-20%</span>
          <span className="text-white/50">0%</span>
          <span className="text-green-400/70">+20%</span>
        </div>
      </div>

      {/* Status text */}
      <div className="mt-2 text-center">
        {isHighValue ? (
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1 bg-neon-green/20 rounded-full"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="text-xs font-semibold text-neon-green">VALUE DETECTEE</span>
          </motion.div>
        ) : evValue >= 0 ? (
          <span className="text-xs text-yellow-400/70">Value neutre</span>
        ) : (
          <span className="text-xs text-red-400/70">Pas de value</span>
        )}
      </div>
    </div>
  )
}
