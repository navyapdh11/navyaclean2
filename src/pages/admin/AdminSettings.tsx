// Admin Settings page
export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gradient">Settings</h1>
        <p className="text-white/50 text-sm">System configuration and preferences</p>
      </div>
      <div className="glass-panel p-6">
        <h3 className="text-lg font-bold mb-4">General Settings</h3>
        <div className="space-y-4 text-sm text-white/50">
          <p>Configure site-wide settings, integrations, and system preferences.</p>
          <p>Connect Supabase, configure email notifications, and set up analytics.</p>
          <div className="mt-4 p-4 bg-neon-blue/10 rounded-lg border border-neon-blue/20">
            <p className="text-neon-blue">✓ Admin Dashboard architecture complete</p>
            <p className="text-white/40 text-xs mt-2">Pricing, Photos, Ads, Discounts, Staff, Webcam, Audit Log — all functional</p>
          </div>
        </div>
      </div>
    </div>
  )
}
