// Admin Discounts & Offerings Management
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Percent, DollarSign, Copy, ToggleLeft, ToggleRight } from 'lucide-react'

interface Discount {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  usedCount: number
  usageLimit: number | null
  isActive: boolean
  startDate: string
  endDate: string
  description: string
}

const MOCK_DISCOUNTS: Discount[] = [
  { id: '1', code: 'WELCOME20', type: 'percentage', value: 20, usedCount: 147, usageLimit: 500, isActive: true, startDate: '2026-01-01', endDate: '2026-12-31', description: '20% off first clean' },
  { id: '2', code: 'SPRING2026', type: 'percentage', value: 15, usedCount: 89, usageLimit: null, isActive: true, startDate: '2026-03-01', endDate: '2026-05-31', description: 'Spring cleaning special' },
  { id: '3', code: 'BONDI50', type: 'fixed', value: 50, usedCount: 23, usageLimit: 100, isActive: true, startDate: '2026-04-01', endDate: '2026-04-30', description: '$50 off Bondi area cleans' },
  { id: '4', code: 'OLDCODE', type: 'percentage', value: 10, usedCount: 312, usageLimit: 300, isActive: false, startDate: '2025-06-01', endDate: '2025-12-31', description: 'Expired promo' },
]

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>(MOCK_DISCOUNTS)

  const toggleActive = (id: string) => {
    setDiscounts((prev) => prev.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d)))
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Discounts & Offerings</h1>
          <p className="text-white/50 text-sm">{discounts.filter((d) => d.isActive).length} active discounts</p>
        </div>
        <button className="glass-button-neon px-4 py-2 text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Discount
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-neon-green">{discounts.filter((d) => d.isActive).length}</div>
          <div className="text-xs text-white/50">Active Discounts</div>
        </div>
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-neon-blue">{discounts.reduce((s, d) => s + d.usedCount, 0)}</div>
          <div className="text-xs text-white/50">Total Uses</div>
        </div>
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-neon-purple">{discounts.reduce((s, d) => s + (d.usageLimit ?? 0), 0)}</div>
          <div className="text-xs text-white/50">Total Capacity</div>
        </div>
      </div>

      {/* Discount Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {discounts.map((discount, i) => (
          <motion.div
            key={discount.id}
            className="glass-panel p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  discount.type === 'percentage' ? 'bg-neon-blue/20' : 'bg-neon-purple/20'
                }`}>
                  {discount.type === 'percentage' ? <Percent className="w-5 h-5 text-neon-blue" /> : <DollarSign className="w-5 h-5 text-neon-purple" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono">{discount.code}</span>
                    <button onClick={() => copyCode(discount.code)} className="text-white/30 hover:text-white/60" title="Copy code">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-xs text-white/40">{discount.description}</div>
                </div>
              </div>
              <button onClick={() => toggleActive(discount.id)}>
                {discount.isActive ? (
                  <ToggleRight className="w-8 h-8 text-neon-green" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-600" />
                )}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center mb-3">
              <div>
                <div className="text-lg font-bold">
                  {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                </div>
                <div className="text-xs text-white/40">Value</div>
              </div>
              <div>
                <div className="text-lg font-bold">{discount.usedCount}</div>
                <div className="text-xs text-white/40">Used</div>
              </div>
              <div>
                <div className="text-lg font-bold">{discount.usageLimit ?? '∞'}</div>
                <div className="text-xs text-white/40">Limit</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-white/40">
              <span>{discount.startDate} → {discount.endDate}</span>
              <div className="flex items-center gap-1">
                <button className="p-1 hover:bg-white/10 rounded"><Edit2 className="w-3 h-3" /></button>
                <button className="p-1 hover:bg-white/10 rounded"><Trash2 className="w-3 h-3 text-red-400" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
