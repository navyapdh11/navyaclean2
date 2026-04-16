// Dynamic Service Page — /service/[slug]/[state]
// Shows service details, live pricing, addons, process steps, testimonials, tips, and booking flow

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Check, ArrowLeft, MapPin, Clock, DollarSign, Shield, Star, ChevronDown, ChevronUp, Calendar, Phone, Sparkles, Info } from 'lucide-react'
import { getServiceBySlug, type ServiceDefinition, type AustralianState, AU_STATES, STATE_CONFIG, cleaningServices } from '../lib/services-au'
import { getFAQsByService } from '../lib/faqs'
import { calculateAUPrice } from '../lib/pricing'
import {
  getAddonsForService,
  getTestimonialsForService,
  getTipsForService,
  getPricingNotesForService,
  SERVICE_PROCESS,
  ADDON_DEFINITIONS,
} from '../lib/service-content'
import FAQSection from '../components/content/FAQSection'
import ComplianceFooter from '../components/compliance/ComplianceFooter'
import SEO from '../components/SEO'

// Service slug aliases
const SERVICE_ALIASES: Record<string, string> = {
  'standard': 'domestic', 'regular': 'domestic', 'house': 'domestic', 'home': 'domestic', 'residential': 'domestic',
  'bond': 'end-of-lease', 'bond-clean': 'end-of-lease', 'bondclean': 'end-of-lease', 'endoflease': 'end-of-lease', 'end-of-lease-clean': 'end-of-lease',
  'deep': 'deep-clean', 'deepclean': 'deep-clean', 'deep-cleaning': 'deep-clean',
  'move': 'move-in-out', 'movein': 'move-in-out', 'move-out': 'move-in-out', 'move-in': 'move-in-out',
  'office-clean': 'office', 'office-cleaning': 'office',
  'retail-clean': 'retail', 'retail-cleaning': 'retail',
  'carpet-clean': 'carpet', 'carpet-cleaning': 'carpet',
  'window-clean': 'window', 'window-cleaning': 'window',
  'pressure-wash': 'pressure', 'pressure-washing': 'pressure', 'pressure-clean': 'pressure',
}

// ──────────────────────────────────────────────────────────────
// Collapsible Section Component
// ──────────────────────────────────────────────────────────────

