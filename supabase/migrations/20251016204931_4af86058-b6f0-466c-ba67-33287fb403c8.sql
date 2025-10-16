-- Add missing foreign key relationships (only if they don't exist)

-- Add foreign key from jobs to profiles (customer) if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'jobs_customer_id_fkey'
  ) THEN
    ALTER TABLE public.jobs
    ADD CONSTRAINT jobs_customer_id_fkey 
    FOREIGN KEY (customer_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from jobs to profiles (awarded provider) if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'jobs_awarded_provider_id_fkey'
  ) THEN
    ALTER TABLE public.jobs
    ADD CONSTRAINT jobs_awarded_provider_id_fkey 
    FOREIGN KEY (awarded_provider_id) 
    REFERENCES public.profiles(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- Add foreign key from bids to profiles if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bids_provider_id_fkey'
  ) THEN
    ALTER TABLE public.bids
    ADD CONSTRAINT bids_provider_id_fkey 
    FOREIGN KEY (provider_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from bids to jobs if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bids_job_id_fkey'
  ) THEN
    ALTER TABLE public.bids
    ADD CONSTRAINT bids_job_id_fkey 
    FOREIGN KEY (job_id) 
    REFERENCES public.jobs(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from payments to profiles (customer) if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_customer_id_fkey'
  ) THEN
    ALTER TABLE public.payments
    ADD CONSTRAINT payments_customer_id_fkey 
    FOREIGN KEY (customer_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from payments to profiles (provider) if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_provider_id_fkey'
  ) THEN
    ALTER TABLE public.payments
    ADD CONSTRAINT payments_provider_id_fkey 
    FOREIGN KEY (provider_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from payments to jobs if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_job_id_fkey'
  ) THEN
    ALTER TABLE public.payments
    ADD CONSTRAINT payments_job_id_fkey 
    FOREIGN KEY (job_id) 
    REFERENCES public.jobs(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from messages to profiles (sender) if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'messages_sender_id_fkey'
  ) THEN
    ALTER TABLE public.messages
    ADD CONSTRAINT messages_sender_id_fkey 
    FOREIGN KEY (sender_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from messages to profiles (recipient) if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'messages_recipient_id_fkey'
  ) THEN
    ALTER TABLE public.messages
    ADD CONSTRAINT messages_recipient_id_fkey 
    FOREIGN KEY (recipient_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from messages to jobs if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'messages_job_id_fkey'
  ) THEN
    ALTER TABLE public.messages
    ADD CONSTRAINT messages_job_id_fkey 
    FOREIGN KEY (job_id) 
    REFERENCES public.jobs(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from user_reports to profiles (reporter) if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_reports_reporter_id_fkey'
  ) THEN
    ALTER TABLE public.user_reports
    ADD CONSTRAINT user_reports_reporter_id_fkey 
    FOREIGN KEY (reporter_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from user_reports to profiles (reported user) if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_reports_reported_user_id_fkey'
  ) THEN
    ALTER TABLE public.user_reports
    ADD CONSTRAINT user_reports_reported_user_id_fkey 
    FOREIGN KEY (reported_user_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from user_reports to jobs (reported job) if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_reports_reported_job_id_fkey'
  ) THEN
    ALTER TABLE public.user_reports
    ADD CONSTRAINT user_reports_reported_job_id_fkey 
    FOREIGN KEY (reported_job_id) 
    REFERENCES public.jobs(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from reviews to profiles (reviewer) if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reviews_reviewer_id_fkey'
  ) THEN
    ALTER TABLE public.reviews
    ADD CONSTRAINT reviews_reviewer_id_fkey 
    FOREIGN KEY (reviewer_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from reviews to profiles (reviewed) if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reviews_reviewed_id_fkey'
  ) THEN
    ALTER TABLE public.reviews
    ADD CONSTRAINT reviews_reviewed_id_fkey 
    FOREIGN KEY (reviewed_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from reviews to jobs if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reviews_job_id_fkey'
  ) THEN
    ALTER TABLE public.reviews
    ADD CONSTRAINT reviews_job_id_fkey 
    FOREIGN KEY (job_id) 
    REFERENCES public.jobs(id) 
    ON DELETE CASCADE;
  END IF;
END $$;