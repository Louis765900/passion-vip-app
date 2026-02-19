import { NextRequest, NextResponse } from 'next/server'
import * as sportsdb from '@/services/sportsdb'
import * as weather from '@/services/weather'
import * as openmeteo from '@/services/openmeteo'
import * as quickchart from '@/services/quickchart'
import * as countries from '@/services/countries'
import * as nominatim from '@/services/nominatim'

/**
 * POST /api/intelligence
 *
 * Shannon Intelligence — Analyse complète d'un match en combinant
 * toutes les APIs (TheSportsDB, WeatherAPI, Open-Meteo, Nominatim,
 * REST Countries, QuickChart).
 *
 * Body: { homeTeam: string, awayTeam: string, league?: string }
 *
 * Retourne:
 * - Données des 2 équipes (TheSportsDB)
 * - Forme récente (derniers résultats)
 * - Météo du stade (WeatherAPI + Open-Meteo fallback)
 * - Localisation du stade (Nominatim)
 * - Infos pays (REST Countries)
 * - Graphiques (QuickChart)
 * - Score d'analyse Shannon
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { homeTeam, awayTeam } = body as { homeTeam: string; awayTeam: string }

    if (!homeTeam || !awayTeam) {
      return NextResponse.json(
        { error: 'homeTeam et awayTeam sont requis' },
        { status: 400 }
      )
    }

    // ── Step 1: Résoudre les équipes via TheSportsDB ──
    const [homeResults, awayResults] = await Promise.all([
      sportsdb.searchTeam(homeTeam).catch(() => []),
      sportsdb.searchTeam(awayTeam).catch(() => []),
    ])

    const home = homeResults[0] || null
    const away = awayResults[0] || null

    if (!home || !away) {
      return NextResponse.json(
        {
          error: 'Impossible de trouver une ou les deux équipes',
          details: {
            homeFound: !!home,
            awayFound: !!away,
          },
        },
        { status: 404 }
      )
    }

    // ── Step 2: Récupérer les derniers résultats (forme) ──
    const [homeLastEvents, awayLastEvents] = await Promise.all([
      sportsdb.getLastEvents(home.idTeam).catch(() => []),
      sportsdb.getLastEvents(away.idTeam).catch(() => []),
    ])

    const homeForm = sportsdb.extractForm(homeLastEvents, home.idTeam)
    const awayForm = sportsdb.extractForm(awayLastEvents, away.idTeam)

    // ── Step 3: H2H — filtrer les derniers résultats croisés ──
    const h2hMatches = homeLastEvents.filter(
      (e) =>
        (e.strHomeTeam === away.strTeam || e.strAwayTeam === away.strTeam)
    )

    // ── Step 4: Localisation du stade + météo (en parallèle) ──
    const stadiumName = home.strStadium || ''
    const stadiumCity = home.strStadiumLocation || home.strCountry || ''

    const [stadiumGeo, weatherData, countryInfo] = await Promise.all([
      stadiumName
        ? nominatim.findStadium(stadiumName, stadiumCity).catch(() => null)
        : Promise.resolve(null),
      stadiumCity
        ? weather.getMatchWeather(stadiumCity).catch(() => null)
        : Promise.resolve(null),
      home.strCountry
        ? countries.searchByName(home.strCountry).catch(() => [])
        : Promise.resolve([]),
    ])

    // ── Step 5: Open-Meteo fallback si WeatherAPI échoue ──
    let weatherResult = weatherData
    if (!weatherResult && stadiumGeo) {
      const omForecast = await openmeteo
        .getWeatherSummary(stadiumGeo.lat, stadiumGeo.lon)
        .catch(() => null)
      if (omForecast) {
        weatherResult = {
          temperature: omForecast.today.maxTemp,
          condition: omForecast.today.description,
          wind: omForecast.today.wind,
          humidity: 0,
          rainChance: omForecast.today.precipitation > 0 ? 80 : 10,
        }
      }
    }

    // ── Step 6: Analyse Shannon (scoring simplifié) ──
    const analysis = computeShannonScore(homeForm, awayForm, h2hMatches, home, away)

    // ── Step 7: Générer les graphiques ──
    const formChartUrl = quickchart.getFormChart(
      homeLastEvents.slice(0, 5).map((e) => e.strEvent?.slice(0, 20) || '?'),
      homeForm.slice(0, 5) as ('W' | 'D' | 'L')[],
      home.strTeam,
    )

    const comparisonLabels = ['Forme', 'H2H', 'Classement', 'Attaque', 'Défense']
    const comparisonChartUrl = quickchart.getTeamComparisonChart(
      comparisonLabels,
      [
        formScorePercent(homeForm),
        analysis.h2hHomeAdvantage,
        50,
        analysis.homeAttack,
        analysis.homeDefense,
      ],
      [
        formScorePercent(awayForm),
        analysis.h2hAwayAdvantage,
        50,
        analysis.awayAttack,
        analysis.awayDefense,
      ],
      home.strTeam,
      away.strTeam,
    )

    // ── Résultat final ──
    return NextResponse.json({
      success: true,
      match: {
        homeTeam: {
          id: home.idTeam,
          name: home.strTeam,
          shortName: home.strTeamShort,
          badge: home.strTeamBadge,
          stadium: home.strStadium,
          country: home.strCountry,
          league: home.strLeague,
          form: homeForm,
          lastResults: homeLastEvents.slice(0, 5).map(formatEvent),
        },
        awayTeam: {
          id: away.idTeam,
          name: away.strTeam,
          shortName: away.strTeamShort,
          badge: away.strTeamBadge,
          country: away.strCountry,
          league: away.strLeague,
          form: awayForm,
          lastResults: awayLastEvents.slice(0, 5).map(formatEvent),
        },
        h2h: h2hMatches.map(formatEvent),
      },
      venue: {
        stadium: stadiumName,
        city: stadiumCity,
        geo: stadiumGeo
          ? { lat: stadiumGeo.lat, lon: stadiumGeo.lon }
          : null,
        country: countryInfo[0]
          ? {
              name: countryInfo[0].name.common,
              flag: countryInfo[0].flags.svg,
              capital: countryInfo[0].capital?.[0],
            }
          : null,
      },
      weather: weatherResult,
      analysis: {
        prediction: analysis.prediction,
        confidence: analysis.confidence,
        direction: analysis.direction,
        keyFactors: analysis.keyFactors,
      },
      charts: {
        form: formChartUrl,
        comparison: comparisonChartUrl,
      },
      meta: {
        sources: ['TheSportsDB', 'WeatherAPI', 'Open-Meteo', 'Nominatim', 'REST Countries', 'QuickChart'],
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Intelligence API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// ── Helpers ──

function formatEvent(e: sportsdb.SportsDBEvent) {
  return {
    id: e.idEvent,
    name: e.strEvent,
    date: e.dateEvent,
    homeTeam: e.strHomeTeam,
    awayTeam: e.strAwayTeam,
    homeScore: e.intHomeScore,
    awayScore: e.intAwayScore,
    status: e.strStatus,
  }
}

function formScorePercent(form: string[]): number {
  if (!form.length) return 50
  const values: Record<string, number> = { W: 100, D: 50, L: 0 }
  const total = form.reduce((sum, r) => sum + (values[r] ?? 50), 0)
  return Math.round(total / form.length)
}

function computeShannonScore(
  homeForm: string[],
  awayForm: string[],
  h2h: sportsdb.SportsDBEvent[],
  home: sportsdb.SportsDBTeam,
  away: sportsdb.SportsDBTeam,
) {
  let homeScore = 0
  let awayScore = 0
  const keyFactors: string[] = []

  // Forme
  const hf = formScorePercent(homeForm)
  const af = formScorePercent(awayForm)
  if (hf > 70) { homeScore += 2; keyFactors.push(`${home.strTeam} en excellente forme (${homeForm.join('')})`) }
  else if (hf > 50) { homeScore += 1 }
  else if (hf < 30) { homeScore -= 1; keyFactors.push(`${home.strTeam} en mauvaise forme (${homeForm.join('')})`) }

  if (af > 70) { awayScore += 2; keyFactors.push(`${away.strTeam} en excellente forme (${awayForm.join('')})`) }
  else if (af > 50) { awayScore += 1 }
  else if (af < 30) { awayScore -= 1; keyFactors.push(`${away.strTeam} en mauvaise forme (${awayForm.join('')})`) }

  // H2H
  let h2hHome = 0
  let h2hAway = 0
  for (const m of h2h) {
    const hs = m.intHomeScore ? parseInt(m.intHomeScore) : null
    const as_ = m.intAwayScore ? parseInt(m.intAwayScore) : null
    if (hs === null || as_ === null) continue
    if (m.strHomeTeam === home.strTeam) {
      if (hs > as_) h2hHome++
      else if (as_ > hs) h2hAway++
    } else {
      if (as_ > hs) h2hHome++
      else if (hs > as_) h2hAway++
    }
  }
  if (h2hHome > h2hAway) { homeScore += 1; keyFactors.push(`H2H favorable: ${h2hHome}V-${h2hAway}D`) }
  else if (h2hAway > h2hHome) { awayScore += 1; keyFactors.push(`H2H défavorable: ${h2hHome}V-${h2hAway}D`) }

  // Avantage domicile
  homeScore += 0.5
  keyFactors.push(`Avantage domicile pour ${home.strTeam}`)

  // Calcul final
  const diff = homeScore - awayScore
  let direction: 'home' | 'away' | 'draw'
  let prediction: string

  if (diff > 1.5) { direction = 'home'; prediction = `Victoire ${home.strTeam}` }
  else if (diff < -1.5) { direction = 'away'; prediction = `Victoire ${away.strTeam}` }
  else if (Math.abs(diff) < 0.5) { direction = 'draw'; prediction = 'Match nul probable' }
  else { direction = diff > 0 ? 'home' : 'away'; prediction = diff > 0 ? `Légère avantage ${home.strTeam}` : `Légère avantage ${away.strTeam}` }

  const confidence = Math.min(Math.round(50 + Math.abs(diff) * 12), 90)

  return {
    prediction,
    confidence,
    direction,
    keyFactors: keyFactors.slice(0, 5),
    homeAttack: hf > 60 ? 70 : 50,
    homeDefense: hf > 40 ? 60 : 45,
    awayAttack: af > 60 ? 70 : 50,
    awayDefense: af > 40 ? 60 : 45,
    h2hHomeAdvantage: h2h.length > 0 ? Math.round((h2hHome / Math.max(h2hHome + h2hAway, 1)) * 100) : 50,
    h2hAwayAdvantage: h2h.length > 0 ? Math.round((h2hAway / Math.max(h2hHome + h2hAway, 1)) * 100) : 50,
  }
}
