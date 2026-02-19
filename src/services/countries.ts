import { API_CONFIG } from '@/lib/config/apis'

// ==========================================
// REST Countries Service (Accès libre)
// ==========================================

const config = API_CONFIG.restCountries

export interface Country {
  name: {
    common: string
    official: string
    nativeName?: Record<string, { official: string; common: string }>
  }
  cca2: string
  cca3: string
  capital?: string[]
  region: string
  subregion?: string
  languages?: Record<string, string>
  currencies?: Record<string, { name: string; symbol: string }>
  population: number
  area: number
  timezones: string[]
  flags: {
    png: string
    svg: string
    alt?: string
  }
  latlng: [number, number]
  maps: {
    googleMaps: string
    openStreetMaps: string
  }
}

async function fetchCountries<T>(endpoint: string): Promise<T> {
  const url = `${config.baseUrl}/${endpoint}`

  const response = await fetch(url, {
    next: { revalidate: 86400 }, // Cache 24h (données stables)
  })

  if (response.status === 404) {
    return [] as unknown as T
  }

  if (!response.ok) {
    throw new Error(`REST Countries error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Recherche un pays par nom
 */
export async function searchByName(name: string): Promise<Country[]> {
  return fetchCountries<Country[]>(`name/${encodeURIComponent(name)}`)
}

/**
 * Récupère un pays par code ISO (alpha-2 ou alpha-3)
 */
export async function getByCode(code: string): Promise<Country[]> {
  return fetchCountries<Country[]>(`alpha/${encodeURIComponent(code)}`)
}

/**
 * Récupère les pays d'une région
 */
export async function getByRegion(region: string): Promise<Country[]> {
  return fetchCountries<Country[]>(`region/${encodeURIComponent(region)}`)
}

/**
 * Récupère le drapeau d'un pays (URL SVG)
 */
export async function getFlag(countryCode: string): Promise<string | null> {
  const countries = await getByCode(countryCode)
  return countries[0]?.flags.svg || null
}

/**
 * Récupère les coordonnées GPS d'un pays (centre)
 */
export async function getCoordinates(countryName: string): Promise<{ lat: number; lon: number } | null> {
  const countries = await searchByName(countryName)
  if (!countries[0]) return null
  return { lat: countries[0].latlng[0], lon: countries[0].latlng[1] }
}

/**
 * Test de connectivité REST Countries
 */
export async function testConnection(): Promise<{ ok: boolean; message: string; data?: unknown }> {
  try {
    const countries = await searchByName('France')
    const france = countries[0]
    return {
      ok: true,
      message: `Connecté - France: ${france.capital?.[0]}, ${france.population.toLocaleString('fr-FR')} hab.`,
      data: {
        name: france.name.common,
        capital: france.capital?.[0],
        population: france.population,
      },
    }
  } catch (error) {
    return { ok: false, message: `Erreur: ${error instanceof Error ? error.message : String(error)}` }
  }
}
