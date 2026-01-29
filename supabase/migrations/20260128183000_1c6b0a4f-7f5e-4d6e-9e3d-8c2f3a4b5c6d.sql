-- Do not expose email to anonymous users
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  id,
  full_name,
  avatar_url,
  bio,
  location,
  language_preference,
  created_at,
  CASE
    WHEN show_email AND auth.role() = 'authenticated' THEN email
    ELSE NULL
  END AS email,
  is_public,
  show_email
FROM public.profiles
WHERE is_public OR auth.uid() = id;

REVOKE ALL ON public.public_profiles FROM public;
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;
