import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'

let _client: GoogleGenerativeAI | null = null

function getClient(): GoogleGenerativeAI {
  if (_client) return _client
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) throw new Error('GOOGLE_AI_API_KEY not configured')
  _client = new GoogleGenerativeAI(apiKey)
  return _client
}

export async function callGemini(
  prompt: string,
  options?: {
    model?: string
    temperature?: number
    maxOutputTokens?: number
    systemInstruction?: string
    jsonMode?: boolean
  },
): Promise<string> {
  const client = getClient()

  const model: GenerativeModel = client.getGenerativeModel({
    model: options?.model || process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    systemInstruction: options?.systemInstruction,
    generationConfig: {
      temperature: options?.temperature ?? 0.1,
      maxOutputTokens: options?.maxOutputTokens ?? 2048,
      ...(options?.jsonMode !== false && {
        responseMimeType: 'application/json',
      }),
    },
  })

  const result = await model.generateContent(prompt)
  const response = result.response
  return response.text()
}

export function isGeminiAvailable(): boolean {
  return !!process.env.GOOGLE_AI_API_KEY
}
