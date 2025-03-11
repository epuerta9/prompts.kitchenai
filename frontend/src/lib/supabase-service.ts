import { createClient } from '@/utils/supabase/client';
import { Prompt, Message, Version, User } from './types';

// Get the current user from Supabase
export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return {
    id: user.id,
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
  };
}

// Get all prompts for the current user
export async function getPrompts(): Promise<Prompt[]> {
  const supabase = createClient();
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Fetch prompts
  const { data: prompts, error: promptsError } = await supabase
    .from('prompts')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (promptsError) {
    throw new Error(`Failed to fetch prompts: ${promptsError.message}`);
  }
  
  // Fetch versions for each prompt
  const promptIds = prompts.map(p => p.id);
  const { data: versions, error: versionsError } = await supabase
    .from('prompt_versions')
    .select('*')
    .in('prompt_id', promptIds);
  
  if (versionsError) {
    throw new Error(`Failed to fetch versions: ${versionsError.message}`);
  }
  
  // Map the data to match our application's data structure
  return prompts.map(prompt => {
    const promptVersions = versions
      .filter(v => v.prompt_id === prompt.id)
      .map(v => ({
        id: v.id,
        prompt_id: v.prompt_id,
        version: v.version,
        messages: v.messages as Message[],
        created_by: {
          id: v.created_by,
          name: user.name,
          email: user.email,
        },
        created_at: v.created_at,
        notes: v.notes,
      }));
    
    return {
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      versions: promptVersions,
      created_by: {
        id: prompt.created_by,
        name: user.name,
        email: user.email,
      },
      created_at: prompt.created_at,
      updated_at: prompt.updated_at,
      current_version: prompt.current_version,
    };
  });
}

// Get a single prompt by ID
export async function getPrompt(id: string): Promise<Prompt | undefined> {
  const supabase = createClient();
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Fetch the prompt
  const { data: prompt, error: promptError } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .single();
  
  if (promptError) {
    throw new Error(`Failed to fetch prompt: ${promptError.message}`);
  }
  
  // Fetch versions for the prompt
  const { data: versions, error: versionsError } = await supabase
    .from('prompt_versions')
    .select('*')
    .eq('prompt_id', id)
    .order('version', { ascending: true });
  
  if (versionsError) {
    throw new Error(`Failed to fetch versions: ${versionsError.message}`);
  }
  
  // Map the data to match our application's data structure
  const promptVersions = versions.map(v => ({
    id: v.id,
    prompt_id: v.prompt_id,
    version: v.version,
    messages: v.messages as Message[],
    created_by: {
      id: v.created_by,
      name: user.name,
      email: user.email,
    },
    created_at: v.created_at,
    notes: v.notes,
  }));
  
  return {
    id: prompt.id,
    title: prompt.title,
    description: prompt.description,
    versions: promptVersions,
    created_by: {
      id: prompt.created_by,
      name: user.name,
      email: user.email,
    },
    created_at: prompt.created_at,
    updated_at: prompt.updated_at,
    current_version: prompt.current_version,
  };
}

// Create a new prompt
export async function createPrompt(data: {
  title: string;
  description: string;
  messages: Message[];
}): Promise<Prompt> {
  const supabase = createClient();
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const now = new Date().toISOString();
  
  // Create the prompt
  const { data: newPrompt, error: promptError } = await supabase
    .from('prompts')
    .insert({
      title: data.title,
      description: data.description,
      created_by: user.id,
      created_at: now,
      updated_at: now,
      current_version: 1,
    })
    .select()
    .single();
  
  if (promptError) {
    throw new Error(`Failed to create prompt: ${promptError.message}`);
  }
  
  // Create the first version
  const { data: newVersion, error: versionError } = await supabase
    .from('prompt_versions')
    .insert({
      prompt_id: newPrompt.id,
      version: 1,
      messages: data.messages,
      created_by: user.id,
      created_at: now,
    })
    .select()
    .single();
  
  if (versionError) {
    // Rollback prompt creation if version creation fails
    await supabase.from('prompts').delete().eq('id', newPrompt.id);
    throw new Error(`Failed to create prompt version: ${versionError.message}`);
  }
  
  // Return the complete prompt object
  return {
    id: newPrompt.id,
    title: newPrompt.title,
    description: newPrompt.description,
    versions: [{
      id: newVersion.id,
      prompt_id: newVersion.prompt_id,
      version: newVersion.version,
      messages: newVersion.messages as Message[],
      created_by: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      created_at: newVersion.created_at,
      notes: newVersion.notes,
    }],
    created_by: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    created_at: newPrompt.created_at,
    updated_at: newPrompt.updated_at,
    current_version: newPrompt.current_version,
  };
}

// Create a new version for an existing prompt
export async function createVersion(promptId: string, data: {
  messages: Message[];
  notes?: string;
}): Promise<Prompt> {
  const supabase = createClient();
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Get the current prompt
  const { data: prompt, error: promptError } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', promptId)
    .single();
  
  if (promptError) {
    throw new Error(`Failed to fetch prompt: ${promptError.message}`);
  }
  
  const newVersionNumber = prompt.current_version + 1;
  const now = new Date().toISOString();
  
  // Create the new version
  const { data: newVersion, error: versionError } = await supabase
    .from('prompt_versions')
    .insert({
      prompt_id: promptId,
      version: newVersionNumber,
      messages: data.messages,
      created_by: user.id,
      created_at: now,
      notes: data.notes,
    })
    .select()
    .single();
  
  if (versionError) {
    throw new Error(`Failed to create prompt version: ${versionError.message}`);
  }
  
  // Update the prompt with the new current version
  const { data: updatedPrompt, error: updateError } = await supabase
    .from('prompts')
    .update({
      current_version: newVersionNumber,
      updated_at: now,
    })
    .eq('id', promptId)
    .select()
    .single();
  
  if (updateError) {
    throw new Error(`Failed to update prompt: ${updateError.message}`);
  }
  
  // Get all versions for the prompt
  const { data: versions, error: versionsError } = await supabase
    .from('prompt_versions')
    .select('*')
    .eq('prompt_id', promptId)
    .order('version', { ascending: true });
  
  if (versionsError) {
    throw new Error(`Failed to fetch versions: ${versionsError.message}`);
  }
  
  // Map the data to match our application's data structure
  const promptVersions = versions.map(v => ({
    id: v.id,
    prompt_id: v.prompt_id,
    version: v.version,
    messages: v.messages as Message[],
    created_by: {
      id: v.created_by,
      name: user.name,
      email: user.email,
    },
    created_at: v.created_at,
    notes: v.notes,
  }));
  
  return {
    id: updatedPrompt.id,
    title: updatedPrompt.title,
    description: updatedPrompt.description,
    versions: promptVersions,
    created_by: {
      id: updatedPrompt.created_by,
      name: user.name,
      email: user.email,
    },
    created_at: updatedPrompt.created_at,
    updated_at: updatedPrompt.updated_at,
    current_version: updatedPrompt.current_version,
  };
} 