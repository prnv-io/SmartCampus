-- Create messages table for real-time chat between claimer and finder

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES claims(claim_id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_messages_claim_id ON messages(claim_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view messages for claims they're involved in
CREATE POLICY "Users can view messages for their claims" ON messages
  FOR SELECT USING (
    -- User is the sender
    sender_id = auth.uid()
    OR
    -- User is involved in the claim (finder or claimer)
    EXISTS (
      SELECT 1 FROM claims
      WHERE claims.claim_id = messages.claim_id
      AND (
        -- User is the finder (item owner)
        EXISTS (
          SELECT 1 FROM items
          WHERE items.id = claims.item_id
          AND items.user_id = auth.uid()
        )
        OR
        -- User is the claimer
        claims.claimer_id = auth.uid()
      )
    )
  );

-- RLS Policy: Users can insert messages only for claims they're involved in
CREATE POLICY "Users can send messages for their claims" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM claims
      WHERE claims.claim_id = messages.claim_id
      AND (
        -- User is the finder (item owner)
        EXISTS (
          SELECT 1 FROM items
          WHERE items.id = claims.item_id
          AND items.user_id = auth.uid()
        )
        OR
        -- User is the claimer
        claims.claimer_id = auth.uid()
      )
    )
  );
