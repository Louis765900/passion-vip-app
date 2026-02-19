import { API_CONFIG } from '@/lib/config/apis'

// ==========================================
// WeatherAPI Service (Plan Business Trial)
// ==========================================

const config = API_CONFIG.weatherApi

export interface WeatherCurrent {
  location: {
    name: string
    region: string
    country: string
    lat: number
    lon: number
    localtime: string
  }
  current: {
    temp_c: number
    feelslike_c: number
    condition: {
      text: string
      icon: string
      code: number
    }
    wind_kph: number
    wind_dir: string
    humidity: number
    cloud: number
    uv: number
    precip_mm: number
    is_day: number
  }
}

export interface WeatherForecastDay {
  date: string
  day: {
    maxtemp_c: number
    mintemp_c: number
    avgtemp_c: number
    condition: { text: string; icon: string }
    daily_chance_of_rain: number
    daily_chance_of_snow: number
    maxwind_kph: number
    avghumidity: number
    uv: number
  }
  hour: Array<{
    time: string
    temp_c: number
    condition: { text: string; icon: string }
    chance_of_rain: number
    wind_kph: number
  }>
}

export interface WeatherForecast extends WeatherCurrent {
  forecast: {
    forecastday: WeatherForecastDay[]
  }
}

class WeatherApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode?: number
  ) {
    super(message)
    this.name = 'WeatherApiError'
  }
}

async function fetchWeather<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  if (!config.apiKey) {
    throw new WeatherApiError('WEATHERAPI_KEY non configurée', 401)
  }

  const searchParams = new URLSearchParams({
    key: config.apiKey,
    ...params,
  })

  const url = `${config.baseUrl}/${endpoint}?${searchParams}`

  const response = await fetch(url, {
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new WeatherApiError(
      errorData?.error?.message || `WeatherAPI error: ${response.status}`,
      response.status,
      errorData?.error?.code
    )
  }

  return response.json()
}

/**
 * Météo actuelle pour une localité
 */
export async function getCurrentWeather(location: string): Promise<WeatherCurrent> {
  return fetchWeather<WeatherCurrent>('current.json', { q: location })
}

/**
 * Prévisions météo (1 à 14 jours)
 */
export async function getForecast(location: string, days: number = 3): Promise<WeatherForecast> {
  return fetchWeather<WeatherForecast>('forecast.json', {
    q: location,
    days: Math.min(days, 14).toString(),
  })
}

/**
 * Météo pour un match (ville du stade)
 */
export async function getMatchWeather(city: string): Promise<{
  temperature: number
  condition: string
  wind: number
  humidity: number
  rainChance: number
}> {
  const forecast = await getForecast(city, 1)
  const current = forecast.current
  const todayForecast = forecast.forecast.forecastday[0]

  return {
    temperature: current.temp_c,
    condition: current.condition.text,
    wind: current.wind_kph,
    humidity: current.humidity,
    rainChance: todayForecast.day.daily_chance_of_rain,
  }
}

/**
 * Test de connectivité WeatherAPI
 */
export async function testConnection(): Promise<{ ok: boolean; message: string; data?: unknown }> {
  try {
    const weather = await getCurrentWeather('Paris')
    return {
      ok: true,
      message: `Connecté - Paris: ${weather.current.temp_c}°C, ${weather.current.condition.text}`,
      data: {
        location: weather.location.name,
        temp: weather.current.temp_c,
        condition: weather.current.condition.text,
      },
    }
  } catch (error) {
    return { ok: false, message: `Erreur: ${error instanceof Error ? error.message : String(error)}` }
  }
}
