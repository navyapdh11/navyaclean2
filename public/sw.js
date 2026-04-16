// Service Worker for SparkleClean Pro PWA
// Implements caching strategy for offline support

const CACHE_NAME = 'sparkleclean-v1'
const OFFLINE_CACHE = 'sparkleclean-offline-v1'

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

// Network timeout for fetch requests
const NETWORK_TIMEOUT = 5000

// Install event — cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate event — clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== OFFLINE_CACHE)
          .map((name) => caches.delete(name))
      )
    )
  )
  self.clients.claim()
})

// Fetch event — network-first for API, cache-first for static
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event
  const url = new URL(request.url)

  // API requests — network-first with timeout
  if (url.pathname.startsWith('/api/') || url.pathname.includes('supabase')) {
    event.respondWith(networkFirst(request))
    return
  }

  // Navigation requests — network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(navigateFirst(request))
    return
  }

  // Static assets — cache-first
  event.respondWith(cacheFirst(request))
})

// Cache-first strategy
async function cacheFirst(request: Request): Promise<Response> {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    return new Response('Resource not available', { status: 404 })
  }
}

// Network-first strategy with timeout
async function networkFirst(request: Request): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), NETWORK_TIMEOUT)

  try {
    const response = await fetch(request, { signal: controller.signal })
    clearTimeout(timeout)
    return response
  } catch (error) {
    clearTimeout(timeout)
    // Try cache as fallback
    const cached = await caches.match(request)
    if (cached) return cached
    throw error
  }
}

// Navigation-first with offline fallback
async function navigateFirst(request: Request): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), NETWORK_TIMEOUT)

  try {
    const response = await fetch(request, { signal: controller.signal })
    clearTimeout(timeout)

    // Cache successful navigation
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    clearTimeout(timeout)

    // Return offline page as fallback
    const offlinePage = await caches.match('/offline.html')
    if (offlinePage) return offlinePage

    return new Response('You are offline. Please check your internet connection.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    })
  }
}

// Push notification handler
self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() || {}

  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: data.url || '/',
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'SparkleClean Pro', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event: NotificationClickEvent) => {
  event.notification.close()

  if (event.action === 'view') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((windowClients) => {
        const url = event.notification.data
        const client = windowClients.find((c) => c.url === url)
        if (client) {
          return client.focus()
        }
        return clients.openWindow(url)
      })
    )
  }
})

// Background sync for offline quote submissions
self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'sync-quotes') {
    event.waitUntil(syncPendingQuotes())
  }
})

async function syncPendingQuotes(): Promise<void> {
  // Sync any quotes that were saved while offline
  try {
    const response = await fetch('/api/quotes/sync')
    if (response.ok) {
      console.log('[SW] Offline quotes synced successfully')
    }
  } catch (error) {
    console.error('[SW] Failed to sync offline quotes:', error)
  }
}

// Message handler for communication with main app
self.addEventListener('message', (event: MessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Export for TypeScript
export {}
