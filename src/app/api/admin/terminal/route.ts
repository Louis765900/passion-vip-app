import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export const dynamic = 'force-dynamic'

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_KV_REST_API_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN

function getRedis() {
  if (!redisUrl || !redisToken) throw new Error('Redis non configure')
  return new Redis({ url: redisUrl, token: redisToken })
}

interface CommandResult {
  output: string
  type: 'success' | 'error' | 'info' | 'warning' | 'table'
}

async function executeCommand(command: string, secret: string): Promise<CommandResult> {
  const parts = command.trim().split(/\s+/)
  const cmd = parts[0]?.toLowerCase()
  const args = parts.slice(1)

  // Verification admin
  if (secret !== process.env.ADMIN_SECRET) {
    return { output: 'Acces refuse. Secret invalide.', type: 'error' }
  }

  const redis = getRedis()

  switch (cmd) {
    // ===== HELP =====
    case 'help': {
      const helpText = [
        'Commandes disponibles:',
        '',
        '  help                     Afficher cette aide',
        '  users                    Lister tous les utilisateurs',
        '  users count              Nombre total d\'utilisateurs',
        '  stats                    Statistiques globales',
        '  bets <email>             Voir les paris d\'un utilisateur',
        '  bankroll <email>         Voir la bankroll d\'un utilisateur',
        '  check-bets               Forcer la verification de tous les paris pending',
        '  check-bets <email>       Verifier les paris d\'un utilisateur specifique',
        '  telegram <message>       Envoyer un message sur Telegram',
        '  generate                 Lancer la generation de pronostics',
        '  invite                   Generer un lien d\'invitation VIP',
        '  publish                  Publier le brouillon sur Telegram',
        '  draft                    Voir le brouillon actuel',
        '  status                   Statut du systeme',
        '  set-bet <email> <betId> <won|lost>  Forcer le resultat d\'un pari',
        '  clear                    Effacer le terminal',
      ].join('\n')
      return { output: helpText, type: 'info' }
    }

    // ===== USERS =====
    case 'users': {
      if (args[0] === 'count') {
        const keys = await redis.keys('user:*:bets')
        const uniqueEmails = new Set(keys.map(k => k.replace('user:', '').replace(':bets', '')))
        return { output: `Utilisateurs inscrits: ${uniqueEmails.size}`, type: 'success' }
      }

      // Lister tous les utilisateurs
      const keys = await redis.keys('user:*:bets')
      if (keys.length === 0) {
        return { output: 'Aucun utilisateur trouve.', type: 'warning' }
      }

      const users: string[] = []
      for (const key of keys) {
        const email = key.replace('user:', '').replace(':bets', '')
        const bankrollRaw = await redis.get(`user:${email}:bankroll`)
        const bankroll = bankrollRaw ? parseFloat(String(bankrollRaw)) : 0
        const betsRaw = await redis.get(`user:${email}:bets`)
        const bets = betsRaw ? (typeof betsRaw === 'string' ? JSON.parse(betsRaw) : betsRaw) as Array<{status: string}> : []
        const pending = bets.filter(b => b.status === 'pending').length
        const won = bets.filter(b => b.status === 'won').length
        const lost = bets.filter(b => b.status === 'lost').length
        users.push(`  ${email} | Bankroll: ${bankroll.toFixed(2)}€ | Paris: ${bets.length} (${won}W/${lost}L/${pending}P)`)
      }

      return { output: `Utilisateurs (${users.length}):\n${users.join('\n')}`, type: 'table' }
    }

    // ===== STATS =====
    case 'stats': {
      const userKeys = await redis.keys('user:*:bets')
      let totalBets = 0
      let totalWon = 0
      let totalLost = 0
      let totalPending = 0
      let totalBankroll = 0

      for (const key of userKeys) {
        const email = key.replace('user:', '').replace(':bets', '')
        const betsRaw = await redis.get(`user:${email}:bets`)
        const bets = betsRaw ? (typeof betsRaw === 'string' ? JSON.parse(betsRaw) : betsRaw) as Array<{status: string}> : []
        totalBets += bets.length
        totalWon += bets.filter(b => b.status === 'won').length
        totalLost += bets.filter(b => b.status === 'lost').length
        totalPending += bets.filter(b => b.status === 'pending').length

        const bankrollRaw = await redis.get(`user:${email}:bankroll`)
        totalBankroll += bankrollRaw ? parseFloat(String(bankrollRaw)) : 0
      }

      const winRate = (totalWon + totalLost) > 0 ? ((totalWon / (totalWon + totalLost)) * 100).toFixed(1) : '0'

      const output = [
        'Statistiques globales:',
        `  Utilisateurs:     ${userKeys.length}`,
        `  Paris totaux:     ${totalBets}`,
        `  Gagnes:           ${totalWon}`,
        `  Perdus:           ${totalLost}`,
        `  En attente:       ${totalPending}`,
        `  Win rate:         ${winRate}%`,
        `  Bankroll totale:  ${totalBankroll.toFixed(2)}€`,
      ].join('\n')

      return { output, type: 'success' }
    }

    // ===== BETS =====
    case 'bets': {
      const email = args[0]
      if (!email) return { output: 'Usage: bets <email>', type: 'error' }

      const betsRaw = await redis.get(`user:${email}:bets`)
      const bets = betsRaw ? (typeof betsRaw === 'string' ? JSON.parse(betsRaw) : betsRaw) as Array<{id: string, homeTeam: string, awayTeam: string, market: string, selection: string, odds: number, stake: number, status: string, date: string}> : []

      if (bets.length === 0) {
        return { output: `Aucun pari pour ${email}`, type: 'warning' }
      }

      const lines = bets.map((b, i) => {
        const status = b.status === 'won' ? '[WON]' : b.status === 'lost' ? '[LOST]' : '[PENDING]'
        return `  ${i + 1}. ${status} ${b.homeTeam} vs ${b.awayTeam} | ${b.market}: ${b.selection} | Cote: ${b.odds} | Mise: ${b.stake}€ | ${b.date || 'N/A'}\n     ID: ${b.id}`
      })

      return { output: `Paris de ${email} (${bets.length}):\n${lines.join('\n')}`, type: 'table' }
    }

    // ===== BANKROLL =====
    case 'bankroll': {
      const email = args[0]
      if (!email) return { output: 'Usage: bankroll <email>', type: 'error' }

      const bankrollRaw = await redis.get(`user:${email}:bankroll`)
      const initialRaw = await redis.get(`user:${email}:bankroll:initial`)
      const locked = await redis.get(`user:${email}:bankroll:locked`)
      const bankroll = bankrollRaw ? parseFloat(String(bankrollRaw)) : 0
      const initial = initialRaw ? parseFloat(String(initialRaw)) : 0
      const roi = initial > 0 ? (((bankroll - initial) / initial) * 100).toFixed(2) : '0'

      const output = [
        `Bankroll de ${email}:`,
        `  Solde actuel:     ${bankroll.toFixed(2)}€`,
        `  Solde initial:    ${initial.toFixed(2)}€`,
        `  ROI:              ${roi}%`,
        `  Verrouillée:      ${locked ? 'Oui' : 'Non'}`,
      ].join('\n')

      return { output, type: 'success' }
    }

    // ===== CHECK-BETS =====
    case 'check-bets': {
      const targetEmail = args[0]

      if (targetEmail) {
        // Verifier un utilisateur specifique
        const betsRaw = await redis.get(`user:${targetEmail}:bets`)
        const bets = betsRaw ? (typeof betsRaw === 'string' ? JSON.parse(betsRaw) : betsRaw) as Array<{status: string}> : []
        const pending = bets.filter(b => b.status === 'pending').length
        return { output: `Verification lancee pour ${targetEmail} (${pending} paris pending). Utilisez la page "Mes Paris" pour declencher la verification client-side.`, type: 'info' }
      }

      // Compter tous les paris pending
      const keys = await redis.keys('pending_user_bet:*')
      return { output: `${keys.length} paris en attente de verification dans le systeme.\nLa verification se fait automatiquement quand l'utilisateur visite "Mes Paris" ou via le CRON daily.`, type: 'info' }
    }

    // ===== SET-BET =====
    case 'set-bet': {
      const email = args[0]
      const betId = args[1]
      const newStatus = args[2]?.toLowerCase()

      if (!email || !betId || !['won', 'lost'].includes(newStatus || '')) {
        return { output: 'Usage: set-bet <email> <betId> <won|lost>', type: 'error' }
      }

      const betsRaw = await redis.get(`user:${email}:bets`)
      const bets = betsRaw ? (typeof betsRaw === 'string' ? JSON.parse(betsRaw) : betsRaw) as Array<{id: string, status: string, potentialWin: number, stake: number, settledAt?: string, perplexityVerified: boolean}> : []

      const betIndex = bets.findIndex(b => b.id === betId)
      if (betIndex === -1) return { output: `Pari ${betId} non trouve pour ${email}`, type: 'error' }

      const bet = bets[betIndex]
      if (bet.status !== 'pending') return { output: `Pari deja regle (${bet.status})`, type: 'warning' }

      bet.status = newStatus as 'won' | 'lost'
      bet.settledAt = new Date().toISOString()
      bet.perplexityVerified = false

      // Mettre a jour la bankroll si gagne
      if (newStatus === 'won') {
        const bankrollRaw = await redis.get(`user:${email}:bankroll`)
        let bankroll = bankrollRaw ? parseFloat(String(bankrollRaw)) : 100
        bankroll += bet.potentialWin
        await redis.set(`user:${email}:bankroll`, bankroll)
      }

      await redis.set(`user:${email}:bets`, JSON.stringify(bets))
      await redis.del(`pending_user_bet:${betId}`)

      return { output: `Pari ${betId} mis a jour: ${newStatus.toUpperCase()} pour ${email}`, type: 'success' }
    }

    // ===== TELEGRAM =====
    case 'telegram': {
      const message = args.join(' ')
      if (!message) return { output: 'Usage: telegram <message>', type: 'error' }

      const telegramToken = process.env.TELEGRAM_BOT_TOKEN
      const chatId = process.env.TELEGRAM_CHAT_ID

      if (!telegramToken || !chatId) {
        return { output: 'Variables Telegram manquantes (TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID)', type: 'error' }
      }

      const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          disable_web_page_preview: true,
        })
      })

      const result = await response.json()
      if (result.ok) {
        return { output: 'Message envoye sur Telegram avec succes.', type: 'success' }
      }
      return { output: `Erreur Telegram: ${result.description}`, type: 'error' }
    }

    // ===== GENERATE =====
    case 'generate': {
      const cronUrl = `/api/cron/daily?key=${encodeURIComponent(process.env.ADMIN_SECRET || '')}`
      return { output: `Pour generer les pronostics, appelez:\n  ${cronUrl}\n\nCette commande est executee par le CRON Vercel automatiquement.`, type: 'info' }
    }

    // ===== INVITE =====
    case 'invite': {
      try {
        const { v4: uuidv4 } = await import('uuid')
        const token = uuidv4()
        await redis.set(`invite:${token}`, 'valid', { ex: 172800 })

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pronoscope.vercel.app'
        const link = `${baseUrl}/join?token=${token}`

        return { output: `Lien d'invitation VIP genere (48h):\n  ${link}`, type: 'success' }
      } catch {
        return { output: 'Erreur lors de la generation de l\'invitation', type: 'error' }
      }
    }

    // ===== PUBLISH =====
    case 'publish': {
      const draft = await redis.get('draft:daily:pronostics')
      if (!draft) {
        return { output: 'Aucun brouillon a publier. Lancez "generate" d\'abord.', type: 'warning' }
      }

      return { output: 'Brouillon pret. Utilisez "draft" pour voir le contenu, puis "telegram <message>" pour l\'envoyer.', type: 'info' }
    }

    // ===== DRAFT =====
    case 'draft': {
      const draft = await redis.get('draft:daily:pronostics')
      if (!draft) {
        return { output: 'Aucun brouillon en attente.', type: 'warning' }
      }

      const parsed = typeof draft === 'string' ? JSON.parse(draft) : draft
      return { output: JSON.stringify(parsed, null, 2), type: 'info' }
    }

    // ===== STATUS =====
    case 'status': {
      const checks: string[] = []

      // Redis
      try {
        await redis.ping()
        checks.push('  Redis:          OK')
      } catch {
        checks.push('  Redis:          ERREUR')
      }

      // API Football
      checks.push(`  API Football:   ${process.env.API_FOOTBALL_KEY ? 'Configure' : 'NON CONFIGURE'}`)

      // Perplexity
      checks.push(`  Perplexity AI:  ${process.env.PERPLEXITY_API_KEY ? 'Configure' : 'NON CONFIGURE'}`)

      // Telegram
      checks.push(`  Telegram:       ${process.env.TELEGRAM_BOT_TOKEN ? 'Configure' : 'NON CONFIGURE'}`)

      // Groq
      checks.push(`  Groq LLM:       ${process.env.GROQ_API_KEY ? 'Configure' : 'NON CONFIGURE'}`)

      // Stats rapides
      const pendingKeys = await redis.keys('pending_user_bet:*')
      const userKeys = await redis.keys('user:*:bets')
      checks.push('')
      checks.push(`  Utilisateurs:   ${userKeys.length}`)
      checks.push(`  Paris pending:  ${pendingKeys.length}`)

      return { output: `Statut du systeme:\n${checks.join('\n')}`, type: 'success' }
    }

    // ===== CLEAR =====
    case 'clear': {
      return { output: '__CLEAR__', type: 'info' }
    }

    default:
      return { output: `Commande inconnue: "${cmd}". Tapez "help" pour la liste des commandes.`, type: 'error' }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { command, secret } = await req.json()

    if (!command || typeof command !== 'string') {
      return NextResponse.json({ output: 'Commande requise', type: 'error' })
    }

    const result = await executeCommand(command, secret)
    return NextResponse.json(result)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur inconnue'
    console.error('[ADMIN TERMINAL]', msg)
    return NextResponse.json({ output: `Erreur: ${msg}`, type: 'error' })
  }
}
