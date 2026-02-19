import { NextRequest } from 'next/server';
import { Match } from '@/types';
import { callPerplexity, isPerplexityAvailable } from '@/lib/ai/perplexity';
import { callGemini, isGeminiAvailable } from '@/lib/ai/gemini';
import { parseLLMJson, repairJSON } from '@/lib/ai/parseJSON';
import { z } from 'zod'; // Pour la validation stricte

// ============================================================
// TYPES ULTRA-DÉTAILLÉS (pour que TypeScript guide l'IA)
// ============================================================

type PhaseName = 'context' | 'stats_advanced' | 'odds_analysis' | 'value_detection' | 'kelly_risk' | 'final_pro' | 'review_critical';

// Schémas de validation avec Zod (validation stricte)
const ContextSchema = z.object({
  injuries: z.array(z.string()),
  weather: z.string().optional(),
  referee: z.object({
    name: z.string(),
    style: z.enum(['strict', 'lenient', 'cards_happy', 'lets_play']),
    avg_cards_per_game: z.number(),
    home_advantage_factor: z.number().min(0).max(1),
  }).optional(),
  motivation: z.object({
    home: z.string(),
    away: z.string(),
    derby: z.boolean(),
    title_race: z.boolean(),
    relegation_battle: z.boolean(),
  }),
  news_impact: z.string(),
  team_travel: z.object({
    distance_km: z.number(),
    rest_days_home: z.number(),
    rest_days_away: z.number(),
  }),
});

const StatsAdvancedSchema = z.object({
  // Stats classiques améliorées
  home_form_advanced: z.object({
    last_5: z.string(),
    adjusted_form_score: z.number().min(0).max(100),
    quality_opponents_score: z.number().min(0).max(100),
  }),
  away_form_advanced: z.object({
    last_5: z.string(),
    adjusted_form_score: z.number().min(0).max(100),
    quality_opponents_score: z.number().min(0).max(100),
  }),
  h2h_analysis: z.object({
    summary: z.string(),
    trends: z.array(z.string()),
    avg_goals: z.number(),
  }),
  
  // Statistiques avancées (xG, etc.)
  advanced_metrics: z.object({
    home_xg_avg: z.number(),
    away_xg_avg: z.number(),
    home_xga_avg: z.number(), // xG concédés
    away_xga_avg: z.number(),
    home_ppda: z.number(), // Passes par action défensive
    away_ppda: z.number(),
    home_deep_completions: z.number(), // Passes dans les 20 derniers mètres
    away_deep_completions: z.number(),
  }),
  
  // Forces relatives (0-100)
  team_strengths: z.object({
    home_attack: z.number(),
    home_defense: z.number(),
    away_attack: z.number(),
    away_defense: z.number(),
    home_set_pieces: z.number(),
    away_set_pieces: z.number(),
  }),
  
  key_insights: z.array(z.string()),
  edge_opportunity: z.string().optional(), // Où est l'avantage potentiel
});

const OddsAnalysisSchema = z.object({
  // Cotes actuelles et probabilités implicites
  current_market: z.object({
    home: z.number(),
    draw: z.number(),
    away: z.number(),
    implied_prob_home: z.number(),
    implied_prob_draw: z.number(),
    implied_prob_away: z.number(),
    bookmaker_margin: z.number(), // La marge du book (overround)
  }),
  
  // Notre estimation des "vraies" probabilités
  our_estimated_probabilities: z.object({
    home: z.number(),
    draw: z.number(),
    away: z.number(),
    confidence_level: z.enum(['low', 'medium', 'high']),
  }),
  
  // Analyse de la marge et des mouvements
  margin_analysis: z.object({
    is_sharp_market: z.boolean(),
    movement_trend: z.enum(['home_supported', 'away_supported', 'stable']),
    sharp_money_indicator: z.string(),
  }),
  
  // Analyse des cotes asiatiques et autres marchés
  asian_handicap: z.object({
    line: z.string(),
    home_odds: z.number(),
    away_odds: z.number(),
    value_side: z.string().optional(),
  }).optional(),
  
  over_under: z.object({
    line: z.number(),
    over_odds: z.number(),
    under_odds: z.number(),
    value_side: z.string().optional(),
  }).optional(),
});

const ValueDetectionSchema = z.object({
  // Value bets identifiés
  value_opportunities: z.array(z.object({
    market: z.string(),
    selection: z.string(),
    bookmaker_odds: z.number(),
    our_probability: z.number(),
    implied_probability: z.number(),
    value_formula: z.string(), // (our_prob * odds) - 1
    value_percentage: z.number(), // En pourcentage
    expected_value: z.number(), // En unités
    confidence: z.enum(['low', 'medium', 'high']),
    reasoning: z.string(),
  })),
  
  // Favorite-longshot bias analysis
  bias_analysis: z.object({
    favorite_is_undervalued: z.boolean(),
    longshot_is_overvalued: z.boolean(),
    recommended_action: z.string(),
  }),
  
  // Best value bet
  best_value: z.object({
    selection: z.string(),
    value_pct: z.number(),
    ev_per_unit: z.number(),
  }),
});

