-- Support requests submitted from help center
CREATE TABLE IF NOT EXISTS public.support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create support requests"
  ON public.support_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view support requests"
  ON public.support_requests FOR SELECT
  USING (has_role(auth.uid(), 'admin'));
