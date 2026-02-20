import { NextRequest, NextResponse } from 'next/server'
import { Match } from '@/types'
import { Redis } from '@upstash/redis'
import { callPerplexity, isPerplexityAvailable } from '@/lib/ai/perplexity'
import { callGemini, isGeminiAvailable } from '@/lib/ai/gemini'
import { parseLLMJson } from '@/lib/ai/parseJSON'

// ── Redis pour le cache pronostic 24h ──
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_KV_REST_API_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN || '',
})

function getCacheKey(match: Match): string {
  if (match.id) return `pronostic:${match.id}`
  const home = match.homeTeam.toLowerCase().replace(/\s+/g, '-')
  const away = match.awayTeam.toLowerCase().replace(/\s+/g, '-')
  return `pronostic:${home}:${away}:${match.date}`
}

// ── Traduction automatique des marchés en Français ──
function translateMarkets(pronostic: any): any {
  const FR: Record<string, string> = {
    'Both Teams To Score': 'Les deux équipes marquent',
    'Both Teams Score': 'Les deux équipes marquent',
    'BTTS': 'Les deux équipes marquent',
    'Double Chance': 'Chance Double',
    'Double Chance 1X': 'Chance Double 1X',
    'Double Chance X2': 'Chance Double X2',
    'Double Chance 12': 'Chance Double 12',
    'Over 0.5': 'Plus de 0.5 but',
    'Over 1.5': 'Plus de 1.5 buts',
    'Over 1.5 Goals': 'Plus de 1.5 buts',
    'Over 2.5': 'Plus de 2.5 buts',
    'Over 2.5 Goals': 'Plus de 2.5 buts',
    'Over 3.5': 'Plus de 3.5 buts',
    'Over 3.5 Goals': 'Plus de 3.5 buts',
    'Under 0.5': 'Moins de 0.5 but',
    'Under 1.5': 'Moins de 1.5 buts',
    'Under 1.5 Goals': 'Moins de 1.5 buts',
    'Under 2.5': 'Moins de 2.5 buts',
    'Under 2.5 Goals': 'Moins de 2.5 buts',
    'Under 3.5': 'Moins de 3.5 buts',
    '1N2': 'Résultat final',
    'Draw No Bet': 'Victoire sans nul',
    'Draw No Bet Home': 'Domicile sans nul',
    'Draw No Bet Away': 'Extérieur sans nul',
    'Asian Handicap': 'Handicap asiatique',
    'Correct Score': 'Score exact',
    'First Goalscorer': 'Premier buteur',
    'To Win': 'Victoire',
    'Home Win': 'Victoire domicile',
    'Away Win': 'Victoire extérieur',
    'Draw': 'Match nul',
    'Handicap -1': 'Handicap -1 but',
    'Handicap +1': 'Handicap +1 but',
  }

  function tr(text: string | undefined): string {
    if (!text) return text ?? ''
    if (FR[text]) return FR[text]
    let out = text
    for (const [en, fr] of Object.entries(FR)) {
      out = out.replace(new RegExp(`\\b${en}\\b`, 'gi'), fr)
    }
    return out
  }

  if (pronostic.vip_tickets?.safe) {
    pronostic.vip_tickets.safe.market = tr(pronostic.vip_tickets.safe.market)
    pronostic.vip_tickets.safe.selection = tr(pronostic.vip_tickets.safe.selection)
  }
  if (pronostic.vip_tickets?.fun) {
    pronostic.vip_tickets.fun.market = tr(pronostic.vip_tickets.fun.market)
    pronostic.vip_tickets.fun.selection = tr(pronostic.vip_tickets.fun.selection)
  }
  if (pronostic.predictions?.main_market) {
    pronostic.predictions.main_market.market = tr(pronostic.predictions.main_market.market)
  }

  // Importance en français
  const IMP: Record<string, string> = { 'High': 'Élevée', 'Medium': 'Moyenne', 'Low': 'Faible' }
  if (pronostic.analysis?.missing_players) {
    pronostic.analysis.missing_players = pronostic.analysis.missing_players.map((p: any) => ({
      ...p,
      importance: IMP[p.importance] ?? p.importance,
    }))
  }

  return pronostic
}

