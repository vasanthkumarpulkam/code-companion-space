-- Create bids table
CREATE TABLE public.bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  proposal TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'awarded', 'rejected'))
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bids
CREATE POLICY "Job owners can view all bids for their jobs"
ON public.bids FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE jobs.id = bids.job_id
    AND jobs.customer_id = auth.uid()
  )
);

CREATE POLICY "Providers can view their own bids"
ON public.bids FOR SELECT
USING (auth.uid() = provider_id);

CREATE POLICY "Providers can create bids"
ON public.bids FOR INSERT
WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update their own pending bids"
ON public.bids FOR UPDATE
USING (auth.uid() = provider_id AND status = 'pending');

CREATE POLICY "Job owners can update bid status"
ON public.bids FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE jobs.id = bids.job_id
    AND jobs.customer_id = auth.uid()
  )
);

-- RLS Policies for messages
CREATE POLICY "Users can view messages they sent"
ON public.messages FOR SELECT
USING (auth.uid() = sender_id);

CREATE POLICY "Users can view messages sent to them"
ON public.messages FOR SELECT
USING (auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages read status"
ON public.messages FOR UPDATE
USING (auth.uid() = recipient_id);

-- Add triggers for updated_at
CREATE TRIGGER update_bids_updated_at
BEFORE UPDATE ON public.bids
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for performance
CREATE INDEX idx_bids_job_id ON public.bids(job_id);
CREATE INDEX idx_bids_provider_id ON public.bids(provider_id);
CREATE INDEX idx_messages_job_id ON public.messages(job_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);