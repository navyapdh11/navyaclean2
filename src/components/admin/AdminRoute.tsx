import { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { validateAdminSession, type AdminUser } from '../../lib/admin-api'
import { Loader2 } from 'lucide-react'

interface AdminRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'manager'
}

export default function AdminRoute({ children, requiredRole }: AdminRouteProps) {
  const location = useLocation()
  const [validating, setValidating] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [_user, setUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    let cancelled = false

    async function checkAuth() {
      const result = await validateAdminSession()

      if (cancelled) return

      if (!result.valid || !result.user) {
        setAuthorized(false)
        setValidating(false)
        return
      }

      if (requiredRole && result.user.role !== 'admin' && result.user.role !== requiredRole) {
        setAuthorized(false)
        setUser(result.user)
        setValidating(false)
        return
      }

      setAuthorized(true)
      setUser(result.user)
      setValidating(false)
    }

    checkAuth()
    return () => { cancelled = true }
  }, [requiredRole])

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-neon-blue animate-spin mx-auto mb-3" aria-hidden="true" />
          <p className="text-white/50 text-sm">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
