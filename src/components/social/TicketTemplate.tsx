'use client'

import { forwardRef, useState } from 'react'
import { Trophy } from 'lucide-react'
import { Match, PronosticResponse, getTeamColor, getTeamInitials } from '@/types'

interface TicketTemplateProps {
  match: Match
  pronostic: PronosticResponse
  ticketType: 'safe' | 'fun'
  homeLogo?: string
  awayLogo?: string
  leagueLogo?: string
}

// Logo avec fallback sur initiales - utilise <img> standard pour html2canvas
function TeamLogoCapture({
  teamName,
  logoUrl
}: {
  teamName: string
  logoUrl?: string
}) {
  const [imgError, setImgError] = useState(false)
  const initials = getTeamInitials(teamName)
  const color = getTeamColor(teamName)

  if (logoUrl && !imgError) {
    return (
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          padding: 4,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
        }}
      >
        <img
          src={logoUrl}
          alt={teamName}
          crossOrigin="anonymous"
          onError={() => setImgError(true)}
          style={{
            width: 48,
            height: 48,
            objectFit: 'contain',
          }}
        />
      </div>
    )
  }

  return (
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: color,
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
    >
      {initials}
    </div>
  )
}

export const TicketTemplate = forwardRef<HTMLDivElement, TicketTemplateProps>(
  ({ match, pronostic, ticketType, homeLogo, awayLogo, leagueLogo }, ref) => {
    const ticket = ticketType === 'safe' ? pronostic.vip_tickets.safe : pronostic.vip_tickets.fun
    const confidence = ticketType === 'safe' ? pronostic.vip_tickets.safe.confidence : undefined
    const evValue = ticketType === 'fun' ? pronostic.vip_tickets.fun.ev_value : undefined
    const [leagueImgError, setLeagueImgError] = useState(false)

    // Utiliser les logos du match si non fournis en props
    const homeLogoUrl = homeLogo || match.homeTeamLogo
    const awayLogoUrl = awayLogo || match.awayTeamLogo
    const leagueLogoUrl = leagueLogo || match.leagueLogo

    return (
      <div
        ref={ref}
        style={{
          width: 400,
          padding: 24,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
          border: '2px solid #39ff14',
          boxShadow: '0 0 30px rgba(57, 255, 20, 0.3)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header avec Logo Ligue */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy style={{ width: 24, height: 24, color: '#39ff14' }} />
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
              PronoScope
            </span>
          </div>
          <span
            style={{
              padding: '4px 12px',
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 'bold',
              backgroundColor: ticketType === 'safe' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(168, 85, 247, 0.2)',
              color: ticketType === 'safe' ? '#4ade80' : '#c084fc',
              border: `1px solid ${ticketType === 'safe' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(168, 85, 247, 0.5)'}`,
            }}
          >
            {ticketType === 'safe' ? 'SAFE' : 'FUN'}
          </span>
        </div>

        {/* League Logo & Name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 16,
            padding: '8px 16px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 8,
          }}
        >
          {leagueLogoUrl && !leagueImgError ? (
            <img
              src={leagueLogoUrl}
              alt={match.league}
              crossOrigin="anonymous"
              onError={() => setLeagueImgError(true)}
              style={{
                width: 24,
                height: 24,
                objectFit: 'contain',
              }}
            />
          ) : (
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: '#39ff14',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Trophy style={{ width: 14, height: 14, color: '#0a0a0a' }} />
            </div>
          )}
          <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, fontWeight: 500 }}>
            {match.league}
          </span>
        </div>

        {/* Teams */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            padding: '0 16px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <TeamLogoCapture teamName={match.homeTeam} logoUrl={homeLogoUrl} />
            <span
              style={{
                color: 'white',
                fontWeight: 500,
                fontSize: 13,
                textAlign: 'center',
                maxWidth: 100,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {match.homeTeam}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ color: '#39ff14', fontWeight: 'bold', fontSize: 24 }}>VS</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginTop: 4 }}>
              {match.time}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <TeamLogoCapture teamName={match.awayTeam} logoUrl={awayLogoUrl} />
            <span
              style={{
                color: 'white',
                fontWeight: 500,
                fontSize: 13,
                textAlign: 'center',
                maxWidth: 100,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {match.awayTeam}
            </span>
          </div>
        </div>

        {/* Date */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, margin: 0 }}>{match.date}</p>
        </div>

        {/* Prediction Box */}
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
            background: 'rgba(57, 255, 20, 0.1)',
            border: '1px solid rgba(57, 255, 20, 0.3)',
          }}
        >
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, marginBottom: 4, marginTop: 0 }}>
            {ticket.market}
          </p>
          <p style={{ color: '#39ff14', fontWeight: 'bold', fontSize: 20, margin: '8px 0' }}>
            {ticket.selection}
          </p>
          <p style={{ color: 'white', fontWeight: 600, marginTop: 8, marginBottom: 0 }}>
            Cote: <span style={{ color: '#39ff14' }}>{ticket.odds_estimated.toFixed(2)}</span>
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 32,
            marginBottom: 16,
          }}
        >
          {confidence !== undefined && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 11, margin: 0, marginBottom: 4 }}>
                Confiance
              </p>
              <p style={{ color: '#4ade80', fontWeight: 'bold', fontSize: 18, margin: 0 }}>
                {confidence}%
              </p>
            </div>
          )}
          {evValue !== undefined && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 11, margin: 0, marginBottom: 4 }}>
                Value
              </p>
              <p style={{ color: '#c084fc', fontWeight: 'bold', fontSize: 18, margin: 0 }}>
                +{evValue.toFixed(1)}%
              </p>
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 11, margin: 0, marginBottom: 4 }}>
              Score
            </p>
            <p style={{ color: '#39ff14', fontWeight: 'bold', fontSize: 18, margin: 0 }}>
              {pronostic.predictions.score_exact}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            paddingTop: 16,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <p style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 10, margin: 0 }}>
            Genere par PronoScope - Pariez responsablement
          </p>
        </div>
      </div>
    )
  }
)

TicketTemplate.displayName = 'TicketTemplate'
