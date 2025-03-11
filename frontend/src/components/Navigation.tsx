import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Navigation() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  async function handleSignOut() {
    'use server';
    
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    await supabase.auth.signOut();
    return redirect('/login');
  }
  
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          KitchenAI
        </Link>
        <div className="space-x-4">
          <Link href="/todos" className="hover:text-gray-300">
            Todos
          </Link>
          {user ? (
            <form action={handleSignOut}>
              <button type="submit" className="hover:text-gray-300">
                Sign Out
              </button>
            </form>
          ) : (
            <Link href="/login" className="hover:text-gray-300">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
} 