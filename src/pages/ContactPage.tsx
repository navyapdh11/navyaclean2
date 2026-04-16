import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react'
import { PHONE_DISPLAY, PHONE_LINK, EMAIL_DISPLAY, EMAIL_LINK } from '../lib/constants'

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="px-4 pt-16 pb-12 text-center">
        <motion.h1
          className="text-4xl sm:text-5xl font-black text-gradient mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Contact Us
        </motion.h1>
        <motion.p
          className="text-lg text-white/70 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Have questions? We're here to help. Reach out anytime.
        </motion.p>
      </section>

      <section className="px-4 py-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="glass-panel p-6">
              <h2 className="text-xl font-bold text-gradient mb-4">Get In Touch</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-neon-blue flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-white/50">Phone</p>
                    <a href={PHONE_LINK} className="text-white font-medium hover:text-neon-blue transition-colors">
                      {PHONE_DISPLAY}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-neon-purple flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-white/50">Email</p>
                    <a href={EMAIL_LINK} className="text-white font-medium hover:text-neon-purple transition-colors">
                      {EMAIL_DISPLAY}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-neon-green flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-white/50">Address</p>
                    <p className="text-white font-medium">123 Clean Street, Sydney NSW 2000</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-neon-pink flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-white/50">Hours</p>
                    <p className="text-white font-medium">Mon-Fri 7am-8pm, Sat 8am-6pm</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Response Promise */}
            <div className="glass-panel p-6">
              <h3 className="font-bold text-neon-blue mb-2">⚡ Quick Response Promise</h3>
              <p className="text-white/70 text-sm">
                We respond to all enquiries within 2 hours during business hours. 
                For urgent bookings, call us directly for same-day service.
              </p>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            className="glass-panel p-6 glow-border"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-xl font-bold text-gradient mb-4">Send a Message</h2>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Thank you! We\'ll respond within 2 hours.'); }}>
              <div>
                <label htmlFor="contact-name" className="block text-sm font-semibold text-neon-blue mb-2">Full Name *</label>
                <input id="contact-name" type="text" required className="glass-input w-full p-3" placeholder="John Smith" />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-semibold text-neon-blue mb-2">Email *</label>
                <input id="contact-email" type="email" required className="glass-input w-full p-3" placeholder="john@example.com" />
              </div>
              <div>
                <label htmlFor="contact-phone" className="block text-sm font-semibold text-neon-blue mb-2">Phone</label>
                <input id="contact-phone" type="tel" className="glass-input w-full p-3" placeholder="04XX XXX XXX" />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-semibold text-neon-blue mb-2">Message *</label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  className="glass-input w-full p-3 resize-none"
                  placeholder="How can we help?"
                />
              </div>
              <button type="submit" className="w-full glass-button-neon py-3 font-bold flex items-center justify-center gap-2">
                <Send className="w-4 h-4" aria-hidden="true" />
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
