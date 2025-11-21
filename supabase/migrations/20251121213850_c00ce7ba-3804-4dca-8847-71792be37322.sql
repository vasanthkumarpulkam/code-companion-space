-- Drop existing INSERT policy for messages
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

-- Create improved policy that validates both sender and recipient
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND (
      -- For job messages: sender must be job owner or awarded provider, recipient must be the other party
      (job_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM jobs 
        WHERE id = job_id 
        AND (
          (customer_id = auth.uid() AND awarded_provider_id = recipient_id) OR
          (awarded_provider_id = auth.uid() AND customer_id = recipient_id)
        )
      )) OR
      -- For quote messages: sender must be customer or provider, recipient must be the other party
      (quote_request_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM quote_requests 
        WHERE id = quote_request_id 
        AND (
          (customer_id = auth.uid() AND provider_id = recipient_id) OR
          (provider_id = auth.uid() AND customer_id = recipient_id)
        )
      ))
    )
  );