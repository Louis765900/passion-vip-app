import { NextRequest, NextResponse } from 'next/server'
import { Match } from '@/types'
import { callPerplexity, isPerplexityAvailable } from '@/lib/ai/perplexity'
import { callGemini, isGeminiAvailable } from '@/lib/ai/gemini'
import { parseLLMJson } from '@/lib/ai/parseJSON'

// ── Prompt Perplexity : COLLECTE DE DONNÉES UNIQUEMENT ──
const PERPLEXITY_DATA_PROMPT = (match: Match) => `Tu es un chercheur sportif. Collecte UNIQUEMENT des DONNEES FACTUELLES verifiables pour ce match.
NE fais AUCUNE prediction ni analyse. Collecte uniquement les faits.

MATCH: ${match.homeTeam} vs ${match.awayTeam}
LIGUE: ${match.league}
DATE: ${match.date}

Retourne un JSON avec exactement cette structure:
{
  "injuries_suspensions": {
    "home": [{"player": "Nom", "reason": "blessure/suspension", "importance": "High/Medium/Low"}],
    "away": [{"player": "Nom", "reason": "blessure/suspension", "importance": "High/Medium/Low"}]
  },
  "recent_form": {
    "home": {"last_5": "WDWLW", "description": "description forme", "goals_scored_avg": 1.8, "goals_conceded_avg": 0.9},
    "away": {"last_5": "DDWLW", "description": "description forme", "goals_scored_avg": 1.2, "goals_conceded_avg": 1.4}
  },
  "h2h": {
    "last_5_results": ["W", "D", "L", "W", "W"],
    "home_wins": 3, "draws": 1, "away_wins": 1,
    "summary": "resume des confrontations"
  },
  "current_odds": {
    "home_win": 1.85, "draw": 3.40, "away_win": 4.20,
    "over_2_5": 1.90, "btts": 1.95
  },
  "weather": "Description meteo au stade si disponible",
  "referee": "Nom et tendance de l'arbitre si trouvee",
  "xg": {"home": 1.65, "away": 1.22},
  "context": "Enjeux du match, rivalite, fatigue calendrier"
}

IMPORTANT: Reponds UNIQUEMENT avec le JSON, sans texte avant ou apres.`

// ── Prompt Gemini : RAISONNEMENT ET ANALYSE ──
const GEMINI_REASONING_PROMPT = (match: Match, rawData: string) => `Tu es l'Analyste Senior de "PronoScope", un expert en paris sportifs professionnels.
Tu recois des donnees collectees en temps reel par un moteur de recherche. Ton role est d'appliquer un raisonnement statistique avance.

## TA METHODOLOGIE :
1. Evaluer la force relative des equipes (forme, effectif, H2H)
2. Calculer les probabilites reelles pour 1/N/2 (basees sur xG et forme)
3. Comparer aux cotes du marche pour identifier la VALUE (EV positive)
4. Determiner le niveau de risque et la mise recommandee (Kelly Criterion)
5. Generer les tickets SAFE (confiance >70%, bankroll 5%) et FUN (EV >5%, bankroll 1-2%)

## DONNEES COLLECTEES EN TEMPS REEL :
${rawData}

## MATCH : ${match.homeTeam} vs ${match.awayTeam} | ${match.league} | ${match.date}

## FORMAT DE REPONSE OBLIGATOIRE :
{
  "analysis": {
    "context": "Synthese du contexte et des enjeux en 2-3 phrases",
    "key_stats": [
      {"label": "Stat importante", "value": "valeur", "impact": "positive/negative/neutral"}
    ],
    "missing_players": [
      {"team": "Equipe", "player": "Joueur", "importance": "High/Medium/Low"}
    ],
    "weather": "Meteo si pertinent",
    "referee_tendency": "Tendance arbitre si trouvee",
    "home_team_stats": {"attack": 75, "defense": 68, "form": 80, "morale": 72, "h2h": 60},
    "away_team_stats": {"attack": 70, "defense": 65, "form": 55, "morale": 60, "h2h": 40},
    "h2h_history": {"results": ["W","D","L","W","W"], "home_wins": 3, "draws": 1, "away_wins": 1}
  },
  "predictions": {
    "main_market": {
      "market": "1N2",
      "selection": "1",
      "odds_estimated": 1.85,
      "confidence": 75,
      "reason": "Explication detaillee"
    },
    "score_exact": "2-1",
    "btts_prob": 62,
    "over_2_5_prob": 58
  },
  "vip_tickets": {
    "safe": {
      "market": "Double Chance 1X",
      "selection": "1X",
      "odds_estimated": 1.25,
      "confidence": 82,
      "reason": "Securite maximale",
      "bankroll_percent": 5
    },
    "fun": {
      "market": "Over 2.5 Goals",
      "selection": "Over 2.5",
      "odds_estimated": 2.10,
      "ev_value": 8.5,
      "risk_analysis": "Risque modere avec bonne value",
      "bankroll_percent": 2
    }
  }
}`

