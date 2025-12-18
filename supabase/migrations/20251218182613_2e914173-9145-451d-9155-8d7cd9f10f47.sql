-- Fix jobs table security: remove public access

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON public.jobs;

-- Create a new policy that only allows authenticated users to view jobs
CREATE POLICY "Authenticated users can view jobs"
ON public.jobs
FOR SELECT
TO authenticated
USING (true);