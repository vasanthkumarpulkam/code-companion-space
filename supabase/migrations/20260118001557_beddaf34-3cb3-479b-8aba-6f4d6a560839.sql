
-- Fix: Remove the overly permissive policy that exposes email/phone
DROP POLICY IF EXISTS "Authenticated users can view public profile data" ON public.profiles;

-- Recreate the public_profiles view WITHOUT security_invoker
-- This allows the view to read from profiles using owner permissions
-- while only exposing non-sensitive columns
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

-- Security is enforced via GRANT permissions, not RLS
-- This is safe because:
-- 1. The view only exposes non-sensitive fields (excludes email, phone)
-- 2. Direct profiles table access is restricted by RLS (users see only their own)
-- 3. GRANT restricts view access to authenticated users only

REVOKE ALL ON public.public_profiles FROM anon;
REVOKE ALL ON public.public_profiles FROM public;
GRANT SELECT ON public.public_profiles TO authenticated;

COMMENT ON VIEW public.public_profiles IS 'Public profile view exposing only non-sensitive fields (excludes email, phone). View owner bypasses RLS; access restricted to authenticated users via GRANT.';
