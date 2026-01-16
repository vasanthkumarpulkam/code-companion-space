-- Add server-side validation constraints to bids table
ALTER TABLE public.bids 
ADD CONSTRAINT bids_amount_check 
  CHECK (amount >= 1 AND amount <= 1000000),
ADD CONSTRAINT bids_proposal_length_check 
  CHECK (char_length(proposal) >= 50 AND char_length(proposal) <= 2000);

-- Add server-side validation constraints to messages table
ALTER TABLE public.messages
ADD CONSTRAINT messages_content_length_check 
  CHECK (
    char_length(content) > 0 AND char_length(content) <= 5000
  );