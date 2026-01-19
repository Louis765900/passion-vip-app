'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Clock, MapPin, Search, Brain, BarChart3, Flame, Gem } from 'lucide-react'
import Image from 'next/image'
import { Match, getTeamColor, getTeamInitials, LEAGUE_COLORS } from '@/types'

interface MatchCardProps {
  match: Match
  onGeneratePronostic: (match: Match) => void
  isLoading: boolean
  badges?: {
    isValue?: boolean
    isSafe?: boolean
  }
}

const loadingMessages = [
  { icon: Search, text: 'Recherche des infos...' },
  { icon: BarChart3, text: 'Analyse des stats...' },
  { icon: Brain, text: 'Generation VIP...' },
]

function TeamLogo({ teamName, logoUrl }: { teamName: string; logoUrl?: string }) {
  const [imgError, setImgError] = useState(false)
  const initials = getTeamInitials(teamName)
  const color = getTeamColor(teamName)

  // Si on a un logo URL valide et pas d'erreur, afficher l'image
  if (logoUrl && !imgError) {
    return (
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-white/10 p-1 shadow-lg overflow-hidden">
        <Image
          src={logoUrl}
          alt={teamName}
          width={40}
          height={40}
          className="object-contain w-8 h-8 md:w-10 md:h-10"
          onError={() => setImgError(true)}
          unoptimized // Les logos API-Football sont déjà optimisés
        />
      </div>
    )
  }

  // Fallback: initiales
  return (
    <div
      className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-lg"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  )
}

export default function MatchCard({ match, onGeneratePronostic, isLoading, badges }: MatchCardProps) {
  const [loadingStep, setLoadingStep] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      setLoadingStep(0)
      return
    }

    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % loadingMessages.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [isLoading])

  const currentMessage = loadingMessages[loadingStep]
  const LoadingIcon = currentMessage.icon
  const leagueColor = LEAGUE_COLORS[match.league] || '#4B5563'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: isLoading ? 1 : 1.02 }}
      transition={{ duration: 0.2 }}
      className={`glass-card rounded-xl overflow-hidden relative ${isLoading ? 'ring-2 ring-neon-green/50' : ''}`}
    >
      {/* Badges */}
      {badges && (badges.isValue || badges.isSafe) && (
        <div className="absolute top-12 right-2 z-10 flex flex-col gap-1">
          {badges.isValue && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1 px-2 py-1 bg-orange-500/90 rounded-full shadow-lg"
            >
              <Flame className="w-3 h-3 text-white" />
              <span className="text-[10px] font-bold text-white">VALUE</span>
            </motion.div>
          )}
          {badges.isSafe && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-1 px-2 py-1 bg-blue-500/90 rounded-full shadow-lg"
            >
              <Gem className="w-3 h-3 text-white" />
              <span className="text-[10px] font-bold text-white">SAFE</span>
            </motion.div>
          )}
        </div>
      )}

      {/* League Header */}
      <div
        className="px-3 md:px-4 py-2 flex items-center justify-between gap-2"
        style={{ backgroundColor: `${leagueColor}CC` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-4 h-4 md:w-5 md:h-5 rounded-full flex-shrink-0"
            style={{ backgroundColor: leagueColor }}
          />
          <span className="text-xs md:text-sm font-medium text-white truncate">
            {match.league}
          </span>
        </div>
        <div className="flex items-center gap-1 text-neon-green text-[10px] md:text-xs font-medium bg-dark-900/50 px-2 py-1 rounded-full flex-shrink-0">
          <Clock className="w-3 h-3" />
          <span>{match.time}</span>
        </div>
      </div>

      {/* Match Content */}
      <div className="p-3 md:p-5">
        {/* Teams */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          {/* Home Team */}
          <div className="flex-1 text-center min-w-0">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 bg-dark-600/50 rounded-full flex items-center justify-center p-1"
            >
              <TeamLogo teamName={match.homeTeam} logoUrl={match.homeTeamLogo} />
            </motion.div>
            <h3 className="font-semibold text-xs md:text-sm text-white truncate px-1">
              {match.homeTeam}
            </h3>
          </div>

          {/* VS */}
          <div className="px-2 md:px-3 flex-shrink-0">
            <div className="text-center">
              <span className="text-base md:text-xl font-bold text-white/30">VS</span>
              <div className="text-[10px] md:text-xs text-white/50 mt-1">{match.date}</div>
            </div>
          </div>

          {/* Away Team */}
          <div className="flex-1 text-center min-w-0">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 bg-dark-600/50 rounded-full flex items-center justify-center p-1"
            >
              <TeamLogo teamName={match.awayTeam} logoUrl={match.awayTeamLogo} />
            </motion.div>
            <h3 className="font-semibold text-xs md:text-sm text-white truncate px-1">
              {match.awayTeam}
            </h3>
          </div>
        </div>

        {/* Venue */}
        {match.stade && (
          <div className="flex items-center justify-center gap-2 text-white/50 text-[10px] md:text-xs mb-3 md:mb-4">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{match.stade}</span>
          </div>
        )}

        {/* Generate Button */}
        <motion.button
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          onClick={() => onGeneratePronostic(match)}
          disabled={isLoading}
          className={`
            w-full py-3 md:py-3 px-3 md:px-4 rounded-lg font-semibold text-xs md:text-sm
            flex items-center justify-center gap-2
            transition-all duration-300 min-h-[44px]
            ${isLoading
              ? 'bg-neon-green/20 border-2 border-neon-green text-neon-green'
              : 'bg-gradient-to-r from-neon-green/20 to-green-600/20 border border-neon-green/50 text-neon-green hover:shadow-neon hover:border-neon-green active:scale-[0.98]'
            }
          `}
        >
          {isLoading ? (
            <motion.div
              className="flex items-center gap-2"
              key={loadingStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <LoadingIcon className="w-4 h-4" />
              </motion.div>
              <span className="text-xs md:text-sm">{currentMessage.text}</span>
            </motion.div>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Analyse La Passion VIP</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}
