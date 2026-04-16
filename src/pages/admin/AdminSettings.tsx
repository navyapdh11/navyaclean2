// Admin Settings page — site config, integrations, email, analytics
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Mail, BarChart3, Globe, Shield, Database, CheckCircle } from 'lucide-react'

export default function AdminSettings() {
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    siteName: 'Aasta Clean Pro',
    siteUrl: 'https://sparkleclean.pro',
    phone: '+61 8 6226 6262',
    email: 'aastacleanpro@gmail.com',
    abn: '12 345 678 901',
    address: '51 Tate Street, West Leederville WA 6007',
    // Integrations
    supabaseUrl: '',
    supabaseKey: '',
    resendApiKey: '',
    plausibleDomain: '',
    // Email notifications
    emailNotifications: true,
    newQuoteAlert: true,
    bookingConfirmation: true,
    weeklyReport: false,
    // Security
    twoFactorAuth: false,
    sessionTimeout: '30',
  })

  const handleSave = () => {
    try {
      localStorage.setItem('sc_settings', JSON.stringify(settings))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('[Admin] Failed to save settings:', err)
    }
  }

  // Load saved settings
  useState(() => {
    try {
      const saved = localStorage.getItem('sc_settings')
      if (saved) setSettings(JSON.parse(saved))
    } catch { /* ignore */ }
  })

  const Section = ({ icon: Icon, title, description, children }: { icon: React.ElementType; title: string; description: string; children: React.ReactNode }) => (
    <motion.div
      className="glass-panel p-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="flex items-start gap-3 mb-4">
        <Icon className="w-5 h-5 text-neon-blue flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-sm text-white/50">{description}</p>
        </div>
      </div>
      {children}
    </motion.div>
  )

  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 py-2"
    >
      <div className={`w-10 h-6 rounded-full transition-colors relative ${checked ? 'bg-neon-green' : 'bg-gray-600'}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </div>
      <span className="text-sm text-white/70">{label}</span>
    </button>
  )

  const Input = ({ label, type = 'text', value, onChange, placeholder, hint }: { label: string; type?: string; value: string | boolean; onChange: (v: string) => void; placeholder?: string; hint?: string }) => (
    <div>
      <label className="block text-sm text-white/60 mb-1">{label}</label>
      <input
        type={type}
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        className="glass-input w-full p-2.5 text-sm"
        placeholder={placeholder}
      />
      {hint && <p className="text-xs text-white/40 mt-1">{hint}</p>}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Settings</h1>
          <p className="text-white/50 text-sm">System configuration, integrations, and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-neon-green text-sm font-semibold flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Saved!</span>}
          <button onClick={handleSave} className="glass-button-neon px-4 py-2 text-sm font-semibold flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>

      {/* General Settings */}
      <Section icon={Globe} title="General Settings" description="Site-wide configuration and business details">
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Site Name" value={settings.siteName} onChange={(v) => setSettings({ ...settings, siteName: v })} />
          <Input label="Site URL" type="url" value={settings.siteUrl} onChange={(v) => setSettings({ ...settings, siteUrl: v })} hint="Full URL including https://" />
          <Input label="Phone" type="tel" value={settings.phone} onChange={(v) => setSettings({ ...settings, phone: v })} />
          <Input label="Email" type="email" value={settings.email} onChange={(v) => setSettings({ ...settings, email: v })} />
          <Input label="ABN" value={settings.abn} onChange={(v) => setSettings({ ...settings, abn: v })} hint="Australian Business Number" />
          <Input label="Address" value={settings.address} onChange={(v) => setSettings({ ...settings, address: v })} />
        </div>
      </Section>

      {/* Integrations */}
      <Section icon={Database} title="Integrations" description="Connect external services and APIs">
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Supabase URL" value={settings.supabaseUrl} onChange={(v) => setSettings({ ...settings, supabaseUrl: v })} placeholder="https://your-project.supabase.co" />
          <Input label="Supabase Anon Key" type="password" value={settings.supabaseKey} onChange={(v) => setSettings({ ...settings, supabaseKey: v })} placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." hint="Found in Supabase Dashboard → Settings → API" />
          <Input label="Resend API Key" type="password" value={settings.resendApiKey} onChange={(v) => setSettings({ ...settings, resendApiKey: v })} placeholder="re_..." hint="For email notifications" />
          <Input label="Plausible Domain" value={settings.plausibleDomain} onChange={(v) => setSettings({ ...settings, plausibleDomain: v })} placeholder="sparkleclean.pro" hint="For privacy-first analytics" />
        </div>
      </Section>

      {/* Email Notifications */}
      <Section icon={Mail} title="Email Notifications" description="Configure automated email alerts and reports">
        <div className="space-y-3">
          <Toggle checked={settings.emailNotifications} onChange={(v) => setSettings({ ...settings, emailNotifications: v })} label="Enable Email Notifications" />
          <Toggle checked={settings.newQuoteAlert} onChange={(v) => setSettings({ ...settings, newQuoteAlert: v })} label="New Quote Alerts" />
          <Toggle checked={settings.bookingConfirmation} onChange={(v) => setSettings({ ...settings, bookingConfirmation: v })} label="Booking Confirmations" />
          <Toggle checked={settings.weeklyReport} onChange={(v) => setSettings({ ...settings, weeklyReport: v })} label="Weekly Summary Reports" />
        </div>
      </Section>

      {/* Security */}
      <Section icon={Shield} title="Security" description="Authentication and session settings">
        <div className="space-y-4">
          <Toggle checked={settings.twoFactorAuth} onChange={(v) => setSettings({ ...settings, twoFactorAuth: v })} label="Two-Factor Authentication" />
          <div>
            <label className="block text-sm text-white/60 mb-1">Session Timeout (minutes)</label>
            <select
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
              className="glass-input w-full p-2.5 text-sm"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
            </select>
          </div>
        </div>
      </Section>

      {/* Analytics */}
      <Section icon={BarChart3} title="Analytics" description="Tracking and performance monitoring">
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="glass-panel p-4">
            <div className="text-2xl font-bold text-neon-blue">487</div>
            <div className="text-xs text-white/50">Total Quotes</div>
          </div>
          <div className="glass-panel p-4">
            <div className="text-2xl font-bold text-neon-green">$48,750</div>
            <div className="text-xs text-white/50">Revenue This Month</div>
          </div>
          <div className="glass-panel p-4">
            <div className="text-2xl font-bold text-neon-purple">312</div>
            <div className="text-xs text-white/50">Bookings</div>
          </div>
        </div>
      </Section>
    </div>
  )
}
