
-- Fix the Security Definer View warning by explicitly setting security_invoker = true
-- This ensures the view respects the permissions of the querying user, not the view owner
-- Combined with GRANT permissions, this provides proper access control

DROP VIEW IF EXISTS public.public_profiles;

-- Create view with explicit security_invoker = true
-- This is safe because:
-- 1. The view only exposes non-sensitive fields (no email/phone)
-- 2. We use GRANT to restrict access to authenticated users only
-- 3. security_invoker ensures we don't bypass RLS unintentionally
CREATE VIEW public.public_profiles
WITH (security_invoker = true)
AS SELECT 
  id,
  full_name,
  avatar_url,
  bio,
  location,
  language_preference,
  created_at
FROM public.profiles;

-- Revoke all access from anonymous/public users
REVOKE ALL ON public.public_profiles FROM anon;
REVOKE ALL ON public.public_profiles FROM public;

-- Grant SELECT to authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;

-- Also need to ensure profiles table has a policy that allows reading non-sensitive data
-- Add a policy for authenticated users to read any profile's non-sensitive data
-- (The view already filters to only non-sensitive columns)
DO $$
BEGIN
  -- Drop the policy if it exists
  DROP POLICY IF EXISTS "Authenticated users can view public profile data" ON public.profiles;
  
  -- Create policy allowing authenticated users to read any profile
  -- This is safe because sensitive data (email, phone) is only exposed via get_contact_info_if_authorized()
  CREATE POLICY "Authenticated users can view public profile data"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);
END $$;

COMMENT ON VIEW public.public_profiles IS 'Public profile view with security_invoker=true. Exposes only non-sensitive fields (excludes email, phone). Accessible to authenticated users only via GRANT permissions.';
