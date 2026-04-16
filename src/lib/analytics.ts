// Plausible Privacy-First Analytics Integration
//
// Plausible does NOT use cookies, does NOT track individuals, and is fully GDPR/Privacy Act compliant.
//
// Setup:
// 1. Sign up at https://plausible.io
// 2. Add your domain (sparkleclean.pro)
// 3. Set VITE_PLAUSIBLE_DOMAIN in .env.local
// 4. The script is injected via index.html (see below)
//
// No cookies, no localStorage, no fingerprinting. 100% privacy-first.

const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN

/**
 * Track a custom event (e.g., quote_submitted, booking_started)
 * Plausible custom events require data-domain and data-name attributes
 */
export function trackEvent(name: string, props?: Record<string, string | number | boolean>) {
  if (!PLAUSIBLE_DOMAIN) {
    console.debug('[Plausible] Not configured — event tracked to console:', name)
    console.debug('[Plausible] Event props:', props)
    return
  }

  // Plausible custom event API
  const event = new CustomEvent('plausible', { detail: { name, props } })
  window.dispatchEvent(event)
}

/**
 * Track quote funnel steps
 */
export const trackQuoteFunnel = {
  /** User landed on booking page */
  started: () => trackEvent('quote_funnel_started'),
  /** User selected services */
  selectedServices: (count: number) => trackEvent('quote_services_selected', { count }),
  /** User adjusted property details */
  adjustedProperty: () => trackEvent('quote_property_adjusted'),
  /** User submitted quote */
  submitted: (total: number) => trackEvent('quote_submitted', { total }),
  /** Quote submission failed */
  failed: (reason: string) => trackEvent('quote_failed', { reason }),
}

/**
 * Track booking funnel steps
 */
export const trackBookingFunnel = {
  started: () => trackEvent('booking_funnel_started'),
  stepCompleted: (step: number, totalSteps: number) => 
    trackEvent('booking_step_completed', { step, totalSteps }),
  completed: (bookingId: string) => trackEvent('booking_completed', { bookingId }),
  paymentStarted: () => trackEvent('payment_started'),
  paymentCompleted: () => trackEvent('payment_completed'),
}

/**
 * Outbound link click tracking
 */
export function trackOutbound(url: string, label?: string) {
  trackEvent('outbound_click', { url, label: label || url })
}

/**
 * 404 page tracking
 */
export function track404(path: string) {
  trackEvent('404', { path })
}
