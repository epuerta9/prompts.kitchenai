export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface Version {
  id: string;
  prompt_id: string;
  version: number;
  messages: Message[];
  created_by: User;
  created_at: string;
  notes?: string;
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  versions: Version[];
  created_by: User;
  created_at: string;
  updated_at: string;
  current_version: number;
} 