// Main App Router — replaces the single-page App.tsx
// Wraps all pages with Header + Footer layout and 3D background

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import ServicePage from './pages/ServicePage'
import ServiceCityPage from './pages/ServiceCityPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import CancellationPage from './pages/CancellationPage'
import AdminLayout from './components/admin/AdminLayout'
import AdminRoute from './components/admin/AdminRoute'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminPricing from './pages/admin/AdminPricing'
import AdminPhotos from './pages/admin/AdminPhotos'
import AdminAds from './pages/admin/AdminAds'
import AdminDiscounts from './pages/admin/AdminDiscounts'
import AdminStaff from './pages/admin/AdminStaff'
import AdminWebcam from './pages/admin/AdminWebcam'
import AdminAudit from './pages/admin/AdminAudit'
import AdminSettings from './pages/admin/AdminSettings'
import InstallPrompt from './components/pwa/InstallPrompt'
import { usePWA } from './hooks/usePWA'

// Keep the original App as the booking page
import QuoteBuilderApp from './App'

function AppContent() {
  const { isInstallable, handleInstall, dismissInstall } = usePWA()

  return (
    <>
      <div className="min-h-screen relative">
        <Header />
        <main id="main-content" className="relative z-10">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/service/:slug/:state" element={<ServicePage />} />
              <Route path="/service/:slug/:state/:city" element={<ServiceCityPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/cancellation" element={<CancellationPage />} />
              <Route path="/booking" element={<QuoteBuilderApp />} />

              {/* Admin Login (public) */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Admin Dashboard (protected) */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="pricing" element={<AdminRoute><AdminPricing /></AdminRoute>} />
                <Route path="photos" element={<AdminRoute><AdminPhotos /></AdminRoute>} />
                <Route path="ads" element={<AdminRoute><AdminAds /></AdminRoute>} />
                <Route path="discounts" element={<AdminRoute><AdminDiscounts /></AdminRoute>} />
                <Route path="staff" element={<AdminRoute><AdminStaff /></AdminRoute>} />
                <Route path="webcam" element={<AdminRoute><AdminWebcam /></AdminRoute>} />
                <Route path="audit" element={<AdminRoute><AdminAudit /></AdminRoute>} />
                <Route path="settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
              </Route>

              {/* 404 */}
              <Route path="*" element={
                <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
                  <div>
                    <h1 className="text-6xl font-black text-gradient mb-4">404</h1>
                    <p className="text-xl text-white/70 mb-6">Page not found</p>
                    <a href="/" className="glass-button-neon px-6 py-3">Go Home</a>
                  </div>
                </div>
              } />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>

      {/* PWA Install Prompt */}
      {isInstallable && (
        <InstallPrompt onInstall={handleInstall} onDismiss={dismissInstall} />
      )}
    </>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
