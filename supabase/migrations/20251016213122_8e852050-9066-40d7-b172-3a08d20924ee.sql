-- Allow everyone to see provider roles (not sensitive information)
CREATE POLICY "Provider roles are viewable by everyone"
ON public.user_roles
FOR SELECT
USING (role = 'provider');