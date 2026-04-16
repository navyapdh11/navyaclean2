import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Sparkles, Zap, Shield, Leaf, Clock, Star, Phone,
  User, Sun, Moon,
} from 'lucide-react'

// Local imports
import { quoteSchema, defaultValues, type QuoteForm } from './lib/schema'
import { formatPrice, PET_SURCHARGE, URGENT_MULTIPLIER } from './lib/pricing'
import { SERVICES_LIST, FAQS, TRUST_BADGES, PHONE_DISPLAY, PHONE_LINK, EMAIL_DISPLAY, EMAIL_LINK } from './lib/constants'
import { submitQuoteRequest } from './lib/api'
import { useQuoteCalculator } from './hooks/useQuoteCalculator'
import { useTheme } from './hooks/useTheme'
import ServiceCard from './components/ServiceCard'
import FaqItem from './components/FaqItem'
import TrustBadge from './components/TrustBadge'
import BookingConfirmation from './components/BookingConfirmation'

// ─── Main App ─────────────────────────────────────────────────
export default function App() {
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [quoteId, setQuoteId] = useState<string | undefined>()
  const [customerId, setCustomerId] = useState<string | undefined>()
  const { theme, toggleTheme } = useTheme()

  const { register, handleSubmit, control, formState: { errors }, reset, setValue, watch } = useForm<QuoteForm>({
    resolver: zodResolver(quoteSchema),
    defaultValues,
    mode: 'onBlur',
  })

  // Reactive quote calculation with type-safe hook
  const liveQuote = useQuoteCalculator(control)
  const priceBreakdown = useMemo(() => formatPrice(liveQuote), [liveQuote])

  const serviceValues = watch('services')

  const onSubmit = useCallback(async (data: QuoteForm) => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const response = await submitQuoteRequest(data, liveQuote)
      if (!response.success) {
        throw new Error(response.message || 'Submission failed')
      }
      setQuoteId(response.quoteId)
      setCustomerId(response.customerId)
      setSubmitted(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [liveQuote])

  const handleReset = useCallback(() => {
    setSubmitted(false)
    setSubmitError(null)
    setQuoteId(undefined)
    setCustomerId(undefined)
    reset(defaultValues)
  }, [reset])

  const toggleFaq = useCallback((index: number) => {
    setOpenFaq(prev => prev === index ? null : index)
  }, [])

  const fadeInUp = useMemo(() => ({
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  }), [])

  return (
    <div className="min-h-screen">
      {/* Skip Navigation */}
      <a
        href="#quote-builder"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-neon-blue focus:text-black focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to quote builder
      </a>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 glass-panel p-3 hover:glass-glow transition-all"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Hero Section */}
      <motion.header
        className="relative overflow-hidden px-4 pt-16 pb-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-neon-blue/10 via-transparent to-transparent" />
        <motion.h1
          className="relative text-4xl sm:text-5xl md:text-7xl font-black mb-4 text-gradient"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          ✨ SparkleClean Pro
        </motion.h1>
        <motion.p
          className="relative text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-8"
          {...fadeInUp}
        >
          Premium 3D Quote Builder — Transparent Pricing, Instant Results
        </motion.p>
        <motion.div
          className="relative flex flex-wrap justify-center gap-4 text-sm"
          {...fadeInUp}
        >
          <span className="glass-panel px-4 py-2 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" aria-hidden="true" /> 4.9★ Rating
          </span>
          <span className="glass-panel px-4 py-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-neon-green" aria-hidden="true" /> $20M Insured
          </span>
          <span className="glass-panel px-4 py-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-neon-blue" aria-hidden="true" /> Same Day Available
          </span>
        </motion.div>
      </motion.header>

      {/* Services Showcase */}
      <section className="px-4 py-12 max-w-6xl mx-auto" aria-label="Our cleaning services">
        <motion.h2
          className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gradient"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          🧼 Our Services
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4" role="list">
          {SERVICES_LIST.map((service, i) => (
            <motion.div
              key={service.id}
              className="glass-panel p-5 text-center hover:glass-glow cursor-pointer transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              role="listitem"
            >
              <div className="text-4xl mb-3" aria-hidden="true">{service.icon}</div>
              <h3 className="font-bold text-sm mb-1" style={{ color: service.color }}>{service.name}</h3>
              <p className="text-xs text-white/70">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3D Quote Builder Form */}
      <section className="px-4 py-12 max-w-4xl mx-auto" id="quote-builder" aria-label="Quote builder">
        <motion.div
          className="glass-panel p-6 md:p-8 glow-border"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gradient flex items-center gap-3">
            <Sparkles className="w-8 h-8" aria-hidden="true" /> 3D Quote Builder
          </h2>
          <p className="text-white/70 mb-8">Customize your cleaning package — price updates in real-time. All prices include GST.</p>

          <AnimatePresence mode="wait">
            {submitted ? (
              <BookingConfirmation
                key="confirmation"
                quoteId={quoteId}
                customerId={customerId}
                total={priceBreakdown.total}
                gst={priceBreakdown.gst}
                subtotal={priceBreakdown.subtotal}
                customerName={watch('name') || 'Customer'}
                customerEmail={watch('email') || 'your email'}
                onReset={handleReset}
              />
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
                aria-label="Cleaning quote request form"
                noValidate
              >
                {/* Contact Information */}
                <fieldset className="space-y-4">
                  <legend className="text-neon-blue text-sm font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" aria-hidden="true" /> Contact Information
                  </legend>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-neon-blue text-sm font-semibold mb-2">Full Name *</label>
                      <input
                        id="name"
                        type="text"
                        {...register('name')}
                        className="glass-input w-full p-3"
                        placeholder="John Smith"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                      />
                      {errors.name && (
                        <p id="name-error" className="text-red-400 text-xs mt-1" role="alert">{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-neon-blue text-sm font-semibold mb-2">Email *</label>
                      <input
                        id="email"
                        type="email"
                        {...register('email')}
                        className="glass-input w-full p-3"
                        placeholder="john@example.com"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                      {errors.email && (
                        <p id="email-error" className="text-red-400 text-xs mt-1" role="alert">{errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-neon-blue text-sm font-semibold mb-2">Phone *</label>
                      <input
                        id="phone"
                        type="tel"
                        {...register('phone')}
                        className="glass-input w-full p-3"
                        placeholder="04XX XXX XXX"
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                      />
                      {errors.phone && (
                        <p id="phone-error" className="text-red-400 text-xs mt-1" role="alert">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>
                </fieldset>

                {/* Property Type & Area */}
                <fieldset className="grid md:grid-cols-2 gap-4">
                  <legend className="sr-only">Property details</legend>
                  <div>
                    <label htmlFor="propertyType" className="block text-neon-blue text-sm font-semibold mb-2">Property Type</label>
                    <select
                      id="propertyType"
                      {...register('propertyType')}
                      className="glass-input w-full p-3"
                      aria-describedby="property-desc"
                    >
                      <option value="house">🏠 House</option>
                      <option value="apartment">🏢 Apartment</option>
                      <option value="office">💼 Office</option>
                      <option value="commercial">🏭 Commercial</option>
                    </select>
                    <span id="property-desc" className="sr-only">Select your property type for accurate pricing</span>
                  </div>
                  <div>
                    <label htmlFor="area" className="block text-neon-blue text-sm font-semibold mb-2">Area (sqm)</label>
                    <Controller
                      name="area"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <input
                            id="area"
                            type="range"
                            min="10"
                            max="5000"
                            step="10"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="w-full accent-neon-blue"
                            aria-valuemin={10}
                            aria-valuemax={5000}
                            aria-valuenow={field.value}
                            aria-valuetext={`${field.value} square meters`}
                          />
                          <div className="text-center text-neon-blue font-mono text-lg" aria-hidden="true">{field.value.toLocaleString()} m²</div>
                        </div>
                      )}
                    />
                  </div>
                </fieldset>

                {/* Bedrooms & Bathrooms */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neon-purple text-sm font-semibold mb-2">Bedrooms</label>
                    <Controller
                      name="bedrooms"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => field.onChange(Math.max(0, field.value - 1))}
                            className="glass-input w-10 h-10 flex items-center justify-center"
                            aria-label="Decrease bedroom count"
                          >−</button>
                          <span className="text-2xl font-bold w-8 text-center" aria-label={`${field.value} bedrooms`}>{field.value}</span>
                          <button
                            type="button"
                            onClick={() => field.onChange(Math.min(10, field.value + 1))}
                            className="glass-input w-10 h-10 flex items-center justify-center"
                            aria-label="Increase bedroom count"
                          >+</button>
                        </div>
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-neon-purple text-sm font-semibold mb-2">Bathrooms</label>
                    <Controller
                      name="bathrooms"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => field.onChange(Math.max(0, field.value - 1))}
                            className="glass-input w-10 h-10 flex items-center justify-center"
                            aria-label="Decrease bathroom count"
                          >−</button>
                          <span className="text-2xl font-bold w-8 text-center" aria-label={`${field.value} bathrooms`}>{field.value}</span>
                          <button
                            type="button"
                            onClick={() => field.onChange(Math.min(10, field.value + 1))}
                            className="glass-input w-10 h-10 flex items-center justify-center"
                            aria-label="Increase bathroom count"
                          >+</button>
                        </div>
                      )}
                    />
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <label htmlFor="frequency" className="block text-neon-pink text-sm font-semibold mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" aria-hidden="true" /> Cleaning Frequency
                  </label>
                  <select id="frequency" {...register('frequency')} className="glass-input w-full p-3">
                    <option value="one-time">One-Time (Full Price)</option>
                    <option value="weekly">Weekly (25% OFF) ⭐ Best Value</option>
                    <option value="fortnightly">Fortnightly (15% OFF)</option>
                    <option value="monthly">Monthly (10% OFF)</option>
                  </select>
                </div>

                {/* Services */}
                <fieldset>
                  <legend className="block text-neon-pink text-sm font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" aria-hidden="true" /> Select Services *
                  </legend>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3" role="group" aria-label="Cleaning services">
                    {SERVICES_LIST.map((service) => {
                      const isSelected = serviceValues?.includes(service.id) ?? false
                      return (
                        <ServiceCard
                          key={service.id}
                          service={service}
                          isSelected={isSelected}
                          onToggle={() => {
                            const current = serviceValues ?? []
                            const updated = isSelected
                              ? current.filter((s) => s !== service.id)
                              : [...current, service.id]
                            setValue('services', updated, { shouldValidate: true, shouldDirty: true })
                          }}
                        />
                      )
                    })}
                  </div>
                  {errors.services && (
                    <p className="text-red-400 text-xs mt-1" role="alert">{errors.services.message}</p>
                  )}
                </fieldset>

                {/* Add-ons */}
                <fieldset>
                  <legend className="sr-only">Additional options</legend>
                  <div className="flex flex-wrap gap-3" role="group" aria-label="Add-on options">
                    <label className="flex items-center gap-2 p-3 glass-input cursor-pointer hover:glass-glow transition-all">
                      <Controller
                        name="pets"
                        control={control}
                        render={({ field }) => (
                          <input type="checkbox" checked={field.value} onChange={field.onChange} className="w-4 h-4 neon-checkbox" aria-label="Pet friendly products surcharge" />
                        )}
                      />
                      <span className="text-sm">🐾 Pet Friendly +${PET_SURCHARGE}</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 glass-input cursor-pointer hover:glass-glow transition-all">
                      <Controller
                        name="ecoFriendly"
                        control={control}
                        render={({ field }) => (
                          <input type="checkbox" checked={field.value} onChange={field.onChange} className="w-4 h-4 neon-checkbox" aria-label="Eco-friendly cleaning products" />
                        )}
                      />
                      <Leaf className="w-4 h-4 text-neon-green" aria-hidden="true" />
                      <span className="text-sm">Eco-Friendly +15%</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 glass-input cursor-pointer hover:glass-glow transition-all">
                      <Controller
                        name="urgent"
                        control={control}
                        render={({ field }) => (
                          <input type="checkbox" checked={field.value} onChange={field.onChange} className="w-4 h-4 neon-checkbox" aria-label="Urgent same-day service" />
                        )}
                      />
                      <Zap className="w-4 h-4 text-yellow-400" aria-hidden="true" />
                      <span className="text-sm">Urgent x{URGENT_MULTIPLIER}</span>
                    </label>
                  </div>
                </fieldset>

                {/* Live Quote Preview */}
                <motion.div
                  className="glass-panel p-6 text-center glow-border"
                  animate={{
                    boxShadow: [
                      '0 0 5px rgba(0, 240, 255, 0.2)',
                      '0 0 20px rgba(0, 240, 255, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)',
                      '0 0 5px rgba(0, 240, 255, 0.2)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  role="status"
                  aria-live="polite"
                  aria-label={`Estimated quote: ${priceBreakdown.total}, includes GST`}
                >
                  <div className="text-4xl sm:text-5xl font-black text-gradient mb-1">
                    {priceBreakdown.total}
                  </div>
                  <p className="text-cyan-300 text-sm">Live Quote — Updates Instantly · Inc. GST</p>
                  <p className="text-white/50 text-xs mt-1">
                    Subtotal: {priceBreakdown.subtotal} · GST: {priceBreakdown.gst}
                  </p>
                </motion.div>

                {/* Submission error */}
                {submitError && (
                  <div className="glass-panel p-4 border-red-400/30 text-center" role="alert">
                    <p className="text-red-400 text-sm">Error: {submitError}</p>
                  </div>
                )}

                {/* Legal consent */}
                <p className="text-white/50 text-xs text-center">
                  By submitting, you agree to our{' '}
                  <a href="#terms" className="text-neon-blue underline hover:text-neon-purple transition-colors">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#privacy" className="text-neon-blue underline hover:text-neon-purple transition-colors">Privacy Policy</a>.
                  This is an estimate, not a binding contract. Final price may vary based on on-site assessment.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full glass-button-neon py-4 text-lg font-bold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" aria-hidden="true" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" aria-hidden="true" />
                      Get Your Instant Quote
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Trust Badges */}
      <section className="px-4 py-12 max-w-4xl mx-auto" aria-label="Why choose us">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRUST_BADGES.map((badge, i) => (
            <TrustBadge key={badge.title} {...badge} index={i} />
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-12 max-w-3xl mx-auto" aria-label="Frequently asked questions">
        <motion.h2
          className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gradient"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          ❓ Frequently Asked Questions
        </motion.h2>
        <div className="space-y-3" role="list">
          {FAQS.map((faq, i) => (
            <div key={faq.q} role="listitem">
              <FaqItem
                question={faq.q}
                answer={faq.a}
                index={i}
                isOpen={openFaq === i}
                onToggle={() => toggleFaq(i)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 text-center" aria-label="Call to action">
        <motion.div
          className="max-w-2xl mx-auto glass-panel p-10 glow-border"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gradient">Ready for a Spotless Space?</h2>
          <p className="text-white/70 mb-6">Book now and get 25% off your first weekly clean. No lock-in contracts. All prices include GST.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={PHONE_LINK}
              className="glass-button-neon px-8 py-3 flex items-center justify-center gap-2"
              aria-label={`Call us at ${PHONE_DISPLAY}`}
            >
              <Phone className="w-5 h-5" aria-hidden="true" /> Call {PHONE_DISPLAY}
            </a>
            <a
              href={EMAIL_LINK}
              className="glass-button-neon px-8 py-3 flex items-center justify-center gap-2"
              aria-label={`Email us at ${EMAIL_DISPLAY}`}
              style={{ borderColor: 'rgba(0, 204, 125, 0.3)' }}
            >
              <Leaf className="w-5 h-5" aria-hidden="true" /> {EMAIL_DISPLAY}
            </a>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="glass-button-neon px-8 py-3"
              style={{ borderColor: 'rgba(139, 92, 246, 0.3)' }}
              aria-label="Scroll back to top to get a quote"
            >
              Get Quote ↑
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 text-center text-white/70 text-sm border-t border-white/10">
        <p>© 2026 SparkleClean Pro. All rights reserved. | ABN 12 345 678 901</p>
        <p className="mt-1">Sydney, NSW | <a href={EMAIL_LINK} className="text-neon-blue hover:underline">{EMAIL_DISPLAY}</a> | <a href={PHONE_LINK} className="text-neon-blue hover:underline">{PHONE_DISPLAY}</a></p>
        <div className="mt-3 flex justify-center gap-4 text-xs text-white/50">
          <a href="#terms" className="hover:text-neon-blue transition-colors">Terms of Service</a>
          <a href="#privacy" className="hover:text-neon-blue transition-colors">Privacy Policy</a>
          <a href="#sitemap" className="hover:text-neon-blue transition-colors">Sitemap</a>
        </div>
      </footer>
    </div>
  )
}
