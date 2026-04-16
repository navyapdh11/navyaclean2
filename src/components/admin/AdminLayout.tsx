// Admin Layout — wraps all admin pages with sidebar navigation
import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, DollarSign, Image, Megaphone, Percent, Users, Camera, FileText,
  Settings, ChevronLeft, ChevronRight, Home, LogOut, Shield
} from 'lucide-react'

interface NavItem {
  icon: React.ReactNode
  label: string
  path: string
  badge?: string
}

const NAV_ITEMS: NavItem[] = [
  { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/admin' },
  { icon: <DollarSign className="w-5 h-5" />, label: 'Pricing', path: '/admin/pricing' },
  { icon: <Image className="w-5 h-5" />, label: 'Photos', path: '/admin/photos' },
  { icon: <Megaphone className="w-5 h-5" />, label: 'Ads & Banners', path: '/admin/ads', badge: '2' },
  { icon: <Percent className="w-5 h-5" />, label: 'Discounts', path: '/admin/discounts', badge: '3' },
  { icon: <Users className="w-5 h-5" />, label: 'Staff', path: '/admin/staff' },
  { icon: <Camera className="w-5 h-5" />, label: 'Webcam', path: '/admin/webcam' },
  { icon: <FileText className="w-5 h-5" />, label: 'Audit Log', path: '/admin/audit' },
  { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/admin/settings' },
]

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex bg-gray-950 text-white">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.2 }}
        className="relative bg-gray-900 border-r border-white/10 flex flex-col"
      >
        {/* Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-neon-blue text-black rounded-full flex items-center justify-center z-10"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-white/10">
          <Shield className="w-6 h-6 text-neon-blue flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-3 font-black text-gradient text-sm"
              >
                ADMIN PANEL
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.badge && !collapsed && (
                <span className="ml-auto bg-neon-purple text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Links */}
        <div className="p-2 border-t border-white/10 space-y-1">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Back to Site</span>}
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Exit Admin</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-gray-900/50 backdrop-blur border-b border-white/10 flex items-center px-6">
          <h2 className="text-lg font-bold">
            {NAV_ITEMS.find((n) => window.location.pathname.startsWith(n.path))?.label || 'Admin'}
          </h2>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-white/40">Admin Mode</span>
            <div className="w-8 h-8 rounded-full bg-neon-blue/20 border border-neon-blue/40 flex items-center justify-center text-xs font-bold text-neon-blue">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
