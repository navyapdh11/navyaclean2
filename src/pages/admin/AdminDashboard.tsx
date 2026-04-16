// Admin Dashboard Overview — stats, quick actions, recent activity
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DollarSign, Users, Percent, Camera, Activity, Clock, AlertTriangle } from 'lucide-react'

export default function AdminDashboard() {
  const stats = {
    totalQuotes: 487,
    totalBookings: 312,
    activeDiscounts: 3,
    activeStaff: 12,
    camerasOnline: 2,
    revenueThisMonth: 48750,
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Revenue (Month)', value: `$${stats.revenueThisMonth.toLocaleString()}`, icon: DollarSign, color: 'text-neon-green' },
          { label: 'Total Bookings', value: stats.totalBookings, icon: Activity, color: 'text-neon-blue' },
          { label: 'Active Discounts', value: stats.activeDiscounts, icon: Percent, color: 'text-neon-purple' },
          { label: 'Staff Online', value: `${stats.activeStaff}`, icon: Users, color: 'text-neon-green' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="glass-panel p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-xs text-white/40">Last 30 days</span>
            </div>
            <div className="text-2xl font-black">{stat.value}</div>
            <div className="text-sm text-white/50">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Update Pricing', to: '/admin/pricing', icon: DollarSign },
            { label: 'Manage Photos', to: '/admin/photos', icon: Camera },
            { label: 'Create Discount', to: '/admin/discounts', icon: Percent },
            { label: 'View Webcam', to: '/admin/webcam', icon: Camera },
          ].map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="glass-input p-4 rounded-lg text-center hover:bg-white/10 transition-all block"
            >
              <action.icon className="w-6 h-6 mx-auto mb-2 text-neon-blue" />
              <div className="text-sm font-semibold">{action.label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Quotes */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-neon-blue" />
            Recent Quotes
          </h3>
          <div className="space-y-3">
            {[
              { id: 'QT-0487', service: 'Domestic Clean', location: 'Bondi, NSW', amount: 185, time: '2 min ago' },
              { id: 'QT-0486', service: 'End of Lease', location: 'Parramatta, NSW', amount: 650, time: '15 min ago' },
              { id: 'QT-0485', service: 'Office Clean', location: 'Sydney CBD', amount: 320, time: '1 hr ago' },
              { id: 'QT-0484', service: 'Carpet Clean', location: 'Manly, NSW', amount: 240, time: '2 hrs ago' },
            ].map((quote) => (
              <div key={quote.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <div className="text-sm font-semibold">{quote.service}</div>
                  <div className="text-xs text-white/40">{quote.location}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-neon-green">${quote.amount}</div>
                  <div className="text-xs text-white/40">{quote.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Alerts & Notifications
          </h3>
          <div className="space-y-3">
            {[
              { type: 'warning', message: '2 cameras offline — check connections', time: '5 min ago' },
              { type: 'info', message: 'New discount code WELCOME20 is active', time: '1 hr ago' },
              { type: 'success', message: 'Monthly revenue target reached', time: '3 hrs ago' },
              { type: 'warning', message: '3 pending staff applications', time: '1 day ago' },
            ].map((alert, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  alert.type === 'warning' ? 'bg-yellow-400' :
                  alert.type === 'info' ? 'bg-neon-blue' : 'bg-neon-green'
                }`} />
                <div className="flex-1">
                  <div className="text-sm">{alert.message}</div>
                  <div className="text-xs text-white/40">{alert.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
