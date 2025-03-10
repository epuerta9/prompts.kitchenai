'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Prompt, getPrompts } from '@/lib/api';
import { NewPromptDialog } from '@/components/prompts/new-prompt-dialog';
import { PromptCard } from '@/components/prompts/prompt-card';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getPrompts();
      setPrompts(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch prompts';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setPrompts((current) => current.filter((p) => p.id !== id));
      toast.success('Prompt deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete prompt';
      toast.error(message);
      // Revert the optimistic update on error
      await fetchPrompts();
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchPrompts}>Try Again</Button>
      </div>
    );
  }

  return (
    <main className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Prompts</h1>
        <NewPromptDialog onSuccess={fetchPrompts} />
      </div>
      {prompts.length === 0 ? (
        <div className="flex h-[calc(100vh-16rem)] flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">No prompts found</p>
          <NewPromptDialog onSuccess={fetchPrompts} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </main>
  );
}
