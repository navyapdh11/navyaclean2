// Admin API Client — connects admin UI to Supabase Edge Functions
// Replaces localStorage with real database operations

const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL

// Admin auth
export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'cleaner' | 'dispatcher'
  department: string
}

export interface LoginResponse {
  success: boolean
  user: AdminUser
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export async function adminLogin(
  email: string,
  password: string,
  pin?: string
): Promise<LoginResponse | { error: string; retryAfter?: number }> {
  try {
    const response = await fetch(`${functionsUrl}/admin-auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, pin }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error, retryAfter: data.retryAfter }
    }

    // Store tokens
    localStorage.setItem('admin_token', data.accessToken)
    localStorage.setItem('admin_refresh', data.refreshToken)
    localStorage.setItem('admin_user', JSON.stringify(data.user))

    return data
  } catch (error) {
    return { error: (error as Error).message }
  }
}

export async function validateAdminSession(): Promise<{ valid: boolean; user?: AdminUser; error?: string }> {
  const token = localStorage.getItem('admin_token')
  if (!token) return { valid: false, error: 'No token' }

  try {
    const response = await fetch(`${functionsUrl}/admin-auth`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })

    const data = await response.json()

    if (!response.ok) {
      return { valid: false, error: data.error }
    }

    return { valid: true, user: data.user }
  } catch (error) {
    return { valid: false, error: (error as Error).message }
  }
}

export async function adminLogout() {
  const token = localStorage.getItem('admin_token')
  if (token) {
    try {
      await fetch(`${functionsUrl}/admin-auth`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
    } catch {
      // Ignore errors on logout
    }
  }
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_refresh')
  localStorage.removeItem('admin_user')
}

export function getAdminUser(): AdminUser | null {
  const raw = localStorage.getItem('admin_user')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function getAdminToken(): string | null {
  return localStorage.getItem('admin_token')
}

// ──────────────────────────────────────────────────────────────
// CRUD Operations via Edge Function
// ──────────────────────────────────────────────────────────────

type TableName = 'admin_settings' | 'photo_gallery' | 'ad_campaigns' | 'discounts' | 'staff' | 'cameras'

async function adminFetch(table: TableName, id?: string): Promise<any> {
  const params = new URLSearchParams({ table })
  if (id) params.set('id', id)

  const response = await fetch(`${functionsUrl}/admin-crud?${params}`, {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const data = await response.json()
  return data.data
}

async function adminCreate(table: TableName, data: Record<string, unknown>): Promise<any> {
  const token = getAdminToken()
  const response = await fetch(`${functionsUrl}/admin-crud?table=${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  const result = await response.json()
  return result.data
}

async function adminUpdate(table: TableName, id: string, data: Record<string, unknown>): Promise<any> {
  const token = getAdminToken()
  const response = await fetch(`${functionsUrl}/admin-crud?table=${table}&id=${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  const result = await response.json()
  return result.data
}

async function adminDelete(table: TableName, id: string): Promise<void> {
  const token = getAdminToken()
  const response = await fetch(`${functionsUrl}/admin-crud?table=${table}&id=${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || `HTTP ${response.status}`)
  }
}

// ──────────────────────────────────────────────────────────────
// Typed Admin API
// ──────────────────────────────────────────────────────────────

export const adminApi = {
  // Stats
  async getDashboardStats() {
    const { supabase } = await import('./supabase-client')
    const { data, error } = await supabase.rpc('get_admin_dashboard_stats')
    if (error) throw new Error(error.message)
    return data
  },

  async getRecentBookings(limit = 20) {
    const { supabase } = await import('./supabase-client')
    const { data, error } = await supabase.rpc('get_recent_bookings', { p_limit: limit })
    if (error) throw new Error(error.message)
    return data
  },

  // Staff
  async getStaff() {
    return adminFetch('staff')
  },
  async createStaff(data: Record<string, unknown>) {
    return adminCreate('staff', data)
  },
  async updateStaff(id: string, data: Record<string, unknown>) {
    return adminUpdate('staff', id, data)
  },
  async deleteStaff(id: string) {
    return adminDelete('staff', id)
  },

  // Discounts
  async getDiscounts() {
    return adminFetch('discounts')
  },
  async createDiscount(data: Record<string, unknown>) {
    return adminCreate('discounts', data)
  },
  async updateDiscount(id: string, data: Record<string, unknown>) {
    return adminUpdate('discounts', id, data)
  },
  async deleteDiscount(id: string) {
    return adminDelete('discounts', id)
  },

  // Ad Campaigns
  async getAds() {
    return adminFetch('ad_campaigns')
  },
  async createAd(data: Record<string, unknown>) {
    return adminCreate('ad_campaigns', data)
  },
  async updateAd(id: string, data: Record<string, unknown>) {
    return adminUpdate('ad_campaigns', id, data)
  },
  async deleteAd(id: string) {
    return adminDelete('ad_campaigns', id)
  },

  // Photos
  async getPhotos() {
    return adminFetch('photo_gallery')
  },
  async createPhoto(data: Record<string, unknown>) {
    return adminCreate('photo_gallery', data)
  },
  async updatePhoto(id: string, data: Record<string, unknown>) {
    return adminUpdate('photo_gallery', id, data)
  },
  async deletePhoto(id: string) {
    return adminDelete('photo_gallery', id)
  },

  // Cameras
  async getCameras() {
    return adminFetch('cameras')
  },
  async createCamera(data: Record<string, unknown>) {
    return adminCreate('cameras', data)
  },
  async updateCamera(id: string, data: Record<string, unknown>) {
    return adminUpdate('cameras', id, data)
  },
  async deleteCamera(id: string) {
    return adminDelete('cameras', id)
  },

  // Admin Settings
  async getSettings() {
    return adminFetch('admin_settings')
  },
  async updateSetting(id: string, data: Record<string, unknown>) {
    return adminUpdate('admin_settings', id, data)
  },

  // Cleaners (via supabase-client)
  async getAvailableCleaners(date: string, suburb?: string) {
    const { supabase } = await import('./supabase-client')
    const { data, error } = await supabase.rpc('get_available_cleaners', {
      p_date: date,
      p_suburb: suburb || null,
    })
    if (error) throw new Error(error.message)
    return data
  },
}
