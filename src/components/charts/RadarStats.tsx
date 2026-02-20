'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { TeamRadarStats } from '@/types'

interface RadarStatsProps {
  homeTeam: string
  awayTeam: string
  homeStats: TeamRadarStats
  awayStats: TeamRadarStats
}

const STAT_LABELS: Record<keyof TeamRadarStats, string> = {
  attack: 'Attaque',
  defense: 'Défense',
  form: 'Forme',
  morale: 'Moral',
  h2h: 'H2H',
}

export function RadarStats({ homeTeam, awayTeam, homeStats, awayStats }: RadarStatsProps) {
  // Guard : si les stats sont absentes ou mal formées, afficher un placeholder
  if (!homeStats || !awayStats) {
    return (
      <div className="w-full bg-dark-800/50 rounded-xl p-4 flex items-center justify-center h-[280px]">
        <p className="text-white/40 text-sm">Stats non disponibles pour ce match</p>
      </div>
    )
  }

  // Forcer des valeurs numériques (l'IA peut renvoyer des strings)
  const toNum = (v: unknown): number => {
    const n = Number(v)
    return isFinite(n) && n >= 0 ? Math.min(n, 100) : 50
  }

  const data = (Object.keys(STAT_LABELS) as (keyof TeamRadarStats)[]).map((key) => ({
    stat: STAT_LABELS[key],
    home: toNum(homeStats[key]),
    away: toNum(awayStats[key]),
    fullMark: 100,
  }))

  return (
    <div className="w-full bg-dark-800/50 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-white/80 mb-2 text-center">
        Comparaison des Forces
      </h4>
      {/* Hauteur fixe explicite pour eviter height: 0 */}
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#ffffff20" />
          <PolarAngleAxis
            dataKey="stat"
            tick={{ fill: '#ffffff90', fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#ffffff50', fontSize: 9 }}
            tickCount={5}
          />
          <Radar
            name={homeTeam}
            dataKey="home"
            stroke="#39ff14"
            fill="#39ff14"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Radar
            name={awayTeam}
            dataKey="away"
            stroke="#ff6b6b"
            fill="#ff6b6b"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '10px',
              fontSize: '11px',
            }}
          />
        </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
