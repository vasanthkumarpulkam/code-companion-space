
-- ============================================
-- FIX 1: Provider Settings - Protect from competitors
-- ============================================
-- Drop the overly permissive policy that exposes hourly rates to competitors
DROP POLICY IF EXISTS "Authenticated users can view provider settings" ON public.provider_settings;

-- Customers can view all provider settings (needed for marketplace browsing)
CREATE POLICY "Customers can view provider settings"
  ON public.provider_settings
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'customer'));

-- Admins can view all provider settings  
CREATE POLICY "Admins can view all provider settings"
  ON public.provider_settings
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Note: Providers already see their own via "Providers can manage their own settings" ALL policy

-- ============================================
-- FIX 2: Bids - Explicit protection against cross-provider visibility
-- ============================================
-- Current policies are correct, but add a comment for documentation
COMMENT ON TABLE public.bids IS 'Bid visibility is restricted: providers see only their own bids, job owners see all bids for their jobs. Cross-provider bid visibility is prevented by RLS.';

-- ============================================
-- FIX 3: Jobs - Create a function to mask location for open jobs
-- ============================================
-- Create a function that returns masked location for open jobs
-- Full location only visible to: job owner, awarded provider, bidders
CREATE OR REPLACE FUNCTION public.get_job_location_for_user(
  p_job_id uuid,
  p_user_id uuid
)
RETURNS TABLE(
  location text,
  location_lat numeric,
  location_lng numeric,
  is_precise boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job RECORD;
  v_is_authorized BOOLEAN := FALSE;
BEGIN
  -- Get job details
  SELECT j.* INTO v_job FROM jobs j WHERE j.id = p_job_id;
  
  IF v_job IS NULL THEN
    RETURN;
  END IF;
  
  -- Check if user is authorized to see precise location
  -- Authorized: job owner, awarded provider, users who have bid
  v_is_authorized := (
    v_job.customer_id = p_user_id
    OR v_job.awarded_provider_id = p_user_id
    OR EXISTS (SELECT 1 FROM bids b WHERE b.job_id = p_job_id AND b.provider_id = p_user_id)
    OR has_role(p_user_id, 'admin')
  );
  
  IF v_is_authorized THEN
    -- Return precise location
    RETURN QUERY SELECT v_job.location, v_job.location_lat, v_job.location_lng, TRUE;
  ELSE
    -- Return masked location (city only, rounded coordinates)
    RETURN QUERY SELECT 
      regexp_replace(v_job.location, ',?\s*TX\s*\d{5}(-\d{4})?$', ', TX'),  -- Remove zip code
      ROUND(v_job.location_lat, 2),  -- Round to ~1km precision
      ROUND(v_job.location_lng, 2),
      FALSE;
  END IF;
END;
$$;

-- ============================================
-- FIX 4: Payments - Add explicit documentation
-- ============================================
-- Current policies are correct (customers/providers see own, admins see all)
-- RLS default-deny handles public access
COMMENT ON TABLE public.payments IS 'Payment visibility is restricted to involved parties (customer_id, provider_id) and admins. RLS default-deny prevents unauthorized access.';

-- ============================================
-- FIX 5: Reviews - Consider anonymizing reviewer for non-participants
-- ============================================
-- Create a view that hides reviewer_id from non-participants
CREATE OR REPLACE VIEW public.public_reviews AS
SELECT 
  r.id,
  r.job_id,
  r.reviewed_id,
  CASE 
    WHEN auth.uid() = r.reviewer_id 
         OR auth.uid() = r.reviewed_id 
         OR has_role(auth.uid(), 'admin')
    THEN r.reviewer_id
    ELSE NULL
  END as reviewer_id,
  r.rating,
  r.comment,
  r.created_at
FROM public.reviews r;

GRANT SELECT ON public.public_reviews TO authenticated;

COMMENT ON VIEW public.public_reviews IS 'Public reviews view that anonymizes reviewer_id for non-participants to prevent retaliation against reviewers.';
