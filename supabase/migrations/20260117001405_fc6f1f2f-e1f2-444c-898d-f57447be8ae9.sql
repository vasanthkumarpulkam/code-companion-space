-- Recreate public_profiles view to ensure it excludes sensitive fields
-- and uses security_invoker to respect RLS

DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = on)
AS SELECT 
  id,
  full_name,
  avatar_url,
  bio,
  location,
  language_preference,
  created_at
FROM public.profiles;

-- Grant SELECT to authenticated users only (not anon/public)
REVOKE ALL ON public.public_profiles FROM anon;
REVOKE ALL ON public.public_profiles FROM public;
GRANT SELECT ON public.public_profiles TO authenticated;

-- Add comment explaining the security design
COMMENT ON VIEW public.public_profiles IS 'Public profile view that intentionally excludes sensitive contact information (email, phone). Contact info is only accessible via get_contact_info_if_authorized() function for users with completed business relationships.';