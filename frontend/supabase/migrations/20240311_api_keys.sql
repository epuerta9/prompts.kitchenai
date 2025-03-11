-- Create API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, name)
);

-- Set up Row Level Security
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own API keys
CREATE POLICY "Users can view their own API keys" 
  ON api_keys 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own API keys
CREATE POLICY "Users can insert their own API keys" 
  ON api_keys 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own API keys
CREATE POLICY "Users can update their own API keys" 
  ON api_keys 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy for users to delete their own API keys
CREATE POLICY "Users can delete their own API keys" 
  ON api_keys 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX api_keys_user_id_idx ON api_keys(user_id); 