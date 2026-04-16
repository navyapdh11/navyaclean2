// Main App Router — replaces the single-page App.tsx
// Wraps all pages with Header + Footer layout and 3D background

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import CancellationPage from './pages/CancellationPage'

// Keep the original App as the booking page
import QuoteBuilderApp from './App'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <div className="min-h-screen relative">
        <Header />
        <main id="main-content" className="relative z-10">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/cancellation" element={<CancellationPage />} />
              {/* Quote builder keeps original App.tsx at /booking */}
              <Route path="/booking" element={<QuoteBuilderApp />} />
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
    </BrowserRouter>
  )
}
