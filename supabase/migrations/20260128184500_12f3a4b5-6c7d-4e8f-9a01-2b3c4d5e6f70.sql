-- Add SMS preference to notification settings
ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT false;
