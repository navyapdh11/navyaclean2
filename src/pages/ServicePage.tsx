// Dynamic Service Page — /service/[slug]/[state]
// Shows service details, pricing, FAQs, and booking CTA for a specific service and state

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Check, ArrowLeft, MapPin, Clock, DollarSign, Shield } from 'lucide-react'
import { getServiceBySlug, type ServiceDefinition, type AustralianState, AU_STATES, STATE_CONFIG } from '../lib/services-au'
import { getFAQsByService } from '../lib/faqs'
import AdvancedPriceCalculator from '../components/calculator/AdvancedPriceCalculator'
import FAQSection from '../components/content/FAQSection'
import ComplianceFooter from '../components/compliance/ComplianceFooter'
import SEO from '../components/SEO'

export default function ServicePage() {
  const params = useParams<{ slug: string; state: string }>()
  const slug = params.slug || ''
  const state = (params.state as AustralianState) || 'NSW'

  const [service, setService] = useState<ServiceDefinition | null>(null)
  const [loading, setLoading] = useState(true)
  const faqs = service ? getFAQsByService(service.slug, state) : []

  useEffect(() => {
    setLoading(true)
    const found = getServiceBySlug(slug)
    setService(found || null)
    setLoading(false)
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70">Loading service details...</p>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-6xl font-black text-gradient mb-4">404</h1>
          <p className="text-xl text-white/70 mb-6">Service not found</p>
          <Link to="/services" className="glass-button-neon px-6 py-3">
            Back to Services
          </Link>
        </div>
      </div>
    )
  }

  const stateMultiplier = service.states[state]?.multiplier ?? 1.0
  const statePrice = {
    min: Math.round(service.basePrice.min * stateMultiplier),
    max: Math.round(service.basePrice.max * stateMultiplier),
  }

  return (
    <>
      {/* SEO Structured Data */}
      {service && (
        <SEO
          title={`${service.name} in ${state} | SparkleClean Pro`}
          description={`${service.description} From $${statePrice.min} AUD. Book online with instant quote.`}
          url={`/service/${slug}/${state}`}
          image={`/og/services/${service.slug}.jpg`}
          type="service"
          service={service}
          state={state}
          faqs={faqs}
          breadcrumbs={[
            { name: 'Home', url: '/' },
            { name: 'Services', url: '/services' },
            { name: service.name, url: `/service/${slug}/${state}` },
          ]}
        />
      )}

      {/* Breadcrumbs */}
      <nav className="max-w-6xl mx-auto px-4 pt-8 text-sm text-white/50" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
          <li>/</li>
          <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
          <li>/</li>
          <li className="text-white" aria-current="page">{service.name} - {state}</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <Link to="/services" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                Back to Services
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl" aria-hidden="true">{service.icon}</span>
                <h1 className="text-4xl sm:text-5xl font-black text-gradient">
                  {service.name}
                </h1>
              </div>
              <p className="text-lg text-white/70">{service.description}</p>

              {/* State Selector */}
              <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Select state">
                {AU_STATES.map((s: AustralianState) => (
                  <Link
                    key={s}
                    to={`/service/${slug}/${s}`}
                    className={`px-3 py-1.5 text-sm font-bold rounded transition-all ${
                      state === s
                        ? 'bg-neon-blue text-black'
                        : 'glass-input text-white/70 hover:text-white'
                    }`}
                    role="radio"
                    aria-checked={state === s}
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </div>

            {/* Price Info */}
            <div className="glass-panel p-6 space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-neon-green" aria-hidden="true" />
                Pricing for {state}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white/50">Price Range</p>
                  <p className="text-2xl font-bold text-neon-green">
                    ${statePrice.min} — ${statePrice.max} AUD
                  </p>
                  <p className="text-xs text-white/40 mt-1">Includes GST</p>
                </div>
                <div>
                  <p className="text-sm text-white/50">State Rate</p>
                  <p className="text-2xl font-bold text-neon-blue">
                    ×{stateMultiplier}
                  </p>
                  <p className="text-xs text-white/40 mt-1">{state} multiplier applied</p>
                </div>
              </div>
              {service.guarantee && (
                <div className="flex items-center gap-2 text-sm text-neon-green bg-neon-green/10 px-4 py-2 rounded">
                  <Shield className="w-4 h-4" aria-hidden="true" />
                  {service.guarantee}
                </div>
              )}
            </div>

            {/* What's Included */}
            <div className="glass-panel p-6">
              <h2 className="text-xl font-bold mb-4">What's Included</h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {service.includedFeatures.map((feature: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* State Compliance */}
            {STATE_CONFIG[state] && (
              <div className="glass-panel p-6 border-l-4 border-neon-blue">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-neon-blue" aria-hidden="true" />
                  {state} Compliance
                </h3>
                <ul className="space-y-2 text-sm text-white/70">
                  {STATE_CONFIG[state].whsAct && (
                    <li>• {STATE_CONFIG[state].whsAct}</li>
                  )}
                  {service.category === 'residential' && STATE_CONFIG[state].tenancyAct && (
                    <li>• {STATE_CONFIG[state].tenancyAct} compliant</li>
                  )}
                  {STATE_CONFIG[state].complianceNotes && (
                    <li>• {STATE_CONFIG[state].complianceNotes}</li>
                  )}
                </ul>
              </div>
            )}

            {/* Certifications */}
            {service.certifications && service.certifications.length > 0 && (
              <div className="glass-panel p-6">
                <h3 className="font-bold mb-4">Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {service.certifications.map((cert: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-neon-purple/20 border border-neon-purple/40 text-neon-purple text-sm rounded-full"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs */}
            <FAQSection serviceSlug={service.slug} state={state} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Service Info Card */}
            <div className="glass-panel p-6">
              <h3 className="font-bold text-lg mb-4">Service Info</h3>
              <dl className="space-y-3 text-sm">
                {service.duration && (
                  <div>
                    <dt className="text-white/50 flex items-center gap-2">
                      <Clock className="w-4 h-4" aria-hidden="true" />
                      Duration
                    </dt>
                    <dd className="font-medium text-white">{service.duration}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-white/50">Category</dt>
                  <dd className="font-medium text-white capitalize">{service.category}</dd>
                </div>
                <div>
                  <dt className="text-white/50">Pricing Model</dt>
                  <dd className="font-medium text-white capitalize">
                    {service.pricingModel ? service.pricingModel.replace(/_/g, ' / ') : 'Custom'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Price Calculator */}
            <AdvancedPriceCalculator service={service} defaultState={state} />
          </aside>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="py-16 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gradient">
            Ready to Book {service.name}?
          </h2>
          <p className="text-lg text-white/70">
            Get your instant quote and book in 60 seconds
          </p>
          <Link
            to="/booking"
            className="inline-block glass-button-neon px-8 py-4 text-lg font-bold"
          >
            Get Your Free Quote →
          </Link>
        </div>
      </section>

      {/* Compliance Footer */}
      <ComplianceFooter
        state={state}
        service={service}
        businessDetails={{
          abn: '12 345 678 901',
          insurance: 'Public Liability $20M',
          whs: true,
        }}
      />
    </>
  )
}