// ── Prompt Perplexity : COLLECTE ANTI-HALLUCINATION ──
const PERPLEXITY_DATA_PROMPT = (match: Match) => `Tu es un chercheur sportif expert en verification factuelle. Tu disposes d'un acces web en temps reel.

⚠️ REGLES ABSOLUES :
- N'INVENTE JAMAIS un joueur, un chiffre ou un fait. Si introuvable → null.
- Ne te base JAMAIS sur tes donnees d'entrainement pour les noms de joueurs ou les effectifs.
- Les effectifs changent a chaque mercato. Verifie TOUJOURS les compositions 2025/2026.
- Un joueur peut avoir change de club a l'ete 2025. Verifie avant de le mentionner.

MATCH : ${match.homeTeam} vs ${match.awayTeam}
COMPETITION : ${match.league}
DATE : ${match.date}

PROTOCOLE DE RECHERCHE (dans cet ordre strict) :
1. Recherche "${match.homeTeam} effectif 2025 2026 blessés absents" → site officiel du club, L'Equipe, RMC Sport, Transfermarkt
2. Recherche "${match.awayTeam} effectif 2025 2026 blessés absents" → mêmes sources
3. Recherche "${match.homeTeam} ${match.awayTeam} arbitre désigné ${match.date}" → site fédération officielle (FFF, UEFA, FIGC, DFB selon la compet)
4. Recherche "${match.homeTeam} résultats 2025 2026 forme" → SofaScore, WhoScored (5 derniers matchs officiels)
5. Recherche "${match.awayTeam} résultats 2025 2026 forme" → mêmes sources
6. Recherche "${match.homeTeam} ${match.awayTeam} historique" → dernières 5 confrontations directes
7. Recherche "cotes ${match.homeTeam} ${match.awayTeam}" → Bet365, Unibet, PMU (cotes actuelles)
8. Recherche "météo ${match.date} stade ${match.homeTeam}" → météo locale au moment du match
9. Recherche "${match.homeTeam} xG 2025 2026" et "${match.awayTeam} xG 2025 2026" → FBref, SofaScore

REGLES POUR LES JOUEURS BLESSÉS :
- Ne liste QUE les joueurs dont la blessure/suspension est confirmée par une source officielle ou un media fiable trouvé via ta recherche web.
- Si tu ne trouves aucun blessé confirmé, retourne un tableau vide [].
- N'invente PAS de blessés. Un tableau vide est préférable à une hallucination.

Retourne UNIQUEMENT ce JSON (sans texte avant ou apres) :
{
  "injuries_suspensions": {
    "home": [{"player": "Prenom Nom", "reason": "blessure musculaire/suspension/choix tactique", "importance": "High/Medium/Low", "source": "nom du media ou site"}],
    "away": [{"player": "Prenom Nom", "reason": "blessure musculaire/suspension/choix tactique", "importance": "High/Medium/Low", "source": "nom du media ou site"}]
  },
  "recent_form": {
    "home": {"last_5": "VVDNV", "description": "Forme specifique en 2-3 mots", "goals_scored_avg": 1.8, "goals_conceded_avg": 0.9},
    "away": {"last_5": "DDVND", "description": "Forme specifique en 2-3 mots", "goals_scored_avg": 1.2, "goals_conceded_avg": 1.4}
  },
  "h2h": {
    "last_5_results": ["V", "N", "D", "V", "V"],
    "home_wins": 3, "draws": 1, "away_wins": 1,
    "summary": "Resume factuel des 5 dernieres confrontations avec annees"
  },
  "current_odds": {
    "home_win": 1.85, "draw": 3.40, "away_win": 4.20,
    "over_2_5": 1.90, "btts": 1.95
  },
  "weather": "Ciel nuageux, 12 degres, vent 20km/h - impact sur le jeu long",
  "referee": "Prenom Nom - X cartons jaunes/match en moyenne cette saison 2025/2026, X penalties accordes",
  "xg": {"home": 1.65, "away": 1.22},
  "ranking_context": "Position actuelle 2025/2026 et enjeux classement des deux equipes",
  "tactical_notes": "Systeme de jeu habituel saison 2025/2026, fatigue calendrier, contexte de rivalite"
}`

