import { memo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Mail, Phone, Calendar, Sparkles } from 'lucide-react'

interface BookingConfirmationProps {
  quoteId?: string
  customerId?: string
  total: string
  gst: string
  subtotal: string
  customerName: string
  customerEmail: string
  onReset: () => void
}

const BookingConfirmation = memo(function BookingConfirmation({
  quoteId,
  total,
  gst,
  subtotal,
  customerName,
  customerEmail,
  onReset,
}: BookingConfirmationProps) {
  return (
    <motion.div
      key="confirmation"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="text-center py-8"
      role="status"
      aria-live="polite"
    >
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="mb-6"
      >
        <CheckCircle className="w-20 h-20 text-neon-green mx-auto" aria-hidden="true" />
      </motion.div>

      <h3 className="text-2xl sm:text-3xl font-bold text-neon-green mb-2">
        Quote Confirmed!
      </h3>

      <p className="text-white/70 mb-6">
        Thank you, <strong>{customerName}</strong>! We've saved your quote.
      </p>

      {/* Quote ID */}
      {quoteId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel p-4 mb-6 inline-block"
        >
          <p className="text-white/50 text-sm">Quote Reference</p>
          <p className="text-xl font-mono font-bold text-neon-blue" aria-label={`Quote ID: ${quoteId}`}>
            {quoteId.slice(0, 8).toUpperCase()}
          </p>
        </motion.div>
      )}

      {/* Price Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel p-6 mb-6 max-w-md mx-auto"
      >
        <div className="text-4xl sm:text-5xl font-black text-gradient mb-2" aria-label={`Your quote is ${total} including GST`}>
          {total}
        </div>
        <p className="text-white/50 text-sm">
          Subtotal: {subtotal} · GST: {gst}
        </p>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-panel p-6 mb-6 max-w-md mx-auto text-left"
      >
        <h4 className="font-semibold text-neon-blue mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          What happens next?
        </h4>
        <ul className="space-y-3 text-sm text-white/70">
          <li className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-neon-purple mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>Confirmation email sent to <strong className="text-white">{customerEmail}</strong></span>
          </li>
          <li className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-neon-green mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>We'll contact you within 2 hours to schedule your clean</span>
          </li>
          <li className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-neon-pink mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>Need to reach us? Call <a href="tel:+61290000000" className="text-neon-blue underline">+61 2 9000 0000</a></span>
          </li>
        </ul>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col sm:flex-row gap-3 justify-center"
      >
        <button
          onClick={onReset}
          className="glass-button-neon px-8 py-3"
          aria-label="Get another quote"
        >
          Get Another Quote
        </button>
      </motion.div>

      {/* Trust message */}
      <p className="text-white/40 text-xs mt-6">
        🔒 Your information is secure · Free cancellation up to 24h · $20M insured
      </p>
    </motion.div>
  )
})

export default BookingConfirmation
