-- Fix Security Issue 1: profiles table - require authentication for all SELECT access
-- Drop existing SELECT policies and recreate with explicit authentication requirement

DROP POLICY IF EXISTS "Users can view own full profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles during active business" ON public.profiles;

-- Recreate with explicit auth.uid() IS NOT NULL check
CREATE POLICY "Users can view own full profile"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "Users can view profiles during active business"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    (auth.uid() = id) OR 
    (EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.customer_id = auth.uid() 
        AND jobs.awarded_provider_id = profiles.id 
        AND jobs.status = ANY (ARRAY['awarded'::text, 'in_progress'::text])
    )) OR 
    (EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.awarded_provider_id = auth.uid() 
        AND jobs.customer_id = profiles.id 
        AND jobs.status = ANY (ARRAY['awarded'::text, 'in_progress'::text])
    )) OR 
    (EXISTS (
      SELECT 1 FROM quote_requests
      WHERE quote_requests.customer_id = auth.uid() 
        AND quote_requests.provider_id = profiles.id 
        AND quote_requests.status = ANY (ARRAY['pending'::text, 'quoted'::text])
    )) OR 
    (EXISTS (
      SELECT 1 FROM quote_requests
      WHERE quote_requests.provider_id = auth.uid() 
        AND quote_requests.customer_id = profiles.id 
        AND quote_requests.status = ANY (ARRAY['pending'::text, 'quoted'::text])
    ))
  )
);

-- Fix Security Issue 2: payments table - require authentication for all SELECT access
-- Drop existing SELECT policies and recreate with explicit authentication requirement

DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;

-- Recreate with explicit auth.uid() IS NOT NULL check
CREATE POLICY "Admins can view all payments"
ON public.payments
FOR SELECT
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own payments"
ON public.payments
FOR SELECT
USING (auth.uid() IS NOT NULL AND (auth.uid() = customer_id OR auth.uid() = provider_id));