// ── Prompt Gemini : ANALYSE TACTIQUE + TICKETS FRENCH ──
const GEMINI_REASONING_PROMPT = (match: Match, rawData: string) => `Tu es l'Analyste Senior de "PronoScope". TOUTES TES REPONSES SONT EN FRANCAIS UNIQUEMENT.

## DONNEES TEMPS REEL COLLECTEES (SOURCE : PERPLEXITY WEB SEARCH) :
${rawData}

## MATCH : ${match.homeTeam} vs ${match.awayTeam} | ${match.league} | ${match.date}

## ⚠️ REGLES ANTI-HALLUCINATION ABSOLUES :
1. Ne mentionne JAMAIS un joueur blessé ou absent qui n'est PAS dans "injuries_suspensions" ci-dessus.
2. Ne suppose JAMAIS l'effectif ou la composition. Utilise UNIQUEMENT les données ci-dessus.
3. Si un champ est null dans les données, écris "Information non disponible" — N'INVENTE RIEN.
4. Les stats du radar (attack/defense/form/morale/h2h) doivent être calculées à partir des données fournies, pas inventées.
5. Ne cite JAMAIS un joueur par son nom sauf s'il est listé dans "injuries_suspensions" fourni.

## METHODOLOGIE OBLIGATOIRE :
1. Analyse tactique : forme, systeme de jeu, absences uniquement celles listées dans les données (chaque absent important = -5 à -10 pts sur l'axe concerné)
2. Probabilites reelles 1/N/2 basées sur xG, forme et H2H des données ci-dessus → calcul Kelly Criterion
3. VALUE = prob_reelle > 1/cote_marche → EV% = (prob * cote - 1) * 100
4. AJUSTEMENT METEO : pluie forte ou vent >30km/h → favoriser "Moins de 2.5 buts", réduire confiance BTTS
5. Tickets : SAFE si confiance ≥72% ET cote ≥1.50 ; FUN si EV ≥5% ET cote ≥1.80

## NOMENCLATURE FRANÇAISE OBLIGATOIRE :
- "Chance Double" (jamais "Double Chance")
- "Les deux équipes marquent" (jamais "BTTS")
- "Plus de X buts" / "Moins de X buts" (jamais "Over/Under")
- "Résultat final" (jamais "1N2")
- "Match nul" (jamais "Draw")
- Importance joueurs : "Élevée" / "Moyenne" / "Faible"

## FORMAT JSON OBLIGATOIRE :
{
  "analysis": {
    "context": "Analyse tactique précise : forme des équipes, enjeux classement, ambiance, historique rivalité - 2-3 phrases concrètes",
    "key_stats": [
      {"label": "Forme dom. (5 derniers)", "value": "3V 1N 1D", "impact": "positive"},
      {"label": "Buts encaissés/match", "value": "0.7", "impact": "positive"},
      {"label": "xG domicile moy.", "value": "1.65", "impact": "positive"}
    ],
    "missing_players": [
      {"team": "Nom équipe", "player": "Prénom Nom", "importance": "Élevée"}
    ],
    "weather": "Météo précise + impact potentiel (ex: pluie → terrain lourd, jeu direct)",
    "referee_tendency": "Nom arbitre + tendance (permissif/strict, nb cartons, penalties)",
    "home_team_stats": {"attack": 75, "defense": 68, "form": 80, "morale": 72, "h2h": 60},
    "away_team_stats": {"attack": 70, "defense": 65, "form": 55, "morale": 60, "h2h": 40},
    "h2h_history": {"results": ["V","N","D","V","V"], "home_wins": 3, "draws": 1, "away_wins": 1}
  },
  "predictions": {
    "main_market": {
      "market": "Résultat final",
      "selection": "1",
      "odds_estimated": 1.85,
      "confidence": 75,
      "reason": "Explication du raisonnement en français"
    },
    "score_exact": "2-1",
    "btts_prob": 62,
    "over_2_5_prob": 58
  },
  "vip_tickets": {
    "safe": {
      "market": "Chance Double 1X",
      "selection": "1X",
      "odds_estimated": 1.25,
      "confidence": 82,
      "reason": "Justification en français basée sur les données réelles collectées",
      "bankroll_percent": 5
    },
    "fun": {
      "market": "Plus de 2.5 buts",
      "selection": "Plus de 2.5",
      "odds_estimated": 2.10,
      "ev_value": 8.5,
      "risk_analysis": "Analyse du risque et de la value en français",
      "bankroll_percent": 2
    }
  }
}`

