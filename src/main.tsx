import { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary'
import AppRouter from './AppRouter'
import './index.css'

// Register Service Worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('[PWA] Service Worker registered:', registration.scope)
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error)
      })
  })
}

// Lazy-load 3D scene only if user has no prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <div className="relative min-h-screen">
      {/* 3D Background — only render if user hasn't requested reduced motion */}
      {!prefersReducedMotion && <LazyScene3D />}

      {/* Main Content with Router */}
      <div className="relative z-10">
        <AppRouter />
      </div>
    </div>
  </ErrorBoundary>
)

// Lazy wrapper that dynamically imports Three.js
function LazyScene3D() {
  // Use dynamic import to lazy-load Three.js scene
  // This defers 1.1MB of JS until after initial paint
  const LazyScene = lazy(() => import('./components/Scene3DLoader'))
  return (
    <Suspense fallback={null}>
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none" aria-hidden="true">
        <LazyScene />
      </div>
    </Suspense>
  )
}
