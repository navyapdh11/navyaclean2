// Advanced Price Calculator with Monte Carlo Simulation
// For AU services with state-specific pricing

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, Sparkles, Loader } from 'lucide-react'
import type { ServiceDefinition, AustralianState } from '../../lib/services-au'
import { AU_STATES, STATE_CONFIG } from '../../lib/services-au'
import { runMonteCarloSimulation } from '../../lib/pricing'

interface CalculatorProps {
  service: ServiceDefinition
  defaultState?: AustralianState
}

export default function AdvancedPriceCalculator({ service, defaultState = 'NSW' }: CalculatorProps) {
  // Base inputs
  const [state, setState] = useState<AustralianState>(defaultState)
  const [bedrooms, setBedrooms] = useState(2)
  const [bathrooms, setBathrooms] = useState(1)
  const [sqm, setSqm] = useState(100)
  const [condition, setCondition] = useState<'basic' | 'standard' | 'deep'>('standard')

  // Addons
  const [addons, setAddons] = useState<string[]>([])

  // Frequency
  const [frequency, setFrequency] = useState<'once' | 'weekly' | 'fortnightly' | 'monthly'>('once')

  // Monte Carlo simulation state
  const [priceRange, setPriceRange] = useState<{ min: number; max: number; avg: number } | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Run Monte Carlo simulation on input change
  useEffect(() => {
    setIsCalculating(true)
    const timer = setTimeout(() => {
      const result = runMonteCarloSimulation(service, state, {
        serviceId: service.id,
        state,
        bedrooms,
        bathrooms,
        sqm,
        condition,
        addons,
        frequency,
      })
      setPriceRange(result)
      setIsCalculating(false)
    }, 300) // Debounce

    return () => clearTimeout(timer)
  }, [service, state, bedrooms, bathrooms, sqm, condition, addons, frequency])

  const toggleAddon = useCallback((addon: string) => {
    setAddons((prev) =>
      prev.includes(addon) ? prev.filter((a) => a !== addon) : [...prev, addon]
    )
  }, [])

  const stateMultiplier = service.states[state]?.multiplier ?? 1.0

  return (
    <div className="glass-panel p-6 space-y-6 glow-border" role="form" aria-label="Price calculator">
      {/* Header */}
      <div className="flex items-center gap-2 text-neon-blue">
        <Sparkles className="w-5 h-5" aria-hidden="true" />
        <h3 className="text-lg font-bold">Advanced Price Calculator</h3>
        <div className="relative group" aria-label="Tooltip">
          <Info className="w-4 h-4 text-gray-400 cursor-help" aria-hidden="true" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Prices include GST and state-specific adjustments
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      </div>

      {/* State Selector */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-neon-blue">State / Territory</label>
        <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Select state">
          {AU_STATES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setState(s)}
              className={`px-3 py-2 text-sm font-bold rounded transition-all ${
                state === s
                  ? 'bg-neon-blue text-black'
                  : 'glass-input text-white/70 hover:text-white'
              }`}
              role="radio"
              aria-checked={state === s}
            >
              {s}
            </button>
          ))}
        </div>
        {STATE_CONFIG[state] && (
          <p className="text-xs text-white/50">
            ×{stateMultiplier} rate · {STATE_CONFIG[state].minWage}/hr min wage
          </p>
        )}
      </div>

      {/* Property Size */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <label className="font-medium">Bedrooms</label>
            <span className="text-neon-blue font-bold">{bedrooms}</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={bedrooms}
            onChange={(e) => setBedrooms(Number(e.target.value))}
            className="w-full accent-neon-blue"
            aria-valuemin={0}
            aria-valuemax={10}
            aria-valuenow={bedrooms}
            aria-label="Number of bedrooms"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <label className="font-medium">Bathrooms</label>
            <span className="text-neon-blue font-bold">{bathrooms}</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={bathrooms}
            onChange={(e) => setBathrooms(Number(e.target.value))}
            className="w-full accent-neon-blue"
            aria-valuemin={1}
            aria-valuemax={5}
            aria-valuenow={bathrooms}
            aria-label="Number of bathrooms"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <label className="font-medium">Property Size</label>
            <span className="text-neon-blue font-bold">{sqm} m²</span>
          </div>
          <input
            type="range"
            min="20"
            max="500"
            step="10"
            value={sqm}
            onChange={(e) => setSqm(Number(e.target.value))}
            className="w-full accent-neon-blue"
            aria-valuemin={20}
            aria-valuemax={500}
            aria-valuenow={sqm}
            aria-label="Property size in square meters"
          />
        </div>
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Cleaning Condition</label>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Cleaning condition">
          {(['basic', 'standard', 'deep'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCondition(c)}
              className={`px-3 py-2 text-sm font-semibold rounded capitalize transition-all ${
                condition === c
                  ? 'bg-neon-blue text-black'
                  : 'glass-input text-white/70 hover:text-white'
              }`}
              role="radio"
              aria-checked={condition === c}
            >
              {c}
              {c === 'deep' && (
                <span className="ml-1 text-xs opacity-75">+50%</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Addons */}
      {service.addons && service.addons.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Add-ons</label>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Add-on options">
            {service.addons.map((addon) => (
              <button
                key={addon}
                type="button"
                onClick={() => toggleAddon(addon)}
                className={`px-3 py-2 text-sm rounded text-left transition-all justify-start flex items-center gap-2 ${
                  addons.includes(addon)
                    ? 'bg-neon-purple/20 border border-neon-purple text-neon-purple'
                    : 'glass-input text-white/70 hover:text-white'
                }`}
                aria-pressed={addons.includes(addon)}
              >
                {addons.includes(addon) && <span aria-hidden="true">✓</span>}
                <span>{addon.replace(/_/g, ' ')}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Frequency */}
      {service.frequencyDiscounts && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Frequency</label>
          <p className="text-xs text-white/50">Save with regular cleaning</p>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Cleaning frequency">
            {(['once', 'weekly', 'fortnightly', 'monthly'] as const).map((f) => {
              const discount = service.frequencyDiscounts?.[f]
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={`relative px-3 py-2 text-sm font-semibold rounded transition-all ${
                    frequency === f
                      ? 'bg-neon-blue text-black'
                      : 'glass-input text-white/70 hover:text-white'
                  }`}
                  role="radio"
                  aria-checked={frequency === f}
                >
                  {f === 'once' ? 'One-time' : f}
                  {discount && (
                    <span className="absolute -top-1 -right-1 bg-neon-green text-black text-xs px-1.5 py-0.5 rounded-full font-bold">
                      -{discount * 100}%
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Price Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={priceRange ? `${priceRange.min}-${priceRange.max}` : 'loading'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 rounded-xl p-6 text-center border border-neon-blue/20"
          role="status"
          aria-live="polite"
          aria-label="Price estimate"
        >
          {isCalculating || !priceRange ? (
            <div className="flex items-center justify-center gap-2" aria-label="Calculating price">
              <Loader className="w-5 h-5 text-neon-blue animate-spin" aria-hidden="true" />
              <span className="text-sm">Calculating best price...</span>
            </div>
          ) : (
            <>
              <div className="text-sm text-white/60 mb-1">Estimated Price (incl. GST)</div>
              <div className="text-4xl font-black text-gradient mb-2">
                ${priceRange.avg} AUD
              </div>
              <div className="text-xs text-white/50">
                Range: ${priceRange.min} — ${priceRange.max}
              </div>
              <div className="mt-2 text-xs text-white/40">
                ✓ GST included · ✓ {state} state rate applied (×{stateMultiplier})
              </div>
              {frequency !== 'once' && service.frequencyDiscounts && (
                <div className="mt-2 text-sm text-neon-green font-semibold">
                  You save ${Math.round(priceRange.avg * (service.frequencyDiscounts[frequency] ?? 0))} with {frequency} cleaning!
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* CTA */}
      <a
        href="/booking"
        className="w-full glass-button-neon py-3 text-center font-bold block"
        role="button"
      >
        Book Now — Get Exact Quote →
      </a>
    </div>
  )
}