// ── Prompt Perplexity legacy (fallback si Gemini indisponible) ──
const PERPLEXITY_FULL_PROMPT = (match: Match) => `Tu es l'Analyste Senior de "PronoScope". Tu analyses en FRANCAIS UNIQUEMENT.

## ⚠️ PROTOCOLE ANTI-HALLUCINATION STRICT :
Avant d'analyser, recherche OBLIGATOIREMENT sur le web ces points dans cet ordre :
- Effectif ACTUEL 2025/2026 des deux clubs (les joueurs changent de club, vérifie les transferts récents)
- Absents/blessés CONFIRMÉS des deux clubs (communiqués officiels clubs, L'Equipe, RMC)
- N'invente JAMAIS un joueur blessé : si introuvable, laisse missing_players vide []
- Arbitre désigné et son historique réel saison 2025/2026
- Météo prévue au stade (ville du club domicile) à l'heure du match
- Forme réelle des 5 derniers matchs saison 2025/2026 (SofaScore, WhoScored)
- H2H des 5 dernières confrontations directes (avec années pour vérification)

## METHODOLOGIE :
1. Analyse tactique concrète (ne pas généraliser)
2. Probabilités 1/N/2 basées sur xG, forme et H2H
3. Value betting : comparer prob réelle aux cotes du marché
4. TICKET SAFE : confiance ≥72%, cote ≥1.50, mise 5% bankroll
5. TICKET FUN : EV ≥5%, cote ≥1.80, mise 1-2% bankroll

## FORMAT JSON OBLIGATOIRE (FRANCAIS UNIQUEMENT) :
{
  "analysis": {
    "context": "Analyse tactique précise en français - 2-3 phrases spécifiques au match",
    "key_stats": [{"label": "Stat", "value": "valeur", "impact": "positive/negative/neutral"}],
    "missing_players": [{"team": "Equipe", "player": "Joueur", "importance": "Élevée/Moyenne/Faible"}],
    "weather": "Météo précise + impact",
    "referee_tendency": "Nom + tendance arbitre",
    "home_team_stats": {"attack": 75, "defense": 68, "form": 80, "morale": 72, "h2h": 60},
    "away_team_stats": {"attack": 70, "defense": 65, "form": 55, "morale": 60, "h2h": 40},
    "h2h_history": {"results": ["V","N","D","V","V"], "home_wins": 3, "draws": 1, "away_wins": 1}
  },
  "predictions": {
    "main_market": {"market": "Résultat final", "selection": "1", "odds_estimated": 1.85, "confidence": 75, "reason": "Explication en français"},
    "score_exact": "2-1",
    "btts_prob": 62,
    "over_2_5_prob": 58
  },
  "vip_tickets": {
    "safe": {"market": "Chance Double 1X", "selection": "1X", "odds_estimated": 1.25, "confidence": 82, "reason": "Justification réelle", "bankroll_percent": 5},
    "fun": {"market": "Plus de 2.5 buts", "selection": "Plus de 2.5", "odds_estimated": 2.10, "ev_value": 8.5, "risk_analysis": "Analyse du risque", "bankroll_percent": 2}
  }
}

MATCH : ${match.homeTeam} vs ${match.awayTeam} | ${match.league} | ${match.date}`

// ── Mock response (mode sans clé API) ──
function getMockResponse(match: Match) {
  return {
    analysis: {
      context: `${match.homeTeam} reçoit ${match.awayTeam} dans un match important de ${match.league}. Les deux équipes sont en forme et ce derby s'annonce disputé.`,
      key_stats: [
        { label: 'Forme récente (5 derniers)', value: '3V 1N 1D', impact: 'positive' },
        { label: 'Buts marqués/match', value: '2.1', impact: 'positive' },
        { label: 'Clean sheets saison', value: '40%', impact: 'neutral' },
      ],
      missing_players: [],
      weather: 'Temps clair, conditions optimales de jeu',
      referee_tendency: 'Arbitre strict sur les fautes, 4.2 cartons jaunes/match en moyenne',
      home_team_stats: { attack: 75, defense: 68, form: 80, morale: 72, h2h: 60 },
      away_team_stats: { attack: 70, defense: 65, form: 55, morale: 60, h2h: 40 },
      h2h_history: { results: ['V', 'N', 'D', 'V', 'N'], home_wins: 2, draws: 2, away_wins: 1 },
    },
    predictions: {
      main_market: {
        market: 'Résultat final',
        selection: '1',
        odds_estimated: 1.85,
        confidence: 75,
        reason: 'Avantage domicile et meilleure forme récente sur 5 matchs',
      },
      score_exact: '2-1',
      btts_prob: 62,
      over_2_5_prob: 58,
    },
    vip_tickets: {
      safe: {
        market: 'Chance Double 1X',
        selection: '1X',
        odds_estimated: 1.25,
        confidence: 82,
        reason: 'Sécurité maximale — domicile invaincu depuis 6 matchs, extérieur en difficulté',
        bankroll_percent: 5,
      },
      fun: {
        market: 'Plus de 2.5 buts',
        selection: 'Plus de 2.5',
        odds_estimated: 2.1,
        ev_value: 8.5,
        risk_analysis: 'Value positive : les deux équipes marquent en moyenne 3.1 buts/match combinés',
        bankroll_percent: 2,
      },
    },
  }
}

