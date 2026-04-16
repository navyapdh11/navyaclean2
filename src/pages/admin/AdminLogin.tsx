import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Lock, Eye, EyeOff } from 'lucide-react'
import { adminLogin } from '../../lib/admin-api'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [retryAfter, setRetryAfter] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (retryAfter && retryAfter > 0) {
      setError(`Too many attempts. Try again in ${retryAfter}s`)
      return
    }

    setLoading(true)

    const result = await adminLogin(email, password, pin || undefined)

    if ('error' in result) {
      setError(result.error)
      if (result.retryAfter) {
        setRetryAfter(result.retryAfter)
        const timer = setInterval(() => {
          setRetryAfter((prev) => {
            if (!prev || prev <= 1) {
              clearInterval(timer)
              return null
            }
            return prev - 1
          })
        }, 1000)
      }
    } else {
      navigate('/admin/dashboard')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-panel p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-neon-blue mx-auto mb-3" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-gradient">Admin Access</h1>
          <p className="text-white/50 text-sm mt-1">SparkleClean Pro Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm text-white/60 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sparkleclean.pro"
              className="glass-input w-full p-3 text-sm"
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-white/60 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="glass-input w-full p-3 text-sm"
              required
              autoComplete="current-password"
            />
          </div>

          {/* PIN (optional second factor) */}
          <div>
            <label className="block text-sm text-white/60 mb-1">
              PIN <span className="text-white/30">(optional)</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" aria-hidden="true" />
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit PIN"
                className="glass-input w-full p-3 pl-10 text-sm"
                maxLength={6}
                inputMode="numeric"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || (retryAfter !== null && retryAfter > 0)}
            className="glass-button-neon w-full py-3 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? 'Signing in...' : retryAfter ? `Try again in ${retryAfter}s` : 'Sign In'}
          </button>
        </form>

        <p className="text-white/30 text-xs text-center mt-6">
          Restricted access. All actions are logged and monitored.
        </p>
      </div>
    </div>
  )
}
