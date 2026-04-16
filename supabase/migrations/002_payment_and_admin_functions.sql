-- Migration: 002_payment_and_admin_functions
-- Created: 2026-04-16
-- Description: RPC functions for payment tracking, discount validation, and admin stats

-- ──────────────────────────────────────────────────────────────
-- 1. Update booking payment status (called from Stripe webhook)
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_booking_payment(
  p_booking_id UUID,
  p_payment_status TEXT,
  p_stripe_payment_intent_id TEXT,
  p_stripe_receipt_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking RECORD;
  v_result JSONB;
BEGIN
  -- Fetch the booking
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Booking not found');
  END IF;

  -- Update payment status
  UPDATE bookings
  SET
    payment_status = p_payment_status,
    stripe_payment_intent_id = p_stripe_payment_intent_id,
    stripe_receipt_url = COALESCE(p_stripe_receipt_url, stripe_receipt_url),
    status = CASE
      WHEN p_payment_status IN ('paid', 'deposit_paid') AND status = 'pending' THEN 'confirmed'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = p_booking_id;

  -- Log to audit log
  INSERT INTO audit_log (actor_type, actor_id, action, resource_type, resource_id, details)
  VALUES (
    'system',
    'stripe-webhook',
    'PAYMENT_STATUS_UPDATED',
    'booking',
    p_booking_id::TEXT,
    jsonb_build_object(
      'payment_status', p_payment_status,
      'stripe_payment_intent_id', p_stripe_payment_intent_id,
      'old_status', v_booking.status,
      'old_payment_status', v_booking.payment_status
    )
  );

  v_result := jsonb_build_object(
    'success', true,
    'booking_id', p_booking_id,
    'payment_status', p_payment_status,
    'booking_status', (SELECT status FROM bookings WHERE id = p_booking_id)
  );

  RETURN v_result;
END;
$$;

-- ──────────────────────────────────────────────────────────────
-- 2. Validate discount code
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION validate_discount(
  p_code TEXT,
  p_total_cents INT,
  p_service_slugs TEXT[] DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_discount RECORD;
  v_discount_amount_cents INT;
BEGIN
  -- Find active discount
  SELECT * INTO v_discount
  FROM discounts
  WHERE code = p_code
    AND is_active = true
    AND NOW() BETWEEN start_date AND end_date;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid or expired discount code');
  END IF;

  -- Check usage limit
  IF v_discount.usage_limit IS NOT NULL AND v_discount.used_count >= v_discount.usage_limit THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Discount code has reached its usage limit');
  END IF;

  -- Check minimum spend
  IF v_discount.min_spend_cents IS NOT NULL AND p_total_cents < v_discount.min_spend_cents THEN
    RETURN jsonb_build_object('valid', false, 'error', format('Minimum spend of $%s required', v_discount.min_spend_cents / 100.0));
  END IF;

  -- Check applicable services
  IF v_discount.applicable_services IS NOT NULL AND p_service_slugs IS NOT NULL THEN
    -- Check if any selected service matches the applicable services
    IF NOT (
      SELECT bool_or(ARRAY[s] <@ v_discount.applicable_services)
      FROM unnest(p_service_slugs) s
    ) THEN
      RETURN jsonb_build_object('valid', false, 'error', 'Discount does not apply to selected services');
    END IF;
  END IF;

  -- Calculate discount amount
  IF v_discount.type = 'percentage' THEN
    v_discount_amount_cents := ROUND(p_total_cents * (v_discount.value / 100.0));
    IF v_discount.max_discount_cents IS NOT NULL THEN
      v_discount_amount_cents := LEAST(v_discount_amount_cents, v_discount.max_discount_cents);
    END IF;
  ELSIF v_discount.type = 'fixed' THEN
    v_discount_amount_cents := ROUND(v_discount.value * 100);
    IF v_discount.max_discount_cents IS NOT NULL THEN
      v_discount_amount_cents := LEAST(v_discount_amount_cents, v_discount.max_discount_cents);
    END IF;
  ELSE
    v_discount_amount_cents := 0;
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'code', v_discount.code,
    'type', v_discount.type,
    'value', v_discount.value,
    'discount_amount_cents', v_discount_amount_cents,
    'description', v_discount.description
  );
END;
$$;

-- ──────────────────────────────────────────────────────────────
-- 3. Use discount code (increment used_count)
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION use_discount(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE discounts
  SET used_count = used_count + 1, updated_at = NOW()
  WHERE code = p_code AND is_active = true;
  RETURN FOUND;
END;
$$;

-- ──────────────────────────────────────────────────────────────
-- 4. Admin dashboard stats
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_quotes', (SELECT COUNT(*) FROM quotes),
    'total_bookings', (SELECT COUNT(*) FROM bookings),
    'total_customers', (SELECT COUNT(*) FROM customers),
    'total_revenue_cents', (
      SELECT COALESCE(SUM(total_cents), 0)
      FROM quotes
      WHERE status IN ('accepted', 'converted')
    ),
    'pending_bookings', (SELECT COUNT(*) FROM bookings WHERE status = 'pending'),
    'confirmed_bookings', (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'),
    'completed_bookings', (SELECT COUNT(*) FROM bookings WHERE status = 'completed'),
    'cancelled_bookings', (SELECT COUNT(*) FROM bookings WHERE status = 'cancelled'),
    'active_discounts', (SELECT COUNT(*) FROM discounts WHERE is_active = true AND NOW() BETWEEN start_date AND end_date),
    'active_staff', (SELECT COUNT(*) FROM staff WHERE is_active = true),
    'active_ads', (SELECT COUNT(*) FROM ad_campaigns WHERE status = 'active'),
    'avg_quote_value_cents', (
      SELECT COALESCE(ROUND(AVG(total_cents)), 0)
      FROM quotes
      WHERE created_at > NOW() - INTERVAL '30 days'
    ),
    'quotes_this_month', (
      SELECT COUNT(*) FROM quotes
      WHERE created_at > NOW() - INTERVAL '30 days'
    ),
    'bookings_this_month', (
      SELECT COUNT(*) FROM bookings
      WHERE created_at > NOW() - INTERVAL '30 days'
    )
  ) INTO v_stats;

  RETURN v_stats;
END;
$$;

-- ──────────────────────────────────────────────────────────────
-- 5. Recent bookings with customer details
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_recent_bookings(p_limit INT DEFAULT 20)
RETURNS TABLE (
  id UUID,
  customer_name TEXT,
  customer_email TEXT,
  requested_date DATE,
  time_slot TEXT,
  suburb TEXT,
  status TEXT,
  payment_status TEXT,
  quote_total_cents INT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    c.full_name AS customer_name,
    c.email AS customer_email,
    b.requested_date,
    b.requested_time_slot AS time_slot,
    b.suburb,
    b.status,
    b.payment_status,
    q.total_cents AS quote_total_cents,
    b.created_at
  FROM bookings b
  JOIN customers c ON c.id = b.customer_id
  JOIN quotes q ON q.id = b.quote_id
  ORDER BY b.created_at DESC
  LIMIT p_limit;
END;
$$;

-- ──────────────────────────────────────────────────────────────
-- 6. Cleaner availability for a given date
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_available_cleaners(
  p_date DATE,
  p_suburb TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  rating DECIMAL,
  jobs_completed INT,
  current_bookings INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cl.id,
    cl.full_name,
    cl.email,
    cl.rating,
    cl.jobs_completed,
    (
      SELECT COUNT(*)
      FROM bookings b
      WHERE b.cleaner_id = cl.id
        AND b.requested_date = p_date
        AND b.status NOT IN ('cancelled', 'no_show')
    ) AS current_bookings
  FROM cleaners cl
  WHERE cl.status = 'available'
    AND cl.is_active = true
    AND (
      p_suburb IS NULL
      OR p_suburb = ANY(cl.service_areas)
    )
    AND (
      SELECT COUNT(*)
      FROM bookings b
      WHERE b.cleaner_id = cl.id
        AND b.requested_date = p_date
        AND b.status NOT IN ('cancelled', 'no_show')
    ) < cl.max_daily_jobs
  ORDER BY cl.rating DESC, cl.jobs_completed DESC;
END;
$$;

-- Grant execute to authenticated users (admin)
GRANT EXECUTE ON FUNCTION update_booking_payment TO authenticated;
GRANT EXECUTE ON FUNCTION validate_discount TO PUBLIC;
GRANT EXECUTE ON FUNCTION use_discount TO PUBLIC;
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_bookings TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_cleaners TO authenticated;
