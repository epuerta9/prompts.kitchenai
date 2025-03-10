'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Prompt, getPrompts, deletePrompt } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  Search, 
  FileText
} from 'lucide-react';

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPrompts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getPrompts();
      setPrompts(data);
      if (data.length > 0 && !selectedPrompt) {
        setSelectedPrompt(data[0]);
      }
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
      await deletePrompt(id);
      setPrompts((current) => current.filter((p) => p.id !== id));
      if (selectedPrompt?.id === id) {
        setSelectedPrompt(prompts.length > 1 ? prompts.find(p => p.id !== id) || null : null);
      }
      toast.success('Prompt deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete prompt';
      toast.error(message);
    }
  };

  const handleSelectPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
  };

  const filteredPrompts = prompts.filter(prompt => 
    prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    prompt.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchPrompts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchPrompts}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Prompts</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Prompt
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left sidebar - Prompt list */}
        <div className="col-span-3 rounded-lg border bg-white shadow-sm">
          <div className="border-b p-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search prompts..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="p-2">
            {filteredPrompts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-4 text-center text-slate-500">
                <p>No prompts found</p>
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear search
                </Button>
              </div>
            ) : (
              <ul className="space-y-2">
                {filteredPrompts.map((prompt) => (
                  <li 
                    key={prompt.id}
                    className={`
                      cursor-pointer rounded-md p-2 transition-colors
                      ${selectedPrompt?.id === prompt.id 
                        ? 'bg-slate-100 text-slate-900' 
                        : 'hover:bg-slate-50'}
                    `}
                    onClick={() => handleSelectPrompt(prompt)}
                  >
                    <h3 className="font-medium">{prompt.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                      {prompt.description}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Main content area */}
        <div className="col-span-9 rounded-lg border bg-white shadow-sm">
          {selectedPrompt ? (
            <div className="p-6">
              <h2 className="mb-4 text-xl font-semibold">{selectedPrompt.title}</h2>
              <p className="mb-6 text-slate-600">{selectedPrompt.description}</p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => handleDelete(selectedPrompt.id)}>
                  Delete
                </Button>
                <Button>Edit</Button>
              </div>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 rounded-full bg-slate-100 p-3">
                <FileText className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium">No prompt selected</h3>
              <p className="mb-4 text-slate-500">
                Select a prompt from the list or create a new one to get started
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Prompt
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 