const KellyRiskSchema = z.object({
  // Calculs Kelly pour chaque value bet
  kelly_calculations: z.array(z.object({
    selection: z.string(),
    odds: z.number(),
    probability: z.number(),
    full_kelly: z.number(), // f* = (bp - q) / b
    fractional_kelly_25: z.number(), // 25% de Kelly
    fractional_kelly_50: z.number(), // 50% de Kelly
    recommended_fraction: z.number(), // Notre reco (ex: 0.35 pour 35% du Kelly pur)
    recommended_stake_percent: z.number(), // % de bankroll à miser
  })),
  
  // Analyse de risque
  risk_assessment: z.object({
    overall_risk_score: z.number().min(0).max(100),
    risk_level: z.enum(['very_low', 'low', 'medium', 'high', 'very_high']),
    volatility_expectation: z.enum(['low', 'medium', 'high']),
    correlation_with_other_bets: z.array(z.string()).optional(),
  }),
  
  // Facteurs de risque
  risk_factors: z.array(z.object({
    factor: z.string(),
    severity: z.number().min(1).max(5),
    mitigation: z.string(),
  })),
  
  // Recommandation de mise finale
  staking_plan: z.object({
    recommended_bet_size: z.number(), // % de bankroll
    max_bet_size: z.number(), // % de bankroll (limite de sécurité)
    kelly_justification: z.string(), // Explication du calcul
    alternative_staking: z.string().optional(), // Flat betting recommandé si Kelly trop risqué
  }),
});

const FinalProSchema = z.object({
  // Synthèse exécutive (pour que l'utilisateur comprenne tout immédiatement)
  executive_summary: z.object({
    one_sentence_verdict: z.string(),
    confidence_stars: z.number().min(1).max(5),
    expected_value_rating: z.enum(['poor', 'fair', 'good', 'excellent']),
    risk_appetite_match: z.enum(['conservative', 'moderate', 'aggressive']),
  }),
  
  // Le pari principal (meilleur value bet)
  main_bet: z.object({
    market: z.string(),
    selection: z.string(),
    odds: z.number(),
    stake_percent: z.number(),
    expected_value: z.number(),
    roi_projection: z.string(), // ex: "+8.5% EV"
    reasoning: z.string(),
    kelly_used: z.boolean(),
  }),
  
  // Ticket sécurisé (faible risque)
  safe_ticket: z.object({
    market: z.string(),
    selection: z.string(),
    odds: z.number(),
    stake_percent: z.number(),
    confidence: z.number(),
    reasoning: z.string(),
  }),
  
  // Ticket spéculatif (haute value, risque plus élevé)
  speculative_ticket: z.object({
    market: z.string(),
    selection: z.string(),
    odds: z.number(),
    stake_percent: z.number(),
    value_percentage: z.number(),
    reasoning: z.string(),
    caveat: z.string().optional(),
  }),
  
  // Paris combinés recommandés (si pertinent)
  combination_suggestions: z.array(z.object({
    description: z.string(),
    estimated_odds: z.number(),
    stake_percent: z.number(),
    reasoning: z.string(),
  })).optional(),
  
  // Prédictions complémentaires
  score_prediction: z.string(),
  both_teams_to_score: z.boolean(),
  total_goals_prediction: z.string(),
  
  // Avertissements et biais identifiés
  bias_warnings: z.array(z.object({
    bias_type: z.string(),
    description: z.string(),
    how_we_avoided: z.string(),
  })),
  
  // Message final
  final_message: z.string(),
});

const ReviewCriticalSchema = z.object({
  // Auto-critique de l'analyse
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  
  // Scénarios alternatifs
  alternative_scenarios: z.array(z.object({
    scenario: z.string(),
    probability: z.number(),
    impact_on_bets: z.string(),
  })),
  
  // Vérification des biais
  bias_check: z.object({
    confirmation_bias_detected: z.boolean(),
    recency_bias_detected: z.boolean(),
    favorite_bias_detected: z.boolean(),
    action_taken: z.string(),
  }),
  
  // Note finale et ajustements
  final_grade: z.enum(['A', 'B', 'C', 'D', 'F']),
  suggested_adjustments: z.array(z.string()),
  
  // Verdict du "second regard"
  second_look_verdict: z.string(),
});

// Types inférés
type ContextData = z.infer<typeof ContextSchema>;
type StatsAdvancedData = z.infer<typeof StatsAdvancedSchema>;
type OddsAnalysisData = z.infer<typeof OddsAnalysisSchema>;
type ValueDetectionData = z.infer<typeof ValueDetectionSchema>;
type KellyRiskData = z.infer<typeof KellyRiskSchema>;
type FinalProData = z.infer<typeof FinalProSchema>;
type ReviewCriticalData = z.infer<typeof ReviewCriticalSchema>;

// ============================================================
// PROMPTS ULTRA-DÉTAILLÉS (pour que l'IA comprenne tout immédiatement)
// ============================================================

