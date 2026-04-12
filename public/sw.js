// Service Worker for PWA offline support
// This is a minimal service worker with cache-first strategy for static assets

const CACHE_NAME = 'sparkleclean-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
]

// Install event: cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Some assets may not be available yet; skip them
      })
    })
  )
  self.skipWaiting()
})

// Activate event: clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// Fetch event: network-first for HTML, cache-first for static assets
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event

  // HTML pages: network first, fall back to cache
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse)
          })
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Static assets: cache first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse
      return fetch(request).then((response) => {
        const clonedResponse = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, clonedResponse)
        })
        return response
      })
    }).catch(() => {
      // Offline fallback could return a custom offline page
      return new Response('Offline — please check your connection', {
        status: 503,
        statusText: 'Service Unavailable',
      })
    })
  )
})
