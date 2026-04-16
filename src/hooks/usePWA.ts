// PWA Hook — manages install prompt, offline status, and updates
import { useState, useEffect, useCallback } from 'react'

interface PWAState {
  isOnline: boolean
  isInstallable: boolean
  updateAvailable: boolean
  isInstalled: boolean
  promptEvent: BeforeInstallPromptEvent | null
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isOnline: navigator.onLine,
    isInstallable: false,
    updateAvailable: false,
    isInstalled: (window as any).matchMedia('(display-mode: standalone)').matches,
    promptEvent: null,
  })

  // Track online status
  useEffect(() => {
    const handleOnline = () => setState((s) => ({ ...s, isOnline: true }))
    const handleOffline = () => setState((s) => ({ ...s, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Listen for install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setState((s) => ({
        ...s,
        isInstallable: true,
        promptEvent: e as BeforeInstallPromptEvent,
      }))
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Listen for app installed
  useEffect(() => {
    window.addEventListener('appinstalled', () => {
      setState((s) => ({ ...s, isInstalled: true, isInstallable: false }))
    })
  }, [])

  // Listen for service worker updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setState((s) => ({ ...s, updateAvailable: true }))
      })
    }
  }, [])

  // Install app
  const handleInstall = useCallback(async () => {
    if (!state.promptEvent) return

    await state.promptEvent.prompt()
    const choice = await state.promptEvent.userChoice

    setState((s) => ({
      ...s,
      isInstallable: choice.outcome === 'accepted',
      promptEvent: null,
    }))
  }, [state.promptEvent])

  // Dismiss install prompt
  const dismissInstall = useCallback(() => {
    setState((s) => ({ ...s, isInstallable: false }))
  }, [])

  // Register service worker
  const registerSW = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })
        console.log('[PWA] Service Worker registered:', registration.scope)
        return registration
      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error)
      }
    }
  }, [])

  // Update service worker
  const updateSW = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
    }
  }, [])

  return {
    ...state,
    handleInstall,
    dismissInstall,
    registerSW,
    updateSW,
  }
}
