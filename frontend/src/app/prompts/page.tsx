'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Prompt, Message } from '@/lib/types';
import { getPrompts, createPrompt, getCurrentUser } from '@/lib/supabase-service';
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
  History,
  Edit,
  ExternalLink
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function CreatePromptDialog({ onSuccess }: { onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [systemMessage, setSystemMessage] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !systemMessage.trim() || !userMessage.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const messages: Message[] = [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: userMessage
        }
      ];

      await createPrompt({
        title,
        description,
        messages
      });
      
      toast.success('Prompt created successfully');
      setIsOpen(false);
      setTitle('');
      setDescription('');
      setSystemMessage('');
      setUserMessage('');
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
          <div className="w-full max-w-2xl rounded-lg bg-white p-6">
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
                  className="min-h-[80px]"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">System Message</label>
                <Textarea
                  value={systemMessage}
                  onChange={(e) => setSystemMessage(e.target.value)}
                  placeholder="Enter system message (e.g., 'You are a helpful cooking assistant')"
                  className="min-h-[80px]"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">User Message Template</label>
                <Textarea
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Enter user message template (e.g., 'Generate a recipe using: {ingredients}')"
                  className="min-h-[80px]"
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

function PromptCard({ prompt }: { prompt: Prompt }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const handleEdit = () => {
    router.push(`/prompts/${prompt.id}`);
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
                    onClick={handleEdit}
                  >
                    <History className="mr-2 h-4 w-4 text-slate-500" />
                    View Versions ({prompt.versions.length})
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
          <span className="ml-3 rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">
            v{prompt.current_version}
          </span>
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

  const filteredPrompts = prompts.filter(prompt => 
    prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    prompt.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchPrompts();
  }, []);

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Prompts</h1>
          <CreatePromptDialog onSuccess={fetchPrompts} />
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search prompts..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4 text-red-700">
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={fetchPrompts}
            >
              Try Again
            </Button>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="rounded-md bg-slate-50 p-8 text-center">
            <FileText className="mx-auto mb-2 h-8 w-8 text-slate-400" />
            <h3 className="mb-1 text-lg font-medium">No prompts found</h3>
            <p className="mb-4 text-slate-500">
              {searchQuery ? 'Try a different search term' : 'Create your first prompt to get started'}
            </p>
            {searchQuery && (
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPrompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 