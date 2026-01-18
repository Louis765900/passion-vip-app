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
      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 p-1 shadow-lg overflow-hidden">
        <Image
          src={logoUrl}
          alt={teamName}
          width={40}
          height={40}
          className="object-contain"
          onError={() => setImgError(true)}
          unoptimized // Les logos API-Football sont déjà optimisés
        />
      </div>
    )
  }

  // Fallback: initiales
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
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
        className="px-4 py-2 flex items-center justify-between"
        style={{ backgroundColor: `${leagueColor}CC` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full"
            style={{ backgroundColor: leagueColor }}
          />
          <span className="text-sm font-medium text-white truncate max-w-[150px]">
            {match.league}
          </span>
        </div>
        <div className="flex items-center gap-1 text-neon-green text-xs font-medium bg-dark-900/50 px-2 py-1 rounded-full">
          <Clock className="w-3 h-3" />
          <span>{match.time}</span>
        </div>
      </div>

      {/* Match Content */}
      <div className="p-5">
        {/* Teams */}
        <div className="flex items-center justify-between mb-4">
          {/* Home Team */}
          <div className="flex-1 text-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-16 h-16 mx-auto mb-2 bg-dark-600/50 rounded-full flex items-center justify-center p-1"
            >
              <TeamLogo teamName={match.homeTeam} logoUrl={match.homeTeamLogo} />
            </motion.div>
            <h3 className="font-semibold text-sm text-white truncate px-1">
              {match.homeTeam}
            </h3>
          </div>

          {/* VS */}
          <div className="px-3">
            <div className="text-center">
              <span className="text-xl font-bold text-white/30">VS</span>
              <div className="text-xs text-white/50 mt-1">{match.date}</div>
            </div>
          </div>

          {/* Away Team */}
          <div className="flex-1 text-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-16 h-16 mx-auto mb-2 bg-dark-600/50 rounded-full flex items-center justify-center p-1"
            >
              <TeamLogo teamName={match.awayTeam} logoUrl={match.awayTeamLogo} />
            </motion.div>
            <h3 className="font-semibold text-sm text-white truncate px-1">
              {match.awayTeam}
            </h3>
          </div>
        </div>

        {/* Venue */}
        {match.stade && (
          <div className="flex items-center justify-center gap-2 text-white/50 text-xs mb-4">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[200px]">{match.stade}</span>
          </div>
        )}

        {/* Generate Button */}
        <motion.button
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          onClick={() => onGeneratePronostic(match)}
          disabled={isLoading}
          className={`
            w-full py-3 px-4 rounded-lg font-semibold text-sm
            flex items-center justify-center gap-2
            transition-all duration-300
            ${isLoading
              ? 'bg-neon-green/20 border-2 border-neon-green text-neon-green'
              : 'bg-gradient-to-r from-neon-green/20 to-green-600/20 border border-neon-green/50 text-neon-green hover:shadow-neon hover:border-neon-green'
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
              <span>{currentMessage.text}</span>
            </motion.div>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyse La Passion VIP
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}
