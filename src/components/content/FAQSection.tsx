// Enhanced FAQ Section with state-specific filtering and accordion

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { getFAQsByService } from '../../lib/faqs'

interface FAQSectionProps {
  serviceSlug: string
  state?: string
}

export default function FAQSection({ serviceSlug, state = 'NSW' }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const faqs = getFAQsByService(serviceSlug, state)

  if (faqs.length === 0) return null

  return (
    <section className="py-8" aria-label="Frequently asked questions">
      <h2 className="text-2xl font-bold text-gradient mb-6">
        ❓ Frequently Asked Questions
      </h2>
      <div className="space-y-3" role="list">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            className="glass-panel overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            role="listitem"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              aria-expanded={openIndex === i}
              aria-controls={`faq-answer-${i}`}
            >
              <span className="font-semibold text-white pr-4">{faq.q}</span>
              {openIndex === i ? (
                <ChevronUp className="w-5 h-5 text-neon-blue flex-shrink-0" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white/50 flex-shrink-0" aria-hidden="true" />
              )}
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  id={`faq-answer-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                  role="region"
                >
                  <div className="px-6 pb-4 text-white/70 text-sm leading-relaxed border-t border-white/10 pt-4">
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
