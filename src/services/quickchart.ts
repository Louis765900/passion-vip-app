import { API_CONFIG } from '@/lib/config/apis'

// ==========================================
// QuickChart Service (Accès libre)
// ==========================================

const config = API_CONFIG.quickChart

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'scatter'
  data: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      backgroundColor?: string | string[]
      borderColor?: string | string[]
      borderWidth?: number
      fill?: boolean
    }>
  }
  options?: Record<string, unknown>
}

/**
 * Génère l'URL d'un graphique QuickChart
 */
export function getChartUrl(
  chartConfig: ChartConfig,
  options?: { width?: number; height?: number; backgroundColor?: string; format?: 'png' | 'svg' | 'webp' }
): string {
  const params = new URLSearchParams({
    c: JSON.stringify(chartConfig),
    w: (options?.width || 500).toString(),
    h: (options?.height || 300).toString(),
    bkg: options?.backgroundColor || 'transparent',
    f: options?.format || 'png',
  })

  return `${config.baseUrl}?${params}`
}

/**
 * Génère un graphique de classement (barres horizontales)
 */
export function getStandingsChart(
  teams: string[],
  points: number[],
  title: string = 'Classement'
): string {
  return getChartUrl({
    type: 'bar',
    data: {
      labels: teams,
      datasets: [{
        label: title,
        data: points,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      }],
    },
    options: {
      indexAxis: 'y',
      plugins: { title: { display: true, text: title } },
    },
  })
}

/**
 * Génère un graphique de performance (ligne)
 */
export function getPerformanceChart(
  labels: string[],
  values: number[],
  title: string = 'Performance'
): string {
  return getChartUrl({
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: title,
        data: values,
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
      }],
    },
    options: {
      plugins: { title: { display: true, text: title } },
    },
  })
}

/**
 * Génère un graphique de répartition (camembert)
 */
export function getDistributionChart(
  labels: string[],
  values: number[],
  title: string = 'Répartition'
): string {
  const colors = [
    'rgba(59, 130, 246, 0.7)',
    'rgba(16, 185, 129, 0.7)',
    'rgba(245, 158, 11, 0.7)',
    'rgba(239, 68, 68, 0.7)',
    'rgba(139, 92, 246, 0.7)',
    'rgba(236, 72, 153, 0.7)',
  ]

  return getChartUrl({
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        label: title,
        data: values,
        backgroundColor: colors.slice(0, labels.length),
      }],
    },
    options: {
      plugins: { title: { display: true, text: title } },
    },
  })
}

/**
 * Génère un graphique radar de comparaison d'équipes
 */
export function getTeamComparisonChart(
  labels: string[],
  homeData: number[],
  awayData: number[],
  homeName: string,
  awayName: string,
): string {
  return getChartUrl({
    type: 'radar',
    data: {
      labels,
      datasets: [
        {
          label: homeName,
          data: homeData,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
        },
        {
          label: awayName,
          data: awayData,
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2,
        },
      ],
    },
    options: {
      plugins: { title: { display: true, text: `${homeName} vs ${awayName}` } },
      scales: { r: { beginAtZero: true, max: 100 } },
    },
  })
}

/**
 * Génère un graphique de forme récente (W/D/L en couleurs)
 */
export function getFormChart(
  matchLabels: string[],
  results: ('W' | 'D' | 'L')[],
  teamName: string,
): string {
  const colorMap = { W: 'rgba(16, 185, 129, 0.8)', D: 'rgba(245, 158, 11, 0.8)', L: 'rgba(239, 68, 68, 0.8)' }
  const valueMap = { W: 3, D: 1, L: 0 }

  return getChartUrl({
    type: 'bar',
    data: {
      labels: matchLabels,
      datasets: [{
        label: teamName,
        data: results.map(r => valueMap[r]),
        backgroundColor: results.map(r => colorMap[r]),
        borderWidth: 0,
      }],
    },
    options: {
      plugins: { title: { display: true, text: `Forme récente — ${teamName}` } },
      scales: { y: { max: 3 } },
    },
  })
}

/**
 * Télécharge un graphique en tant que Buffer (pour envoi ou sauvegarde)
 */
export async function downloadChart(chartConfig: ChartConfig, options?: { width?: number; height?: number }): Promise<ArrayBuffer> {
  const url = getChartUrl(chartConfig, options)
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`QuickChart error: ${response.status} ${response.statusText}`)
  }

  return response.arrayBuffer()
}

/**
 * Test de connectivité QuickChart
 */
export async function testConnection(): Promise<{ ok: boolean; message: string; data?: unknown }> {
  try {
    const url = getChartUrl({
      type: 'bar',
      data: {
        labels: ['Test'],
        datasets: [{ label: 'Test', data: [1] }],
      },
    })

    const response = await fetch(url, { method: 'HEAD' })
    return {
      ok: response.ok,
      message: response.ok
        ? `Connecté - Génération de graphiques opérationnelle`
        : `Erreur HTTP ${response.status}`,
      data: { chartUrl: url },
    }
  } catch (error) {
    return { ok: false, message: `Erreur: ${error instanceof Error ? error.message : String(error)}` }
  }
}
