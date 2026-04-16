// Home Page — extracts the main content from the original App.tsx
// This is the landing page without the quote form (which moves to /booking)

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles, Zap, Shield, Leaf, Clock, Star } from 'lucide-react'
import { SERVICES_LIST, FAQS, TRUST_BADGES } from '../lib/constants'
import FaqItem from '../components/FaqItem'
import TrustBadge from '../components/TrustBadge'

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const fadeInUp = useMemo(() => ({
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  }), [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.header
        className="relative overflow-hidden px-4 pt-24 pb-16 text-center"
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

        {/* CTA Buttons */}
        <motion.div
          className="relative mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          {...fadeInUp}
        >
          <Link to="/booking" className="glass-button-neon px-8 py-4 text-lg font-bold">
            <Sparkles className="w-5 h-5 mr-2" aria-hidden="true" />
            Get Instant Quote
          </Link>
          <Link to="/services" className="glass-panel px-8 py-4 text-lg font-semibold hover:glass-glow transition-all">
            Our Services
          </Link>
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

      {/* Why Choose Us */}
      <section className="px-4 py-12 max-w-4xl mx-auto" aria-label="Why choose us">
        <motion.h2
          className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gradient"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          💎 Why Choose SparkleClean Pro?
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Zap className="w-6 h-6" />, title: 'Instant Quotes', desc: 'Get transparent, GST-inclusive pricing in seconds with our 3D quote builder.' },
            { icon: <Leaf className="w-6 h-6" />, title: 'Eco-Friendly', desc: 'Certified sustainable products, safe for families, children, and pets.' },
            { icon: <Shield className="w-6 h-6" />, title: 'Fully Insured', desc: '$20M public liability insurance, police-checked cleaners, satisfaction guaranteed.' },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              className="glass-panel p-6 text-center hover:glass-glow transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <div className="text-neon-blue mb-3 flex justify-center">{item.icon}</div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-white/60 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
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
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <FaqItem
              key={i}
              index={i}
              question={faq.q}
              answer={faq.a}
              isOpen={openFaq === i}
              onToggle={() => setOpenFaq(prev => prev === i ? null : i)}
            />
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-panel p-8 max-w-2xl mx-auto glow-border"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gradient mb-4">
            Ready for a Spotless Space?
          </h2>
          <p className="text-white/70 mb-6">
            Join hundreds of happy Sydney customers. Your first clean is just a click away.
          </p>
          <Link to="/booking" className="glass-button-neon px-8 py-4 text-lg font-bold">
            Get Your Free Quote →
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