const ANALYSIS_PHASES = {
  context: {
    name: 'Contexte & Environnement',
    icon: '🌍',
    prompt: (match: Match) => `Tu es un détective sportif spécialisé dans la collecte d'informations contextuelles. Avant même de regarder les stats, tu sais tout sur l'environnement du match.

MATCH: ${match.homeTeam} vs ${match.awayTeam}
LIGUE: ${match.league}
DATE: ${match.date}

Ta mission : Rassembler TOUTES les informations non-statistiques qui pourraient influencer le résultat.

INSTRUCTIONS SPÉCIFIQUES :
1. Blessures et suspensions : Identifie les joueurs clés absents ou incertains. Précise leur importance (capitaine, meilleur buteur, etc.)
2. Météo : Température, vent, pluie - et comment cela affecte le style de jeu
3. Arbitre : Son nom, son style (strict, laisse jouer, cartons faciles ?), statistiques de cartons, avantage domicile ?
4. Motivation : Derby ? Course au titre ? Maintien ? Dernier match d'un entraîneur ?
5. Actualités : Changement d'entraîneur, crise interne, rumeurs de transfert, etc.
6. Voyage et fatigue : Distance parcourue par l'équipe visiteuse, jours de repos comparés
7. Public : Stade plein ? Pression sur l'équipe locale ?

RÉPONDS EN JSON VALIDE UNIQUEMENT avec cette structure exacte :
{
  "phase": "context",
  "data": {
    "injuries": ["Mbappé (capitaine, 20 buts) - incertain", "Hakimi - suspendu"],
    "weather": "Pluie battante, vent fort - mauvais pour le jeu aérien, avantage aux équipes physiques",
    "referee": {
      "name": "M. Letexier",
      "style": "strict",
      "avg_cards_per_game": 4.2,
      "home_advantage_factor": 0.6
    },
    "motivation": {
      "home": "Course au titre - besoin de points",
      "away": "Maintien - dernier chance",
      "derby": true,
      "title_race": true,
      "relegation_battle": false
    },
    "news_impact": "L'entraîneur visiteur a annoncé son départ en fin de saison - possible relâchement",
    "team_travel": {
      "distance_km": 850,
      "rest_days_home": 6,
      "rest_days_away": 3
    }
  }
}

Raisonne étape par étape, mais ne donne que le JSON final. Sois précis, factuel, et cite tes sources implicites.`,
  },

  stats_advanced: {
    name: 'Stats Avancées & xG',
    icon: '📈',
    prompt: (match: Match, previousData: string) => `Tu es un data scientist spécialisé en football analytics. Tu maîtrises les Expected Goals (xG), la PPDA, et toutes les métriques avancées.

MATCH: ${match.homeTeam} vs ${match.awayTeam}
CONTEXTE DISPONIBLE: ${previousData}

Ta mission : Fournir une analyse statistique approfondie qui va bien au-delà des simples victoires/défaites.

INSTRUCTIONS SPÉCIFIQUES :

1. Analyse la forme récente, mais ajuste-la en fonction de la qualité des adversaires rencontrés
2. Calcule les xG moyens (expected goals) pour les 5-10 derniers matchs - à domicile pour l'équipe locale, à l'extérieur pour la visiteuse
3. Calcule les xGA (expected goals against) - la qualité défensive
4. Compare xG vs buts réels : qui sur-performe ? sous-performe ? (indice de régression possible)
5. PPDA (passes par action défensive) : plus bas = pressing plus intense
6. "Deep completions" : passes complétées dans les 20 mètres adverses
7. Évalue les forces relatives (attaque/défense) sur 100 par rapport à la moyenne de la ligue
8. Identifie les forces spécifiques : coups de pied arrêtés, jeu de tête, transitions rapides

RÈGLES DE RAISONNEMENT :
- Si une équipe sur-performe son xG, attends-toi à une régression
- Si une équipe a une PPDA très basse, elle fatiguera en fin de match
- Les équipes avec beaucoup de deep completions créent beaucoup d'occasions
- Compare toujours domicile vs extérieur séparément

{
  "phase": "stats_advanced",
  "data": {
    "home_form_advanced": {
      "last_5": "3V 1N 1D (victoires contre équipes faibles, défaite contre leader)",
      "adjusted_form_score": 72,
      "quality_opponents_score": 45
    },
    "away_form_advanced": {
      "last_5": "2V 2N 1D (match nul contre leader)",
      "adjusted_form_score": 68,
      "quality_opponents_score": 65
    },
    "h2h_analysis": {
      "summary": "3V domicile, 1N, 1V extérieur sur 5 confronts",
      "trends": ["Beaucoup de buts en 2e mi-temps", "L'équipe domicile domine possession"],
      "avg_goals": 2.8
    },
    "advanced_metrics": {
      "home_xg_avg": 1.65,
      "away_xg_avg": 1.22,
      "home_xga_avg": 0.9,
      "away_xga_avg": 1.4,
      "home_ppda": 8.5,
      "away_ppda": 11.2,
      "home_deep_completions": 12.3,
      "away_deep_completions": 8.1
    },
    "team_strengths": {
      "home_attack": 78,
      "home_defense": 82,
      "away_attack": 65,
      "away_defense": 60,
      "home_set_pieces": 85,
      "away_set_pieces": 55
    },
    "key_insights": [
      "${match.homeTeam} sur-performe son xG (+0.15) - risque de régression",
      "${match.awayTeam} concède beaucoup d'occasions profondes - vulnérable",
      "Les coups de pied arrêtés sont l'arme majeure des locaux"
    ],
    "edge_opportunity": "L'écart de xG suggère que les locaux devraient créer plus d'occasions que les cotes ne le reflètent"
  }
}`,
  },

  odds_analysis: {
    name: 'Analyse des Cotes & Marché',
    icon: '💰',
    prompt: (match: Match, previousData: string) => `Tu es un trader professionnel chez un bookmaker "sharp" (Pinnacle, Betfair). Tu comprends les mouvements de marché et la signification des cotes mieux que personne.

MATCH: ${match.homeTeam} vs ${match.awayTeam}
DONNÉES DISPONIBLES: ${previousData}

Ta mission : Analyser les cotes comme un trader, détecter où est la "vraie" valeur.

INSTRUCTIONS SPÉCIFIQUES :

1. Calcule les probabilités implicites actuelles : 1 / cote (attention à la marge)
2. Calcule la marge du bookmaker (overround) : somme des probabilités implicites - 100%
   - Marge typique : 5-12% selon le marché
   - Plus la marge est faible, plus le marché est "sharp"

3. À partir des stats avancées, estime TES propres probabilités (les "vraies")
   - Ajuste pour la forme récente, xG, blessures
   - Sois précis (ex: 52.5%, pas juste 53%)

4. Compare tes probabilités aux probabilités implicites
   - Écart positif = value potentielle

5. Analyse les mouvements de cotes
   - Si la cote domicile baisse : de l'argent intelligent arrive ?
   - Regarde les marchés asiatiques (souvent plus "sharps" que les européens)

6. Détecte le "favorite-longshot bias"
   - Les outsiders sont généralement surcôtés (cotes trop basses)
   - Les favoris sont parfois sous-côtés (cotes trop hautes)

7. Identifie où les bookmakers pourraient avoir fait une erreur

{
  "phase": "odds_analysis",
  "data": {
    "current_market": {
      "home": 2.10,
      "draw": 3.40,
      "away": 3.80,
      "implied_prob_home": 45.2,
      "implied_prob_draw": 28.1,
      "implied_prob_away": 25.3,
      "bookmaker_margin": 8.6
    },
    "our_estimated_probabilities": {
      "home": 52.0,
      "draw": 26.0,
      "away": 22.0,
      "confidence_level": "high"
    },
    "margin_analysis": {
      "is_sharp_market": true,
      "movement_trend": "home_supported",
      "sharp_money_indicator": "Les asiatiques ont baissé de 2.20 à 2.10 - money intelligente"
    },
    "asian_handicap": {
      "line": "-0.5",
      "home_odds": 1.95,
      "away_odds": 1.95,
      "value_side": "home"
    },
    "over_under": {
      "line": 2.5,
      "over_odds": 1.90,
      "under_odds": 1.90,
      "value_side": "over"
    }
  }
}`,
  },

  value_detection: {
    name: 'Détection de Value',
    icon: '🎯',
    prompt: (match: Match, previousData: string) => `Tu es un "value hunter" professionnel. Ta seule mission : trouver les paris où l'espérance mathématique est positive.

MATCH: ${match.homeTeam} vs ${match.awayTeam}
ANALYSES DISPONIBLES: ${previousData}

La formule magique : **EV = (Probabilité estimée × Cote) - 1**
Si EV > 0, c'est un value bet.

INSTRUCTIONS SPÉCIFIQUES :

1. Identifie TOUS les marchés où il pourrait y avoir de la value
   - 1N2 (victoire, nul, défaite)
   - Double chance
   - Over/Under
   - Handicap asiatique
   - Les deux équipes marquent (BTTS)

2. Pour chaque marché, calcule :
   - La probabilité implicite du bookmaker (1/cote × 100)
   - Ta probabilité estimée (basée sur les stats avancées)
   - La value = (ta proba × cote) - 1
   - L'EV en pourcentage (value × 100)

3. Classe les value bets par ordre de valeur décroissante

4. Applique le "favorite-longshot bias" à ton analyse
   - Si un outsider a une value positive, vérifie deux fois (peut-être un piège)
   - Si un favori a une value positive, c'est souvent plus fiable

5. Pour le meilleur value bet, explique POURQUOI le bookmaker s'est trompé

{
  "phase": "value_detection",
  "data": {
    "value_opportunities": [
      {
        "market": "1N2",
        "selection": "1 (${match.homeTeam})",
        "bookmaker_odds": 2.10,
        "our_probability": 0.52,
        "implied_probability": 0.452,
        "value_formula": "(0.52 × 2.10) - 1 = 0.092",
        "value_percentage": 9.2,
        "expected_value": 0.092,
        "confidence": "high",
        "reasoning": "Les xG montrent une domination plus nette que ne le reflètent les cotes, et le marché asiatique soutient cette analyse"
      },
      {
        "market": "Over 2.5",
        "selection": "Over 2.5",
        "bookmaker_odds": 1.90,
        "our_probability": 0.58,
        "implied_probability": 0.526,
        "value_formula": "(0.58 × 1.90) - 1 = 0.102",
        "value_percentage": 10.2,
        "expected_value": 0.102,
        "confidence": "medium",
        "reasoning": "Les confrontations récentes et les xG combinés suggèrent un match ouvert"
      }
    ],
    "bias_analysis": {
      "favorite_is_undervalued": true,
      "longshot_is_overvalued": false,
      "recommended_action": "Saisir la value sur le favori avant que le marché ne s'ajuste"
    },
    "best_value": {
      "selection": "Over 2.5",
      "value_pct": 10.2,
      "ev_per_unit": 0.102
    }
  }
}`,
  },

  kelly_risk: {
    name: 'Kelly Criterion & Risk Management',
    icon: '⚖️',
    prompt: (match: Match, previousData: string) => `Tu es un gestionnaire de hedge funds spécialisé dans l'allocation optimale de capital selon le critère de Kelly.

MATCH: ${match.homeTeam} vs ${match.awayTeam}
VALUE BETS IDENTIFIÉS: ${previousData}

Ta mission : Calculer la mise optimale pour chaque value bet en utilisant le Kelly Criterion, puis ajuster pour le risque.

RAPPEL DE LA FORMULE DE KELLY :
f* = (bp - q) / b
où :
- b = cote décimale - 1 (le profit net en cas de gain)
- p = ta probabilité estimée (en décimal, pas en %)
- q = 1 - p (probabilité de perte)
- f* = fraction de la bankroll à miser

INSTRUCTIONS SPÉCIFIQUES :

1. Pour chaque value bet identifié, calcule le Kelly "pur" (full Kelly)

2. Applique un "Fractional Kelly" :
   - Kelly × 0.25 pour les paris risqués ou faible confiance
   - Kelly × 0.50 pour les paris moyens
   - Kelly × 0.75 pour les paris très haute confiance
   - Justifie ton choix de fraction

3. Vérifie que la mise recommandée ne dépasse PAS 5% de la bankroll (règle de sécurité) [citation:1]

4. Évalue le risque global :
   - Score de risque (0-100) basé sur : volatilité du match, blessures, confiance dans les probas
   - Niveau de risque (très faible à très élevé)

5. Identifie les facteurs de risque spécifiques

6. Propose un plan de staking clair

{
  "phase": "kelly_risk",
  "data": {
    "kelly_calculations": [
      {
        "selection": "1 (${match.homeTeam})",
        "odds": 2.10,
        "probability": 0.52,
        "full_kelly": 0.047,
        "fractional_kelly_25": 0.0118,
        "fractional_kelly_50": 0.0235,
        "recommended_fraction": 0.5,
        "recommended_stake_percent": 2.35
      },
      {
        "selection": "Over 2.5",
        "odds": 1.90,
        "probability": 0.58,
        "full_kelly": 0.102,
        "fractional_kelly_25": 0.0255,
        "fractional_kelly_50": 0.051,
        "recommended_fraction": 0.35,
        "recommended_stake_percent": 3.57
      }
    ],
    "risk_assessment": {
      "overall_risk_score": 42,
      "risk_level": "medium",
      "volatility_expectation": "medium",
      "correlation_with_other_bets": ["Over 2.5 est corrélé avec victoire domicile"]
    },
    "risk_factors": [
      {
        "factor": "Incertitude sur la composition (blessés de dernière minute)",
        "severity": 3,
        "mitigation": "Réduire la mise de 20% ou attendre les compositions"
      },
      {
        "factor": "Marché asiatique montre des signaux contradictoires",
        "severity": 2,
        "mitigation": "Privilégier le Kelly fractionné à 0.35"
      }
    ],
    "staking_plan": {
      "recommended_bet_size": 2.35,
      "max_bet_size": 5.0,
      "kelly_justification": "Kelly pur = 4.7%. Avec confiance élevée mais risque de corrélation, on prend 50% du Kelly = 2.35%",
      "alternative_staking": "Flat betting à 2% pour les risk-averse"
    }
  }
}`,
  },

  final_pro: {
    name: 'Pronostic Pro & Synthèse Exécutive',
    icon: '🏆',
    prompt: (match: Match, previousData: string) => `Tu es le Directeur des Investissements Sportifs chez "PronoScope". Tu vas présenter ton analyse à des investisseurs exigeants qui veulent comprendre IMMÉDIATEMENT où est l'opportunité.

MATCH: ${match.homeTeam} vs ${match.awayTeam}
ANALYSE COMPLÈTE: ${previousData}

Ta mission : Synthétiser TOUTE l'analyse en un pronostic professionnel, clair, actionnable.

INSTRUCTIONS DE RAISONNEMENT (à suivre dans ta tête, pas à inclure) :

1. Révise tous les outputs précédents :
   - Contexte (blessures, météo, arbitre)
   - Stats avancées (xG, forces, faiblesses)
   - Analyse des cotes (marché, mouvements)
   - Value bets identifiés
   - Kelly et risque

2. Identifie le MEILLEUR pari (meilleur compromis value/risque)

3. Construis un ticket "safe" (probabilité >70%, risque faible)
   - Ex: Double chance, Under X.5, Handicap 0

4. Construis un ticket "spéculatif" (value élevée, risque plus haut)
   - Ex: Score exact, BTTS + Over, outsider

5. Vérifie les biais cognitifs potentiels :
   - Ai-je un biais de confirmation ? (check)
   - Suis-je trop influencé par les résultats récents ? (check)
   - Est-ce que je parie sur mon équipe préférée ? (check)

6. Rédige un résumé EXÉCUTIF qu'un investisseur comprend en 10 secondes

{
  "phase": "final_pro",
  "data": {
    "executive_summary": {
      "one_sentence_verdict": "Value claire sur ${match.homeTeam} et Over 2.5, avec une confiance élevée dans les stats avancées.",
      "confidence_stars": 4,
      "expected_value_rating": "good",
      "risk_appetite_match": "moderate"
    },
    "main_bet": {
      "market": "1N2",
      "selection": "1 (${match.homeTeam})",
      "odds": 2.10,
      "stake_percent": 2.35,
      "expected_value": 9.2,
      "roi_projection": "+9.2% EV",
      "reasoning": "Les xG montrent une supériorité de 52% contre 45% implicite. Le marché asiatique confirme le mouvement. Kelly fractionné à 50%.",
      "kelly_used": true
    },
    "safe_ticket": {
      "market": "Double Chance",
      "selection": "1X (${match.homeTeam} ou nul)",
      "odds": 1.28,
      "stake_percent": 5.0,
      "confidence": 85,
      "reasoning": "L'invincibilité à domicile et la faiblesse défensive visiteuse rendent ce pari très sûr."
    },
    "speculative_ticket": {
      "market": "Over 2.5 Goals",
      "selection": "Over 2.5",
      "odds": 1.90,
      "stake_percent": 3.0,
      "value_percentage": 10.2,
      "reasoning": "xG combinés élevés et historique des confrontations suggèrent un match ouvert. Value à 10%.",
      "caveat": "Attention : si l'équipe domicile marque tôt, elle pourrait gérer"
    },
    "combination_suggestions": [
      {
        "description": "Victoire domicile + Over 1.5",
        "estimated_odds": 2.40,
        "stake_percent": 1.5,
        "reasoning": "Combine la victoire probable avec au moins 2 buts - safe boost"
      }
    ],
    "score_prediction": "2-1",
    "both_teams_to_score": true,
    "total_goals_prediction": "2-3 buts",
    "bias_warnings": [
      {
        "bias_type": "Recency bias",
        "description": "L'équipe visiteuse vient de gérer un gros match, mais nos stats ajustées corrigent cela",
        "how_we_avoided": "Utilisation des xG sur longue période, pas seulement résultats récents"
      }
    ],
    "final_message": "Opportunité de value identifiée. La gestion de bankroll selon Kelly fractionné est recommandée. Les paris sont indicatifs - ne misez que ce que vous pouvez perdre."
  }
}`,
  },

  review_critical: {
    name: 'Relecture Critique & Second Regard',
    icon: '🔍',
    prompt: (match: Match, previousData: string) => `Tu es un analyste sceptique, un "devil's advocate". Ton travail : trouver les failles dans l'analyse précédente.

MATCH: ${match.homeTeam} vs ${match.awayTeam}
ANALYSE FINALE: ${previousData}

Ta mission : Passer l'analyse au crible et identifier tout ce qui pourrait la remettre en question.

INSTRUCTIONS SPÉCIFIQUES :

1. Identifie les forces de l'analyse (ce qui est solide)

2. Identifie les faiblesses potentielles :
   - Hypothèses fragiles
   - Données manquantes
   - Biais possibles

3. Propose des scénarios alternatifs qui invalideraient le pronostic
   - Ex: "Si X joue finalement, alors..."
   - Ex: "En cas de pluie, le jeu aérien..."

4. Vérifie les biais cognitifs spécifiquement :
   - Biais de confirmation : l'analyse a-t-elle cherché des infos qui contredisent ?
   - Biais de récence : trop de poids aux derniers matchs ?
   - Biais du favori : a-t-on sous-estimé l'outsider ?

5. Donne une note finale (A à F) et des ajustements si nécessaire

{
  "phase": "review_critical",
  "data": {
    "strengths": [
      "Utilisation des xG sur longue période",
      "Analyse des mouvements asiatiques",
      "Kelly fractionné bien calibré"
    ],
    "weaknesses": [
      "Incertitude sur deux blessés de dernière minute",
      "Échantillon limité pour les xG à l'extérieur",
      "Pas d'analyse des corners/marchés secondaires"
    ],
    "alternative_scenarios": [
      {
        "scenario": "Si le buteur domicile est forfait",
        "probability": 15,
        "impact_on_bets": "La value sur victoire domicile diminue significativement"
      },
      {
        "scenario": "Pluie torrentielle",
        "probability": 20,
        "impact_on_bets": "Over 2.5 moins probable, jeu plus fermé"
      }
    ],
    "bias_check": {
      "confirmation_bias_detected": false,
      "recency_bias_detected": false,
      "favorite_bias_detected": true,
      "action_taken": "L'analyse a légèrement surévalué le favori - correction appliquée dans les probas finales"
    },
    "final_grade": "B+",
    "suggested_adjustments": [
      "Réduire la mise sur Over 2.5 de 3% à 2.5% en raison du risque météo",
      "Attendre les compositions pour le bet principal"
    ],
    "second_look_verdict": "Analyse solide malgré quelques incertitudes. Les value bets restent valables avec ajustement mineur des mises."
  }
}`,
  },
};

