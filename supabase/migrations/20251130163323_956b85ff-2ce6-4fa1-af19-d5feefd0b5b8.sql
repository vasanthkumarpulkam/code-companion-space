-- Add message reactions table
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- Users can add reactions
CREATE POLICY "Users can add reactions"
ON message_reactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view reactions on messages they can see
CREATE POLICY "Users can view reactions"
ON message_reactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM messages
    WHERE messages.id = message_reactions.message_id
    AND (messages.sender_id = auth.uid() OR messages.recipient_id = auth.uid())
  )
);

-- Users can delete their own reactions
CREATE POLICY "Users can delete their own reactions"
ON message_reactions FOR DELETE
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX idx_message_reactions_user_id ON message_reactions(user_id);