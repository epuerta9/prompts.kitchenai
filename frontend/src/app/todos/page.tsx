import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default async function TodosPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: todos, error } = await supabase.from('todos').select();

  return (
    <ProtectedRoute>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Todos</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error.message}
          </div>
        )}
        
        {todos && todos.length > 0 ? (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li key={todo.id} className="p-2 border rounded">
                {todo.title || todo.task || JSON.stringify(todo)}
              </li>
            ))}
          </ul>
        ) : (
          <p>No todos found. You might need to create a 'todos' table in your Supabase database.</p>
        )}
      </div>
    </ProtectedRoute>
  );
} 