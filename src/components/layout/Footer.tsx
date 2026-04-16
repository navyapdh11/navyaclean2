import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Phone, Mail, Shield, Clock } from 'lucide-react'
import { PHONE_DISPLAY, PHONE_LINK, EMAIL_DISPLAY, EMAIL_LINK } from '../../lib/constants'

const Footer = memo(function Footer() {
  return (
    <footer className="border-t border-glass-border/50 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-gradient mb-3">SparkleClean Pro</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Premium cleaning services across Sydney. Transparent GST-inclusive pricing, eco-friendly products, fully insured cleaners.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-white/60 hover:text-neon-blue transition-colors">Home</Link></li>
              <li><Link to="/services" className="text-white/60 hover:text-neon-blue transition-colors">Services</Link></li>
              <li><Link to="/about" className="text-white/60 hover:text-neon-blue transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-white/60 hover:text-neon-blue transition-colors">Contact</Link></li>
              <li><Link to="/booking" className="text-white/60 hover:text-neon-blue transition-colors">Get Quote</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="text-white/60 hover:text-neon-blue transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-white/60 hover:text-neon-blue transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cancellation" className="text-white/60 hover:text-neon-blue transition-colors">Cancellation Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-3">Contact</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-neon-blue flex-shrink-0" aria-hidden="true" />
                <a href={PHONE_LINK} className="hover:text-neon-blue transition-colors">{PHONE_DISPLAY}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-neon-purple flex-shrink-0" aria-hidden="true" />
                <a href={EMAIL_LINK} className="hover:text-neon-purple transition-colors">{EMAIL_DISPLAY}</a>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-neon-green flex-shrink-0" aria-hidden="true" />
                <span>$20M Public Liability</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neon-pink flex-shrink-0" aria-hidden="true" />
                <span>Mon-Fri 7am-8pm, Sat 8am-6pm</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-glass-border/30 text-center text-sm text-white/40">
          <p>&copy; {new Date().getFullYear()} SparkleClean Pro. All rights reserved. ABN: 12 345 678 901</p>
          <p className="mt-1">All prices include 10% GST. Serving Greater Sydney Metropolitan Area.</p>
        </div>
      </div>
    </footer>
  )
})

export default Footer
