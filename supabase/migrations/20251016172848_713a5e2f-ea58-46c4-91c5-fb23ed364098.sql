-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, reviewer_id)
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_fee NUMERIC NOT NULL,
  provider_fee NUMERIC NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_payment_status CHECK (status IN ('pending', 'completed', 'failed', 'refunded'))
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Reviews are viewable by everyone"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "Users can create reviews for jobs they participated in"
ON public.reviews FOR INSERT
WITH CHECK (
  auth.uid() = reviewer_id AND
  (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = reviews.job_id
      AND (jobs.customer_id = auth.uid() OR jobs.awarded_provider_id = auth.uid())
    )
  )
);

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments"
ON public.payments FOR SELECT
USING (auth.uid() = customer_id OR auth.uid() = provider_id);

CREATE POLICY "System can create payments"
ON public.payments FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update payment status"
ON public.payments FOR UPDATE
USING (true);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
ON public.payments FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_reviews_job_id ON public.reviews(job_id);
CREATE INDEX idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewed_id ON public.reviews(reviewed_id);
CREATE INDEX idx_payments_job_id ON public.payments(job_id);
CREATE INDEX idx_payments_customer_id ON public.payments(customer_id);
CREATE INDEX idx_payments_provider_id ON public.payments(provider_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('job-media', 'job-media', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('profile-images', 'profile-images', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Storage policies for job media
CREATE POLICY "Job media is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'job-media');

CREATE POLICY "Authenticated users can upload job media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'job-media' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own job media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'job-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own job media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'job-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for profile images
CREATE POLICY "Profile images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload their own profile image"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile image"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile image"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Function to calculate average rating for a user
CREATE OR REPLACE FUNCTION public.get_user_average_rating(user_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(AVG(rating), 0)
  FROM public.reviews
  WHERE reviewed_id = user_id;
$$;

-- Function to update job status on bid award
CREATE OR REPLACE FUNCTION public.award_bid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update job status when a bid is awarded
  IF NEW.status = 'awarded' AND OLD.status = 'pending' THEN
    UPDATE public.jobs
    SET status = 'awarded', awarded_provider_id = NEW.provider_id
    WHERE id = NEW.job_id;
    
    -- Reject all other bids
    UPDATE public.bids
    SET status = 'rejected'
    WHERE job_id = NEW.job_id AND id != NEW.id AND status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for bid award
CREATE TRIGGER on_bid_awarded
AFTER UPDATE ON public.bids
FOR EACH ROW
EXECUTE FUNCTION public.award_bid();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;