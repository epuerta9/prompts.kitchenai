'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

interface ApiKeyFormProps {
  userId: string;
}

export function ApiKeyForm({ userId }: ApiKeyFormProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a name for your API key');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Generate a random API key
      const key = generateApiKey();
      
      // Hash the key before storing it (in a real app, you'd do this server-side)
      const hashedKey = await hashApiKey(key);
      
      const supabase = createClient();
      
      // Store the API key in the database
      const { error } = await supabase
        .from('api_keys')
        .insert({
          name,
          key: hashedKey,
          user_id: userId,
          created_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      // Show the API key to the user (only time they'll see the full key)
      setNewKey(key);
      setName('');
      toast.success('API key created successfully');
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      toast.success('API key copied to clipboard');
    }
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            API Key Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="e.g., Development, Production"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create API Key'}
        </button>
      </form>
      
      {newKey && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="font-medium text-yellow-800 mb-2">
            Your new API key (copy it now, you won't see it again):
          </p>
          <div className="flex items-center">
            <code className="bg-white p-2 rounded border flex-1 overflow-x-auto text-sm">
              {newKey}
            </code>
            <button
              onClick={copyToClipboard}
              className="ml-2 px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
            >
              Copy
            </button>
          </div>
          <p className="mt-2 text-sm text-yellow-700">
            Store this key securely. For security reasons, we can't show it to you again.
          </p>
        </div>
      )}
    </div>
  );
}

// Helper functions
function generateApiKey() {
  // Generate a random string for the API key
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const prefix = 'ka_';
  let result = prefix;
  
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

async function hashApiKey(key: string) {
  // In a real app, you'd hash this server-side
  // This is a simple placeholder for demo purposes
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
} 