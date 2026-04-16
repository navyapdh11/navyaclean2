// Supabase Edge Function: admin-crud
// Generic CRUD API for admin tables (staff, pricing, discounts, photos, ads, cameras)
// Requires authenticated admin session

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
}

// Tables allowed for CRUD
const ALLOWED_TABLES = [
  'admin_settings',
  'photo_gallery',
  'ad_campaigns',
  'discounts',
  'staff',
  'cameras',
]

// Authenticate admin from Authorization header
async function authenticateAdmin(req: Request): Promise<{ id: string; role: string } | null> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null

  const { data: staff } = await supabase
    .from('staff')
    .select('id, role')
    .eq('email', user.email)
    .eq('is_active', true)
    .single()

  if (!staff) return null
  return { id: staff.id, role: staff.role }
}

// Log admin action
async function logAdminAction(
  adminId: string,
  action: string,
  resourceType: string,
  resourceId: string | null,
  details: Record<string, unknown> = {}
) {
  await supabase.from('audit_logs').insert({
    actor_type: 'admin',
    actor_id: adminId,
    action,
    resource_type: resourceType,
    resource_id: resourceId ? resourceId as any : undefined,
    details,
  })
}

serve(async (req: Request) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  const url = new URL(req.url)
  const table = url.searchParams.get('table')
  const id = url.searchParams.get('id')

  // Validate table
  if (!table || !ALLOWED_TABLES.includes(table)) {
    return new Response(
      JSON.stringify({ error: 'Invalid table. Must be one of: ' + ALLOWED_TABLES.join(', ') }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }

  // GET requests don't need auth (for public read of active items)
  if (req.method === 'GET') {
    try {
      let query = supabase.from(table).select('*')

      // Apply public filters
      if (table === 'discounts') {
        query = query.eq('is_active', true).gte('end_date', new Date().toISOString()).lte('start_date', new Date().toISOString())
      } else if (table === 'ad_campaigns') {
        query = query.eq('status', 'active').lte('start_date', new Date().toISOString())
      } else if (table === 'photo_gallery') {
        query = query.eq('is_active', true)
      }

      // Single item or list
      if (id) {
        query = query.eq('id', id).single()
      } else {
        query = query.order('created_at', { ascending: false })
        const limit = url.searchParams.get('limit')
        if (limit) query = query.limit(parseInt(limit))
      }

      const { data, error } = await query

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message, code: error.code }),
          { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ data }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      return new Response(
        JSON.stringify({ error: (error as Error).message }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }
  }

  // POST, PUT, PATCH, DELETE require admin auth
  const admin = await authenticateAdmin(req)
  if (!admin) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized. Admin access required.' }),
      { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }

  // POST — Create
  if (req.method === 'POST') {
    try {
      const body = await req.json()

      const { data, error } = await supabase
        .from(table)
        .insert(body)
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )
      }

      await logAdminAction(admin.id, 'CREATE', table, (data as any).id, { data })

      return new Response(
        JSON.stringify({ data, message: 'Created successfully' }),
        { status: 201, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      return new Response(
        JSON.stringify({ error: (error as Error).message }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }
  }

  // PATCH — Update
  if (req.method === 'PATCH' || req.method === 'PUT') {
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'id parameter required for updates' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    try {
      const body = await req.json()

      // Get old value for audit
      const { data: oldData } = await supabase.from(table).select('*').eq('id', id).single()

      const { data, error } = await supabase
        .from(table)
        .update(body)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )
      }

      await logAdminAction(admin.id, 'UPDATE', table, id, {
        old_value: oldData,
        new_value: data,
      })

      return new Response(
        JSON.stringify({ data, message: 'Updated successfully' }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      return new Response(
        JSON.stringify({ error: (error as Error).message }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }
  }

  // DELETE
  if (req.method === 'DELETE') {
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'id parameter required for deletes' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    try {
      const { data: oldData } = await supabase.from(table).select('*').eq('id', id).single()

      const { error } = await supabase.from(table).delete().eq('id', id)

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )
      }

      await logAdminAction(admin.id, 'DELETE', table, id, { old_value: oldData })

      return new Response(
        JSON.stringify({ message: 'Deleted successfully' }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      return new Response(
        JSON.stringify({ error: (error as Error).message }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }
  }

  return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS })
})
