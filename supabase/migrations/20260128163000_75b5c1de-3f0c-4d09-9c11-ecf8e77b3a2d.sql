-- Enforce rate limits on write operations

-- Quote request rate limiting
CREATE OR REPLACE FUNCTION public.check_quote_request_rate_limit()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 30 quote requests per day per user
  RETURN check_rate_limit('quote_request', 30, INTERVAL '24 hours');
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_quote_request_rate_limit() TO authenticated;

-- Jobs: apply job posting rate limit
DROP POLICY IF EXISTS "Customers can create jobs" ON public.jobs;
CREATE POLICY "Customers can create jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id
    AND check_job_posting_rate_limit()
  );

-- Bids: apply bid submission rate limit
DROP POLICY IF EXISTS "Providers can create bids" ON public.bids;
CREATE POLICY "Providers can create bids"
  ON public.bids FOR INSERT
  WITH CHECK (
    auth.uid() = provider_id
    AND check_bid_submission_rate_limit()
  );

-- Messages: apply messaging rate limit
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND check_message_rate_limit()
    AND (
      (job_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM jobs
        WHERE id = job_id
        AND (customer_id = auth.uid() OR awarded_provider_id = auth.uid())
      ))
      OR
      (quote_request_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM quote_requests
        WHERE id = quote_request_id
        AND (customer_id = auth.uid() OR provider_id = auth.uid())
      ))
    )
  );

-- Quote requests: apply quote request rate limit
DROP POLICY IF EXISTS "Customers can create quote requests" ON public.quote_requests;
CREATE POLICY "Customers can create quote requests"
  ON public.quote_requests FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id
    AND check_quote_request_rate_limit()
  );
