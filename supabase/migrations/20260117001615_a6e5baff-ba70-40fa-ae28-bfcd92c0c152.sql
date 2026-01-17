-- =============================================
-- FIX 1: Jobs Table - Implement Tiered RLS Policies
-- =============================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view jobs" ON public.jobs;

-- Job owners see everything about their jobs
CREATE POLICY "Job owners can view their jobs"
ON public.jobs FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = customer_id);

-- Providers can browse open jobs (needed for marketplace functionality)
CREATE POLICY "Providers can browse open jobs"
ON public.jobs FOR SELECT
USING (auth.uid() IS NOT NULL AND status = 'open');

-- Bidders can view full details of jobs they've bid on
CREATE POLICY "Bidders can view jobs they bid on"
ON public.jobs FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM bids
    WHERE bids.job_id = jobs.id AND bids.provider_id = auth.uid()
  )
);

-- Awarded providers can view jobs assigned to them
CREATE POLICY "Awarded providers can view their jobs"
ON public.jobs FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = awarded_provider_id);

-- =============================================
-- FIX 2: Payments Table - Remove Dangerous Policies
-- =============================================

-- Drop overly permissive policies if they exist
DROP POLICY IF EXISTS "System can create payments" ON public.payments;
DROP POLICY IF EXISTS "System can update payment status" ON public.payments;

-- The existing create_payment and update_payment_status functions already have proper authorization
-- No need to recreate them - they're already SECURITY DEFINER with proper checks

-- Add a comment explaining the security model
COMMENT ON TABLE public.payments IS 'Payment records are managed exclusively through secure RPC functions (create_payment, update_payment_status). Direct INSERT/UPDATE is blocked by RLS. Only SELECT is allowed for involved parties.';