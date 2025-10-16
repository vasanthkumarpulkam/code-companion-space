-- Fix profiles table PII exposure by implementing column-level access control

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Policy 1: Users can view their own full profile (including email and phone)
CREATE POLICY "Users can view own full profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create a view for public profile information (excludes email and phone)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  avatar_url,
  location,
  bio,
  language_preference,
  created_at
FROM public.profiles;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;

-- Note: Application code will need to be updated to:
-- 1. Query from 'profiles' table when viewing own profile (gets email/phone)
-- 2. Query from 'public_profiles' view when viewing other users (no email/phone)