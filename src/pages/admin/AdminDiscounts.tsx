// Admin Discounts & Offerings Management — full CRUD with modal forms
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Percent, DollarSign, Copy, ToggleLeft, ToggleRight, X, Save } from 'lucide-react'

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

const emptyDiscount = (): Omit<Discount, 'id' | 'usedCount'> => ({
  code: '', type: 'percentage', value: 0, usageLimit: null, isActive: true,
  startDate: new Date().toISOString().split('T')[0] as string,
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] as string,
  description: '',
})

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>(MOCK_DISCOUNTS)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyDiscount())

  const toggleActive = (id: string) => {
    setDiscounts((prev) => prev.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d)))
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this discount? This cannot be undone.')) {
      setDiscounts((prev) => prev.filter((d) => d.id !== id))
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyDiscount())
    setShowModal(true)
  }

  const openEdit = (discount: Discount) => {
    setEditingId(discount.id)
    setForm({
      code: discount.code,
      type: discount.type,
      value: discount.value,
      usageLimit: discount.usageLimit,
      isActive: discount.isActive,
      startDate: discount.startDate,
      endDate: discount.endDate,
      description: discount.description,
    })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.code || form.value <= 0) {
      alert('Code and value are required')
      return
    }
    if (editingId) {
      setDiscounts((prev) =>
        prev.map((d) => d.id === editingId ? { ...d, ...form } : d)
      )
    } else {
      setDiscounts((prev) => [{ ...form, id: String(Date.now()), usedCount: 0 }, ...prev])
    }
    setShowModal(false)
  }

  const activeCount = discounts.filter((d) => d.isActive).length
  const totalUses = discounts.reduce((s, d) => s + d.usedCount, 0)
  const totalCapacity = discounts.reduce((s, d) => s + (d.usageLimit ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Discounts & Offerings</h1>
          <p className="text-white/50 text-sm">{activeCount} active discounts</p>
        </div>
        <button onClick={openCreate} className="glass-button-neon px-4 py-2 text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Discount
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-neon-green">{activeCount}</div>
          <div className="text-xs text-white/50">Active Discounts</div>
        </div>
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-neon-blue">{totalUses}</div>
          <div className="text-xs text-white/50">Total Uses</div>
        </div>
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-neon-purple">{totalCapacity || '∞'}</div>
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
                <button onClick={() => openEdit(discount)} className="p-1 hover:bg-white/10 rounded" title="Edit"><Edit2 className="w-3 h-3" /></button>
                <button onClick={() => handleDelete(discount.id)} className="p-1 hover:bg-white/10 rounded" title="Delete"><Trash2 className="w-3 h-3 text-red-400" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gradient">
                  {editingId ? 'Edit Discount' : 'Create Discount'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/10 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Discount Code *</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="glass-input w-full p-2.5 text-sm font-mono"
                    placeholder="e.g. SUMMER25"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value as 'percentage' | 'fixed' })}
                      className="glass-input w-full p-2.5 text-sm"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Value *</label>
                    <input
                      type="number"
                      value={form.value}
                      onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                      className="glass-input w-full p-2.5 text-sm"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Usage Limit (empty = unlimited)</label>
                  <input
                    type="number"
                    value={form.usageLimit ?? ''}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value ? Number(e.target.value) : null })}
                    className="glass-input w-full p-2.5 text-sm"
                    min="0"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="glass-input w-full p-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1">End Date</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="glass-input w-full p-2.5 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="glass-input w-full p-2.5 text-sm"
                    placeholder="e.g. 20% off first clean"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setForm({ ...form, isActive: !form.isActive })}>
                    {form.isActive ? <ToggleRight className="w-8 h-8 text-neon-green" /> : <ToggleLeft className="w-8 h-8 text-gray-600" />}
                  </button>
                  <span className="text-sm text-white/60">{form.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="glass-input px-4 py-2 text-sm font-semibold">Cancel</button>
                <button onClick={handleSave} className="glass-button-neon px-4 py-2 text-sm font-semibold flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
