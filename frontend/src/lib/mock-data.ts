import { Prompt, User } from './types';

export const mockUser: User = {
  id: 'user1',
  name: 'John Doe',
  email: 'john@example.com'
};

export const mockPrompts: Prompt[] = [
  {
    id: 'prompt1',
    title: 'Recipe Generator',
    description: 'A prompt that generates cooking recipes based on available ingredients',
    versions: [
      {
        id: 'v1',
        version: 1,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful cooking assistant.'
          },
          {
            role: 'user',
            content: 'Generate a recipe using the following ingredients: {ingredients}'
          }
        ],
        created_by: mockUser,
        created_at: '2024-03-01T10:00:00Z'
      },
      {
        id: 'v2',
        version: 2,
        messages: [
          {
            role: 'system',
            content: 'You are a professional chef specialized in creative cooking.'
          },
          {
            role: 'user',
            content: 'Create a unique recipe using these ingredients, considering dietary restrictions: {ingredients}'
          }
        ],
        created_by: mockUser,
        created_at: '2024-03-05T15:30:00Z',
        notes: 'Added dietary restrictions consideration'
      }
    ],
    created_by: mockUser,
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-05T15:30:00Z',
    current_version: 2
  },
  {
    id: 'prompt2',
    title: 'Meal Planner',
    description: 'Creates weekly meal plans based on preferences and nutritional goals',
    versions: [
      {
        id: 'v3',
        version: 1,
        messages: [
          {
            role: 'system',
            content: 'You are a nutrition expert and meal planning assistant.'
          },
          {
            role: 'user',
            content: 'Create a weekly meal plan considering: {preferences}'
          }
        ],
        created_by: mockUser,
        created_at: '2024-03-10T09:00:00Z'
      }
    ],
    created_by: mockUser,
    created_at: '2024-03-10T09:00:00Z',
    updated_at: '2024-03-10T09:00:00Z',
    current_version: 1
  }
];

// Mock API functions
export async function getPrompts(): Promise<Prompt[]> {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  return mockPrompts;
}

export async function getPrompt(id: string): Promise<Prompt | undefined> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockPrompts.find(p => p.id === id);
}

export async function createPrompt(data: {
  title: string;
  description: string;
  messages: { role: 'system' | 'user' | 'assistant'; content: string; }[];
}): Promise<Prompt> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newPrompt: Prompt = {
    id: `prompt-${Date.now()}`,
    title: data.title,
    description: data.description,
    versions: [
      {
        id: `v-${Date.now()}`,
        version: 1,
        messages: data.messages,
        created_by: mockUser,
        created_at: new Date().toISOString()
      }
    ],
    created_by: mockUser,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    current_version: 1
  };
  
  mockPrompts.push(newPrompt);
  return newPrompt;
}

export async function createVersion(promptId: string, data: {
  messages: { role: 'system' | 'user' | 'assistant'; content: string; }[];
  notes?: string;
}): Promise<Prompt> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const prompt = mockPrompts.find(p => p.id === promptId);
  if (!prompt) throw new Error('Prompt not found');
  
  const newVersion = {
    id: `v-${Date.now()}`,
    version: prompt.current_version + 1,
    messages: data.messages,
    created_by: mockUser,
    created_at: new Date().toISOString(),
    notes: data.notes
  };
  
  prompt.versions.push(newVersion);
  prompt.current_version = newVersion.version;
  prompt.updated_at = new Date().toISOString();
  
  return prompt;
} 