'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Brain, BarChart3, Sparkles, CheckCircle2 } from 'lucide-react'

interface AnalysisLoaderProps {
  isVisible: boolean
  matchName: string
}

interface LoadingStep {
  id: number
  icon: React.ReactNode
  text: string
  duration: number
}

const loadingSteps: LoadingStep[] = [
  {
    id: 1,
    icon: <Search className="w-5 h-5" />,
    text: 'Recherche des dernières infos (blessures, météo)...',
    duration: 2000,
  },
  {
    id: 2,
    icon: <BarChart3 className="w-5 h-5" />,
    text: 'Analyse des statistiques et historique H2H...',
    duration: 3000,
  },
  {
    id: 3,
    icon: <Brain className="w-5 h-5" />,
    text: 'Calcul des probabilités et value betting...',
    duration: 4000,
  },
  {
    id: 4,
    icon: <Sparkles className="w-5 h-5" />,
    text: 'Génération des tickets VIP...',
    duration: 5000,
  },
]

export default function AnalysisLoader({ isVisible, matchName }: AnalysisLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0)
      setCompletedSteps([])
      return
    }

    // Progress through steps
    const timers: NodeJS.Timeout[] = []

    loadingSteps.forEach((step, index) => {
      const timer = setTimeout(() => {
        setCurrentStep(index + 1)
        if (index > 0) {
          setCompletedSteps((prev) => [...prev, index])
        }
      }, step.duration)
      timers.push(timer)
    })

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-dark-800 border border-white/10 rounded-2xl p-8 max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-4 bg-neon-green/20 rounded-full flex items-center justify-center"
          >
            <Brain className="w-8 h-8 text-neon-green" />
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-2">Analyse VIP en cours</h3>
          <p className="text-white/60 text-sm">{matchName}</p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {loadingSteps.map((step, index) => {
            const isActive = currentStep === index + 1
            const isCompleted = completedSteps.includes(index + 1) || currentStep > index + 1
            const isPending = currentStep < index + 1

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: isPending ? 0.4 : 1,
                  x: 0,
                }}
                transition={{ delay: index * 0.1 }}
                className={`
                  flex items-center gap-3 p-3 rounded-lg transition-all
                  ${isActive ? 'bg-neon-green/10 border border-neon-green/30' : 'bg-dark-700/50'}
                `}
              >
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                    ${isCompleted ? 'bg-green-500/20 text-green-400' : ''}
                    ${isActive ? 'bg-neon-green/20 text-neon-green' : ''}
                    ${isPending ? 'bg-dark-600 text-white/30' : ''}
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isActive ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      {step.icon}
                    </motion.div>
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm truncate ${
                      isActive ? 'text-neon-green font-medium' :
                      isCompleted ? 'text-green-400' : 'text-white/50'
                    }`}
                  >
                    {step.text}
                  </p>
                </div>
                {isActive && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 bg-neon-green rounded-full"
                  />
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="h-1 bg-dark-600 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-neon-green to-green-400"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStep / loadingSteps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-center text-white/40 text-xs mt-2">
            Étape {currentStep} sur {loadingSteps.length}
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
