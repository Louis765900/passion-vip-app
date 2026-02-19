import { API_CONFIG } from '@/lib/config/apis'

// ==========================================
// Open-Meteo Service (Accès libre, pas de clé)
// ==========================================

const config = API_CONFIG.openMeteo

export interface OpenMeteoForecast {
  latitude: number
  longitude: number
  timezone: string
  hourly: {
    time: string[]
    temperature_2m: number[]
    relative_humidity_2m: number[]
    precipitation_probability: number[]
    wind_speed_10m: number[]
    weather_code: number[]
  }
  daily: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_sum: number[]
    wind_speed_10m_max: number[]
    weather_code: number[]
  }
}

// Codes météo WMO → descriptions en français
const WMO_CODES: Record<number, string> = {
  0: 'Ciel dégagé',
  1: 'Principalement dégagé',
  2: 'Partiellement nuageux',
  3: 'Couvert',
  45: 'Brouillard',
  48: 'Brouillard givrant',
  51: 'Bruine légère',
  53: 'Bruine modérée',
  55: 'Bruine dense',
  61: 'Pluie légère',
  63: 'Pluie modérée',
  65: 'Pluie forte',
  71: 'Neige légère',
  73: 'Neige modérée',
  75: 'Neige forte',
  80: 'Averses légères',
  81: 'Averses modérées',
  82: 'Averses violentes',
  95: 'Orage',
  96: 'Orage avec grêle légère',
  99: 'Orage avec grêle forte',
}

export function getWeatherDescription(code: number): string {
  return WMO_CODES[code] || 'Inconnu'
}

async function fetchOpenMeteo<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const searchParams = new URLSearchParams(params)
  const url = `${config.baseUrl}/${endpoint}?${searchParams}`

  const response = await fetch(url, {
    next: { revalidate: 600 },
  })

  if (!response.ok) {
    throw new Error(`Open-Meteo error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Prévisions horaires et journalières par coordonnées GPS
 */
export async function getForecast(
  latitude: number,
  longitude: number,
  days: number = 3
): Promise<OpenMeteoForecast> {
  return fetchOpenMeteo<OpenMeteoForecast>('forecast', {
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weather_code',
    forecast_days: Math.min(days, 16).toString(),
    timezone: 'Europe/Paris',
  })
}

/**
 * Résumé météo simplifié pour une position
 */
export async function getWeatherSummary(latitude: number, longitude: number): Promise<{
  today: { maxTemp: number; minTemp: number; precipitation: number; wind: number; description: string }
  tomorrow: { maxTemp: number; minTemp: number; precipitation: number; wind: number; description: string }
}> {
  const data = await getForecast(latitude, longitude, 2)

  const buildDay = (index: number) => ({
    maxTemp: data.daily.temperature_2m_max[index],
    minTemp: data.daily.temperature_2m_min[index],
    precipitation: data.daily.precipitation_sum[index],
    wind: data.daily.wind_speed_10m_max[index],
    description: getWeatherDescription(data.daily.weather_code[index]),
  })

  return {
    today: buildDay(0),
    tomorrow: buildDay(1),
  }
}

/**
 * Test de connectivité Open-Meteo
 */
export async function testConnection(): Promise<{ ok: boolean; message: string; data?: unknown }> {
  try {
    // Paris: 48.8566, 2.3522
    const summary = await getWeatherSummary(48.8566, 2.3522)
    return {
      ok: true,
      message: `Connecté - Paris: ${summary.today.maxTemp}°C max, ${summary.today.description}`,
      data: summary.today,
    }
  } catch (error) {
    return { ok: false, message: `Erreur: ${error instanceof Error ? error.message : String(error)}` }
  }
}
