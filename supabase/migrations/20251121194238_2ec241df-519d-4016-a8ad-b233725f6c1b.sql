-- Add badges table for provider verification and achievements
CREATE TABLE IF NOT EXISTS public.provider_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL, -- 'verified', 'top_rated', 'fast_response', 'quality_pro', 'background_checked'
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_provider_badges_provider ON public.provider_badges(provider_id);
CREATE INDEX idx_provider_badges_type ON public.provider_badges(badge_type);

-- Enable RLS
ALTER TABLE public.provider_badges ENABLE ROW LEVEL SECURITY;

-- Badges are viewable by everyone
CREATE POLICY "Badges are viewable by everyone"
ON public.provider_badges FOR SELECT
TO authenticated
USING (true);

-- Only admins can manage badges
CREATE POLICY "Admins can manage badges"
ON public.provider_badges FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add job completion tracking
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completion_notes TEXT;

-- Add bid response tracking
ALTER TABLE public.bids
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS response_notes TEXT;

-- Create function to notify customers of new bids
CREATE OR REPLACE FUNCTION public.notify_new_bid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create notification for job owner
  INSERT INTO public.notifications (user_id, type, title, message, data)
  SELECT 
    jobs.customer_id,
    'new_bid',
    'New Bid Received',
    'You received a new bid on your job',
    jsonb_build_object('job_id', NEW.job_id, 'bid_id', NEW.id, 'amount', NEW.amount)
  FROM jobs
  WHERE jobs.id = NEW.job_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new bid notifications
DROP TRIGGER IF EXISTS on_new_bid ON public.bids;
CREATE TRIGGER on_new_bid
  AFTER INSERT ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_bid();

-- Create function to notify provider of awarded bid
CREATE OR REPLACE FUNCTION public.notify_bid_awarded()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'awarded' AND OLD.status = 'pending' THEN
    -- Notify the provider who got awarded
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      NEW.provider_id,
      'bid_awarded',
      'Congratulations! Your Bid Was Awarded',
      'A customer has accepted your bid',
      jsonb_build_object('job_id', NEW.job_id, 'bid_id', NEW.id, 'amount', NEW.amount)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for awarded bid notifications
DROP TRIGGER IF EXISTS on_bid_awarded ON public.bids;
CREATE TRIGGER on_bid_awarded
  AFTER UPDATE ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_bid_awarded();