// ── Telegram auto-alert pour tickets SAFE / VALUE ──
async function notifyTelegram(match: Match, pronostic: ReturnType<typeof getMockResponse>) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  const safe = pronostic.vip_tickets?.safe
  const fun = pronostic.vip_tickets?.fun
  const isSafe = (safe?.confidence ?? 0) >= 78
  const isValue = (fun?.ev_value ?? 0) >= 7

  if (!isSafe && !isValue) return

  const lines: string[] = []
  lines.push(`🔭 *PronoScope — Alerte Pronostic*`)
  lines.push(``)
  lines.push(`⚽ *${match.homeTeam}* vs *${match.awayTeam}*`)
  lines.push(`🏆 ${match.league} · ${match.time || match.date}`)
  lines.push(``)

  if (isSafe) {
    lines.push(`✅ *TICKET SAFE* (${safe.confidence}% confiance)`)
    lines.push(`   Marché : ${safe.market}`)
    lines.push(`   Sélection : *${safe.selection}* @ ${(safe.odds_estimated ?? 0).toFixed(2)}`)
    lines.push(`   Mise conseillée : ${safe.bankroll_percent ?? 5}% bankroll`)
  }

  if (isValue) {
    if (isSafe) lines.push(``)
    lines.push(`💎 *TICKET VALUE* (+${(fun.ev_value ?? 0).toFixed(1)}% EV)`)
    lines.push(`   Marché : ${fun.market}`)
    lines.push(`   Sélection : *${fun.selection}* @ ${(fun.odds_estimated ?? 0).toFixed(2)}`)
    lines.push(`   Mise conseillée : ${fun.bankroll_percent ?? 2}% bankroll`)
  }

  lines.push(``)
  lines.push(`👉 [Voir l'analyse complète](https://pronoscope.vercel.app)`)

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join('\n'),
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
      }),
    })
    console.log(`  📨 Telegram alert sent for ${match.homeTeam} vs ${match.awayTeam}`)
  } catch (e) {
    console.warn('  ⚠️ Telegram alert failed:', e)
  }
}

