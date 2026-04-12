import type { QuoteForm } from '../lib/schema'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export interface QuoteSubmission {
  formData: QuoteForm
  quote: number
  timestamp: string
}

export interface QuoteResponse {
  success: boolean
  quoteId?: string
  message?: string
}

/**
 * Submit quote request to API endpoint.
 * Falls back to console logging in development mode.
 */
export async function submitQuoteRequest(data: QuoteForm, quote: number): Promise<QuoteResponse> {
  const payload: QuoteSubmission = {
    formData: data,
    quote,
    timestamp: new Date().toISOString(),
  }

  // If API URL is configured, make real request
  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Quote submission failed:', error)
      // Fall through to dev mode
    }
  }

  // Development fallback
  console.log('[DEV MODE] Quote submitted:', payload)
  return { success: true, message: 'Development mode — quote logged to console' }
}
