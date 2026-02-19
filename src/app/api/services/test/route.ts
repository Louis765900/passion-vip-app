import { NextRequest, NextResponse } from 'next/server'
import { testAllServices, testSingleService, availableServices } from '@/services/api-test'

/**
 * GET /api/services/test
 * Teste la connectivité de tous les services externes
 *
 * Query params:
 * - service: (optionnel) Nom d'un service spécifique à tester
 *
 * Exemples:
 * - GET /api/services/test           → Teste tout
 * - GET /api/services/test?service=WeatherAPI  → Teste WeatherAPI uniquement
 */
export async function GET(request: NextRequest) {
  const serviceName = request.nextUrl.searchParams.get('service')

  // Test d'un service spécifique
  if (serviceName) {
    const result = await testSingleService(serviceName)

    if (!result) {
      return NextResponse.json(
        {
          error: `Service "${serviceName}" inconnu`,
          availableServices,
        },
        { status: 404 }
      )
    }

    return NextResponse.json(result)
  }

  // Test de tous les services
  const results = await testAllServices()

  return NextResponse.json(results, {
    status: results.failed > 0 ? 207 : 200, // 207 Multi-Status si certains échouent
  })
}