// ── Prompt Perplexity Legacy (fallback si Gemini indisponible) ──
const PERPLEXITY_FULL_PROMPT = (match: Match) => `Tu es l'Analyste Senior de "PronoScope", un expert en paris sportifs professionnels.

## TA METHODOLOGIE STRICTE :

### 1. DEEP RESEARCH (Recherche en temps reel)
- Absents confirmes (blessures, suspensions, choix tactiques)
- Conditions meteo au stade
- Arbitre designe et son historique (cartons, penalties)
- Forme recente des 2 equipes (5 derniers matchs toutes competitions)
- Contexte du match (rivalite, enjeu, fatigue calendrier)

### 2. ANALYSE STATISTIQUE
- xG (Expected Goals) des 2 equipes sur les 10 derniers matchs
- Stats H2H (Head to Head) des 5 dernieres confrontations
- Statistiques domicile/exterieur
- Efficacite offensive et defensive

### 3. VALUE BETTING
- Calcule les probabilites reelles pour chaque issue (1/N/2)
- Compare avec les cotes moyennes du marche
- Identifie la VALUE (EV positive = cote marche > fair odds)

### 4. GENERATION DE TICKETS

**TICKET SAFE (Bankroll 5%)** - Confiance minimum : 70%, Cote minimum : 1.60
**TICKET FUN (Bankroll 1-2%)** - Value detectee (EV > 5%), Cote minimum : 2.00

## FORMAT DE REPONSE OBLIGATOIRE
Tu dois repondre UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou apres.

{
  "analysis": {
    "context": "Synthese du contexte et des enjeux du match en 2-3 phrases",
    "key_stats": [{"label": "Stat", "value": "valeur", "impact": "positive/negative/neutral"}],
    "missing_players": [{"team": "Equipe", "player": "Joueur", "importance": "High/Medium/Low"}],
    "weather": "Description meteo si pertinent",
    "referee_tendency": "Tendance de l'arbitre si trouvee",
    "home_team_stats": {"attack": 75, "defense": 68, "form": 80, "morale": 72, "h2h": 60},
    "away_team_stats": {"attack": 70, "defense": 65, "form": 55, "morale": 60, "h2h": 40},
    "h2h_history": {"results": ["W","D","L","W","W"], "home_wins": 3, "draws": 1, "away_wins": 1}
  },
  "predictions": {
    "main_market": {"market": "1N2", "selection": "1", "odds_estimated": 1.85, "confidence": 75, "reason": "Explication"},
    "score_exact": "2-1",
    "btts_prob": 62,
    "over_2_5_prob": 58
  },
  "vip_tickets": {
    "safe": {"market": "Double Chance 1X", "selection": "1X", "odds_estimated": 1.25, "confidence": 82, "reason": "Securite maximale", "bankroll_percent": 5},
    "fun": {"market": "Over 2.5 Goals", "selection": "Over 2.5", "odds_estimated": 2.10, "ev_value": 8.5, "risk_analysis": "Risque modere", "bankroll_percent": 2}
  }
}

MATCH A ANALYSER :
Equipe domicile : ${match.homeTeam}
Equipe exterieur : ${match.awayTeam}
Ligue : ${match.league}
Date : ${match.date}

Fournis ton analyse complete au format JSON specifie.`

