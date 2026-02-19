import * as sportsdb from '@/services/sportsdb'
import * as weather from '@/services/weather'
import * as openmeteo from '@/services/openmeteo'
import * as quickchart from '@/services/quickchart'
import * as countries from '@/services/countries'
import * as nominatim from '@/services/nominatim'

// ==========================================
// Test de connectivité centralisé
// ==========================================

export interface ServiceTestResult {
  service: string
  ok: boolean
  message: string
  latencyMs: number
  data?: unknown
}

export interface AllTestsResult {
  timestamp: string
  totalServices: number
  healthy: number
  failed: number
  results: ServiceTestResult[]
}

type TestFn = () => Promise<{ ok: boolean; message: string; data?: unknown }>

const SERVICES: Record<string, TestFn> = {
  TheSportsDB: sportsdb.testConnection,
  WeatherAPI: weather.testConnection,
  'Open-Meteo': openmeteo.testConnection,
  QuickChart: quickchart.testConnection,
  'REST Countries': countries.testConnection,
  Nominatim: nominatim.testConnection,
}

async function testService(name: string, testFn: TestFn): Promise<ServiceTestResult> {
  const start = Date.now()
  try {
    const result = await testFn()
    return {
      service: name,
      ok: result.ok,
      message: result.message,
      latencyMs: Date.now() - start,
      data: result.data,
    }
  } catch (error) {
    return {
      service: name,
      ok: false,
      message: `Exception: ${error instanceof Error ? error.message : String(error)}`,
      latencyMs: Date.now() - start,
    }
  }
}

/**
 * Teste tous les services en parallèle
 */
export async function testAllServices(): Promise<AllTestsResult> {
  const results = await Promise.all(
    Object.entries(SERVICES).map(([name, fn]) => testService(name, fn))
  )

  const healthy = results.filter(r => r.ok).length

  return {
    timestamp: new Date().toISOString(),
    totalServices: results.length,
    healthy,
    failed: results.length - healthy,
    results,
  }
}

/**
 * Teste un service spécifique par nom
 */
export async function testSingleService(serviceName: string): Promise<ServiceTestResult | null> {
  const testFn = SERVICES[serviceName]
  if (!testFn) return null
  return testService(serviceName, testFn)
}

export const availableServices = Object.keys(SERVICES)
