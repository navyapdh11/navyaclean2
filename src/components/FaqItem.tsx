import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface FaqItemProps {
  question: string
  answer: string
  index: number
  isOpen: boolean
  onToggle: () => void
}

const FaqItem = memo(function FaqItem({ question, answer, index, isOpen, onToggle }: FaqItemProps) {
  const panelId = `faq-panel-${index}`
  const buttonId = `faq-button-${index}`

  return (
    <motion.div
      className="glass-panel overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <button
        id={buttonId}
        onClick={onToggle}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <span className="font-semibold pr-4">{question}</span>
        <ChevronDown
          className="w-5 h-5 flex-shrink-0 transition-transform duration-300"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="px-5 pb-5 text-white/70 text-sm leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

export default FaqItem
