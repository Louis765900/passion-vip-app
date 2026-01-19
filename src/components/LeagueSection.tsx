'use client'

import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { Match, LEAGUE_COLORS } from '@/types'
import MatchCard from './MatchCard'

interface MatchBadges {
  isValue?: boolean
  isSafe?: boolean
}

interface LeagueSectionProps {
  league: string
  matches: Match[]
  onGeneratePronostic: (match: Match) => void
  loadingMatchId: string | null
  analyzedMatches?: Map<string, MatchBadges>
}

export default function LeagueSection({
  league,
  matches,
  onGeneratePronostic,
  loadingMatchId,
  analyzedMatches = new Map(),
}: LeagueSectionProps) {
  if (matches.length === 0) return null

  const leagueColor = LEAGUE_COLORS[league] || '#4B5563'

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 md:space-y-4"
    >
      {/* League Header */}
      <div className="flex items-center gap-2 md:gap-3 flex-wrap">
        <div
          className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: leagueColor }}
        >
          <Trophy className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </div>
        <h2 className="text-base md:text-xl font-bold text-white">{league}</h2>
        <span className="px-2 py-0.5 bg-neon-green/20 border border-neon-green/30 rounded-full text-[10px] md:text-xs text-neon-green font-medium">
          {matches.length} match{matches.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            onGeneratePronostic={onGeneratePronostic}
            isLoading={loadingMatchId === match.id}
            badges={analyzedMatches.get(match.id)}
          />
        ))}
      </div>
    </motion.section>
  )
}
