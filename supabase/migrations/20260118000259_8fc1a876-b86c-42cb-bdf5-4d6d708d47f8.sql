
-- Fix public_profiles view: Remove security_invoker to allow authenticated users
-- to view non-sensitive profile data for any user (as intended for provider profiles)
-- The view already excludes sensitive fields (email, phone) and only grants access to authenticated users

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

-- Revoke all access from anonymous/public users
REVOKE ALL ON public.public_profiles FROM anon;
REVOKE ALL ON public.public_profiles FROM public;

-- Only authenticated users can query this view
GRANT SELECT ON public.public_profiles TO authenticated;

-- Document the security design
COMMENT ON VIEW public.public_profiles IS 'Public profile view exposing only non-sensitive fields (excludes email, phone). Accessible to authenticated users only. Contact info available via get_contact_info_if_authorized() for users with completed business relationships.';
