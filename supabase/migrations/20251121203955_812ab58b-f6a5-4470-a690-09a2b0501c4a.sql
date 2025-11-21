-- Enable real-time for quote_requests table
ALTER TABLE quote_requests REPLICA IDENTITY FULL;

-- Create notification function for new quotes
CREATE OR REPLACE FUNCTION notify_quote_sent()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Notify customer when provider sends a quote
  IF NEW.quoted_amount IS NOT NULL AND OLD.quoted_amount IS NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    SELECT 
      NEW.customer_id,
      'quote_received',
      'New Quote Received',
      'A provider has sent you a quote for: ' || NEW.title,
      jsonb_build_object(
        'quote_request_id', NEW.id,
        'provider_id', NEW.provider_id,
        'quoted_amount', NEW.quoted_amount
      );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create notification function for quote acceptance
CREATE OR REPLACE FUNCTION notify_quote_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Notify provider when customer accepts their quote
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    SELECT 
      NEW.provider_id,
      'quote_accepted',
      'Quote Accepted!',
      'Your quote has been accepted for: ' || NEW.title,
      jsonb_build_object(
        'quote_request_id', NEW.id,
        'customer_id', NEW.customer_id,
        'quoted_amount', NEW.quoted_amount
      );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers for quote notifications
DROP TRIGGER IF EXISTS on_quote_sent ON quote_requests;
CREATE TRIGGER on_quote_sent
  AFTER UPDATE ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_quote_sent();

DROP TRIGGER IF EXISTS on_quote_accepted ON quote_requests;
CREATE TRIGGER on_quote_accepted
  AFTER UPDATE ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_quote_accepted();