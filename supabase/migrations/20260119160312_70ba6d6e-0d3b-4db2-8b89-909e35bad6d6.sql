
-- Create a function to validate that a user has the 'provider' role
CREATE OR REPLACE FUNCTION public.is_valid_provider(p_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = p_id AND role = 'provider'
  );
$$;

-- Create a trigger function to validate provider on quote_requests insert
CREATE OR REPLACE FUNCTION public.validate_quote_request_provider()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Validate that the provider_id references a user with 'provider' role
  IF NOT is_valid_provider(NEW.provider_id) THEN
    RAISE EXCEPTION 'Invalid provider: The specified user is not a registered provider';
  END IF;
  
  -- Validate that the customer is not sending a quote request to themselves
  IF NEW.customer_id = NEW.provider_id THEN
    RAISE EXCEPTION 'Invalid request: Cannot send quote request to yourself';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger on quote_requests for INSERT operations
DROP TRIGGER IF EXISTS validate_quote_request_on_insert ON public.quote_requests;
CREATE TRIGGER validate_quote_request_on_insert
  BEFORE INSERT ON public.quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_quote_request_provider();
