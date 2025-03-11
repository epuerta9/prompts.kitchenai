import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ApiKeyForm } from '@/components/profile/ApiKeyForm';
import { ApiKeyList } from '@/components/profile/ApiKeyList';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default async function ProfilePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login?redirectTo=/profile');
  }
  
  // Fetch user's API keys
  const { data: apiKeys, error: apiKeysError } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', user.id);
  
  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">User ID</p>
              <p className="font-medium">{user.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Sign In</p>
              <p className="font-medium">{new Date(user.last_sign_in_at || '').toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">API Keys</h2>
          <p className="mb-6 text-gray-600">
            Create and manage API keys to access the KitchenAI API programmatically.
          </p>
          
          <ApiKeyForm userId={user.id} />
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Your API Keys</h3>
            <ApiKeyList apiKeys={apiKeys || []} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 