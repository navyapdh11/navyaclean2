// Install Prompt Banner — shows when app is installable
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Smartphone } from 'lucide-react'

interface InstallPromptProps {
  onInstall: () => void
  onDismiss: () => void
}

export default function InstallPrompt({ onInstall, onDismiss }: InstallPromptProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:bottom-4 md:left-4 md:right-auto md:max-w-md"
        role="dialog"
        aria-label="Install app prompt"
      >
        <div className="glass-panel p-4 glow-border">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-black" aria-hidden="true" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-sm mb-1">
                Install Aasta Clean Pro
              </h3>
              <p className="text-white/60 text-xs mb-3">
                Add to your home screen for quick access and offline support.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={onInstall}
                  className="flex-1 glass-button-neon py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
                  aria-label="Install app to home screen"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  Install Now
                </button>
                <button
                  onClick={onDismiss}
                  className="px-3 py-2 text-white/50 hover:text-white transition-colors"
                  aria-label="Dismiss install prompt"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
