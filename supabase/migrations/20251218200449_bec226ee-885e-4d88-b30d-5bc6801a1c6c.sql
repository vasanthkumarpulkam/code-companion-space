CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true, security_barrier = true)
AS
SELECT
  id,
  full_name,
  avatar_url,
  bio,
  location,
  language_preference,
  created_at
FROM public.profiles;