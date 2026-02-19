const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'

export async function callPerplexity(
  prompt: string,
  options?: {
    model?: string
    temperature?: number
    maxTokens?: number
    systemPrompt?: string
  },
): Promise<string> {
  const apiKey = process.env.PERPLEXITY_API_KEY
  if (!apiKey) throw new Error('PERPLEXITY_API_KEY not configured')

  const messages: { role: string; content: string }[] = []

  if (options?.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt })
  }
  messages.push({ role: 'user', content: prompt })

  const response = await fetch(PERPLEXITY_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options?.model || 'sonar-pro',
      messages,
      temperature: options?.temperature ?? 0.1,
      max_tokens: options?.maxTokens ?? 2000,
    }),
  })

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

export function isPerplexityAvailable(): boolean {
  return !!process.env.PERPLEXITY_API_KEY
}
