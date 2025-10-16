-- Create default admin user
-- First, we need to create the user account manually in Supabase Auth
-- Then this migration will assign the admin role

-- Function to assign admin role to specific email
CREATE OR REPLACE FUNCTION assign_admin_role_to_email(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get the user ID from profiles table
  SELECT id INTO target_user_id
  FROM public.profiles
  WHERE email = user_email;
  
  -- If user exists, assign admin role
  IF target_user_id IS NOT NULL THEN
    -- Remove existing roles for this user to avoid duplicates
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    
    -- Insert admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin');
  END IF;
END;
$$;

-- Assign admin role to the default admin email
-- This will work once the user account is created
DO $$
DECLARE
  admin_exists BOOLEAN;
BEGIN
  -- Check if the admin user exists
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE email = 'Admin@servicehub.com'
  ) INTO admin_exists;
  
  -- If the admin user exists, assign the role
  IF admin_exists THEN
    PERFORM assign_admin_role_to_email('Admin@servicehub.com');
  END IF;
END;
$$;