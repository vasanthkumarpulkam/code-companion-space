-- Prevent privilege escalation on signup by sanitizing role metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_role app_role := 'customer';
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, language_preference)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'language_preference', 'en')
  );

  -- Allow only customer/provider roles from metadata
  IF (NEW.raw_user_meta_data->>'role') IN ('customer', 'provider') THEN
    new_role := (NEW.raw_user_meta_data->>'role')::app_role;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, new_role);

  RETURN NEW;
END;
$$;
