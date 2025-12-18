-- Add admin policies for category management
CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add admin policy for jobs (for admin oversight)
CREATE POLICY "Admins can manage all jobs"
ON public.jobs
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));