// ============================================================
// MOCK DATA AMÉLIORÉ
// ============================================================

function generateMockData(phase: PhaseName, match: Match): any {
  const mockData: Record<string, any> = {
    context: {
      phase: 'context',
      data: {
        injuries: ["Joueur clé absent", "Deux titulaires incertains"],
        weather: "Ensoleillé, 20°C - conditions idéales",
        referee: {
          name: "M. Dupont",
          style: "lenient",
          avg_cards_per_game: 3.2,
          home_advantage_factor: 0.7
        },
        motivation: {
          home: "Course à l'Europe",
          away: "Maintien",
          derby: false,
          title_race: false,
          relegation_battle: true
        },
        news_impact: "Rien à signaler",
        team_travel: {
          distance_km: 450,
          rest_days_home: 7,
          rest_days_away: 4
        }
      }
    },
    stats_advanced: {
      phase: 'stats_advanced',
      data: {
        home_form_advanced: {
          last_5: "3V 1N 1D",
          adjusted_form_score: 75,
          quality_opponents_score: 60
        },
        away_form_advanced: {
          last_5: "2V 2N 1D",
          adjusted_form_score: 65,
          quality_opponents_score: 55
        },
        h2h_analysis: {
          summary: "3V domicile, 1N, 1V extérieur",
          trends: ["Beaucoup de buts en 2e période"],
          avg_goals: 2.8
        },
        advanced_metrics: {
          home_xg_avg: 1.65,
          away_xg_avg: 1.22,
          home_xga_avg: 0.9,
          away_xga_avg: 1.4,
          home_ppda: 8.5,
          away_ppda: 11.2,
          home_deep_completions: 12.3,
          away_deep_completions: 8.1
        },
        team_strengths: {
          home_attack: 78,
          home_defense: 82,
          away_attack: 65,
          away_defense: 60,
          home_set_pieces: 85,
          away_set_pieces: 55
        },
        key_insights: ["Domination à domicile", "Faiblesse défensive visiteuse"],
        edge_opportunity: "Value potentielle sur le favori"
      }
    },
    odds_analysis: {
      phase: 'odds_analysis',
      data: {
        current_market: {
          home: 2.10,
          draw: 3.40,
          away: 3.80,
          implied_prob_home: 45.2,
          implied_prob_draw: 28.1,
          implied_prob_away: 25.3,
          bookmaker_margin: 8.6
        },
        our_estimated_probabilities: {
          home: 52.0,
          draw: 26.0,
          away: 22.0,
          confidence_level: "high"
        },
        margin_analysis: {
          is_sharp_market: true,
          movement_trend: "home_supported",
          sharp_money_indicator: "Baisse sur le marché asiatique"
        },
        asian_handicap: {
          line: "-0.5",
          home_odds: 1.95,
          away_odds: 1.95,
          value_side: "home"
        },
        over_under: {
          line: 2.5,
          over_odds: 1.90,
          under_odds: 1.90,
          value_side: "over"
        }
      }
    },
    value_detection: {
      phase: 'value_detection',
      data: {
        value_opportunities: [
          {
            market: "1N2",
            selection: "1",
            bookmaker_odds: 2.10,
            our_probability: 0.52,
            implied_probability: 0.452,
            value_formula: "(0.52 × 2.10) - 1 = 0.092",
            value_percentage: 9.2,
            expected_value: 0.092,
            confidence: "high",
            reasoning: "Stats et marché alignés"
          }
        ],
        bias_analysis: {
          favorite_is_undervalued: true,
          longshot_is_overvalued: false,
          recommended_action: "Saisir la value"
        },
        best_value: {
          selection: "1",
          value_pct: 9.2,
          ev_per_unit: 0.092
        }
      }
    },
    kelly_risk: {
      phase: 'kelly_risk',
      data: {
        kelly_calculations: [
          {
            selection: "1",
            odds: 2.10,
            probability: 0.52,
            full_kelly: 0.047,
            fractional_kelly_25: 0.0118,
            fractional_kelly_50: 0.0235,
            recommended_fraction: 0.5,
            recommended_stake_percent: 2.35
          }
        ],
        risk_assessment: {
          overall_risk_score: 42,
          risk_level: "medium",
          volatility_expectation: "medium",
          correlation_with_other_bets: []
        },
        risk_factors: [
          {
            factor: "Incertitude composition",
            severity: 3,
            mitigation: "Fractional Kelly"
          }
        ],
        staking_plan: {
          recommended_bet_size: 2.35,
          max_bet_size: 5.0,
          kelly_justification: "Kelly pur 4.7% → 50% = 2.35%",
          alternative_staking: "Flat 2%"
        }
      }
    },
    final_pro: {
      phase: 'final_pro',
      data: {
        executive_summary: {
          one_sentence_verdict: `Value sur ${match.homeTeam} avec bonne confiance`,
          confidence_stars: 4,
          expected_value_rating: "good",
          risk_appetite_match: "moderate"
        },
        main_bet: {
          market: "1N2",
          selection: "1",
          odds: 2.10,
          stake_percent: 2.35,
          expected_value: 9.2,
          roi_projection: "+9.2% EV",
          reasoning: "Value détectée, Kelly fractionné",
          kelly_used: true
        },
        safe_ticket: {
          market: "Double Chance",
          selection: "1X",
          odds: 1.28,
          stake_percent: 5.0,
          confidence: 85,
          reasoning: "Très sûr"
        },
        speculative_ticket: {
          market: "Over 2.5",
          selection: "Over 2.5",
          odds: 1.90,
          stake_percent: 3.0,
          value_percentage: 10.2,
          reasoning: "Value élevée",
          caveat: "Météo incertaine"
        },
        score_prediction: "2-1",
        both_teams_to_score: true,
        total_goals_prediction: "2-3",
        bias_warnings: [],
        final_message: "Analyse professionnelle - à titre indicatif"
      }
    },
    review_critical: {
      phase: 'review_critical',
      data: {
        strengths: ["Stats avancées", "Kelly"],
        weaknesses: ["Échantillon limité"],
        alternative_scenarios: [],
        bias_check: {
          confirmation_bias_detected: false,
          recency_bias_detected: false,
          favorite_bias_detected: false,
          action_taken: "OK"
        },
        final_grade: "B+",
        suggested_adjustments: [],
        second_look_verdict: "Analyse solide"
      }
    }
  };
  
  return mockData[phase];
}

