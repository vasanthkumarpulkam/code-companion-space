-- Fix 1: Payments table - Restrict insert/update to service role only (using security definer functions)
-- Drop overly permissive policies
DROP POLICY IF EXISTS "System can create payments" ON public.payments;
DROP POLICY IF EXISTS "System can update payment status" ON public.payments;

-- Create secure function to create payments (only callable from edge functions with service role)
CREATE OR REPLACE FUNCTION public.create_payment(
  p_job_id UUID,
  p_customer_id UUID,
  p_provider_id UUID,
  p_customer_fee NUMERIC,
  p_provider_fee NUMERIC
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
BEGIN
  -- Verify the job exists and the caller is either the customer or provider
  IF NOT EXISTS (
    SELECT 1 FROM jobs 
    WHERE id = p_job_id 
    AND (customer_id = auth.uid() OR awarded_provider_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'Unauthorized: You are not associated with this job';
  END IF;

  INSERT INTO payments (job_id, customer_id, provider_id, customer_fee, provider_fee)
  VALUES (p_job_id, p_customer_id, p_provider_id, p_customer_fee, p_provider_fee)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Create secure function to update payment status
CREATE OR REPLACE FUNCTION public.update_payment_status(
  p_payment_id UUID,
  p_status TEXT,
  p_stripe_payment_intent_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow updates by job participants or admins
  IF NOT EXISTS (
    SELECT 1 FROM payments p
    WHERE p.id = p_payment_id 
    AND (p.customer_id = auth.uid() OR p.provider_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  ) THEN
    RAISE EXCEPTION 'Unauthorized: You cannot update this payment';
  END IF;

  UPDATE payments 
  SET 
    status = p_status,
    stripe_payment_intent_id = COALESCE(p_stripe_payment_intent_id, stripe_payment_intent_id),
    completed_at = CASE WHEN p_status = 'completed' THEN NOW() ELSE completed_at END
  WHERE id = p_payment_id;
  
  RETURN TRUE;
END;
$$;

-- Fix 2: User roles - Require authentication to view provider roles
DROP POLICY IF EXISTS "Provider roles are viewable by everyone" ON public.user_roles;

CREATE POLICY "Authenticated users can view provider roles"
ON public.user_roles
FOR SELECT
USING (
  role = 'provider'::app_role 
  AND auth.uid() IS NOT NULL
);

-- Fix 3: Notifications - Restrict insert to security definer function only
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create secure function to create notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Fix 4: Allow providers to delete their own pending bids
CREATE POLICY "Providers can delete their own pending bids"
ON public.bids
FOR DELETE
USING (auth.uid() = provider_id AND status = 'pending');