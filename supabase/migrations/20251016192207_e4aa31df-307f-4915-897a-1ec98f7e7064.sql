-- Create missing profiles for users who don't have them yet
-- This fixes the foreign key constraint error when posting jobs

INSERT INTO public.profiles (id, email, full_name, language_preference)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  COALESCE(au.raw_user_meta_data->>'language_preference', 'en')
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;