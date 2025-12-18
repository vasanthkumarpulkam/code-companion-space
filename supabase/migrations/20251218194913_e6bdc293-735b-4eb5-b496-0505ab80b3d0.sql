-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view profiles of people they interact with" ON public.profiles;

-- Create a more restrictive policy that only allows viewing full profile (with email/phone)
-- during ACTIVE business relationships, not permanently
CREATE POLICY "Users can view profiles during active business" 
ON public.profiles 
FOR SELECT 
USING (
  -- User can always see their own profile
  (auth.uid() = id)
  OR
  -- Can see profile of provider on their ACTIVE awarded job (not completed/canceled)
  (EXISTS (
    SELECT 1 FROM jobs
    WHERE jobs.customer_id = auth.uid()
      AND jobs.awarded_provider_id = profiles.id
      AND jobs.status IN ('awarded', 'in_progress')
  ))
  OR
  -- Can see profile of customer on ACTIVE awarded job they're working
  (EXISTS (
    SELECT 1 FROM jobs
    WHERE jobs.awarded_provider_id = auth.uid()
      AND jobs.customer_id = profiles.id
      AND jobs.status IN ('awarded', 'in_progress')
  ))
  OR
  -- Can see provider profile on ACTIVE quote request
  (EXISTS (
    SELECT 1 FROM quote_requests
    WHERE quote_requests.customer_id = auth.uid()
      AND quote_requests.provider_id = profiles.id
      AND quote_requests.status IN ('pending', 'quoted')
  ))
  OR
  -- Provider can see customer profile on ACTIVE quote request
  (EXISTS (
    SELECT 1 FROM quote_requests
    WHERE quote_requests.provider_id = auth.uid()
      AND quote_requests.customer_id = profiles.id
      AND quote_requests.status IN ('pending', 'quoted')
  ))
);

-- Make public_profiles view accessible to authenticated users for non-sensitive data
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.profiles;

-- Add RLS policy on the public_profiles view (it's actually a view, so we add a policy for SELECT on profiles that feeds it)
-- The view already filters out email and phone, so we just need to ensure the view is queryable
-- Views inherit RLS from base tables, so public_profiles should work via the existing policies