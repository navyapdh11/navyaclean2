// Dynamic Service + City Page — /service/:slug/:state/:city
// Local SEO page with city-specific content and pricing

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Check, ArrowLeft, MapPin, Clock, Shield, Users } from 'lucide-react'
import { getServiceBySlug, type ServiceDefinition, type AustralianState, STATE_CONFIG } from '../lib/services-au'
import { getFAQsByService } from '../lib/faqs'
import { getCityBySlug, type CityEntry } from '../lib/cities-au'
import AdvancedPriceCalculator from '../components/calculator/AdvancedPriceCalculator'
import FAQSection from '../components/content/FAQSection'
import ComplianceFooter from '../components/compliance/ComplianceFooter'
import SEO from '../components/SEO'

export default function ServiceCityPage() {
  const params = useParams<{ slug: string; state: string; city: string }>()
  const slug = params.slug || ''
  const state = (params.state as AustralianState) || 'NSW'
  const citySlug = params.city || ''

  const [service, setService] = useState<ServiceDefinition | null>(null)
  const [city, setCity] = useState<CityEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const faqs = service ? getFAQsByService(service.slug, state) : []

  useEffect(() => {
    setLoading(true)
    const foundService = getServiceBySlug(slug)
    const foundCity = getCityBySlug(citySlug)
    setService(foundService || null)
    setCity(foundCity || null)
    setLoading(false)
  }, [slug, citySlug])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    )
  }

  if (!service || !city) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-6xl font-black text-gradient mb-4">404</h1>
          <p className="text-xl text-white/70 mb-6">Service or city not found</p>
          <Link to="/services" className="glass-button-neon px-6 py-3">Back to Services</Link>
        </div>
      </div>
    )
  }

  const stateMultiplier = service.states[state]?.multiplier ?? 1.0
  const cityMultiplier = city.avgPriceMultiplier ?? 1.0
  const basePrice = Math.round(service.basePrice.min * stateMultiplier * cityMultiplier)

  return (
    <>
      {/* SEO */}
      <SEO
        title={`${service.name} in ${city.name}, ${state} | SparkleClean Pro`}
        description={`Professional ${service.name.toLowerCase()} in ${city.name}, ${state}. From $${basePrice} AUD. Serving ${city.name} and ${city.suburbs.length}+ surrounding suburbs. Book online!`}
        url={`/service/${slug}/${state.toLowerCase()}/${city.slug}`}
        service={service}
        state={state}
        city={city.name}
        faqs={faqs}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Services', url: '/services' },
          { name: service.name, url: `/service/${slug}/${state}` },
          { name: city.name, url: `/service/${slug}/${state.toLowerCase()}/${city.slug}` },
        ]}
      />

      {/* Breadcrumbs */}
      <nav className="max-w-6xl mx-auto px-4 pt-8 text-sm text-white/50" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 flex-wrap">
          <li><Link to="/" className="hover:text-white">Home</Link></li>
          <li>/</li>
          <li><Link to="/services" className="hover:text-white">Services</Link></li>
          <li>/</li>
          <li><Link to={`/service/${slug}/${state}`} className="hover:text-white">{service.name}</Link></li>
          <li>/</li>
          <li className="text-white">{city.name}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <Link to={`/service/${slug}/${state}`} className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-4">
                <ArrowLeft className="w-4 h-4" /> Back to {state}
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl">{service.icon}</span>
                <h1 className="text-4xl sm:text-5xl font-black text-gradient">{service.name}</h1>
              </div>
              <p className="text-xl text-white/70 mb-4">
                in <span className="text-neon-blue font-bold">{city.name}</span>, {state}
              </p>
              <p className="text-white/60">{service.description}</p>
            </div>

            {/* Local Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-panel p-4 text-center">
                <div className="text-3xl font-bold text-neon-blue">${basePrice}</div>
                <div className="text-xs text-white/50">From Price</div>
              </div>
              <div className="glass-panel p-4 text-center">
                <div className="text-3xl font-bold text-neon-green flex items-center justify-center gap-1">
                  <Users className="w-5 h-5" /> {city.suburbs.length}+
                </div>
                <div className="text-xs text-white/50">Suburbs Covered</div>
              </div>
              <div className="glass-panel p-4 text-center">
                <div className="text-3xl font-bold text-neon-purple">2-4hr</div>
                <div className="text-xs text-white/50">Response Time</div>
              </div>
            </div>

            {/* Suburbs Covered */}
            <div className="glass-panel p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-neon-blue" />
                Areas We Cover in {city.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {city.suburbs.map((suburb) => (
                  <span key={suburb} className="px-3 py-1.5 glass-input text-sm rounded-full">
                    {suburb}
                  </span>
                ))}
              </div>
            </div>

            {/* What's Included */}
            <div className="glass-panel p-6">
              <h3 className="font-bold mb-4">What's Included</h3>
              <ul className="grid sm:grid-cols-2 gap-3">
                {service.includedFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Local Compliance */}
            <div className="glass-panel p-6 border-l-4 border-neon-blue">
              <h3 className="font-bold mb-2">{state} Compliance</h3>
              <ul className="space-y-2 text-sm text-white/70">
                {STATE_CONFIG[state].whsAct && <li>• {STATE_CONFIG[state].whsAct}</li>}
                {service.category === 'residential' && STATE_CONFIG[state].tenancyAct && (
                  <li>• {STATE_CONFIG[state].tenancyAct}</li>
                )}
                {STATE_CONFIG[state].complianceNotes && <li>• {STATE_CONFIG[state].complianceNotes}</li>}
              </ul>
            </div>

            {/* FAQs */}
            <FAQSection serviceSlug={service.slug} state={state} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="glass-panel p-6">
              <h3 className="font-bold mb-4">Service Info</h3>
              <dl className="space-y-3 text-sm">
                {service.duration && (
                  <div>
                    <dt className="text-white/50 flex items-center gap-2"><Clock className="w-4 h-4" /> Duration</dt>
                    <dd className="text-white font-medium">{service.duration}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-white/50">Price Range</dt>
                  <dd className="text-white font-medium">
                    ${basePrice} — ${Math.round(service.basePrice.max * stateMultiplier * cityMultiplier)} AUD
                  </dd>
                </div>
                <div>
                  <dt className="text-white/50">Postcode</dt>
                  <dd className="text-white font-medium">{city.postcode}</dd>
                </div>
                {service.guarantee && (
                  <div className="flex items-center gap-2 text-sm text-neon-green">
                    <Shield className="w-4 h-4" />
                    {service.guarantee}
                  </div>
                )}
              </dl>
            </div>

            <AdvancedPriceCalculator service={service} defaultState={state} />
          </aside>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="py-16 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gradient">
            Book {service.name} in {city.name}
          </h2>
          <p className="text-lg text-white/70">Get your instant quote and book in 60 seconds</p>
          <Link to="/booking" className="inline-block glass-button-neon px-8 py-4 text-lg font-bold">
            Get Your Free Quote →
          </Link>
        </div>
      </section>

      <ComplianceFooter state={state} service={service} />
    </>
  )
}
