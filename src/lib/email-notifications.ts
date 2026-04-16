// Email notification service — triggers Supabase Edge Function
// Used to send quote confirmations, booking confirmations, etc.

export interface EmailNotification {
  type: 'quote' | 'booking' | 'cancellation' | 'reminder'
  recipientEmail: string
  recipientName: string
  data: Record<string, unknown>
}

/**
 * Send email notification via Supabase Edge Function
 */
export async function sendEmailNotification(
  notification: EmailNotification
): Promise<{ success: boolean; emailId?: string; error?: string }> {
  try {
    // Get the Edge Function URL from environment or construct it
    const edgeFunctionUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL
    if (!edgeFunctionUrl) {
      console.warn('[Email] VITE_SUPABASE_FUNCTIONS_URL not configured — skipping email')
      console.log('[DEV MODE] Email notification:', notification)
      return { success: true }
    }

    const response = await fetch(`${edgeFunctionUrl}/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(notification),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('[Email] Failed to send notification:', error)
      return { success: false, error: error.message || 'Failed to send email' }
    }

    const result = await response.json()
    return { success: true, emailId: result.email_id }
  } catch (error) {
    console.error('[Email] Unexpected error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send quote confirmation email
 */
export async function sendQuoteConfirmation(
  customerEmail: string,
  customerName: string,
  quoteId: string,
  total: number
): Promise<{ success: boolean; error?: string }> {
  return sendEmailNotification({
    type: 'quote',
    recipientEmail: customerEmail,
    recipientName: customerName,
    data: {
      quoteId,
      total,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  })
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmation(
  customerEmail: string,
  customerName: string,
  bookingId: string,
  date: string,
  timeSlot: string,
  total: number
): Promise<{ success: boolean; error?: string }> {
  return sendEmailNotification({
    type: 'booking',
    recipientEmail: customerEmail,
    recipientName: customerName,
    data: {
      bookingId,
      date,
      timeSlot,
      total,
    },
  })
}

/**
 * Send cancellation confirmation email
 */
export async function sendCancellationConfirmation(
  customerEmail: string,
  customerName: string,
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmailNotification({
    type: 'cancellation',
    recipientEmail: customerEmail,
    recipientName: customerName,
    data: {
      bookingId,
    },
  })
}

/**
 * Send reminder email (24 hours before booking)
 */
export async function sendBookingReminder(
  customerEmail: string,
  customerName: string,
  bookingId: string,
  date: string,
  timeSlot: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmailNotification({
    type: 'reminder',
    recipientEmail: customerEmail,
    recipientName: customerName,
    data: {
      bookingId,
      date,
      timeSlot,
    },
  })
}

/**
 * Database-triggered email (via Supabase webhook)
 * This is called automatically when a new quote is inserted
 */
export async function triggerQuoteWebhook(
  quoteId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // The webhook is triggered automatically by Supabase
    // No need to call the Edge Function directly from the frontend
    console.log(`[Email] Quote webhook triggered for: ${quoteId}`)
    return { success: true }
  } catch (error) {
    console.error('[Email] Webhook trigger failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
