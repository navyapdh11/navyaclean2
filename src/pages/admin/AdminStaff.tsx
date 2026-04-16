// Admin Staff Management
import { useState } from 'react'

import { Plus, Users, Edit2, Trash2, Phone, Mail, MapPin, ToggleRight, ToggleLeft } from 'lucide-react'

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

export default function AdminStaff() {
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF)

  const toggleActive = (id: string) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Staff Management</h1>
          <p className="text-white/50 text-sm">{staff.filter((s) => s.isActive).length} active · {staff.length} total</p>
        </div>
        <button className="glass-button-neon px-4 py-2 text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Staff', value: staff.filter((s) => s.isActive).length, icon: Users, color: 'text-neon-green' },
          { label: 'Total Jobs', value: staff.reduce((s, m) => s + m.jobsCompleted, 0), icon: MapPin, color: 'text-neon-blue' },
          { label: 'Avg Rating', value: (staff.filter((s) => s.rating > 0).reduce((s, m) => s + m.rating, 0) / Math.max(staff.filter((s) => s.rating > 0).length, 1)).toFixed(1), icon: Users, color: 'text-neon-purple' },
          { label: 'Departments', value: [...new Set(staff.map((s) => s.department))].length, icon: Users, color: 'text-yellow-400' },
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
                  <button onClick={() => toggleActive(member.id)}>
                    {member.isActive ? <ToggleRight className="w-8 h-8 text-neon-green" /> : <ToggleLeft className="w-8 h-8 text-gray-600" />}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-white/10 rounded"><Edit2 className="w-4 h-4" /></button>
                    <button className="p-1.5 hover:bg-white/10 rounded"><Trash2 className="w-4 h-4 text-red-400" /></button>
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
