-- Email Notification Webhook Setup
-- Run this in Supabase SQL Editor to enable automatic email notifications
-- when new quotes are created

-- ──────────────────────────────────────────────────────────────
-- 1. Create a function to notify via HTTP webhook
-- ──────────────────────────────────────────────────────────────

-- First, we need to create a secure way to call the Edge Function
-- We'll use pg_net extension (available in Supabase)

-- Enable pg_net extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ──────────────────────────────────────────────────────────────
-- 2. Create notification trigger function
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION notify_quote_email()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT;
  payload JSONB;
BEGIN
  -- Get the webhook URL from Supabase secrets
  -- Note: In production, set this as a Supabase secret
  webhook_url := current_setting('app.notify_quote_webhook_url', true);
  
  -- If webhook URL is not configured, skip silently
  -- (Edge Function will still work when called directly from frontend)
  IF webhook_url IS NULL THEN
    RETURN NEW;
  END IF;

  -- Build the payload
  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'quotes',
    'record', jsonb_build_object(
      'id', NEW.id,
      'customer_id', NEW.customer_id,
      'property_type', NEW.property_type,
      'bedrooms', NEW.bedrooms,
      'bathrooms', NEW.bathrooms,
      'area_sqm', NEW.area_sqm,
      'selected_services', NEW.selected_services,
      'frequency', NEW.frequency,
      'pets', NEW.pets,
      'eco_friendly', NEW.eco_friendly,
      'urgent', NEW.urgent,
      'subtotal_cents', NEW.subtotal_cents,
      'gst_cents', NEW.gst_cents,
      'total_cents', NEW.total_cents,
      'status', NEW.status,
      'valid_until', NEW.valid_until,
      'created_at', NEW.created_at
    )
  );

  -- Send HTTP request to Edge Function asynchronously
  -- This won't block the INSERT operation
  PERFORM net.http_post(
    url := webhook_url,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := payload
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ──────────────────────────────────────────────────────────────
-- 3. Create trigger on quotes table
-- ──────────────────────────────────────────────────────────────

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_notify_quote_email ON quotes;

-- Create the trigger
CREATE TRIGGER trigger_notify_quote_email
  AFTER INSERT ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION notify_quote_email();

-- ──────────────────────────────────────────────────────────────
-- 4. Setup Instructions
-- ──────────────────────────────────────────────────────────────

-- To enable email notifications, run this in Supabase SQL Editor:
-- ALTER SYSTEM SET app.notify_quote_webhook_url = 'https://YOUR-PROJECT.functions.supabase.co/notify-quote';
-- SELECT pg_reload_conf();

-- Or set it per-session (for testing):
-- SET app.notify_quote_webhook_url = 'https://YOUR-PROJECT.functions.supabase.co/notify-quote';

-- ──────────────────────────────────────────────────────────────
-- 5. Deploy Edge Function
-- ──────────────────────────────────────────────────────────────

-- From your terminal, run:
-- 1. supabase login
-- 2. supabase link --project-ref YOUR-PROJECT-REF
-- 3. supabase secrets set RESEND_API_KEY=re_your-key
-- 4. supabase functions deploy notify-quote

-- ──────────────────────────────────────────────────────────────
-- 6. Verify Setup
-- ──────────────────────────────────────────────────────────────

-- Check if trigger exists:
-- SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'trigger_notify_quote_email';

-- Check if pg_net extension is enabled:
-- SELECT * FROM pg_extension WHERE extname = 'pg_net';

-- Test the Edge Function directly:
-- curl -X POST https://YOUR-PROJECT.functions.supabase.co/notify-quote \
--   -H "Content-Type: application/json" \
--   -d '{"type":"INSERT","table":"quotes","record":{"id":"test","customer_id":"test","property_type":"house","bedrooms":3,"bathrooms":2,"area_sqm":150,"selected_services":["standard"],"frequency":"weekly","pets":false,"eco_friendly":false,"urgent":false,"subtotal_cents":10000,"gst_cents":1000,"total_cents":11000,"status":"pending","valid_until":"2026-04-23","created_at":"2026-04-16"}}'
