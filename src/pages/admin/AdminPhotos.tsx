// Admin Photo Management — upload, update, delete gallery photos
import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Trash2, Edit, Eye, Image as ImageIcon, Plus } from 'lucide-react'

interface Photo {
  id: string
  url: string
  title: string
  category: string
  serviceId: string
  isActive: boolean
  sortOrder: number
}

const MOCK_PHOTOS: Photo[] = [
  { id: '1', url: '/photos/domestic-1.jpg', title: 'Modern Kitchen Clean', category: 'residential', serviceId: 'domestic', isActive: true, sortOrder: 1 },
  { id: '2', url: '/photos/office-1.jpg', title: 'Office Reception', category: 'commercial', serviceId: 'office', isActive: true, sortOrder: 2 },
  { id: '3', url: '/photos/carpet-1.jpg', title: 'Steam Cleaning Result', category: 'specialized', serviceId: 'carpet', isActive: true, sortOrder: 3 },
  { id: '4', url: '/photos/endoflease-1.jpg', title: 'Bond-Ready Bathroom', category: 'residential', serviceId: 'endOfLease', isActive: true, sortOrder: 4 },
  { id: '5', url: '/photos/industrial-1.jpg', title: 'Warehouse Floor', category: 'commercial', serviceId: 'industrial', isActive: false, sortOrder: 5 },
  { id: '6', url: '/photos/window-1.jpg', title: 'High-Rise Windows', category: 'specialized', serviceId: 'window', isActive: true, sortOrder: 6 },
]

export default function AdminPhotos() {
  const [photos, setPhotos] = useState<Photo[]>(MOCK_PHOTOS)
  const [uploading, setUploading] = useState(false)
  const [_editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = filter === 'all' ? photos : photos.filter((p) => p.category === filter)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    // Simulate upload
    setTimeout(() => {
      const newPhoto: Photo = {
        id: String(Date.now()),
        url: URL.createObjectURL(file),
        title: file.name.replace(/\.[^.]+$/, ''),
        category: 'general',
        serviceId: 'domestic',
        isActive: true,
        sortOrder: photos.length + 1,
      }
      setPhotos((prev) => [newPhoto, ...prev])
      setUploading(false)
    }, 1000)
  }

  const toggleActive = (id: string) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)))
  }

  const deletePhoto = (id: string) => {
    if (confirm('Delete this photo?')) {
      setPhotos((prev) => prev.filter((p) => p.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Photo Management</h1>
          <p className="text-white/50 text-sm">{photos.length} photos · {photos.filter((p) => p.isActive).length} active</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            multiple
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="glass-button-neon px-4 py-2 text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload Photos'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {['all', 'residential', 'commercial', 'specialized', 'general'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-all ${
              filter === cat ? 'bg-neon-blue text-black' : 'glass-input text-white/60 hover:text-white'
            }`}
          >
            {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((photo, i) => (
          <motion.div
            key={photo.id}
            className="glass-panel overflow-hidden group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            {/* Image */}
            <div className="aspect-video bg-gray-800 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-white/20">
                <ImageIcon className="w-12 h-12" />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button className="p-2 bg-white/10 rounded-full hover:bg-white/20" title="Preview">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 bg-white/10 rounded-full hover:bg-white/20" title="Edit" onClick={() => setEditingId(photo.id)}>
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 bg-red-500/20 rounded-full hover:bg-red-500/40" title="Delete" onClick={() => deletePhoto(photo.id)}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
              {/* Active Badge */}
              <div className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-bold rounded-full ${
                photo.isActive ? 'bg-neon-green/20 text-neon-green' : 'bg-red-500/20 text-red-400'
              }`}>
                {photo.isActive ? 'Active' : 'Hidden'}
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <div className="text-sm font-semibold truncate">{photo.title}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-white/40 capitalize">{photo.category}</span>
                <button
                  onClick={() => toggleActive(photo.id)}
                  className={`text-xs px-2 py-1 rounded ${
                    photo.isActive ? 'bg-neon-green/20 text-neon-green' : 'bg-gray-700 text-white/40'
                  }`}
                >
                  {photo.isActive ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Upload Card */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="glass-panel border-2 border-dashed border-white/20 flex flex-col items-center justify-center aspect-video hover:border-neon-blue/40 transition-colors"
        >
          <Plus className="w-8 h-8 text-white/30 mb-2" />
          <span className="text-sm text-white/40">Add Photo</span>
        </button>
      </div>
    </div>
  )
}
