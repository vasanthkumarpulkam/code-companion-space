-- Fix Security Issue: Restrict profile visibility to hide sensitive contact info

-- Step 1: Drop existing SELECT policies
DROP POLICY IF EXISTS "Users can view own full profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles during active business" ON public.profiles;

-- Step 2: Create policy that ONLY allows users to see their own full profile
-- Other users should use the public_profiles view which excludes email/phone
CREATE POLICY "Users can only view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = id);

-- Step 3: Update the public_profiles view to ensure it excludes sensitive fields
-- First drop if exists, then recreate with security_invoker
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = on) AS
SELECT 
  id,
  full_name,
  avatar_url,
  bio,
  location,
  language_preference,
  created_at
FROM public.profiles;
-- Note: email and phone are intentionally excluded

-- Step 4: Grant SELECT on the view to authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- Step 5: Create a secure function to get contact info only for completed/awarded jobs
CREATE OR REPLACE FUNCTION public.get_contact_info_if_authorized(profile_id uuid)
RETURNS TABLE (email text, phone text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return contact info if:
  -- 1. User is requesting their own info, OR
  -- 2. User has a completed job with this profile (customer-provider relationship)
  IF auth.uid() = profile_id THEN
    RETURN QUERY SELECT p.email, p.phone FROM profiles p WHERE p.id = profile_id;
  ELSIF EXISTS (
    SELECT 1 FROM jobs 
    WHERE status = 'completed'
    AND (
      (customer_id = auth.uid() AND awarded_provider_id = profile_id) OR
      (awarded_provider_id = auth.uid() AND customer_id = profile_id)
    )
  ) THEN
    RETURN QUERY SELECT p.email, p.phone FROM profiles p WHERE p.id = profile_id;
  ELSE
    RETURN;
  END IF;
END;
$$;