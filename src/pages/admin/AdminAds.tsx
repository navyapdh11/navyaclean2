// Admin Ads & Banners Management — full CRUD with modal forms
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Eye, Pause, Play, X, Save } from 'lucide-react'

interface Ad {
  id: string
  name: string
  type: 'banner' | 'popup' | 'sidebar'
  status: 'active' | 'draft' | 'paused' | 'expired'
  position: string
  impressions: number
  clicks: number
  startDate: string
  endDate: string
}

const MOCK_ADS: Ad[] = [
  { id: '1', name: 'Summer Sale 2026', type: 'banner', status: 'active', position: 'homepage_hero', impressions: 12450, clicks: 387, startDate: '2026-01-01', endDate: '2026-03-31' },
  { id: '2', name: 'End of Lease Promo', type: 'popup', status: 'draft', position: 'services_page', impressions: 0, clicks: 0, startDate: '2026-04-01', endDate: '2026-05-31' },
  { id: '3', name: 'Spring Clean Special', type: 'sidebar', status: 'paused', position: 'booking_sidebar', impressions: 8920, clicks: 245, startDate: '2025-10-01', endDate: '2026-01-31' },
]

const emptyAd = (): Omit<Ad, 'id' | 'impressions' | 'clicks'> => ({
  name: '', type: 'banner', status: 'draft', position: '',
  startDate: new Date().toISOString().split('T')[0] as string,
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] as string,
})

export default function AdminAds() {
  const [ads, setAds] = useState<Ad[]>(MOCK_ADS)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyAd())
  const [previewAd, setPreviewAd] = useState<Ad | null>(null)

  const handleToggleStatus = (id: string) => {
    setAds((prev) => prev.map((a) => {
      if (a.id !== id) return a
      const cycle: Record<string, Ad['status']> = { active: 'paused', paused: 'active', draft: 'active', expired: 'draft' }
      return { ...a, status: cycle[a.status] || 'draft' }
    }))
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this ad campaign? This cannot be undone.')) {
      setAds((prev) => prev.filter((a) => a.id !== id))
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyAd())
    setShowModal(true)
  }

  const openEdit = (ad: Ad) => {
    setEditingId(ad.id)
    setForm({ name: ad.name, type: ad.type, status: ad.status, position: ad.position, startDate: ad.startDate, endDate: ad.endDate })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name || !form.position) {
      alert('Name and position are required')
      return
    }
    if (editingId) {
      setAds((prev) => prev.map((a) => a.id === editingId ? { ...a, ...form } : a))
    } else {
      setAds((prev) => [{ ...form, id: String(Date.now()), impressions: 0, clicks: 0 }, ...prev])
    }
    setShowModal(false)
  }

  const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0)
  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0)
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0.0'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Ads & Banners</h1>
          <p className="text-white/50 text-sm">Manage advertising campaigns and placements</p>
        </div>
        <button onClick={openCreate} className="glass-button-neon px-4 py-2 text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Ad
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Impressions', value: totalImpressions.toLocaleString() },
          { label: 'Total Clicks', value: totalClicks.toLocaleString() },
          { label: 'CTR', value: `${ctr}%` },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel p-4 text-center">
            <div className="text-2xl font-bold text-neon-blue">{stat.value}</div>
            <div className="text-xs text-white/50">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Ads Table */}
      <div className="glass-panel overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="p-4 text-white/50 font-semibold">Campaign</th>
              <th className="p-4 text-white/50 font-semibold">Type</th>
              <th className="p-4 text-white/50 font-semibold">Position</th>
              <th className="p-4 text-white/50 font-semibold">Status</th>
              <th className="p-4 text-white/50 font-semibold">Impressions</th>
              <th className="p-4 text-white/50 font-semibold">Clicks</th>
              <th className="p-4 text-white/50 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ads.map((ad) => (
              <tr key={ad.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 font-semibold">{ad.name}</td>
                <td className="p-4 capitalize">{ad.type}</td>
                <td className="p-4 text-white/60">{ad.position}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    ad.status === 'active' ? 'bg-neon-green/20 text-neon-green' :
                    ad.status === 'draft' ? 'bg-gray-700 text-gray-400' :
                    ad.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {ad.status}
                  </span>
                </td>
                <td className="p-4 font-mono">{ad.impressions.toLocaleString()}</td>
                <td className="p-4 font-mono">{ad.clicks.toLocaleString()}</td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPreviewAd(ad)} className="p-1.5 hover:bg-white/10 rounded" title="Preview"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => openEdit(ad)} className="p-1.5 hover:bg-white/10 rounded" title="Edit"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleToggleStatus(ad.id)} className="p-1.5 hover:bg-white/10 rounded" title={ad.status === 'active' ? 'Pause' : 'Activate'}>
                      {ad.status === 'active' ? <Pause className="w-4 h-4 text-yellow-400" /> : <Play className="w-4 h-4 text-neon-green" />}
                    </button>
                    <button onClick={() => handleDelete(ad.id)} className="p-1.5 hover:bg-white/10 rounded" title="Delete"><Trash2 className="w-4 h-4 text-red-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                  {editingId ? 'Edit Ad Campaign' : 'Create Ad Campaign'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/10 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Campaign Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="glass-input w-full p-2.5 text-sm"
                    placeholder="e.g. Summer Sale 2026"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value as Ad['type'] })}
                      className="glass-input w-full p-2.5 text-sm"
                    >
                      <option value="banner">Banner</option>
                      <option value="popup">Popup</option>
                      <option value="sidebar">Sidebar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as Ad['status'] })}
                      className="glass-input w-full p-2.5 text-sm"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Position *</label>
                  <select
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="glass-input w-full p-2.5 text-sm"
                  >
                    <option value="">Select position...</option>
                    <option value="homepage_hero">Homepage Hero</option>
                    <option value="services_page">Services Page</option>
                    <option value="booking_sidebar">Booking Sidebar</option>
                    <option value="footer">Footer</option>
                    <option value="popup_booking">Booking Popup</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Start Date</label>
                    <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="glass-input w-full p-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1">End Date</label>
                    <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="glass-input w-full p-2.5 text-sm" />
                  </div>
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

      {/* Preview Modal */}
      <AnimatePresence>
        {previewAd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewAd(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel p-6 w-full max-w-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gradient">Ad Preview: {previewAd.name}</h2>
                <button onClick={() => setPreviewAd(null)} className="p-1 hover:bg-white/10 rounded"><X className="w-5 h-5" /></button>
              </div>
              <div className="bg-gray-800 rounded-xl p-8 text-center mb-4">
                <span className="text-xs text-white/40 uppercase tracking-wider">{previewAd.type} — {previewAd.position}</span>
                <div className="mt-4 text-2xl font-black text-gradient">{previewAd.name}</div>
                <div className="mt-2 text-sm text-white/50">{previewAd.status} · {previewAd.startDate} → {previewAd.endDate}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="glass-panel p-3">
                  <div className="text-lg font-bold">{previewAd.impressions.toLocaleString()}</div>
                  <div className="text-xs text-white/40">Impressions</div>
                </div>
                <div className="glass-panel p-3">
                  <div className="text-lg font-bold">{previewAd.clicks.toLocaleString()}</div>
                  <div className="text-xs text-white/40">Clicks</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
