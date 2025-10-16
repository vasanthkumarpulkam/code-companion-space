-- Drop existing foreign keys if they exist (ignoring errors)
DO $$ 
BEGIN
    ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_customer_id_fkey;
    ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_awarded_provider_id_fkey;
    ALTER TABLE public.bids DROP CONSTRAINT IF EXISTS bids_provider_id_fkey;
    ALTER TABLE public.bids DROP CONSTRAINT IF EXISTS bids_job_id_fkey;
    ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
    ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_recipient_id_fkey;
    ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_job_id_fkey;
EXCEPTION WHEN OTHERS THEN
    -- Ignore errors if constraints don't exist
    NULL;
END $$;

-- Create foreign keys for jobs table
ALTER TABLE public.jobs
ADD CONSTRAINT jobs_customer_id_fkey
FOREIGN KEY (customer_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

ALTER TABLE public.jobs
ADD CONSTRAINT jobs_awarded_provider_id_fkey
FOREIGN KEY (awarded_provider_id)
REFERENCES public.profiles(id)
ON DELETE SET NULL;

-- Create foreign keys for bids table
ALTER TABLE public.bids
ADD CONSTRAINT bids_provider_id_fkey
FOREIGN KEY (provider_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

ALTER TABLE public.bids
ADD CONSTRAINT bids_job_id_fkey
FOREIGN KEY (job_id)
REFERENCES public.jobs(id)
ON DELETE CASCADE;

-- Create foreign keys for messages table
ALTER TABLE public.messages
ADD CONSTRAINT messages_sender_id_fkey
FOREIGN KEY (sender_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

ALTER TABLE public.messages
ADD CONSTRAINT messages_recipient_id_fkey
FOREIGN KEY (recipient_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

ALTER TABLE public.messages
ADD CONSTRAINT messages_job_id_fkey
FOREIGN KEY (job_id)
REFERENCES public.jobs(id)
ON DELETE CASCADE;