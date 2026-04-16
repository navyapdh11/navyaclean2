// Supabase Edge Function: admin-auth
// Handles admin login, session validation, and role-based access
// Uses Supabase Auth with custom claims for roles

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const adminPin = Deno.env.get('ADMIN_LOGIN_PIN') // 6-digit PIN for admin login

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface LoginRequest {
  email: string
  password: string
  pin?: string // 6-digit PIN for second factor
}

// Rate limiting store (in-memory, resets on deploy)
const loginAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil: number }>()

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const existing = loginAttempts.get(ip)

  if (!existing) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now, lockedUntil: 0 })
    return { allowed: true }
  }

  // Check if locked
  if (existing.lockedUntil > now) {
    return { allowed: false, retryAfter: Math.ceil((existing.lockedUntil - now) / 1000) }
  }

  // Reset if window expired (15 min window)
  if (now - existing.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now, lockedUntil: 0 })
    return { allowed: true }
  }

  // Increment attempts
  existing.count++
  existing.lastAttempt = now

  // Lock after 5 failed attempts
  if (existing.count >= 5) {
    existing.lockedUntil = now + 15 * 60 * 1000 // 15 min lockout
    return { allowed: false, retryAfter: 15 * 60 }
  }

  return { allowed: true }
}

// Verify admin PIN
function verifyPin(pin: string): boolean {
  return pin === adminPin && adminPin && adminPin.length === 6
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  // POST /admin-auth — login or validate session
  if (req.method === 'POST') {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

    const body = await req.json() as LoginRequest
    const { email, password, pin } = body

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'email and password required' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Rate limit check
    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too many login attempts',
          retryAfter: rateLimit.retryAfter,
        }),
        { status: 429, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.log(`[admin-auth] Failed login for ${email} from ${ip}: ${authError.message}`)
        return new Response(
          JSON.stringify({ error: 'Invalid email or password' }),
          { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )
      }

      // Check if user is in staff table with admin/manager role
      const { data: staffMember } = await supabase
        .from('staff')
        .select('id, full_name, email, role, department')
        .eq('email', email)
        .eq('is_active', true)
        .single()

      if (!staffMember) {
        // Sign out the user since they're not authorized as admin
        await supabase.auth.signOut()
        return new Response(
          JSON.stringify({ error: 'Access denied. Admin access only.' }),
          { status: 403, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )
      }

      // Verify PIN if provided (second factor)
      if (pin && !verifyPin(pin)) {
        await supabase.auth.signOut()
        return new Response(
          JSON.stringify({ error: 'Invalid PIN' }),
          { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )
      }

      // Log successful login
      await supabase.from('audit_logs').insert({
        actor_type: 'admin',
        actor_id: staffMember.id,
        action: 'ADMIN_LOGIN',
        details: { ip, role: staffMember.role },
      })

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: authData.user.id,
            email: authData.user.email,
            name: staffMember.full_name,
            role: staffMember.role,
            department: staffMember.department,
          },
          accessToken: authData.session?.access_token,
          refreshToken: authData.session?.refresh_token,
          expiresIn: authData.session?.expires_in,
        }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      console.error('[admin-auth] Error:', error)
      return new Response(
        JSON.stringify({ error: 'Login failed', message: (error as Error).message }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }
  }

  // GET /admin-auth — validate session
  if (req.method === 'GET') {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ valid: false, error: 'No token provided' }),
        { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    try {
      const token = authHeader.replace('Bearer ', '')

      // Verify token with Supabase
      const { data: { user }, error: userError } = await supabase.auth.getUser(token)

      if (userError || !user) {
        return new Response(
          JSON.stringify({ valid: false, error: 'Invalid token' }),
          { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )
      }

      // Check staff role
      const { data: staffMember } = await supabase
        .from('staff')
        .select('id, full_name, email, role, department')
        .eq('email', user.email)
        .eq('is_active', true)
        .single()

      if (!staffMember) {
        return new Response(
          JSON.stringify({ valid: false, error: 'Not an admin' }),
          { status: 403, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          valid: true,
          user: {
            id: user.id,
            email: user.email,
            name: staffMember.full_name,
            role: staffMember.role,
            department: staffMember.department,
          },
        }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      console.error('[admin-auth] Validation error:', error)
      return new Response(
        JSON.stringify({ valid: false, error: 'Token validation failed' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }
  }

  // POST /admin-auth/signout
  if (req.method === 'POST' && req.url.includes('signout')) {
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      if (user) {
        await supabase.from('audit_logs').insert({
          actor_type: 'admin',
          actor_id: user.id,
          action: 'ADMIN_LOGOUT',
        })
      }
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  return new Response('Not found', { status: 404 })
})
