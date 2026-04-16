import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Shield, Clock, Leaf, DollarSign, CheckCircle } from 'lucide-react'
import { SERVICES_LIST } from '../lib/constants'
import { AU_STATES } from '../lib/services-au'

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="px-4 pt-16 pb-12 text-center">
        <motion.h1
          className="text-4xl sm:text-5xl font-black text-gradient mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Our Cleaning Services
        </motion.h1>
        <motion.p
          className="text-lg text-white/70 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          From weekly home cleaning to one-off deep cleans after renovations.
        </motion.p>
      </section>

      {/* Services Grid */}
      <section className="px-4 py-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES_LIST.map((service, i) => (
            <motion.div
              key={service.id}
              className="glass-panel p-6 hover:glass-glow transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-5xl mb-4" aria-hidden="true">{service.icon}</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: service.color }}>
                <Link to={`/service/${service.id}/NSW`} className="hover:text-neon-blue transition-colors">
                  {service.name}
                </Link>
              </h3>
              <p className="text-white/60 text-sm mb-4">{service.desc}</p>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-neon-green flex-shrink-0" aria-hidden="true" />
                  Professional equipment
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-neon-green flex-shrink-0" aria-hidden="true" />
                  Insured & vetted cleaners
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-neon-green flex-shrink-0" aria-hidden="true" />
                  Satisfaction guaranteed
                </li>
              </ul>
              {/* State Links */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-white/50 mb-2">Available in:</p>
                <div className="flex flex-wrap gap-1">
                  {AU_STATES.slice(0, 4).map((state) => (
                    <Link
                      key={state}
                      to={`/service/${service.id}/${state}`}
                      className="px-2 py-1 text-xs glass-input hover:text-neon-blue transition-colors rounded"
                    >
                      {state}
                    </Link>
                  ))}
                  {AU_STATES.length > 4 && (
                    <span className="px-2 py-1 text-xs text-white/40">+{AU_STATES.length - 4} more</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Info */}
      <section className="px-4 py-12 max-w-4xl mx-auto">
        <motion.div
          className="glass-panel p-8 glow-border"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-gradient mb-6 flex items-center gap-3">
            <DollarSign className="w-7 h-7 text-neon-green" aria-hidden="true" />
            Transparent Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-white mb-3">How We Calculate</h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li className="flex gap-2">
                  <span className="text-neon-blue">1.</span>
                  Base cost per service (see individual services above)
                </li>
                <li className="flex gap-2">
                  <span className="text-neon-blue">2.</span>
                  Area-based adjustment (per square metre)
                </li>
                <li className="flex gap-2">
                  <span className="text-neon-blue">3.</span>
                  Room surcharges (bedrooms + bathrooms)
                </li>
                <li className="flex gap-2">
                  <span className="text-neon-blue">4.</span>
                  Frequency discounts (up to 25% off for weekly)
                </li>
                <li className="flex gap-2">
                  <span className="text-neon-blue">5.</span>
                  Add-ons: Eco-friendly, pet-safe, urgent
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Frequency Discounts</h3>
              <div className="space-y-3">
                {[
                  { label: 'One-Time', discount: '0%', color: 'text-white/50' },
                  { label: 'Monthly', discount: '10% OFF', color: 'text-neon-blue' },
                  { label: 'Fortnightly', discount: '15% OFF', color: 'text-neon-purple' },
                  { label: 'Weekly', discount: '25% OFF ⭐', color: 'text-neon-green' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-glass-border/30">
                    <span className="text-sm text-white/70">{item.label}</span>
                    <span className={`text-sm font-bold ${item.color}`}>{item.discount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-white/40 text-xs mt-6">
            All prices include 10% GST. Final price may vary based on on-site assessment.
          </p>
        </motion.div>
      </section>

      {/* Guarantees */}
      <section className="px-4 py-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gradient mb-8">Our Guarantees</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: <Shield className="w-8 h-8" />, title: '$20M Insurance', desc: 'Full public liability coverage for peace of mind.' },
            { icon: <Clock className="w-8 h-8" />, title: 'Same Day Service', desc: 'Book today, cleaned today (subject to availability).' },
            { icon: <Leaf className="w-8 h-8" />, title: 'Eco Certified', desc: 'Sustainable, non-toxic products by Environmental Choice Australia.' },
            { icon: <CheckCircle className="w-8 h-8" />, title: '100% Satisfaction', desc: 'Not happy? We\'ll re-clean for free. No questions asked.' },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              className="glass-panel p-6 flex items-start gap-4 hover:glass-glow transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-neon-blue flex-shrink-0">{item.icon}</div>
              <div>
                <h3 className="font-bold text-lg">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 text-center">
        <Link to="/booking" className="glass-button-neon px-8 py-4 text-lg font-bold">
          Get Your Instant Quote →
        </Link>
      </section>
    </div>
  )
}