// ============================================================
// PHASE TO LLM MAPPING
// ============================================================

const PHASE_LLM: Record<PhaseName, 'gemini' | 'perplexity'> = {
  context: 'perplexity',
  stats_advanced: 'perplexity',
  odds_analysis: 'gemini',
  value_detection: 'gemini',
  kelly_risk: 'gemini',
  final_pro: 'gemini',
  review_critical: 'perplexity',
};

// ============================================================
// APPEL LLM AVEC VALIDATION
// ============================================================

async function callPhaseLLMWithValidation(
  phase: PhaseName,
  prompt: string
): Promise<any> {
  const targetLLM = PHASE_LLM[phase];
  const hasGemini = isGeminiAvailable();
  const hasPerplexity = isPerplexityAvailable();
  
  // Définir le schéma de validation selon la phase
  const schemaMap = {
    context: ContextSchema,
    stats_advanced: StatsAdvancedSchema,
    odds_analysis: OddsAnalysisSchema,
    value_detection: ValueDetectionSchema,
    kelly_risk: KellyRiskSchema,
    final_pro: FinalProSchema,
    review_critical: ReviewCriticalSchema
  };
  
  const schema = schemaMap[phase];
  
  // Essayer jusqu'à 3 fois
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      let content: string;
      
      if (targetLLM === 'gemini' && hasGemini) {
        content = await callGemini(prompt, {
          systemInstruction: "Tu réponds UNIQUEMENT en JSON valide, sans texte avant ni après. Le JSON doit correspondre EXACTEMENT à la structure demandée.",
          maxOutputTokens: 3000,
          temperature: 0.2,
        });
      } else if (targetLLM === 'perplexity' && hasPerplexity) {
        content = await callPerplexity(prompt, {
          model: 'sonar',
          maxTokens: 2500,
          temperature: 0.1,
        });
      } else {
        // Fallback mock
        return generateMockData(phase, {} as Match);
      }
      
      // Parser le JSON
      const parsed = parseLLMJson(content);
      
      // Valider avec Zod
      const validated = schema.parse(parsed.data);
      
      return {
        phase,
        data: validated
      };
    } catch (error) {
      console.error(`Phase ${phase}, tentative ${attempt}:`, error);
      
      if (attempt === 3) {
        // Fallback mock
        return generateMockData(phase, {} as Match);
      }
      
      // Attente exponentielle
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
  
  throw new Error(`Échec phase ${phase}`);
}

