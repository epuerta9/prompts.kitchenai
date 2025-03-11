-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_version INTEGER NOT NULL DEFAULT 1
);

-- Create prompt_versions table
CREATE TABLE IF NOT EXISTS prompt_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  messages JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE(prompt_id, version)
);

-- Set up Row Level Security
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own prompts
CREATE POLICY "Users can view their own prompts" 
  ON prompts 
  FOR SELECT 
  USING (auth.uid() = created_by);

-- Create policy for users to insert their own prompts
CREATE POLICY "Users can insert their own prompts" 
  ON prompts 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Create policy for users to update their own prompts
CREATE POLICY "Users can update their own prompts" 
  ON prompts 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Create policy for users to delete their own prompts
CREATE POLICY "Users can delete their own prompts" 
  ON prompts 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- Create policy for users to see only their own prompt versions
CREATE POLICY "Users can view their own prompt versions" 
  ON prompt_versions 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM prompts 
    WHERE prompts.id = prompt_versions.prompt_id 
    AND prompts.created_by = auth.uid()
  ));

-- Create policy for users to insert their own prompt versions
CREATE POLICY "Users can insert their own prompt versions" 
  ON prompt_versions 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM prompts 
      WHERE prompts.id = prompt_versions.prompt_id 
      AND prompts.created_by = auth.uid()
    )
  );

-- Create policy for users to update their own prompt versions
CREATE POLICY "Users can update their own prompt versions" 
  ON prompt_versions 
  FOR UPDATE 
  USING (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM prompts 
      WHERE prompts.id = prompt_versions.prompt_id 
      AND prompts.created_by = auth.uid()
    )
  );

-- Create policy for users to delete their own prompt versions
CREATE POLICY "Users can delete their own prompt versions" 
  ON prompt_versions 
  FOR DELETE 
  USING (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM prompts 
      WHERE prompts.id = prompt_versions.prompt_id 
      AND prompts.created_by = auth.uid()
    )
  );

-- Create indexes for faster lookups
CREATE INDEX prompts_created_by_idx ON prompts(created_by);
CREATE INDEX prompt_versions_prompt_id_idx ON prompt_versions(prompt_id);
CREATE INDEX prompt_versions_created_by_idx ON prompt_versions(created_by); 