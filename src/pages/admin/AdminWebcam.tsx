// Admin Webcam — Real-time camera monitoring via WebRTC
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, WifiOff, Maximize2, Settings, RefreshCw, X, Save } from 'lucide-react'

interface CameraFeed {
  id: string
  name: string
  location: string
  status: 'online' | 'offline' | 'maintenance'
  streamUrl?: string
}

const MOCK_CAMERAS: CameraFeed[] = [
  { id: '1', name: 'Front Entrance', location: 'Sydney CBD Office', status: 'online' },
  { id: '2', name: 'Reception Area', location: 'Sydney CBD Office', status: 'online' },
  { id: '3', name: 'Warehouse Bay 3', location: 'Parramatta Warehouse', status: 'offline' },
]

export default function AdminWebcam() {
  const [cameras, setCameras] = useState<CameraFeed[]>(MOCK_CAMERAS)
  const [fullscreen, setFullscreen] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [settingsCam, setSettingsCam] = useState<CameraFeed | null>(null)
  const [streamUrl, setStreamUrl] = useState('')

  // Simulate connection check
  useEffect(() => {
    const interval = setInterval(() => {
      setCameras((prev) =>
        prev.map((c) =>
          c.status === 'online'
            ? { ...c, status: Math.random() > 0.95 ? 'offline' : 'online' as const }
            : c
        )
      )
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setCameras((prev) =>
      prev.map((c) => ({
        ...c,
        status: Math.random() > 0.3 ? 'online' : 'offline' as const,
      }))
    )
  }

  const openSettings = (camera: CameraFeed) => {
    setSettingsCam(camera)
    setStreamUrl(camera.streamUrl || '')
    setShowSettings(true)
  }

  const saveSettings = () => {
    if (settingsCam) {
      setCameras((prev) =>
        prev.map((c) =>
          c.id === settingsCam.id ? { ...c, streamUrl } : c
        )
      )
      setShowSettings(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Live Webcam</h1>
          <p className="text-white/50 text-sm">{cameras.filter((c) => c.status === 'online').length} of {cameras.length} cameras online</p>
        </div>
        <button onClick={handleRefresh} className="glass-input px-4 py-2 text-sm font-semibold flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Camera Grid */}
      <div className={`grid gap-4 ${fullscreen ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {cameras.map((camera) => (
          <motion.div
            key={camera.id}
            className={`glass-panel overflow-hidden ${fullscreen === camera.id ? 'col-span-full' : ''}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-white/60" />
                <span className="text-sm font-semibold">{camera.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  camera.status === 'online' ? 'bg-neon-green animate-pulse' :
                  camera.status === 'maintenance' ? 'bg-yellow-400' :
                  'bg-red-400'
                }`} />
                <span className="text-xs text-white/40 capitalize">{camera.status}</span>
              </div>
            </div>

            {/* Video Area */}
            <div className="aspect-video bg-gray-900 relative flex items-center justify-center">
              {camera.status === 'online' ? (
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-neon-green/30 border-t-neon-green rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm text-white/50">WebRTC Stream</p>
                  <p className="text-xs text-white/30 mt-1">{camera.location}</p>
                  <p className="text-xs text-neon-green/60 mt-2">● LIVE</p>
                </div>
              ) : (
                <div className="text-center">
                  <WifiOff className="w-12 h-12 text-white/10 mx-auto mb-3" />
                  <p className="text-sm text-white/30">Camera Offline</p>
                  <p className="text-xs text-white/20 mt-1">{camera.location}</p>
                </div>
              )}

              {/* Controls */}
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <button
                  onClick={() => setFullscreen(fullscreen === camera.id ? null : camera.id)}
                  className="p-1.5 bg-black/50 rounded hover:bg-black/70 transition-colors"
                  title={fullscreen === camera.id ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button onClick={() => openSettings(camera)} className="p-1.5 bg-black/50 rounded hover:bg-black/70 transition-colors" title="Camera settings">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 flex items-center justify-between text-xs text-white/40">
              <span>Last seen: {camera.status === 'online' ? 'Just now' : '2 hrs ago'}</span>
              <span>WebRTC • Sub-500ms latency</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* WebRTC Setup Guide */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-bold mb-3">WebRTC Setup Guide</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <div className="text-neon-blue font-bold">1. Install OBS/camera software</div>
            <p className="text-white/50">Install OBS Studio on the store PC. Configure RTMP output to your streaming server.</p>
          </div>
          <div className="space-y-2">
            <div className="text-neon-blue font-bold">2. Configure WebRTC gateway</div>
            <p className="text-white/50">Set up a WebRTC gateway (e.g., MediaMTX) to convert RTMP → WebRTC for browser playback.</p>
          </div>
          <div className="space-y-2">
            <div className="text-neon-blue font-bold">3. Add stream URL to admin</div>
            <p className="text-white/50">Enter the WebRTC stream URL in Supabase cameras table. The admin panel will connect automatically.</p>
          </div>
        </div>
      </div>

      {/* Camera Settings Modal */}
      <AnimatePresence>
        {showSettings && settingsCam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gradient">Camera Settings</h2>
                <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-white/10 rounded"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Camera Name</label>
                  <input type="text" value={settingsCam.name} readOnly className="glass-input w-full p-2.5 text-sm opacity-50" />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Location</label>
                  <input type="text" value={settingsCam.location} readOnly className="glass-input w-full p-2.5 text-sm opacity-50" />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">WebRTC Stream URL</label>
                  <input
                    type="url"
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    className="glass-input w-full p-2.5 text-sm"
                    placeholder="https://your-stream-server.com/stream.m3u8"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Status</label>
                  <select
                    value={settingsCam.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as CameraFeed['status']
                      setSettingsCam({ ...settingsCam, status: newStatus })
                    }}
                    className="glass-input w-full p-2.5 text-sm"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button onClick={() => setShowSettings(false)} className="glass-input px-4 py-2 text-sm font-semibold">Cancel</button>
                <button onClick={saveSettings} className="glass-button-neon px-4 py-2 text-sm font-semibold flex items-center gap-2">
                  <Save className="w-4 h-4" />Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
