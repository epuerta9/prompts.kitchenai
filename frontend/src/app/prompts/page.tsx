'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Prompt, getPrompts, deletePrompt } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  FileText,
  Calendar,
  User,
  MoreHorizontal,
  Trash2,
  Edit,
  Copy,
  ExternalLink
} from 'lucide-react';

function CreatePromptDialog({ onSuccess }: { onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Mock user data - in a real app, this would come from auth context
      const mockUser = {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com'
      };

      // Create initial messages for the prompt
      const initialMessages = [
        {
          role: 'system' as const,
          content: 'You are a helpful assistant.'
        },
        {
          role: 'user' as const,
          content: 'Hello, can you help me?'
        },
        {
          role: 'assistant' as const,
          content: 'I\'m here to help! What can I assist you with today?'
        }
      ];

      await createPrompt({
        title,
        description,
        created_by: mockUser,
        messages: initialMessages
      });
      
      toast.success('Prompt created successfully');
      setIsOpen(false);
      setTitle('');
      setDescription('');
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create prompt';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New Prompt
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Create New Prompt</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter prompt title"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter prompt description"
                  className="min-h-[100px]"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Prompt'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </>
  );
}

function PromptCard({ prompt, onDelete }: { prompt: Prompt; onDelete: (id: string) => void }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const handleEdit = () => {
    router.push(`/prompts/${prompt.id}`);
  };
  
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      onDelete(prompt.id);
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{prompt.title}</CardTitle>
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-full p-1 hover:bg-slate-100"
            >
              <MoreHorizontal className="h-5 w-5 text-slate-500" />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md border bg-white shadow-lg">
                <ul className="py-1">
                  <li 
                    className="flex cursor-pointer items-center px-4 py-2 text-sm hover:bg-slate-100"
                    onClick={handleEdit}
                  >
                    <Edit className="mr-2 h-4 w-4 text-slate-500" />
                    Edit Prompt
                  </li>
                  <li 
                    className="flex cursor-pointer items-center px-4 py-2 text-sm hover:bg-slate-100"
                    onClick={() => {
                      navigator.clipboard.writeText(prompt.id);
                      toast.success('Prompt ID copied to clipboard');
                      setIsMenuOpen(false);
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4 text-slate-500" />
                    Copy ID
                  </li>
                  <li 
                    className="flex cursor-pointer items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={handleDelete}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm text-slate-600">{prompt.description}</p>
        <div className="mt-4 flex items-center text-xs text-slate-500">
          <User className="mr-1 h-3 w-3" />
          <span className="mr-3">{prompt.created_by.name}</span>
          <Calendar className="mr-1 h-3 w-3" />
          <span>{formatDate(prompt.created_at)}</span>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-slate-50 p-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full"
          onClick={handleEdit}
        >
          <FileText className="mr-2 h-4 w-4" />
          Open Prompt
        </Button>
      </CardFooter>
    </Card>
  );
}

// Mock function for creating a prompt
async function createPrompt(promptData: any) {
  // In a real app, this would call the API
  console.log('Creating prompt:', promptData);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a mock response
  return {
    id: `prompt-${Date.now()}`,
    ...promptData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
      await deletePrompt(id);
      setPrompts((current) => current.filter((p) => p.id !== id));
      toast.success('Prompt deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete prompt';
      toast.error(message);
    }
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
        <CreatePromptDialog onSuccess={fetchPrompts} />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search prompts..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredPrompts.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          {searchQuery ? (
            <>
              <p className="text-slate-500">No prompts found matching "{searchQuery}"</p>
              <Button variant="outline" onClick={() => setSearchQuery('')} className="mt-4">
                Clear search
              </Button>
            </>
          ) : (
            <>
              <FileText className="mb-4 h-12 w-12 text-slate-300" />
              <p className="mb-2 text-lg font-medium">No prompts yet</p>
              <p className="mb-4 text-slate-500">Create your first prompt to get started</p>
              <CreatePromptDialog onSuccess={fetchPrompts} />
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPrompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
} 