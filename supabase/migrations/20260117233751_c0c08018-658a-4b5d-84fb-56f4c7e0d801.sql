-- ============================================
-- FIX 1: Secure assign_admin_role_to_email() function
-- Adds admin-only authorization check to prevent privilege escalation
-- ============================================

CREATE OR REPLACE FUNCTION public.assign_admin_role_to_email(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- CRITICAL: Only existing admins can assign admin roles
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can assign admin roles';
  END IF;
  
  -- Validate email format
  IF user_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Get the user ID from profiles table
  SELECT id INTO target_user_id
  FROM public.profiles
  WHERE email = user_email;
  
  -- Verify user exists
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Remove existing roles for this user to avoid duplicates
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  -- Insert admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin');
END;
$$;

-- Revoke public access and only allow authenticated users to call
REVOKE ALL ON FUNCTION public.assign_admin_role_to_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_admin_role_to_email(text) TO authenticated;

-- ============================================
-- FIX 2: Secure job-media storage bucket
-- Make it private and add proper RLS policies for access control
-- ============================================

-- Make job-media bucket private
UPDATE storage.buckets SET public = false WHERE id = 'job-media';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload job media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update job media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete job media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view job media" ON storage.objects;
DROP POLICY IF EXISTS "Users can view job media for accessible jobs" ON storage.objects;

-- Allow authenticated users to upload job media (to their own folder)
CREATE POLICY "Authenticated users can upload job media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'job-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own job media
CREATE POLICY "Authenticated users can update job media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'job-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own job media
CREATE POLICY "Authenticated users can delete job media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'job-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow viewing job media based on job access rules
CREATE POLICY "Users can view job media for accessible jobs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'job-media' AND
  (
    -- Job owner can always see their media
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- Anyone authenticated can see media for open jobs (marketplace browsing)
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.customer_id::text = (storage.foldername(name))[1]
      AND jobs.status = 'open'
    )
    OR
    -- Awarded providers can see job media
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.customer_id::text = (storage.foldername(name))[1]
      AND jobs.awarded_provider_id = auth.uid()
    )
    OR
    -- Bidders can see media for jobs they've bid on
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.bids b ON b.job_id = j.id
      WHERE j.customer_id::text = (storage.foldername(name))[1]
      AND b.provider_id = auth.uid()
    )
  )
);

-- ============================================
-- FIX 3: Add rate limiting table and functions
-- Database-level rate limiting for critical operations
-- ============================================

-- Create rate limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, action)
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rate limits
CREATE POLICY "Users can view their own rate limits"
ON public.rate_limits FOR SELECT
USING (auth.uid() = user_id);

-- System manages rate limits (no direct user insert/update/delete)
-- Rate limit check function will use SECURITY DEFINER

-- Create rate limit check function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_action TEXT,
  p_limit INTEGER,
  p_window INTERVAL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  current_window TIMESTAMPTZ;
  window_expired BOOLEAN;
BEGIN
  -- Must be authenticated
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get current rate limit state
  SELECT count, window_start, (NOW() - window_start) > p_window
  INTO current_count, current_window, window_expired
  FROM rate_limits
  WHERE user_id = auth.uid() AND action = p_action;
  
  -- If no record exists or window expired, reset counter
  IF current_count IS NULL OR window_expired THEN
    INSERT INTO rate_limits (user_id, action, count, window_start)
    VALUES (auth.uid(), p_action, 1, NOW())
    ON CONFLICT (user_id, action) DO UPDATE
    SET count = 1, window_start = NOW();
    RETURN TRUE;
  END IF;
  
  -- Check if limit exceeded
  IF current_count >= p_limit THEN
    RETURN FALSE;
  END IF;
  
  -- Increment counter
  UPDATE rate_limits 
  SET count = count + 1
  WHERE user_id = auth.uid() AND action = p_action;
  
  RETURN TRUE;
END;
$$;

-- Create wrapper functions for specific actions
CREATE OR REPLACE FUNCTION public.check_job_posting_rate_limit()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 15 jobs per day per user
  RETURN check_rate_limit('job_posting', 15, INTERVAL '24 hours');
END;
$$;

CREATE OR REPLACE FUNCTION public.check_bid_submission_rate_limit()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 75 bids per day per provider
  RETURN check_rate_limit('bid_submission', 75, INTERVAL '24 hours');
END;
$$;

CREATE OR REPLACE FUNCTION public.check_message_rate_limit()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 150 messages per hour per user
  RETURN check_rate_limit('messaging', 150, INTERVAL '1 hour');
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTERVAL) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_job_posting_rate_limit() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_bid_submission_rate_limit() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_message_rate_limit() TO authenticated;