function CollapsibleSection({ title, icon: Icon, children, defaultOpen = false }: { title: string; icon?: React.ElementType; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="glass-panel">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-neon-blue" />}
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-white/40" /> : <ChevronDown className="w-5 h-5 text-white/40" />}
      </button>
      {open && <div className="p-5 pt-0 border-t border-white/5">{children}</div>}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// Main ServicePage
// ──────────────────────────────────────────────────────────────

export default function ServicePage() {
  const params = useParams<{ slug: string; state: string }>()
  const navigate = useNavigate()
  let rawSlug = params.slug || ''
  const state = (params.state as AustralianState) || 'NSW'

  const slug = SERVICE_ALIASES[rawSlug] || rawSlug

  useEffect(() => {
    if (SERVICE_ALIASES[rawSlug] && slug !== rawSlug) {
      navigate(`/service/${slug}/${state}`, { replace: true })
    }
  }, [rawSlug, slug, state, navigate])

  const [service, setService] = useState<ServiceDefinition | null>(null)
  const [loading, setLoading] = useState(true)

  // Booking form state
  const [bedrooms, setBedrooms] = useState(2)
  const [bathrooms, setBathrooms] = useState(1)
  const [sqm, setSqm] = useState(100)
  const [condition, setCondition] = useState<'basic' | 'standard' | 'deep'>('standard')
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [frequency, setFrequency] = useState<'once' | 'weekly' | 'fortnightly' | 'monthly'>('once')

  // Quick booking form
  const [bookingName, setBookingName] = useState('')
  const [bookingPhone, setBookingPhone] = useState('')
  const [bookingDate, setBookingDate] = useState('')
  const [bookingSubmitted, setBookingSubmitted] = useState(false)

  const faqs = service ? getFAQsByService(service.slug, state) : []
  const addons = useMemo(() => getAddonsForService(service?.id || ''), [service])
  const testimonials = useMemo(() => getTestimonialsForService(service?.id || ''), [service])
  const tips = useMemo(() => getTipsForService(service?.id || ''), [service])
  const pricingNotes = useMemo(() => getPricingNotesForService(service?.id || ''), [service])
  const processSteps = useMemo(() => SERVICE_PROCESS[service?.id || ''] || [], [service])

  useEffect(() => {
    setLoading(true)
    const found = getServiceBySlug(slug)
    setService(found || null)
    setLoading(false)
    // Reset form on service change
    setBedrooms(2)
    setBathrooms(1)
    setSqm(100)
    setCondition('standard')
    setSelectedAddons([])
    setFrequency('once')
    setBookingSubmitted(false)
  }, [slug])

  const toggleAddon = useCallback((addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((a) => a !== addonId) : [...prev, addonId]
    )
  }, [])

  // Live price calculation
  const livePrice = useMemo(() => {
    if (!service) return null
    try {
      return calculateAUPrice(service, state, {
        bedrooms, bathrooms, sqm, condition,
        addons: selectedAddons,
        frequency: frequency === 'once' ? undefined : frequency,
      })
    } catch {
      return null
    }
  }, [service, state, bedrooms, bathrooms, sqm, condition, selectedAddons, frequency])

  const stateMultiplier = service?.states[state]?.multiplier ?? 1.0
  const statePrice = service ? {
    min: Math.round(service.basePrice.min * stateMultiplier),
    max: Math.round(service.basePrice.max * stateMultiplier),
  } : null

  const addonsTotal = useMemo(() =>
    selectedAddons.reduce((sum, id) => sum + (ADDON_DEFINITIONS[id]?.price ?? 0), 0),
    [selectedAddons]
  )

  const frequencyDiscount = service?.frequencyDiscounts?.[frequency] ?? 0

  // Loading state
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

  // 404 state
  if (!service) {
    const validSlugs = Object.values(cleaningServices).map(s => s.slug)
    const similarServices = validSlugs.filter(s =>
      s.includes(slug) || slug.split(/[-\s]/).some(word => s.includes(word))
    ).slice(0, 5)

    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <div className="max-w-lg">
          <h1 className="text-6xl font-black text-gradient mb-4">404</h1>
          <p className="text-xl text-white/70 mb-2">Service &quot;{slug}&quot; not found</p>
          <p className="text-sm text-white/50 mb-6">This service may not be available. Here are some popular options:</p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {Object.values(cleaningServices).slice(0, 8).map((s) => (
              <Link key={s.id} to={`/service/${s.slug}/${state}`} className="glass-input px-3 py-1.5 text-sm rounded hover:bg-white/10 transition-colors">
                {s.icon} {s.name}
              </Link>
            ))}
          </div>
          {similarServices.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-neon-blue mb-2">Similar services:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {similarServices.map((s) => (
                  <Link key={s} to={`/service/${s}/${state}`} className="px-3 py-1.5 bg-neon-blue/20 border border-neon-blue/40 text-neon-blue text-sm rounded hover:bg-neon-blue/30 transition-colors">{s}</Link>
                ))}
              </div>
            </div>
          )}
          <Link to="/services" className="glass-button-neon px-6 py-3">Browse All Services</Link>
        </div>
      </div>
    )
  }

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingName || !bookingPhone || !bookingDate) {
      alert('Please fill in all required fields')
      return
    }
    setBookingSubmitted(true)
    // In production: submit to Supabase/API
    console.log('[Booking]', { name: bookingName, phone: bookingPhone, date: bookingDate, service: service.name, state, price: livePrice, addons: selectedAddons })
  }

  return (
    <>
      {/* SEO */}
      {service && statePrice && (
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
      <nav className="max-w-7xl mx-auto px-4 pt-6 text-sm text-white/50" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 flex-wrap">
          <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
          <li>/</li>
          <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
          <li>/</li>
          <li className="text-white" aria-current="page">{service.name} — {state}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <Link to="/services" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Services
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl">{service.icon}</span>
                <div>
                  <h1 className="text-3xl sm:text-5xl font-black text-gradient">{service.name}</h1>
                  <p className="text-sm text-white/50 capitalize">{service.category} · {service.duration}</p>
                </div>
              </div>
              <p className="text-lg text-white/70">{service.description}</p>

              {/* State Selector */}
              <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Select state">
                {AU_STATES.map((s: AustralianState) => (
                  <Link key={s} to={`/service/${slug}/${s}`}
                    className={`px-3 py-1.5 text-sm font-bold rounded transition-all ${state === s ? 'bg-neon-blue text-black' : 'glass-input text-white/70 hover:text-white'}`}
                    role="radio" aria-checked={state === s}>{s}
                  </Link>
                ))}
              </div>
            </div>

            {/* What's Included */}
            <div className="glass-panel p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Check className="w-5 h-5 text-neon-green" /> What's Included</h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {service.includedFeatures.map((feature: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Process Steps */}
            {processSteps.length > 0 && (
              <div className="glass-panel p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Sparkles className="w-5 h-5 text-neon-blue" /> Our Process</h2>
                <div className="space-y-4">
                  {processSteps.map((step) => (
                    <div key={step.step} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-neon-blue/20 border border-neon-blue/40 flex items-center justify-center text-sm font-bold text-neon-blue flex-shrink-0">
                          {step.step}
                        </div>
                        {step.step < processSteps.length && <div className="w-0.5 h-full bg-white/10 mt-2" />}
                      </div>
                      <div className="pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{step.icon}</span>
                          <h3 className="font-bold">{step.title}</h3>
                          {step.duration && <span className="text-xs text-white/40 ml-auto flex items-center gap-1"><Clock className="w-3 h-3" />{step.duration}</span>}
                        </div>
                        <p className="text-sm text-white/60">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* State Compliance */}
            {STATE_CONFIG[state] && (
              <div className="glass-panel p-6 border-l-4 border-neon-blue">
                <h3 className="font-bold mb-2 flex items-center gap-2"><MapPin className="w-5 h-5 text-neon-blue" /> {state} Compliance</h3>
                <ul className="space-y-2 text-sm text-white/70">
                  {STATE_CONFIG[state].whsAct && <li>• {STATE_CONFIG[state].whsAct}</li>}
                  {service.category === 'residential' && STATE_CONFIG[state].tenancyAct && <li>• {STATE_CONFIG[state].tenancyAct} compliant</li>}
                  {STATE_CONFIG[state].complianceNotes && <li>• {STATE_CONFIG[state].complianceNotes}</li>}
                </ul>
              </div>
            )}

            {/* Certifications */}
            {service.certifications && service.certifications.length > 0 && (
              <div className="glass-panel p-6">
                <h3 className="font-bold mb-4">Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {service.certifications.map((cert: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-neon-purple/20 border border-neon-purple/40 text-neon-purple text-sm rounded-full">{cert}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {tips.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xl font-bold flex items-center gap-2"><Info className="w-5 h-5 text-neon-blue" /> Expert Tips</h2>
                {tips.map((tip, i) => (
                  <div key={i} className="glass-panel p-5">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{tip.icon}</span>
                      <div>
                        <h3 className="font-bold mb-1">{tip.title}</h3>
                        <p className="text-sm text-white/70">{tip.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Testimonials */}
            {testimonials.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-yellow-400" /> Customer Reviews</h2>
                <div className="space-y-4">
                  {testimonials.map((t, i) => (
                    <div key={i} className="glass-panel p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex text-yellow-400">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star key={j} className={`w-4 h-4 ${j < t.rating ? 'fill-current' : 'text-white/20'}`} />
                          ))}
                        </div>
                        <span className="text-sm font-semibold">{t.name}</span>
                        <span className="text-xs text-white/40">· {t.location}</span>
                        <span className="text-xs text-white/30 ml-auto">{t.date}</span>
                      </div>
                      <p className="text-sm text-white/70 italic">&ldquo;{t.text}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing Notes */}
            {pricingNotes.length > 0 && (
              <CollapsibleSection title="Pricing Details" icon={DollarSign}>
                <div className="space-y-3">
                  {pricingNotes.map((note, i) => (
                    <div key={i} className="text-sm">
                      <p className="font-semibold text-white">{note.title}</p>
                      <p className="text-white/60">{note.note}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* FAQs */}
            <FAQSection serviceSlug={service.slug} state={state} />
          </div>

          {/* Sticky Sidebar */}
          <aside className="space-y-6">
            {/* Live Price Card */}
            <div className="glass-panel p-6 sticky top-20 space-y-5 border border-neon-blue/20">
              <h3 className="text-lg font-bold flex items-center gap-2"><DollarSign className="w-5 h-5 text-neon-green" /> Instant Quote</h3>

              {/* Property Config */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1"><span className="text-white/50">Bedrooms</span><span className="font-bold text-neon-blue">{bedrooms}</span></div>
                  <input type="range" min="0" max="8" value={bedrooms} onChange={(e) => setBedrooms(Number(e.target.value))} className="w-full accent-neon-blue" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span className="text-white/50">Bathrooms</span><span className="font-bold text-neon-blue">{bathrooms}</span></div>
                  <input type="range" min="1" max="5" value={bathrooms} onChange={(e) => setBathrooms(Number(e.target.value))} className="w-full accent-neon-blue" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span className="text-white/50">Property Size</span><span className="font-bold text-neon-blue">{sqm} m²</span></div>
                  <input type="range" min="20" max="500" step="10" value={sqm} onChange={(e) => setSqm(Number(e.target.value))} className="w-full accent-neon-blue" />
                </div>
              </div>

              {/* Condition */}
              <div className="grid grid-cols-3 gap-2">
                {(['basic', 'standard', 'deep'] as const).map((c) => (
                  <button key={c} onClick={() => setCondition(c)}
                    className={`px-2 py-2 text-xs font-semibold rounded capitalize transition-all ${condition === c ? 'bg-neon-blue text-black' : 'glass-input text-white/70 hover:text-white'}`}>
                    {c}{c === 'deep' && <span className="block text-[10px] opacity-75">+50%</span>}
                  </button>
                ))}
              </div>

              {/* Addons */}
              {addons.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-white/50 mb-2">Add-ons</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {addons.map((addon) => (
                      <button key={addon.id} onClick={() => toggleAddon(addon.id)}
                        className={`w-full text-left px-3 py-2 text-xs rounded transition-all flex items-start gap-2 ${selectedAddons.includes(addon.id) ? 'bg-neon-purple/20 border border-neon-purple text-neon-purple' : 'glass-input text-white/70 hover:text-white'}`}>
                        <span>{selectedAddons.includes(addon.id) ? '✓' : '+'}</span>
                        <div className="flex-1">
                          <span className="font-semibold">{addon.icon} {addon.name}</span>
                          <span className="block text-white/40">+${addon.price}{addon.estimatedTime && <span> · {addon.estimatedTime}</span>}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Frequency */}
              {service.frequencyDiscounts && (
                <div>
                  <p className="text-sm font-medium text-white/50 mb-2">Frequency</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['once', 'weekly', 'fortnightly', 'monthly'] as const).map((f) => {
                      const discount = service.frequencyDiscounts?.[f]
                      return (
                        <button key={f} onClick={() => setFrequency(f)}
                          className={`relative px-2 py-2 text-xs font-semibold rounded transition-all ${frequency === f ? 'bg-neon-blue text-black' : 'glass-input text-white/70 hover:text-white'}`}>
                          {f === 'once' ? 'One-time' : f.charAt(0).toUpperCase() + f.slice(1)}
                          {discount && <span className="absolute -top-1 -right-1 bg-neon-green text-black text-[9px] px-1 py-0.5 rounded-full font-bold">-{discount * 100}%</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Price Display */}
              {livePrice !== null && (
                <div className="bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 rounded-xl p-4 text-center border border-neon-blue/20">
                  <div className="text-xs text-white/50">Estimated Price (incl. GST)</div>
                  <div className="text-3xl font-black text-gradient">${livePrice} <span className="text-sm text-white/50">AUD</span></div>
                  {addonsTotal > 0 && <div className="text-xs text-neon-purple">+ ${addonsTotal} in add-ons</div>}
                  {frequencyDiscount > 0 && <div className="text-xs text-neon-green mt-1">You save ${Math.round(livePrice * frequencyDiscount)} with {frequency} cleaning!</div>}
                  <div className="text-[10px] text-white/40 mt-1">✓ GST · ✓ {state} rate (×{stateMultiplier})</div>
                </div>
              )}

              {/* Guarantee */}
              {service.guarantee && (
                <div className="flex items-center gap-2 text-xs text-neon-green bg-neon-green/10 px-3 py-2 rounded">
                  <Shield className="w-3 h-3" /> {service.guarantee}
                </div>
              )}
            </div>

            {/* Quick Booking Form */}
            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><Calendar className="w-5 h-5 text-neon-blue" /> Quick Book</h3>
              {bookingSubmitted ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="font-bold text-neon-green">Booking Request Sent!</p>
                  <p className="text-xs text-white/50 mt-1">We'll call you within 1 hour to confirm.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitBooking} className="space-y-3">
                  <input type="text" placeholder="Your Name *" value={bookingName} onChange={(e) => setBookingName(e.target.value)} className="glass-input w-full p-2.5 text-sm" required />
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-white/30 flex-shrink-0" />
                    <input type="tel" placeholder="Phone *" value={bookingPhone} onChange={(e) => setBookingPhone(e.target.value)} className="glass-input flex-1 p-2.5 text-sm" required />
                  </div>
                  <input type="date" value={bookingDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setBookingDate(e.target.value)} className="glass-input w-full p-2.5 text-sm" required />
                  <button type="submit" className="w-full glass-button-neon py-3 text-sm font-bold">
                    Book Now — ${livePrice ?? statePrice?.min ?? '—'} →
                  </button>
                  <p className="text-[10px] text-white/30 text-center">No payment required now. Pay after service.</p>
                </form>
              )}
            </div>

            {/* Contact Card */}
            <div className="glass-panel p-5 text-center">
              <p className="text-xs text-white/40 mb-2">Need help choosing?</p>
              <a href="tel:+61862266262" className="text-lg font-bold text-neon-blue hover:text-neon-green transition-colors">
                📞 08 6226 6262
              </a>
              <p className="text-xs text-white/30 mt-1">Mon–Fri 7am–8pm · Sat 8am–6pm</p>
            </div>

            {/* Advanced Calculator Link */}
            <Link to="/booking" className="glass-panel p-5 block text-center hover:border-neon-blue/40 transition-colors">
              <Sparkles className="w-5 h-5 text-neon-purple mx-auto mb-2" />
              <p className="text-sm font-semibold">3D Quote Builder</p>
              <p className="text-xs text-white/40">Full interactive quote with 3D preview</p>
            </Link>
          </aside>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gradient">Ready to Book {service.name}?</h2>
          <p className="text-lg text-white/70">Get your instant quote and book in 60 seconds. No payment required until after service.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/booking" className="glass-button-neon px-8 py-4 text-lg font-bold">3D Quote Builder →</Link>
            <a href="tel:+61862266262" className="glass-input px-8 py-4 text-lg font-semibold flex items-center gap-2"><Phone className="w-5 h-5" /> Call Now</a>
          </div>
        </div>
      </section>

      <ComplianceFooter state={state} service={service} businessDetails={{ abn: '12 345 678 901', address: '51 Tate Street, West Leederville WA 6007', phone: '08 6226 6262', email: 'aastacleanpro@gmail.com', insurance: 'Public Liability $20M', whs: true }} />
    </>
  )
}
