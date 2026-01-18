'use client'

import { useState, useEffect, useCallback } from 'react'
import { BankrollData, Bet, Match, SafeTicket, FunTicket, calculateKellyStake } from '@/types'

const STORAGE_KEY = 'pronosport_bankroll'

const DEFAULT_BANKROLL: BankrollData = {
  balance: 100,
  initialBalance: 100,
  bets: [],
  lastUpdated: new Date().toISOString()
}

export function useBankroll() {
  const [bankroll, setBankroll] = useState<BankrollData>(DEFAULT_BANKROLL)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const data = JSON.parse(stored) as BankrollData
          setBankroll(data)
        } catch {
          setBankroll(DEFAULT_BANKROLL)
        }
      }
      setIsLoaded(true)
    }
  }, [])

  // Save to localStorage whenever bankroll changes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bankroll))
    }
  }, [bankroll, isLoaded])

  // Calculate ROI
  const calculateROI = useCallback(() => {
    const { balance, initialBalance } = bankroll
    if (initialBalance === 0) return 0
    return ((balance - initialBalance) / initialBalance) * 100
  }, [bankroll])

  // Get total profit/loss
  const getProfitLoss = useCallback(() => {
    return bankroll.balance - bankroll.initialBalance
  }, [bankroll])

  // Get pending bets
  const getPendingBets = useCallback(() => {
    return bankroll.bets.filter(bet => bet.status === 'pending')
  }, [bankroll])

  // Place a bet
  const placeBet = useCallback((
    match: Match,
    ticket: SafeTicket | FunTicket,
    ticketType: 'safe' | 'fun',
    stake: number
  ) => {
    const bet: Bet = {
      id: `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      matchId: match.id,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      league: match.league,
      date: match.date,
      ticketType,
      market: ticket.market,
      selection: ticket.selection,
      odds: ticket.odds_estimated,
      stake,
      potentialWin: stake * ticket.odds_estimated,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    setBankroll(prev => ({
      ...prev,
      balance: prev.balance - stake,
      bets: [bet, ...prev.bets],
      lastUpdated: new Date().toISOString()
    }))

    return bet
  }, [])

  // Settle a bet (win/lose)
  const settleBet = useCallback((betId: string, won: boolean) => {
    setBankroll(prev => {
      const bet = prev.bets.find(b => b.id === betId)
      if (!bet || bet.status !== 'pending') return prev

      const newBalance = won
        ? prev.balance + bet.potentialWin
        : prev.balance

      return {
        ...prev,
        balance: newBalance,
        bets: prev.bets.map(b =>
          b.id === betId
            ? { ...b, status: won ? 'won' : 'lost', settledAt: new Date().toISOString() }
            : b
        ),
        lastUpdated: new Date().toISOString()
      }
    })
  }, [])

  // Update initial bankroll
  const setInitialBankroll = useCallback((amount: number) => {
    setBankroll(prev => ({
      ...prev,
      balance: amount,
      initialBalance: amount,
      lastUpdated: new Date().toISOString()
    }))
  }, [])

  // Reset bankroll
  const resetBankroll = useCallback(() => {
    setBankroll(DEFAULT_BANKROLL)
  }, [])

  // Get Kelly stake suggestion
  const getKellySuggestion = useCallback((confidence: number, odds: number) => {
    return calculateKellyStake(bankroll.balance, confidence, odds)
  }, [bankroll.balance])

  return {
    bankroll,
    isLoaded,
    roi: calculateROI(),
    profitLoss: getProfitLoss(),
    pendingBets: getPendingBets(),
    placeBet,
    settleBet,
    setInitialBankroll,
    resetBankroll,
    getKellySuggestion
  }
}
