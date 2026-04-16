// Admin Staff Management — full CRUD with modal forms
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Users, Edit2, Trash2, Phone, Mail, MapPin, ToggleRight, ToggleLeft, X, Save } from 'lucide-react'

interface StaffMember {
  id: string
  name: string
  email: string
  phone: string
  role: 'admin' | 'manager' | 'cleaner' | 'dispatcher'
  department: string
  isActive: boolean
  jobsCompleted: number
  rating: number
  serviceAreas: string[]
}

const MOCK_STAFF: StaffMember[] = [
  { id: '1', name: 'Admin User', email: 'admin@sparkleclean.pro', phone: '+61 400 000 001', role: 'admin', department: 'Management', isActive: true, jobsCompleted: 0, rating: 0, serviceAreas: ['Sydney CBD', 'Parramatta', 'Bondi'] },
  { id: '2', name: 'Sarah Mitchell', email: 'sarah@sparkleclean.pro', phone: '+61 400 000 002', role: 'manager', department: 'Operations', isActive: true, jobsCompleted: 287, rating: 4.9, serviceAreas: ['Sydney CBD', 'North Shore'] },
  { id: '3', name: 'James Chen', email: 'james@sparkleclean.pro', phone: '+61 400 000 003', role: 'cleaner', department: 'Residential', isActive: true, jobsCompleted: 456, rating: 4.8, serviceAreas: ['Bondi', 'Manly', 'Cronulla'] },
  { id: '4', name: 'Emma Green', email: 'emma@sparkleclean.pro', phone: '+61 400 000 004', role: 'cleaner', department: 'Commercial', isActive: true, jobsCompleted: 312, rating: 4.7, serviceAreas: ['Parramatta', 'Liverpool'] },
  { id: '5', name: 'Mike Johnson', email: 'mike@sparkleclean.pro', phone: '+61 400 000 005', role: 'dispatcher', department: 'Logistics', isActive: false, jobsCompleted: 0, rating: 0, serviceAreas: ['All Sydney'] },
]

const emptyStaff = (): Omit<StaffMember, 'id' | 'jobsCompleted' | 'rating'> => ({
  name: '', email: '', phone: '', role: 'cleaner', department: '', isActive: true, serviceAreas: [],
})

export default function AdminStaff() {
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyStaff())

  const toggleActive = (id: string) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)))
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this staff member? This cannot be undone.')) {
      setStaff((prev) => prev.filter((s) => s.id !== id))
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyStaff())
    setShowModal(true)
  }

  const openEdit = (member: StaffMember) => {
    setEditingId(member.id)
    setForm({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      department: member.department,
      isActive: member.isActive,
      serviceAreas: member.serviceAreas,
    })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name || !form.email) {
      alert('Name and email are required')
      return
    }
    if (editingId) {
      setStaff((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? { ...s, ...form }
            : s
        )
      )
    } else {
      const newMember: StaffMember = {
        ...form,
        id: String(Date.now()),
        jobsCompleted: 0,
        rating: 0,
      }
      setStaff((prev) => [newMember, ...prev])
    }
    setShowModal(false)
  }

  const activeStaff = staff.filter((s) => s.isActive).length
  const totalJobs = staff.reduce((s, m) => s + m.jobsCompleted, 0)
  const ratedStaff = staff.filter((s) => s.rating > 0)
  const avgRating = ratedStaff.length > 0 ? (ratedStaff.reduce((s, m) => s + m.rating, 0) / ratedStaff.length).toFixed(1) : '—'
  const departments = [...new Set(staff.map((s) => s.department))].length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Staff Management</h1>
          <p className="text-white/50 text-sm">{activeStaff} active · {staff.length} total</p>
        </div>
        <button onClick={openCreate} className="glass-button-neon px-4 py-2 text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Staff', value: activeStaff, icon: Users, color: 'text-neon-green' },
          { label: 'Total Jobs', value: totalJobs, icon: MapPin, color: 'text-neon-blue' },
          { label: 'Avg Rating', value: avgRating, icon: Users, color: 'text-neon-purple' },
          { label: 'Departments', value: departments, icon: Users, color: 'text-yellow-400' },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel p-4 text-center">
            <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
            <div className="text-xl font-bold">{stat.value}</div>
            <div className="text-xs text-white/50">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Staff Table */}
      <div className="glass-panel overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="p-4 text-white/50 font-semibold">Name</th>
              <th className="p-4 text-white/50 font-semibold">Contact</th>
              <th className="p-4 text-white/50 font-semibold">Role</th>
              <th className="p-4 text-white/50 font-semibold">Jobs</th>
              <th className="p-4 text-white/50 font-semibold">Rating</th>
              <th className="p-4 text-white/50 font-semibold">Status</th>
              <th className="p-4 text-white/50 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center text-xs font-bold text-neon-blue">
                      {member.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold">{member.name}</div>
                      <div className="text-xs text-white/40">{member.department}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-xs text-white/60 flex items-center gap-1"><Mail className="w-3 h-3" />{member.email}</div>
                  <div className="text-xs text-white/60 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{member.phone}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${
                    member.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                    member.role === 'manager' ? 'bg-neon-blue/20 text-neon-blue' :
                    member.role === 'dispatcher' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-neon-green/20 text-neon-green'
                  }`}>
                    {member.role}
                  </span>
                </td>
                <td className="p-4 font-mono">{member.jobsCompleted}</td>
                <td className="p-4">{member.rating > 0 ? `⭐ ${member.rating}` : '—'}</td>
                <td className="p-4">
                  <button onClick={() => toggleActive(member.id)} title={member.isActive ? 'Deactivate' : 'Activate'}>
                    {member.isActive ? <ToggleRight className="w-8 h-8 text-neon-green" /> : <ToggleLeft className="w-8 h-8 text-gray-600" />}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(member)} className="p-1.5 hover:bg-white/10 rounded" title="Edit"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(member.id)} className="p-1.5 hover:bg-white/10 rounded" title="Delete"><Trash2 className="w-4 h-4 text-red-400" /></button>
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
                  {editingId ? 'Edit Staff Member' : 'Add Staff Member'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/10 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="glass-input w-full p-2.5 text-sm"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="glass-input w-full p-2.5 text-sm"
                    placeholder="email@sparkleclean.pro"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="glass-input w-full p-2.5 text-sm"
                    placeholder="+61 400 000 000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Role</label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value as StaffMember['role'] })}
                      className="glass-input w-full p-2.5 text-sm"
                    >
                      <option value="cleaner">Cleaner</option>
                      <option value="manager">Manager</option>
                      <option value="dispatcher">Dispatcher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Department</label>
                    <input
                      type="text"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="glass-input w-full p-2.5 text-sm"
                      placeholder="e.g. Residential"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setForm({ ...form, isActive: !form.isActive })}>
                    {form.isActive ? <ToggleRight className="w-8 h-8 text-neon-green" /> : <ToggleLeft className="w-8 h-8 text-gray-600" />}
                  </button>
                  <span className="text-sm text-white/60">{form.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="glass-input px-4 py-2 text-sm font-semibold">
                  Cancel
                </button>
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
