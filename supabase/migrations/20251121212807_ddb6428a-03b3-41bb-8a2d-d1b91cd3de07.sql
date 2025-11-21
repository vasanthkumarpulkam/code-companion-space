-- Make job_id nullable and add quote_request_id to support both job and quote conversations
ALTER TABLE public.messages ALTER COLUMN job_id DROP NOT NULL;

-- Add quote_request_id column
ALTER TABLE public.messages ADD COLUMN quote_request_id uuid REFERENCES public.quote_requests(id) ON DELETE CASCADE;

-- Add constraint to ensure either job_id or quote_request_id is set
ALTER TABLE public.messages ADD CONSTRAINT messages_context_check 
  CHECK ((job_id IS NOT NULL AND quote_request_id IS NULL) OR 
         (job_id IS NULL AND quote_request_id IS NOT NULL));

-- Update RLS policies for quote-based messages
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages sent to them" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages they sent" ON public.messages;

-- New policy: Users can send messages for jobs they're involved in or quotes they're part of
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND (
      -- For job messages: sender must be job owner or awarded provider
      (job_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM jobs 
        WHERE id = job_id 
        AND (customer_id = auth.uid() OR awarded_provider_id = auth.uid())
      )) OR
      -- For quote messages: sender must be customer or provider
      (quote_request_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM quote_requests 
        WHERE id = quote_request_id 
        AND (customer_id = auth.uid() OR provider_id = auth.uid())
      ))
    )
  );

-- New policy: Users can view messages they sent
CREATE POLICY "Users can view messages they sent" ON public.messages
  FOR SELECT
  USING (auth.uid() = sender_id);

-- New policy: Users can view messages sent to them
CREATE POLICY "Users can view messages sent to them" ON public.messages
  FOR SELECT
  USING (auth.uid() = recipient_id);

-- Create index for quote_request_id lookups
CREATE INDEX IF NOT EXISTS idx_messages_quote_request_id ON public.messages(quote_request_id);