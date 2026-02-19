'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Clock, MapPin, Search, Brain, BarChart3, Flame, Star, Shield } from 'lucide-react'
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
  isFavorite?: boolean
  onToggleFavorite?: (matchId: string) => void
}

const loadingMessages = [
  { icon: Search,   text: 'Recherche des données…' },
  { icon: BarChart3, text: 'Analyse statistique…' },
  { icon: Brain,    text: 'Génération VIP…' },
]

function TeamLogo({ teamName, logoUrl }: { teamName: string; logoUrl?: string }) {
  const [imgError, setImgError] = useState(false)
  const initials = getTeamInitials(teamName)
  const color = getTeamColor(teamName)

  if (logoUrl && !imgError) {
    return (
      <Image
        src={logoUrl}
        alt={teamName}
        width={44}
        height={44}
        className="w-full h-full object-contain"
        onError={() => setImgError(true)}
        unoptimized
      />
    )
  }

  return (
    <div
      className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xs"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  )
}

export default function MatchCard({
  match,
  onGeneratePronostic,
  isLoading,
  badges,
  isFavorite = false,
  onToggleFavorite,
}: MatchCardProps) {
  const [loadingStep, setLoadingStep] = useState(0)
  const [tapped, setTapped] = useState(false)
  const leagueColor = LEAGUE_COLORS[match.league] || '#4B5563'

  useEffect(() => {
    if (!isLoading) { setLoadingStep(0); return }
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % loadingMessages.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [isLoading])

  const { icon: LoadingIcon, text: loadingText } = loadingMessages[loadingStep]
  const hasScore = match.homeScore !== undefined && match.homeScore !== null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.013, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } }}
      whileTap={{ scale: 0.984, transition: { duration: 0.08 } }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onTapStart={() => setTapped(true)}
      onTap={() => setTimeout(() => setTapped(false), 160)}
      onTapCancel={() => setTapped(false)}
      className="ios-widget overflow-hidden relative group cursor-pointer"
    >
      {/* Haptic tap flash */}
      <AnimatePresence>
        {tapped && (
          <motion.div
            initial={{ opacity: 0.18 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-white rounded-ios pointer-events-none z-30"
          />
        )}
      </AnimatePresence>
      {/* Subtle loading ring */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 rounded-ios pointer-events-none z-20"
          style={{ boxShadow: '0 0 0 1.5px rgba(245,158,11,0.45) inset' }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* ── TOP BAR: League + Meta ─────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 min-w-0">
          {/* League color dot */}
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: leagueColor, boxShadow: `0 0 6px ${leagueColor}60` }}
          />
          <span className="text-[11px] font-medium text-white/50 truncate tracking-wide uppercase">
            {match.league}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Badges */}
          <AnimatePresence>
            {badges?.isValue && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-pill text-[10px] font-bold"
                style={{
                  background: 'rgba(255,159,10,0.15)',
                  border: '1px solid rgba(255,159,10,0.30)',
                  color: '#FF9F0A',
                }}
              >
                <Flame className="w-2.5 h-2.5" />
                VALUE
              </motion.div>
            )}
            {badges?.isSafe && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: 0.05 }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-pill text-[10px] font-bold"
                style={{
                  background: 'rgba(10,132,255,0.14)',
                  border: '1px solid rgba(10,132,255,0.28)',
                  color: '#0A84FF',
                }}
              >
                <Shield className="w-2.5 h-2.5" />
                SAFE
              </motion.div>
            )}
          </AnimatePresence>

          {/* Time */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-pill bg-white/[0.06] border border-white/[0.08]">
            <Clock className="w-3 h-3 text-white/40" />
            <span className="text-[11px] font-medium text-white/70">{match.time}</span>
          </div>

          {/* Favorite */}
          {onToggleFavorite && (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={e => { e.stopPropagation(); onToggleFavorite(match.id) }}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/[0.07] transition-colors"
              aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Star className={`w-3.5 h-3.5 transition-colors ${isFavorite ? 'text-amber-400 fill-amber-400' : 'text-white/30'}`} />
            </motion.button>
          )}
        </div>
      </div>

      {/* ── SEPARATOR ───────────────────────────────────────────── */}
      <div className="mx-4 h-px bg-white/[0.05]" />

      {/* ── TEAMS ───────────────────────────────────────────────── */}
      <div className="px-5 py-5">
        <div className="flex items-center justify-between">

          {/* Home Team */}
          <div className="flex-1 flex flex-col items-center gap-2.5 min-w-0">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/[0.06] border border-white/[0.07] flex items-center justify-center p-1.5 overflow-hidden">
              <TeamLogo teamName={match.homeTeam} logoUrl={match.homeTeamLogo} />
            </div>
            <span className="text-[12px] md:text-[13px] font-semibold text-white/90 text-center leading-tight px-1 truncate w-full">
              {match.homeTeam}
            </span>
          </div>

          {/* VS / Score */}
          <div className="px-3 flex-shrink-0 flex flex-col items-center gap-1">
            {hasScore ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-2xl md:text-3xl font-black text-white tabular-nums">
                    {match.homeScore ?? 0}
                  </span>
                  <span className="text-sm font-light text-white/20">–</span>
                  <span className="text-2xl md:text-3xl font-black text-white tabular-nums">
                    {match.awayScore ?? 0}
                  </span>
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-pill ${
                  match.isFinished
                    ? 'bg-white/[0.07] text-white/40'
                    : 'bg-apple-green/[0.12] text-apple-green animate-pulse'
                }`}>
                  {match.isFinished ? 'Terminé' : 'Live'}
                </span>
              </>
            ) : (
              <>
                <span className="text-[15px] font-light text-white/20 tracking-widest">VS</span>
                <span className="text-[10px] text-white/30 mt-0.5">{match.date}</span>
              </>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 flex flex-col items-center gap-2.5 min-w-0">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/[0.06] border border-white/[0.07] flex items-center justify-center p-1.5 overflow-hidden">
              <TeamLogo teamName={match.awayTeam} logoUrl={match.awayTeamLogo} />
            </div>
            <span className="text-[12px] md:text-[13px] font-semibold text-white/90 text-center leading-tight px-1 truncate w-full">
              {match.awayTeam}
            </span>
          </div>

        </div>
      </div>

      {/* ── VENUE ───────────────────────────────────────────────── */}
      {match.stade && (
        <div className="mx-4 flex items-center justify-center gap-1.5 text-white/30 text-[10px] mb-3 -mt-1">
          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate">{match.stade}</span>
        </div>
      )}

      {/* ── ANALYSE BUTTON ──────────────────────────────────────── */}
      {!match.isFinished && (
        <div className="px-4 pb-4">
          <motion.button
            whileHover={{ scale: isLoading ? 1 : 1.015 }}
            whileTap={{ scale: isLoading ? 1 : 0.985 }}
            onClick={() => onGeneratePronostic(match)}
            disabled={isLoading}
            className={`
              w-full py-3 px-4 rounded-macos font-medium text-[13px]
              flex items-center justify-center gap-2
              min-h-[44px] transition-all duration-200
              ${isLoading
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400/70 cursor-not-allowed'
                : 'btn-gold cursor-pointer'
              }
            `}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key={loadingStep}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <LoadingIcon className="w-3.5 h-3.5" />
                  </motion.div>
                  <span>{loadingText}</span>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyse PronoScope</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}
