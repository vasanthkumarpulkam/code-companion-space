-- Create function to notify users of new messages
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  message_title TEXT;
  sender_name TEXT;
BEGIN
  -- Get sender name
  SELECT full_name INTO sender_name
  FROM profiles
  WHERE id = NEW.sender_id;
  
  -- Determine message context
  IF NEW.job_id IS NOT NULL THEN
    SELECT title INTO message_title
    FROM jobs
    WHERE id = NEW.job_id;
    
    message_title := 'Job: ' || COALESCE(message_title, 'Unknown Job');
  ELSIF NEW.quote_request_id IS NOT NULL THEN
    SELECT title INTO message_title
    FROM quote_requests
    WHERE id = NEW.quote_request_id;
    
    message_title := 'Quote: ' || COALESCE(message_title, 'Unknown Quote');
  ELSE
    message_title := 'New Message';
  END IF;
  
  -- Create notification for recipient
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    NEW.recipient_id,
    'new_message',
    COALESCE(sender_name, 'Someone') || ' sent you a message',
    LEFT(NEW.content, 100),
    jsonb_build_object(
      'message_id', NEW.id,
      'sender_id', NEW.sender_id,
      'job_id', NEW.job_id,
      'quote_request_id', NEW.quote_request_id,
      'context', message_title
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new messages
DROP TRIGGER IF EXISTS on_message_created ON public.messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();