import { motion } from 'framer-motion'

export default function CancellationPage() {
  return (
    <div className="min-h-screen">
      <section className="px-4 pt-16 pb-8 text-center">
        <motion.h1 className="text-3xl sm:text-4xl font-black text-gradient mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Cancellation Policy
        </motion.h1>
        <p className="text-white/50 text-sm">Last updated: April 16, 2026</p>
      </section>

      <article className="max-w-3xl mx-auto px-4 py-8 space-y-8 text-white/70 leading-relaxed">
        <motion.div className="glass-panel p-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-bold text-white mb-3">Cancellation Timeframes</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-neon-green/10 rounded-xl border border-neon-green/30">
              <span className="text-neon-green font-bold text-lg">✓</span>
              <div>
                <p className="font-semibold text-neon-green">More than 24 hours before service</p>
                <p className="text-sm">Free cancellation. No charges applied. Full refund if deposit was paid.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-neon-yellow/10 rounded-xl border border-neon-yellow/30">
              <span className="text-neon-yellow font-bold text-lg">!</span>
              <div>
                <p className="font-semibold text-neon-yellow">Within 24 hours of service</p>
                <p className="text-sm">50% cancellation fee applies. This covers cleaner travel costs and lost income.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-neon-pink/10 rounded-xl border border-neon-pink/30">
              <span className="text-neon-pink font-bold text-lg">✗</span>
              <div>
                <p className="font-semibold text-neon-pink">No-show (cleaner arrives, no one home)</p>
                <p className="text-sm">Full quoted amount charged. Cleaner has already travelled and allocated time.</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div className="glass-panel p-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-bold text-white mb-3">How to Cancel</h2>
          <p>To cancel or reschedule a booking, contact us:</p>
          <ul className="mt-3 space-y-2">
            <li>📞 Call: <a href="tel:+61290000000" className="text-neon-blue underline">+61 2 9000 0000</a></li>
            <li>📧 Email: <a href="mailto:contact@sparkleclean.pro" className="text-neon-blue underline">contact@sparkleclean.pro</a></li>
          </ul>
          <p className="mt-3 text-sm">Please provide your booking reference number when cancelling.</p>
        </motion.div>

        <motion.div className="glass-panel p-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-bold text-white mb-3">Rescheduling</h2>
          <p>Rescheduling follows the same timeframes as cancellation. Changes made within 24 hours may incur a $25 rescheduling fee to cover administrative and travel costs.</p>
        </motion.div>

        <motion.div className="glass-panel p-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-bold text-white mb-3">Extreme Weather</h2>
          <p>In cases of extreme weather (bushfire, flooding, severe storms) that prevent safe travel, we will offer free rescheduling or full refund. Your safety and our cleaners' safety come first.</p>
        </motion.div>

        <div className="text-center pt-4">
          <a href="/booking" className="glass-button-neon px-8 py-3 font-bold">Get a Quote →</a>
        </div>
      </article>
    </div>
  )
}
