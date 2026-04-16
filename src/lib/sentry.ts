// Sentry Error Tracking Integration
//
// To enable:
// 1. pnpm add @sentry/react @sentry/browser
// 2. Uncomment the import and init below
// 3. Add VITE_SENTRY_DSN to your .env.local
// 4. Call initSentry() in main.tsx
//
// import * as Sentry from '@sentry/react'

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN

export function initSentry() {
  if (!SENTRY_DSN) {
    // console.warn('[Sentry] VITE_SENTRY_DSN not configured — error tracking disabled')
    return
  }

  // Sentry.init({
  //   dsn: SENTRY_DSN,
  //   environment: import.meta.env.MODE,
  //   tracesSampleRate: 0.1,
  //   replaysSessionSampleRate: 0.1,
  //   replaysOnErrorSampleRate: 1.0,
  //   ignoreErrors: [
  //     'chrome-extension://',
  //     'moz-extension://',
  //     'ResizeObserver loop limit exceeded',
  //   ],
  // })
}

export function captureError(_error: Error, _context?: Record<string, unknown>) {
  if (!SENTRY_DSN) return
  // Sentry.captureException(error, { extra: context })
}

export function captureMessage(_message: string, _level: 'info' | 'warning' | 'error' = 'info') {
  if (!SENTRY_DSN) return
  // Sentry.captureMessage(message, { level })
}

export function setUserContext(_userId?: string, _email?: string) {
  if (!SENTRY_DSN) return
  // Sentry.setUser({ id: userId, email })
}

export function clearUserContext() {
  if (!SENTRY_DSN) return
  // Sentry.setUser(null)
}
