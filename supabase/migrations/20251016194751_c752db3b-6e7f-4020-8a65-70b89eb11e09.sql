-- Add provider skills and certifications
CREATE TABLE IF NOT EXISTS public.provider_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  years_experience INTEGER,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.provider_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  certification_name TEXT NOT NULL,
  issuing_organization TEXT,
  issue_date DATE,
  expiry_date DATE,
  verified BOOLEAN DEFAULT false,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add provider availability and settings
CREATE TABLE IF NOT EXISTS public.provider_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  hourly_rate NUMERIC,
  accepts_hourly BOOLEAN DEFAULT true,
  accepts_fixed BOOLEAN DEFAULT true,
  available_now BOOLEAN DEFAULT false,
  accepts_instant_bookings BOOLEAN DEFAULT false,
  service_radius_miles INTEGER DEFAULT 25,
  bio_headline TEXT,
  response_time_hours INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add saved/favorite providers
CREATE TABLE IF NOT EXISTS public.saved_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, provider_id)
);

-- Add instant quote requests
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  title TEXT NOT NULL CHECK (char_length(title) >= 10),
  description TEXT NOT NULL CHECK (char_length(description) >= 20),
  location TEXT NOT NULL,
  preferred_pricing TEXT CHECK (preferred_pricing IN ('hourly', 'fixed', 'either')),
  urgency TEXT DEFAULT 'flexible' CHECK (urgency IN ('urgent', 'soon', 'flexible')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'accepted', 'declined', 'expired')),
  quoted_amount NUMERIC,
  quoted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.provider_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for provider_skills
CREATE POLICY "Skills are viewable by everyone"
  ON public.provider_skills FOR SELECT
  USING (true);

CREATE POLICY "Providers can manage their own skills"
  ON public.provider_skills FOR ALL
  USING (auth.uid() = provider_id);

-- RLS Policies for provider_certifications
CREATE POLICY "Certifications are viewable by everyone"
  ON public.provider_certifications FOR SELECT
  USING (true);

CREATE POLICY "Providers can manage their own certifications"
  ON public.provider_certifications FOR ALL
  USING (auth.uid() = provider_id);

-- RLS Policies for provider_settings
CREATE POLICY "Settings are viewable by everyone"
  ON public.provider_settings FOR SELECT
  USING (true);

CREATE POLICY "Providers can manage their own settings"
  ON public.provider_settings FOR ALL
  USING (auth.uid() = provider_id);

-- RLS Policies for saved_providers
CREATE POLICY "Users can view their own saved providers"
  ON public.saved_providers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own saved providers"
  ON public.saved_providers FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for quote_requests
CREATE POLICY "Customers can view their own quote requests"
  ON public.quote_requests FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Providers can view quotes sent to them"
  ON public.quote_requests FOR SELECT
  USING (auth.uid() = provider_id);

CREATE POLICY "Customers can create quote requests"
  ON public.quote_requests FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their own quote requests"
  ON public.quote_requests FOR UPDATE
  USING (auth.uid() = customer_id);

CREATE POLICY "Providers can update quotes for their requests"
  ON public.quote_requests FOR UPDATE
  USING (auth.uid() = provider_id);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_provider_settings_updated_at
  BEFORE UPDATE ON public.provider_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_quote_requests_updated_at
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add indexes for performance
CREATE INDEX idx_provider_skills_provider ON public.provider_skills(provider_id);
CREATE INDEX idx_provider_certifications_provider ON public.provider_certifications(provider_id);
CREATE INDEX idx_saved_providers_user ON public.saved_providers(user_id);
CREATE INDEX idx_saved_providers_provider ON public.saved_providers(provider_id);
CREATE INDEX idx_quote_requests_customer ON public.quote_requests(customer_id);
CREATE INDEX idx_quote_requests_provider ON public.quote_requests(provider_id);
CREATE INDEX idx_quote_requests_status ON public.quote_requests(status);