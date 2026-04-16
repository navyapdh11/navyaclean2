import { motion } from 'framer-motion'

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <section className="px-4 pt-16 pb-8 text-center">
        <motion.h1 className="text-3xl sm:text-4xl font-black text-gradient mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Terms of Service
        </motion.h1>
        <p className="text-white/50 text-sm">Last updated: April 16, 2026</p>
      </section>

      <article className="max-w-3xl mx-auto px-4 py-8 space-y-8 text-white/70 leading-relaxed">
        <motion.div className="glass-panel p-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
          <p>By accessing or using SparkleClean Pro's services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
        </motion.div>

        <motion.div className="glass-panel p-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-bold text-white mb-3">2. Services</h2>
          <p>SparkleClean Pro provides residential and commercial cleaning services in the Greater Sydney Metropolitan area. Services include standard cleaning, deep cleaning, carpet cleaning, window cleaning, and oven cleaning.</p>
          <p className="mt-2">All prices quoted include 10% Goods and Services Tax (GST) as required by Australian law.</p>
        </motion.div>

        <motion.div className="glass-panel p-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-bold text-white mb-3">3. Quotes and Pricing</h2>
          <p>Quotes generated through our 3D quote builder are estimates based on the information provided. Final pricing may vary based on on-site assessment. Quotes are valid for 7 days from the date of generation.</p>
          <p className="mt-2">We reserve the right to adjust pricing if the actual property conditions differ significantly from the information provided during quoting.</p>
        </motion.div>

        <motion.div className="glass-panel p-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-bold text-white mb-3">4. Booking and Payment</h2>
          <p>Bookings are confirmed only after acceptance of the quote and payment of the required deposit (if applicable). Full payment is due upon completion of the service unless otherwise agreed.</p>
          <p className="mt-2">We accept cash, credit card (Visa, Mastercard), and bank transfer.</p>
        </motion.div>

        <motion.div className="glass-panel p-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-bold text-white mb-3">5. Cancellation</h2>
          <p>Free cancellation up to 24 hours before scheduled service. Cancellations within 24 hours incur a 50% fee. No-shows are charged the full quoted amount. See our <a href="/cancellation" className="text-neon-blue underline">Cancellation Policy</a> for full details.</p>
        </motion.div>

        <motion.div className="glass-panel p-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-bold text-white mb-3">6. Liability</h2>
          <p>SparkleClean Pro holds $20M public liability insurance. We are not liable for pre-existing damage or wear and tear. Claims must be reported within 24 hours of service completion.</p>
        </motion.div>

        <motion.div className="glass-panel p-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-bold text-white mb-3">7. Satisfaction Guarantee</h2>
          <p>If you are not satisfied with our service, contact us within 24 hours and we will re-clean the affected areas at no additional charge. This guarantee applies to the first service only.</p>
        </motion.div>

        <motion.div className="glass-panel p-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-bold text-white mb-3">8. Governing Law</h2>
          <p>These terms are governed by the laws of New South Wales, Australia. Any disputes will be resolved in the courts of NSW.</p>
        </motion.div>

        <div className="text-center pt-4">
          <a href="/booking" className="glass-button-neon px-8 py-3 font-bold">Get a Quote →</a>
        </div>
      </article>
    </div>
  )
}
