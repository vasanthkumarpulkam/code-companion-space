-- Fix profiles table security: remove public access to sensitive data

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Drop and recreate the public_profiles view to ensure it only shows non-sensitive fields
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  avatar_url,
  bio,
  location,
  language_preference,
  created_at
FROM public.profiles;

-- Grant SELECT on the view to authenticated and anon users
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- Create a new restrictive policy that only allows users to view their own full profile
-- (The existing "Users can view own full profile" policy already covers this)

-- Add a policy that allows authenticated users to see basic profile info for other users
-- through the profiles table for specific use cases (like viewing who bid on their job)
CREATE POLICY "Authenticated users can view basic profile info"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- But we need to handle this through the application layer to not expose email/phone
-- Actually, let's be more restrictive - only allow viewing own profile directly
-- Other profile data should come from public_profiles view

-- Drop the permissive authenticated policy we just created
DROP POLICY IF EXISTS "Authenticated users can view basic profile info" ON public.profiles;

-- Create a policy that allows viewing profiles only for users involved in the same job/quote
CREATE POLICY "Users can view profiles of people they interact with"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Users can always see their own profile
  auth.uid() = id
  OR
  -- Job customers can see awarded provider's profile
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE (jobs.customer_id = auth.uid() AND jobs.awarded_provider_id = profiles.id)
    OR (jobs.awarded_provider_id = auth.uid() AND jobs.customer_id = profiles.id)
  )
  OR
  -- Quote request participants can see each other's profiles
  EXISTS (
    SELECT 1 FROM public.quote_requests
    WHERE (quote_requests.customer_id = auth.uid() AND quote_requests.provider_id = profiles.id)
    OR (quote_requests.provider_id = auth.uid() AND quote_requests.customer_id = profiles.id)
  )
  OR
  -- Message participants can see each other's profiles
  EXISTS (
    SELECT 1 FROM public.messages
    WHERE (messages.sender_id = auth.uid() AND messages.recipient_id = profiles.id)
    OR (messages.recipient_id = auth.uid() AND messages.sender_id = profiles.id)
  )
);