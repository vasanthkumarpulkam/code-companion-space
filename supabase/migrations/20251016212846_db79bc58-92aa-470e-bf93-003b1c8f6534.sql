-- Create default provider settings for existing providers who don't have them
INSERT INTO public.provider_settings (provider_id, available_now, accepts_fixed, accepts_hourly, service_radius_miles)
SELECT 
    ur.user_id,
    false,
    true,
    true,
    25
FROM public.user_roles ur
LEFT JOIN public.provider_settings ps ON ps.provider_id = ur.user_id
WHERE ur.role = 'provider' AND ps.id IS NULL;

-- Create a trigger to automatically create provider settings when someone becomes a provider
CREATE OR REPLACE FUNCTION public.create_provider_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'provider' THEN
    INSERT INTO public.provider_settings (provider_id, available_now, accepts_fixed, accepts_hourly, service_radius_miles)
    VALUES (NEW.user_id, false, true, true, 25)
    ON CONFLICT (provider_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_provider_role_added ON public.user_roles;

-- Create the trigger
CREATE TRIGGER on_provider_role_added
  AFTER INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_provider_settings();