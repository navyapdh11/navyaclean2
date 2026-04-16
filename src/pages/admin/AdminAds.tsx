// Admin Ads & Banners Management
import { useState } from 'react'

import { Plus, Edit2, Trash2, Eye, Pause, Play } from 'lucide-react'

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

export default function AdminAds() {
  const [ads, setAds] = useState<Ad[]>(MOCK_ADS)

  const toggleStatus = (id: string) => {
    setAds((prev) => prev.map((a) => {
      if (a.id !== id) return a
      const next = a.status === 'active' ? 'paused' : a.status === 'paused' ? 'active' : a.status
      return { ...a, status: next }
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Ads & Banners</h1>
          <p className="text-white/50 text-sm">Manage advertising campaigns and placements</p>
        </div>
        <button className="glass-button-neon px-4 py-2 text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Ad
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Impressions', value: ads.reduce((s, a) => s + a.impressions, 0).toLocaleString() },
          { label: 'Total Clicks', value: ads.reduce((s, a) => s + a.clicks, 0).toLocaleString() },
          { label: 'CTR', value: `${((ads.reduce((s, a) => s + a.clicks, 0) / Math.max(ads.reduce((s, a) => s + a.impressions, 0), 1)) * 100).toFixed(1)}%` },
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
                    <button className="p-1.5 hover:bg-white/10 rounded" title="Preview"><Eye className="w-4 h-4" /></button>
                    <button className="p-1.5 hover:bg-white/10 rounded" title="Edit"><Edit2 className="w-4 h-4" /></button>
                    <button className="p-1.5 hover:bg-white/10 rounded" title={ad.status === 'active' ? 'Pause' : 'Activate'} onClick={() => toggleStatus(ad.id)}>
                      {ad.status === 'active' ? <Pause className="w-4 h-4 text-yellow-400" /> : <Play className="w-4 h-4 text-neon-green" />}
                    </button>
                    <button className="p-1.5 hover:bg-white/10 rounded" title="Delete"><Trash2 className="w-4 h-4 text-red-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
