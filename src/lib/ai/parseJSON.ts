/**
 * Parse JSON from LLM output, handling markdown wrappers and surrounding text.
 */
export function parseLLMJson<T = any>(content: string): T {
  let clean = content.trim()

  // Remove markdown code blocks
  if (clean.startsWith('```json')) {
    clean = clean.slice(7)
  } else if (clean.startsWith('```')) {
    clean = clean.slice(3)
  }
  if (clean.endsWith('```')) {
    clean = clean.slice(0, -3)
  }

  // Find JSON boundaries
  const firstBrace = clean.indexOf('{')
  const lastBrace = clean.lastIndexOf('}')

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.substring(firstBrace, lastBrace + 1)
  }

  return JSON.parse(clean)
}

/**
 * Attempt to repair common JSON issues from LLM output.
 */
export function repairJSON(content: string): string {
  let s = content.trim()

  // Remove markdown wrappers
  if (s.startsWith('```json')) s = s.slice(7)
  else if (s.startsWith('```')) s = s.slice(3)
  if (s.endsWith('```')) s = s.slice(0, -3)
  s = s.trim()

  // Extract JSON object
  const firstBrace = s.indexOf('{')
  const lastBrace = s.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    s = s.substring(firstBrace, lastBrace + 1)
  }

  // Fix trailing commas before } or ]
  s = s.replace(/,\s*([}\]])/g, '$1')

  return s
}
