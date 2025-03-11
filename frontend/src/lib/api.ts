import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle error responses
    const message = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export interface User {
  id: string;
  name: string;
  email: string;
  created_at?: string;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  created_by: User;
  created_at?: string;
  updated_at?: string;
  versions?: Version[];
  comments?: Comment[];
}

export interface Version {
  id: string;
  prompt_id: string;
  version: number;
  messages: Message[];
  created_by: User;
  created_at?: string;
  evals?: Eval[];
}

export interface Comment {
  id: string;
  prompt_id: string;
  content: string;
  created_by: User;
  created_at?: string;
}

export interface Eval {
  id: string;
  version_id: string;
  score: number;
  notes: string;
  created_by: User;
  created_at?: string;
}

export interface RunPromptRequest {
  messages: Message[];
  model: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

export interface RunPromptResponse {
  response: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Prompts
export const getPrompts = async (): Promise<Prompt[]> => {
  try {
    const response: Prompt[] = await api.get('/prompts');
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('API Error - getPrompts:', error);
    throw error;
  }
};

export const getPrompt = async (id: string): Promise<Prompt> => {
  try {
    const response: Prompt = await api.get(`/prompts/${id}`);
    return response;
  } catch (error) {
    console.error('API Error - getPrompt:', error);
    throw error;
  }
};

export const createPrompt = async (prompt: Partial<Prompt>): Promise<Prompt> => {
  try {
    const response: Prompt = await api.post('/prompts', prompt);
    return response;
  } catch (error) {
    console.error('API Error - createPrompt:', error);
    throw error;
  }
};

export const updatePrompt = async (id: string, prompt: Partial<Prompt>): Promise<Prompt> => {
  try {
    const response: Prompt = await api.put(`/prompts/${id}`, prompt);
    return response;
  } catch (error) {
    console.error('API Error - updatePrompt:', error);
    throw error;
  }
};

export const deletePrompt = async (id: string): Promise<void> => {
  try {
    await api.delete(`/prompts/${id}`);
  } catch (error) {
    console.error('API Error - deletePrompt:', error);
    throw error;
  }
};

// Versions
export const getVersions = async (promptId: string): Promise<Version[]> => {
  try {
    const response: Version[] = await api.get(`/prompts/${promptId}/versions`);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('API Error - getVersions:', error);
    throw error;
  }
};

export const createVersion = async (promptId: string, version: { messages: Message[], created_by: User }): Promise<Version> => {
  try {
    const response: Version = await api.post(`/prompts/${promptId}/versions`, version);
    return response;
  } catch (error) {
    console.error('API Error - createVersion:', error);
    throw error;
  }
};

// Comments
export const getComments = async (promptId: string): Promise<Comment[]> => {
  try {
    const response: Comment[] = await api.get(`/prompts/${promptId}/comments`);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('API Error - getComments:', error);
    throw error;
  }
};

export const addComment = async (promptId: string, comment: Partial<Comment>): Promise<Comment> => {
  try {
    const response: Comment = await api.post(`/prompts/${promptId}/comments`, comment);
    return response;
  } catch (error) {
    console.error('API Error - addComment:', error);
    throw error;
  }
};

// Evaluations
export const createEvaluation = async (
  promptId: string, 
  version: number, 
  evaluation: Partial<Eval>
): Promise<Eval> => {
  try {
    const response: Eval = await api.post(`/prompts/${promptId}/versions/${version}/eval`, evaluation);
    return response;
  } catch (error) {
    console.error('API Error - createEvaluation:', error);
    throw error;
  }
};

export const getEvaluations = async (promptId: string, version: number): Promise<Eval[]> => {
  try {
    const response: Eval[] = await api.get(`/prompts/${promptId}/versions/${version}/evals`);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('API Error - getEvaluations:', error);
    throw error;
  }
};

// Run prompt
export const runPrompt = async (request: RunPromptRequest): Promise<RunPromptResponse> => {
  try {
    const response: RunPromptResponse = await api.post('/run', request);
    return response;
  } catch (error) {
    console.error('API Error - runPrompt:', error);
    throw error;
  }
};

export default api; 