-- Persist privacy settings on profiles and apply to public view
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_email BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  id,
  full_name,
  avatar_url,
  bio,
  location,
  language_preference,
  created_at,
  CASE WHEN show_email THEN email ELSE NULL END AS email,
  is_public,
  show_email
FROM public.profiles
WHERE is_public OR auth.uid() = id;

REVOKE ALL ON public.public_profiles FROM public;
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;