// ── Validation & defaults ──
function validateAndNormalize(pronostic: any) {
  if (!pronostic.analysis || !pronostic.predictions || !pronostic.vip_tickets) {
    throw new Error('Structure de réponse invalide: ' + Object.keys(pronostic).join(', '))
  }

  if (!pronostic.analysis.key_stats) pronostic.analysis.key_stats = []
  if (!pronostic.analysis.missing_players) pronostic.analysis.missing_players = []

  if (!pronostic.vip_tickets.safe?.bankroll_percent) {
    pronostic.vip_tickets.safe = { ...pronostic.vip_tickets.safe, bankroll_percent: 5 }
  }
  if (!pronostic.vip_tickets.fun?.bankroll_percent) {
    pronostic.vip_tickets.fun = { ...pronostic.vip_tickets.fun, bankroll_percent: 2 }
  }

  const defaultStats = { attack: 50, defense: 50, form: 50, morale: 50, h2h: 50 }
  if (!pronostic.analysis.home_team_stats) pronostic.analysis.home_team_stats = defaultStats
  if (!pronostic.analysis.away_team_stats) pronostic.analysis.away_team_stats = defaultStats

  if (!pronostic.analysis.h2h_history) {
    pronostic.analysis.h2h_history = { results: ['N', 'N', 'N', 'N', 'N'], home_wins: 0, draws: 5, away_wins: 0 }
  }

  return pronostic
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const match: Match = body.match

    if (!match || !match.homeTeam || !match.awayTeam) {
      return NextResponse.json(
        { success: false, error: 'Données du match invalides' },
        { status: 400 },
      )
    }

    const forceRefresh = body.forceRefresh === true

    // ── CACHE CHECK : pronostic figé 24h par match ──
    const cacheKey = getCacheKey(match)
    if (!forceRefresh) {
      try {
        const cached = await redis.get<{ data: any; pipeline: string }>(cacheKey)
        if (cached) {
          console.log(`⚡ [Pronostic Cache HIT] ${cacheKey}`)
          return NextResponse.json({ success: true, ...cached, cached: true })
        }
      } catch { /* ignore cache errors */ }
    } else {
      console.log(`🔄 [Pronostic Cache BYPASS] ${cacheKey} — forceRefresh demandé`)
      try { await redis.del(cacheKey) } catch { /* ignore */ }
    }

    const hasPerplexity = isPerplexityAvailable()
    const hasGemini = isGeminiAvailable()

    // Helper pour sauvegarder en cache + notifier Telegram
    const finalize = async (pronostic: any, pipeline: string) => {
      const translated = translateMarkets(validateAndNormalize(pronostic))
      void notifyTelegram(match, translated)
      try {
        await redis.set(cacheKey, { data: translated, pipeline }, { ex: 86400 })
        console.log(`  💾 [Pronostic Cache SET] ${cacheKey} (24h)`)
      } catch { /* ignore cache errors */ }
      return NextResponse.json({ success: true, data: translated, pipeline })
    }

    // ── MODE 1 : DUAL-LLM (Perplexity data + Gemini reasoning) ──
    if (hasPerplexity && hasGemini) {
      console.log('🔗 Dual-LLM Pipeline:', match.homeTeam, 'vs', match.awayTeam)

      try {
        console.log('  📡 Step 1: Perplexity data collection...')
        const rawData = await callPerplexity(PERPLEXITY_DATA_PROMPT(match), {
          model: 'sonar-pro',
          maxTokens: 1500,
        })
        console.log('  ✅ Perplexity data collected:', rawData.length, 'chars')

        console.log('  🧠 Step 2: Gemini reasoning...')
        const reasonedContent = await callGemini(GEMINI_REASONING_PROMPT(match, rawData), {
          systemInstruction:
            'Tu es un analyste expert en paris sportifs. Tu raisonnes de maniere statistique et rigoureuse. Reponds TOUJOURS en JSON valide et en FRANCAIS.',
          maxOutputTokens: 2048,
        })
        console.log('  ✅ Gemini reasoning complete:', reasonedContent.length, 'chars')

        return await finalize(parseLLMJson(reasonedContent), 'dual')
      } catch (dualError) {
        console.warn('⚠️ Dual pipeline failed, falling back to Perplexity-only:', dualError)
      }
    }

    // ── MODE 2 : PERPLEXITY SEUL (fallback) ──
    if (hasPerplexity) {
      console.log('📡 Perplexity-only:', match.homeTeam, 'vs', match.awayTeam)

      try {
        const content = await callPerplexity(PERPLEXITY_FULL_PROMPT(match), {
          model: 'sonar-pro',
          maxTokens: 2000,
        })
        return await finalize(parseLLMJson(content), 'perplexity')
      } catch (perplexityError) {
        console.warn('⚠️ Perplexity-only failed:', perplexityError)
      }
    }

    // ── MODE 3 : GEMINI SEUL (dégradé) ──
    if (hasGemini) {
      console.log('🧠 Gemini-only (degraded):', match.homeTeam, 'vs', match.awayTeam)

      const geminiDegradedData = `{
  "injuries_suspensions": {"home": [], "away": []},
  "recent_form": {"home": null, "away": null},
  "h2h": null,
  "current_odds": null,
  "weather": null,
  "referee": null,
  "xg": null,
  "ranking_context": null,
  "tactical_notes": null,
  "_warning": "AUCUNE DONNEE TEMPS REEL DISPONIBLE. Tu ne dois mentionner AUCUN joueur par son nom dans missing_players car tu n'as pas de données fiables sur les blessés actuels. Laisse missing_players vide. Base-toi uniquement sur des faits généraux (avantage domicile, statistiques de la compétition) sans inventer de données individuelles."
}`

      try {
        const content = await callGemini(
          GEMINI_REASONING_PROMPT(match, geminiDegradedData),
          {
            systemInstruction:
              'Tu es un analyste expert en paris sportifs. Reponds en JSON valide et en FRANCAIS. IMPORTANT: Tu n\'as PAS de données temps réel. Ne mentionne AUCUN joueur par son nom. Ne cite PAS de blessés. Laisse missing_players = []. Analyses générales uniquement.',
            maxOutputTokens: 2048,
          },
        )
        return await finalize(parseLLMJson(content), 'gemini')
      } catch (geminiError) {
        console.warn('⚠️ Gemini-only failed:', geminiError)
      }
    }

    // ── MODE 4 : MOCK (aucune clé API) ──
    console.log('🎭 Mock mode:', match.homeTeam, 'vs', match.awayTeam)
    return NextResponse.json({ success: true, data: getMockResponse(match), pipeline: 'mock' })
  } catch (error) {
    console.error('Pronostic API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 },
    )
  }
}
