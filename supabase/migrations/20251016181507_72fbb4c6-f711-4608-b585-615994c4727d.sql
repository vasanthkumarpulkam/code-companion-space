-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create new policies for secure profile access
-- Authenticated users can view basic profile information of other users
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Anonymous users cannot view any profiles
-- This prevents email/phone harvesting by unauthenticated visitors

-- Users can still insert and update their own profiles (existing policies remain)
-- The existing "Users can insert their own profile" and "Users can update their own profile" policies are kept