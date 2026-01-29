-- Allow anonymous users to browse open jobs and provider settings

CREATE POLICY "Public can view open jobs"
  ON public.jobs FOR SELECT
  USING (status = 'open');

CREATE POLICY "Public can view provider settings"
  ON public.provider_settings FOR SELECT
  USING (true);
