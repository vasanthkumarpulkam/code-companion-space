-- Fix provider_settings security: remove public access

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Settings are viewable by everyone" ON public.provider_settings;

-- Create a new policy that only allows authenticated users to view provider settings
CREATE POLICY "Authenticated users can view provider settings"
ON public.provider_settings
FOR SELECT
TO authenticated
USING (true);

-- The existing "Providers can manage their own settings" policy already covers provider access