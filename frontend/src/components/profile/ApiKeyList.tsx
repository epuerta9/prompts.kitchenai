'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  name: string;
  created_at: string;
  last_used?: string;
}

interface ApiKeyListProps {
  apiKeys: ApiKey[];
}

export function ApiKeyList({ apiKeys }: ApiKeyListProps) {
  const [keys, setKeys] = useState(apiKeys);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      setIsDeleting(id);
      
      try {
        const supabase = createClient();
        
        const { error } = await supabase
          .from('api_keys')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        // Update the local state
        setKeys(keys.filter(key => key.id !== id));
        toast.success('API key deleted successfully');
      } catch (error) {
        console.error('Error deleting API key:', error);
        toast.error('Failed to delete API key');
      } finally {
        setIsDeleting(null);
      }
    }
  };
  
  if (keys.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        You haven't created any API keys yet.
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Used
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {keys.map((key) => (
            <tr key={key.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">{key.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(key.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {key.last_used 
                  ? new Date(key.last_used).toLocaleDateString() 
                  : 'Never used'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => handleDelete(key.id)}
                  disabled={isDeleting === key.id}
                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                >
                  {isDeleting === key.id ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 