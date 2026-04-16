// PostHog Analytics Service
import posthog from 'posthog-js'

export function initAnalytics() {
  const apiKey = import.meta.env.VITE_POSTHOG_API_KEY
  const host = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com'

  if (!apiKey) {
    console.warn('[Analytics] PostHog API key not configured')
    return
  }

  posthog.init(apiKey, {
    api_host: host,
    autocapture: true,
    capture_pageview: true,
    persistence: 'localStorage',
    loaded: (posthog) => {
      if (import.meta.env.DEV) posthog.debug()
    },
  })
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  posthog.identify(userId, properties)
}

export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  posthog.capture(eventName, properties)
}

export function isFeatureEnabled(flag: string): boolean {
  return posthog.isFeatureEnabled(flag) || false
}

export { posthog }
