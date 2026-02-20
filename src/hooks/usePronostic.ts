'use client'

import { useState, useCallback } from 'react'
import { Match, PronosticResponse, APIPronosticResponse } from '@/types'

interface UsePronosticReturn {
  isLoading: boolean
  loadingMatchId: string | null
  error: string | null
  currentPronostic: PronosticResponse | null
  selectedMatch: Match | null
  generatePronostic: (match: Match, forceRefresh?: boolean) => Promise<void>
  clearPronostic: () => void
}

export function usePronostic(): UsePronosticReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMatchId, setLoadingMatchId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentPronostic, setCurrentPronostic] = useState<PronosticResponse | null>(null)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)

  const generatePronostic = useCallback(async (match: Match, forceRefresh = false) => {
    if (!match || !match.homeTeam || !match.awayTeam) {
      setError('Données du match invalides')
      return
    }

    setIsLoading(true)
    setLoadingMatchId(match.id)
    setError(null)
    setSelectedMatch(match)

    try {
      console.log('Generating VIP pronostic for:', match.homeTeam, 'vs', match.awayTeam)

      const response = await fetch('/api/pronostic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ match, forceRefresh }),
      })

      let data: APIPronosticResponse

      try {
        data = await response.json()
      } catch (jsonError) {
        console.error('Failed to parse response JSON:', jsonError)
        throw new Error(`Erreur serveur (${response.status}): Réponse invalide`)
      }

      if (!response.ok) {
        const errorMessage = data?.error || `Erreur HTTP ${response.status}`
        throw new Error(errorMessage)
      }

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la génération du pronostic')
      }

      if (!data.data) {
        throw new Error('Réponse vide du serveur')
      }

      // Validate structure
      const pronostic = data.data
      if (!pronostic.analysis || !pronostic.predictions || !pronostic.vip_tickets) {
        throw new Error('Structure de pronostic invalide')
      }

      console.log('VIP Pronostic received successfully')
      setCurrentPronostic(pronostic)

    } catch (err) {
      console.error('usePronostic error:', err)
      const errorMessage = err instanceof Error
        ? err.message
        : 'Une erreur inattendue est survenue'
      setError(errorMessage)
      setSelectedMatch(null)
    } finally {
      setIsLoading(false)
      setLoadingMatchId(null)
    }
  }, [])

  const clearPronostic = useCallback(() => {
    setCurrentPronostic(null)
    setSelectedMatch(null)
    setError(null)
  }, [])

  return {
    isLoading,
    loadingMatchId,
    error,
    currentPronostic,
    selectedMatch,
    generatePronostic,
    clearPronostic,
  }
}
