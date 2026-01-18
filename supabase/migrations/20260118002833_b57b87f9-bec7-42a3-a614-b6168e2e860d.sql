
-- Fix notifications INSERT policy to prevent users from creating notifications for others
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create a restrictive policy that only allows system-generated notifications via SECURITY DEFINER function
-- Direct INSERTs by users are not allowed - notifications must go through create_notification()
-- The create_notification function is SECURITY DEFINER and bypasses RLS

-- Add a policy that explicitly denies direct user inserts
-- (RLS default-deny means no INSERT policy = no inserts allowed for regular users)
-- The create_notification() SECURITY DEFINER function will still work

COMMENT ON TABLE public.notifications IS 'Notifications table. Direct INSERT is not allowed - use create_notification() function which validates and creates notifications securely.';
