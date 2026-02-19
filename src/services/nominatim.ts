import { API_CONFIG } from '@/lib/config/apis'

// ==========================================
// Nominatim Geocoding Service (OpenStreetMap)
// ==========================================

const config = API_CONFIG.nominatim

export interface NominatimPlace {
  place_id: number
  licence: string
  osm_type: string
  osm_id: number
  lat: string
  lon: string
  display_name: string
  address: {
    road?: string
    suburb?: string
    city?: string
    town?: string
    village?: string
    county?: string
    state?: string
    postcode?: string
    country: string
    country_code: string
  }
  boundingbox: [string, string, string, string]
  type: string
  importance: number
}

export interface NominatimReverseResult {
  place_id: number
  lat: string
  lon: string
  display_name: string
  address: NominatimPlace['address']
}

// Rate limiter simple : 1 requête par seconde max
let lastRequestTime = 0

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now()
  const elapsed = now - lastRequestTime
  const minInterval = 1000 / config.rateLimit.maxRequestsPerSecond

  if (elapsed < minInterval) {
    await new Promise(resolve => setTimeout(resolve, minInterval - elapsed))
  }

  lastRequestTime = Date.now()

  return fetch(url, {
    headers: {
      'User-Agent': config.userAgent,
    },
    next: { revalidate: 86400 }, // Cache 24h (géodonnées stables)
  })
}

async function fetchNominatim<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const searchParams = new URLSearchParams({
    ...params,
    format: 'json',
    email: config.email,
  })

  const url = `${config.baseUrl}/${endpoint}?${searchParams}`
  const response = await rateLimitedFetch(url)

  if (!response.ok) {
    throw new Error(`Nominatim error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Géocodage : adresse → coordonnées
 */
export async function geocode(query: string, limit: number = 5): Promise<NominatimPlace[]> {
  return fetchNominatim<NominatimPlace[]>('search', {
    q: query,
    limit: limit.toString(),
    addressdetails: '1',
  })
}

/**
 * Géocodage inverse : coordonnées → adresse
 */
export async function reverseGeocode(lat: number, lon: number): Promise<NominatimReverseResult> {
  return fetchNominatim<NominatimReverseResult>('reverse', {
    lat: lat.toString(),
    lon: lon.toString(),
    addressdetails: '1',
  })
}

/**
 * Recherche un stade et retourne ses coordonnées
 */
export async function findStadium(stadiumName: string, city?: string): Promise<{
  name: string
  lat: number
  lon: number
  city: string
  country: string
} | null> {
  const query = city ? `${stadiumName}, ${city}` : stadiumName
  const results = await geocode(query, 1)

  if (!results[0]) return null

  const place = results[0]
  return {
    name: place.display_name,
    lat: parseFloat(place.lat),
    lon: parseFloat(place.lon),
    city: place.address.city || place.address.town || place.address.village || '',
    country: place.address.country,
  }
}

/**
 * Test de connectivité Nominatim
 */
export async function testConnection(): Promise<{ ok: boolean; message: string; data?: unknown }> {
  try {
    const results = await geocode('Parc des Princes, Paris', 1)
    const place = results[0]
    return {
      ok: !!place,
      message: place
        ? `Connecté - Parc des Princes: ${place.lat}, ${place.lon}`
        : 'Connecté mais aucun résultat',
      data: place ? { lat: place.lat, lon: place.lon, name: place.display_name } : null,
    }
  } catch (error) {
    return { ok: false, message: `Erreur: ${error instanceof Error ? error.message : String(error)}` }
  }
}
