// Admin Audit Log — track all admin actions
import { useState } from 'react'
import { Filter, Download, Search } from 'lucide-react'

interface AuditEntry {
  id: string
  action: string
  resource: string
  actor: string
  timestamp: string
  details: string
}

const MOCK_AUDIT: AuditEntry[] = [
  { id: '1', action: 'PRICE_UPDATE', resource: 'pricing', actor: 'Admin User', timestamp: '2026-04-16 14:32', details: 'NSW multiplier: 1.10 → 1.15' },
  { id: '2', action: 'DISCOUNT_CREATED', resource: 'discounts', actor: 'Admin User', timestamp: '2026-04-16 12:15', details: 'Created WELCOME20 (20% off)' },
  { id: '3', action: 'PHOTO_DELETED', resource: 'photos', actor: 'Sarah Mitchell', timestamp: '2026-04-16 10:00', details: 'Deleted 3 old photos' },
  { id: '4', action: 'STAFF_UPDATED', resource: 'staff', actor: 'Admin User', timestamp: '2026-04-15 16:45', details: 'Mike Johnson: active → inactive' },
  { id: '5', action: 'AD_PAUSED', resource: 'ads', actor: 'Sarah Mitchell', timestamp: '2026-04-15 14:20', details: 'Paused Spring Clean Special campaign' },
  { id: '6', action: 'SETTINGS_UPDATED', resource: 'settings', actor: 'Admin User', timestamp: '2026-04-15 09:00', details: 'Updated GST rate to 10%' },
  { id: '7', action: 'QUOTE_CREATED', resource: 'quotes', actor: 'System', timestamp: '2026-04-15 08:30', details: 'Quote #QT-0487 created via website' },
  { id: '8', action: 'BOOKING_CONFIRMED', resource: 'bookings', actor: 'System', timestamp: '2026-04-14 17:00', details: 'Booking #BK-0312 confirmed' },
]

export default function AdminAudit() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = MOCK_AUDIT.filter((entry) => {
    const matchesFilter = filter === 'all' || entry.resource === filter
    const matchesSearch = search === '' || entry.actor.toLowerCase().includes(search.toLowerCase()) || entry.action.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Audit Log</h1>
          <p className="text-white/50 text-sm">{MOCK_AUDIT.length} entries</p>
        </div>
        <button
          onClick={() => {
            const header = 'Timestamp,Action,Resource,Actor,Details'
            const rows = filtered.map((e) => `${e.timestamp},${e.action},${e.resource},${e.actor},"${e.details}"`).join('\n')
            const blob = new Blob([header + '\n' + rows], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
            a.click()
            URL.revokeObjectURL(url)
          }}
          className="glass-input px-4 py-2 text-sm font-semibold flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search actions or actors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-10 p-2.5 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/40" />
          {['all', 'pricing', 'discounts', 'photos', 'staff', 'ads', 'settings'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                filter === cat ? 'bg-neon-blue text-black' : 'glass-input text-white/60 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Table */}
      <div className="glass-panel overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="p-4 text-white/50 font-semibold">Timestamp</th>
              <th className="p-4 text-white/50 font-semibold">Action</th>
              <th className="p-4 text-white/50 font-semibold">Resource</th>
              <th className="p-4 text-white/50 font-semibold">Actor</th>
              <th className="p-4 text-white/50 font-semibold">Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 text-white/40 font-mono text-xs">{entry.timestamp}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    entry.action.includes('DELETE') ? 'bg-red-500/20 text-red-400' :
                    entry.action.includes('CREATE') ? 'bg-neon-green/20 text-neon-green' :
                    entry.action.includes('UPDATE') ? 'bg-neon-blue/20 text-neon-blue' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {entry.action}
                  </span>
                </td>
                <td className="p-4 capitalize text-white/60">{entry.resource}</td>
                <td className="p-4 text-white/70">{entry.actor}</td>
                <td className="p-4 text-white/50 text-xs">{entry.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