// ── Mock response ──
function getMockResponse(match: Match) {
  return {
    analysis: {
      context: `${match.homeTeam} reçoit ${match.awayTeam} dans un match important de ${match.league}. Les deux équipes sont en forme et ce derby s'annonce disputé.`,
      key_stats: [
        { label: 'Forme récente', value: '3V 1N 1D', impact: 'positive' },
        { label: 'Buts marqués', value: '2.1/match', impact: 'positive' },
        { label: 'Clean sheets', value: '40%', impact: 'neutral' },
      ],
      missing_players: [],
      weather: 'Temps clair, conditions optimales',
      referee_tendency: 'Arbitre strict sur les fautes',
      home_team_stats: { attack: 75, defense: 68, form: 80, morale: 72, h2h: 60 },
      away_team_stats: { attack: 70, defense: 65, form: 55, morale: 60, h2h: 40 },
      h2h_history: { results: ['W', 'D', 'L', 'W', 'D'], home_wins: 2, draws: 2, away_wins: 1 },
    },
    predictions: {
      main_market: {
        market: '1N2',
        selection: '1',
        odds_estimated: 1.85,
        confidence: 75,
        reason: 'Avantage domicile et meilleure forme récente',
      },
      score_exact: '2-1',
      btts_prob: 62,
      over_2_5_prob: 58,
    },
    vip_tickets: {
      safe: {
        market: 'Double Chance 1X',
        selection: '1X',
        odds_estimated: 1.25,
        confidence: 82,
        reason: 'Sécurité maximale avec faible risque',
        bankroll_percent: 5,
      },
      fun: {
        market: 'Over 2.5 Goals',
        selection: 'Over 2.5',
        odds_estimated: 2.1,
        ev_value: 8.5,
        risk_analysis: 'Risque modéré avec bonne value',
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
    pronostic.analysis.h2h_history = { results: ['D', 'D', 'D', 'D', 'D'], home_wins: 0, draws: 5, away_wins: 0 }
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

    const hasPerplexity = isPerplexityAvailable()
    const hasGemini = isGeminiAvailable()

    // ── MODE 1 : DUAL-LLM (Perplexity + Gemini) ──
    if (hasPerplexity && hasGemini) {
      console.log('🔗 Dual-LLM Pipeline:', match.homeTeam, 'vs', match.awayTeam)

      try {
        // Step 1: Perplexity collecte les données temps réel
        console.log('  📡 Step 1: Perplexity data collection...')
        const rawData = await callPerplexity(PERPLEXITY_DATA_PROMPT(match), {
          model: 'sonar-pro',
          maxTokens: 1500,
        })
        console.log('  ✅ Perplexity data collected:', rawData.length, 'chars')

        // Step 2: Gemini raisonne sur les données
        console.log('  🧠 Step 2: Gemini reasoning...')
        const reasonedContent = await callGemini(GEMINI_REASONING_PROMPT(match, rawData), {
          systemInstruction:
            'Tu es un analyste expert en paris sportifs. Tu raisonnes de maniere statistique et rigoureuse. Reponds toujours en JSON valide.',
          maxOutputTokens: 2048,
        })
        console.log('  ✅ Gemini reasoning complete:', reasonedContent.length, 'chars')

        const pronostic = validateAndNormalize(parseLLMJson(reasonedContent))
        void notifyTelegram(match, pronostic)
        return NextResponse.json({ success: true, data: pronostic, pipeline: 'dual' })
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
        const pronostic = validateAndNormalize(parseLLMJson(content))
        void notifyTelegram(match, pronostic)
        return NextResponse.json({ success: true, data: pronostic, pipeline: 'perplexity' })
      } catch (perplexityError) {
        console.warn('⚠️ Perplexity-only failed:', perplexityError)
      }
    }

    // ── MODE 3 : GEMINI SEUL (dégradé, pas de données temps réel) ──
    if (hasGemini) {
      console.log('🧠 Gemini-only (degraded):', match.homeTeam, 'vs', match.awayTeam)

      try {
        const content = await callGemini(
          GEMINI_REASONING_PROMPT(match, 'Aucune donnee temps reel disponible. Base-toi sur tes connaissances.'),
          {
            systemInstruction:
              'Tu es un analyste expert en paris sportifs. Reponds en JSON valide. Sans donnees temps reel, base-toi sur tes connaissances historiques.',
            maxOutputTokens: 2048,
          },
        )
        const pronostic = validateAndNormalize(parseLLMJson(content))
        void notifyTelegram(match, pronostic)
        return NextResponse.json({ success: true, data: pronostic, pipeline: 'gemini' })
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