// ============================================================
// API ROUTE FINALE
// ============================================================

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  try {
    const body = await request.json();
    const match: Match = body.match;
    
    if (!match?.homeTeam || !match?.awayTeam) {
      return new Response(JSON.stringify({ error: 'Données du match invalides' }), { status: 400 });
    }
    
    const hasAnyLLM = isPerplexityAvailable() || isGeminiAvailable();
    console.log('🚀 Mode:', hasAnyLLM ? 'LLM' : 'mock');
    
    const stream = new ReadableStream({
      async start(controller) {
        const phases: PhaseName[] = [
          'context',
          'stats_advanced',
          'odds_analysis',
          'value_detection',
          'kelly_risk',
          'final_pro',
          'review_critical'
        ];
        
        const accumulatedData: any = {};
        
        const sendEvent = (type: string, data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type, ...data })}\n\n`));
        };
        
        for (const phase of phases) {
          const phaseConfig = ANALYSIS_PHASES[phase];
          sendEvent('phase_start', { phase, name: phaseConfig.name, icon: phaseConfig.icon });
          
          try {
            let result: any;
            
            if (!hasAnyLLM) {
              await new Promise(resolve => setTimeout(resolve, 500));
              result = generateMockData(phase, match);
            } else {
              const previousDataStr = JSON.stringify(accumulatedData);
              const prompt = phaseConfig.prompt(match, previousDataStr);
              result = await callPhaseLLMWithValidation(phase, prompt);
            }
            
            accumulatedData[phase] = result.data;
            sendEvent('phase_data', { phase, data: result.data });
            sendEvent('phase_end', { phase, success: true });
          } catch (error) {
            console.error(`Erreur phase ${phase}:`, error);
            const mockResult = generateMockData(phase, match);
            accumulatedData[phase] = mockResult.data;
            sendEvent('phase_data', { phase, data: mockResult.data, fallback: true });
            sendEvent('phase_end', { phase, success: true, fallback: true });
          }
        }
        
        sendEvent('complete', { 
          fullAnalysis: accumulatedData,
          summary: accumulatedData.final_pro?.executive_summary?.one_sentence_verdict || 'Analyse terminée'
        });
        
        controller.close();
      },
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Erreur globale:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur interne' }), { status: 500 });
  }
}