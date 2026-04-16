// Admin Pricing Management — update state multipliers, base prices, GST rate with full save/reset
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, RotateCcw, DollarSign, Percent, TrendingUp } from 'lucide-react'
import { cleaningServices, AU_STATES, STATE_CONFIG } from '../../lib/services-au'

export default function AdminPricing() {
  const [multipliers, setMultipliers] = useState<Record<string, number>>(
    Object.fromEntries(AU_STATES.map((s) => [s, STATE_CONFIG[s].multiplier]))
  )
  const [basePrices, setBasePrices] = useState<Record<string, number>>(
    Object.fromEntries(
      Object.entries(cleaningServices).map(([id, svc]) => [id, svc.basePrice.min])
    )
  )
  const [gstRate, setGstRate] = useState(10)
  const [unsaved, setUnsaved] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleMultiplierChange = (state: string, value: number) => {
    setMultipliers((prev) => ({ ...prev, [state]: value }))
    setUnsaved(true)
    setSaved(false)
  }

  const handleBasePriceChange = (serviceId: string, value: number) => {
    setBasePrices((prev) => ({ ...prev, [serviceId]: value }))
    setUnsaved(true)
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    // Save to localStorage (persistent across sessions)
    try {
      localStorage.setItem('sc_pricing', JSON.stringify({ multipliers, basePrices, gstRate }))
      // In production: also save to Supabase admin_settings table
      // await supabase.from('admin_settings').upsert({ key: 'pricing', value: { multipliers, basePrices, gstRate } })
      console.log('[Admin] Pricing saved:', { multipliers, basePrices, gstRate })
      setUnsaved(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('[Admin] Failed to save pricing:', err)
      alert('Failed to save pricing. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (!confirm('Reset all pricing to defaults? This will discard unsaved changes.')) return
    setMultipliers(Object.fromEntries(AU_STATES.map((s) => [s, STATE_CONFIG[s].multiplier])))
    setBasePrices(Object.fromEntries(Object.entries(cleaningServices).map(([id, svc]) => [id, svc.basePrice.min])))
    setGstRate(10)
    setUnsaved(false)
  }

  // Load saved pricing on mount
  useState(() => {
    try {
      const saved = localStorage.getItem('sc_pricing')
      if (saved) {
        const data = JSON.parse(saved)
        if (data.multipliers) setMultipliers(data.multipliers)
        if (data.basePrices) setBasePrices(data.basePrices)
        if (data.gstRate) setGstRate(data.gstRate)
      }
    } catch { /* ignore parse errors */ }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Pricing Management</h1>
          <p className="text-white/50 text-sm">Adjust state multipliers, base prices, and GST rate</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-neon-green text-sm font-semibold">✓ Saved!</span>}
          <button
            onClick={handleReset}
            className="glass-input px-4 py-2 text-sm font-semibold flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!unsaved || saving}
            className="glass-button-neon px-4 py-2 text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* GST Rate */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Percent className="w-5 h-5 text-neon-blue" />
          Tax Settings
        </h3>
        <div className="flex items-center gap-4">
          <label className="text-sm text-white/60">GST Rate (%)</label>
          <input
            type="number"
            value={gstRate}
            onChange={(e) => { setGstRate(Number(e.target.value)); setUnsaved(true); setSaved(false) }}
            className="glass-input w-24 p-3 text-center text-lg font-bold"
            min="0"
            max="20"
            step="0.5"
          />
          <span className="text-sm text-white/40">
            Current: 1/{(1 + gstRate / 100).toFixed(1)} of total price
          </span>
        </div>
      </div>

      {/* State Multipliers */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-neon-green" />
          State Multipliers
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {AU_STATES.map((state) => (
            <div key={state} className="text-center">
              <label className="block text-sm font-bold mb-2">{state}</label>
              <input
                type="number"
                value={multipliers[state]}
                onChange={(e) => handleMultiplierChange(state, Number(e.target.value))}
                className="glass-input w-full p-3 text-center text-lg font-bold"
                min="0.5"
                max="2.0"
                step="0.01"
              />
              <div className="text-xs text-white/40 mt-1">
                ${STATE_CONFIG[state].minWage}/hr min wage
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Base Prices */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-neon-purple" />
          Base Prices (AUD)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(cleaningServices).map(([id, svc]) => (
            <motion.div
              key={id}
              className="glass-input p-4 rounded-lg"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{svc.icon}</span>
                <div>
                  <div className="text-sm font-bold">{svc.name}</div>
                  <div className="text-xs text-white/40 capitalize">{svc.category}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">Base: $</span>
                <input
                  type="number"
                  value={basePrices[id]}
                  onChange={(e) => handleBasePriceChange(id, Number(e.target.value))}
                  className="glass-input w-full p-2 text-center font-bold"
                  min="0"
                  step="5"
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-white/40">
                <span>Max: ${svc.basePrice.max}</span>
                <span>{svc.pricingModel?.replace(/_/g, ' / ')}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Price Preview */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-bold mb-4">Price Preview</h3>
        <p className="text-sm text-white/50 mb-4">Sample calculation: Domestic Clean, 3 bed, 2 bath, NSW</p>
        <div className="bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 rounded-xl p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-white/50">Base Price</div>
              <div className="text-xl font-bold">${basePrices.domestic || 55}</div>
            </div>
            <div>
              <div className="text-sm text-white/50">NSW Multiplier</div>
              <div className="text-xl font-bold text-neon-blue">×{multipliers.NSW || 1}</div>
            </div>
            <div>
              <div className="text-sm text-white/50">Final (incl. GST)</div>
              <div className="text-xl font-bold text-neon-green">
                ${Math.round((basePrices.domestic || 55) * (multipliers.NSW || 1))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
