import type { QuoteForm } from '../lib/schema'
import { submitQuoteToSupabase } from './supabase-client'
import { triggerQuoteWebhook } from './email-notifications'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export interface QuoteSubmission {
  formData: QuoteForm
  quote: number
  timestamp: string
}

export interface QuoteResponse {
  success: boolean
  quoteId?: string
  customerId?: string
  message?: string
}

/**
 * Submit quote request — tries Supabase first, then external API, then dev fallback.
 * Priority: Supabase > External API > console.log (dev)
 * Automatically triggers email notification via webhook
 */
export async function submitQuoteRequest(data: QuoteForm, quote: number): Promise<QuoteResponse> {
  const payload: QuoteSubmission = {
    formData: data,
    quote,
    timestamp: new Date().toISOString(),
  }

  // ── Priority 1: Supabase (primary persistence layer)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey) {
    try {
      const result = await submitQuoteToSupabase(data, quote)
      if (result.success) {
        // Trigger email notification via webhook
        if (result.quoteId) {
          triggerQuoteWebhook(result.quoteId).catch((err) => {
            console.error('[API] Email webhook failed:', err)
            // Non-fatal: quote was saved successfully even if email fails
          })
        }
        
        return {
          success: true,
          quoteId: result.quoteId,
          customerId: result.customerId,
          message: result.quoteId ? `Quote #${result.quoteId.slice(0, 8)} saved` : 'Quote saved',
        }
      }
      // If Supabase failed, fall through to API or dev fallback
      console.error('[API] Supabase submission failed, trying fallback:', result.error)
    } catch (err) {
      console.error('[API] Supabase error, trying fallback:', err)
    }
  }

  // ── Priority 2: External API endpoint
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

      const apiResult = await response.json()
      return {
        success: true,
        quoteId: apiResult.quoteId,
        message: apiResult.message || 'Quote submitted via API',
      }
    } catch (error) {
      console.error('[API] External API failed, using dev fallback:', error)
    }
  }

  // ── Priority 3: Development fallback
  console.log('[DEV MODE] Quote submitted:', payload)
  return { success: true, message: 'Development mode — quote logged to console' }
}
