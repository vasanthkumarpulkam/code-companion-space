-- Fix profile viewing: Add public read policy for provider profiles
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Allow everyone to view basic public profile information
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

-- Fix award_bid trigger security vulnerability
-- Replace the trigger function to verify job ownership
CREATE OR REPLACE FUNCTION public.award_bid()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Update job status when a bid is awarded
  IF NEW.status = 'awarded' AND OLD.status = 'pending' THEN
    -- Verify that the user awarding the bid owns the job
    IF NOT EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE id = NEW.job_id 
      AND customer_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Only job owner can award bids';
    END IF;
    
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
$function$;

-- Add check constraints for input validation
-- Budget limits (drop first if exists)
DO $$ 
BEGIN
  ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_budget_check;
  ALTER TABLE public.jobs ADD CONSTRAINT jobs_budget_check 
    CHECK (budget >= 10 AND budget <= 100000);
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Title and description length limits
DO $$ 
BEGIN
  ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_title_length_check;
  ALTER TABLE public.jobs ADD CONSTRAINT jobs_title_length_check 
    CHECK (char_length(title) >= 20 AND char_length(title) <= 200);
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_description_length_check;
  ALTER TABLE public.jobs ADD CONSTRAINT jobs_description_length_check 
    CHECK (char_length(description) >= 50 AND char_length(description) <= 2000);
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Location validation (ensure location is provided)
DO $$ 
BEGIN
  ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_location_not_empty_check;
  ALTER TABLE public.jobs ADD CONSTRAINT jobs_location_not_empty_check 
    CHECK (char_length(trim(location)) >= 5);
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;