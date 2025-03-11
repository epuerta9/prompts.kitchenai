'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Prompt, Message, Version } from '@/lib/types';
import { getPrompt, createVersion } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs } from '@/components/ui/tabs';
import { 
  Save, 
  Copy, 
  Play, 
  History, 
  Settings, 
  ChevronDown,
  RotateCcw,
  MessageSquare,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for a prompt
const mockPrompt: Prompt = {
  id: 'prompt-1',
  title: 'Customer Support Assistant',
  description: 'A prompt for handling customer support inquiries',
  created_by: {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com'
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  versions: [
    {
      id: 'version-1',
      prompt_id: 'prompt-1',
      version: 1,
      messages: [
        {
          role: 'system',
          content: 'you are a helpful assistant with a pirate accent'
        },
        {
          role: 'user',
          content: 'help me get store details'
        },
        {
          role: 'assistant',
          content: 'Arr matey! I be the helpful assistant ye requested. Here be the store details ye asked for...'
        }
      ],
      created_by: {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com'
      },
      created_at: new Date().toISOString()
    }
  ],
  current_version: 1
};

// Mock data for versions
const mockVersions: Version[] = [
  {
    id: 'version-1',
    prompt_id: 'prompt-1',
    version: 1,
    messages: [
      {
        role: 'system',
        content: 'you are a helpful assistant with a pirate accent'
      },
      {
        role: 'user',
        content: 'help me get store details'
      },
      {
        role: 'assistant',
        content: 'Arr matey! I be the helpful assistant ye requested. Here be the store details ye asked for...'
      }
    ],
    created_by: {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com'
    },
    created_at: new Date().toISOString()
  }
];

// Mock models for testing
const models = [
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gpt-4', name: 'GPT-4' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku' },
];

// Mock function to run a prompt
const mockRunPrompt = async (messages: Message[], model: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return a mock response based on the model
  let response = '';
  
  if (messages.some(m => m.content.toLowerCase().includes('pirate'))) {
    response = `Arr matey! I be the helpful assistant ye requested. Here be the store details ye asked for:
      
Store Name: The Pirate's Treasure
Location: 123 Main Street, Port Royal
Hours: 9am - 9pm, Monday through Saturday, 10am - 6pm on Sundays
Contact: (555) 123-4567
Website: www.piratestreasure.com

They be specializing in nautical goods, maps, and all manner of pirate accessories. Would ye be needin' any other information about the store, me hearty?`;
  } else {
    response = `I'm happy to help! Here are the store details you requested:

Store Name: The General Store
Location: 456 Main Street, Downtown
Hours: 8am - 8pm, Monday through Sunday
Contact: (555) 987-6543
Website: www.thegeneralstore.com

They offer a wide variety of products including groceries, household items, and basic necessities. Is there anything specific about the store you'd like to know?`;
  }
  
  return {
    response,
    model,
    usage: {
      prompt_tokens: 150,
      completion_tokens: 200,
      total_tokens: 350
    }
  };
};

// Mock function to create a version
const mockCreateVersion = async (promptId: string, messages: Message[]) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a mock response
  return {
    id: `version-${Date.now()}`,
    prompt_id: promptId,
    version: mockVersions.length + 1,
    messages,
    created_by: {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com'
    },
    created_at: new Date().toISOString()
  };
};

function MessageEditor({ 
  role, 
  content, 
  onChange, 
  onDelete 
}: { 
  role: 'system' | 'user' | 'assistant'; 
  content: string; 
  onChange: (content: string) => void;
  onDelete?: () => void;
}) {
  const roleLabels = {
    system: 'System',
    user: 'User',
    assistant: 'Assistant'
  };
  
  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between border-b bg-slate-50 p-3">
        <div className="font-medium">{roleLabels[role]}</div>
        {onDelete && (
          <button 
            onClick={onDelete}
            className="rounded-full p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="p-3">
        <Textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[100px] resize-none border-0 focus-visible:ring-0"
          placeholder={`Enter ${roleLabels[role].toLowerCase()} message...`}
        />
      </div>
    </div>
  );
}

function CreateVersionDialog({ prompt, onSuccess }: { prompt: Prompt; onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [systemMessage, setSystemMessage] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Pre-fill with current version's messages
    const currentVersion = prompt?.versions?.find(v => v.version === prompt.current_version);
    if (currentVersion) {
      setSystemMessage(currentVersion.messages.find(m => m.role === 'system')?.content || '');
      setUserMessage(currentVersion.messages.find(m => m.role === 'user')?.content || '');
    }
  }, [prompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!systemMessage.trim() || !userMessage.trim()) {
      toast.error('Please fill in all message fields');
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

      const result = await createVersion(prompt.id, {
        messages,
        notes: notes.trim() || undefined
      });
      
      if (result) {
        toast.success('Version created successfully');
        setIsOpen(false);
        setNotes('');
        onSuccess();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create version';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New Version
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Create New Version</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">System Message</label>
                <Textarea
                  value={systemMessage}
                  onChange={(e) => setSystemMessage(e.target.value)}
                  placeholder="Enter system message"
                  className="min-h-[100px]"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">User Message Template</label>
                <Textarea
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Enter user message template"
                  className="min-h-[100px]"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Version Notes (Optional)</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe what changed in this version"
                  className="min-h-[80px]"
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
                  {isSubmitting ? 'Creating...' : 'Create Version'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </>
  );
}

function VersionCard({ version }: { version: Version }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Version {version.version}</CardTitle>
          <span className="text-sm text-slate-500">{formatDate(version.created_at)}</span>
        </div>
      </CardHeader>
      <CardContent>
        {version.notes && (
          <div className="mb-4">
            <h4 className="mb-1 text-sm font-medium text-slate-700">Notes</h4>
            <p className="text-sm text-slate-600">{version.notes}</p>
          </div>
        )}
        <div className="space-y-4">
          {version.messages.map((message, index) => (
            <div key={index} className="space-y-1">
              <h4 className="text-sm font-medium capitalize text-slate-700">
                {message.role} Message
              </h4>
              <pre className="whitespace-pre-wrap break-words rounded bg-slate-50 p-3 text-sm">
                {message.content}
              </pre>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PromptPage() {
  const params = useParams();
  const router = useRouter();
  
  if (!params?.id) {
    router.push('/prompts');
    return null;
  }
  
  const promptId = params.id as string;
  
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [modelResponse, setModelResponse] = useState('');
  const [activeVersion, setActiveVersion] = useState<Version | null>(null);
  const [editableMessages, setEditableMessages] = useState<Message[]>([]);
  const [allChangesAreSaved, setAllChangesAreSaved] = useState(true);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [topP, setTopP] = useState(0.9);
  const [isCommitting, setIsCommitting] = useState(false);
  
  // Fetch prompt data
  useEffect(() => {
    const fetchPromptData = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, these would be API calls
        // const promptData = await getPrompt(promptId);
        // const versionsData = await getVersions(promptId);
        
        // Using mock data for now
        const promptData = mockPrompt;
        const versionsData = mockVersions;
        
        setPrompt(promptData);
        setVersions(versionsData);
        
        if (versionsData.length > 0) {
          const latestVersion = versionsData.reduce((latest, current) => 
            current.version > latest.version ? current : latest, versionsData[0]);
          setActiveVersion(latestVersion);
          setEditableMessages([...latestVersion.messages]);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch prompt';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPromptData();
  }, [promptId]);
  
  const handleMessageChange = (index: number, content: string) => {
    const newMessages = [...editableMessages];
    newMessages[index] = { ...newMessages[index], content };
    setEditableMessages(newMessages);
    setAllChangesAreSaved(false);
  };
  
  const handleAddMessage = (role: 'system' | 'user' | 'assistant') => {
    const newMessages = [...editableMessages, { role, content: '' }];
    setEditableMessages(newMessages);
    setAllChangesAreSaved(false);
  };
  
  const handleDeleteMessage = (index: number) => {
    // Don't allow deleting if there's only one message
    if (editableMessages.length <= 1) {
      toast.error('Cannot delete the only message');
      return;
    }
    
    const newMessages = [...editableMessages];
    newMessages.splice(index, 1);
    setEditableMessages(newMessages);
    setAllChangesAreSaved(false);
  };
  
  const handleSaveChanges = async () => {
    try {
      // In a real app, you would update the prompt with the new messages
      // await updatePrompt(promptId, { messages: editableMessages });
      
      // For now, just update the local state
      if (activeVersion) {
        const updatedVersion = { ...activeVersion, messages: [...editableMessages] };
        setActiveVersion(updatedVersion);
        
        const updatedVersions = versions.map(v => 
          v.id === updatedVersion.id ? updatedVersion : v
        );
        setVersions(updatedVersions);
      }
      
      toast.success('Changes saved successfully');
      setAllChangesAreSaved(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save changes';
      toast.error(message);
    }
  };
  
  const handleCommitVersion = async () => {
    try {
      setIsCommitting(true);
      
      // In a real app, you would call the API
      // const newVersion = await createVersion(promptId, { 
      //   messages: editableMessages,
      //   created_by: { id: 'user1', name: 'John Doe', email: 'john@example.com' }
      // });
      
      // Using mock function for now
      const newVersion = await mockCreateVersion(promptId, editableMessages);
      
      setVersions([...versions, newVersion]);
      setActiveVersion(newVersion);
      toast.success('New version created successfully');
      setAllChangesAreSaved(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create version';
      toast.error(message);
    } finally {
      setIsCommitting(false);
    }
  };
  
  const handleRunPrompt = async () => {
    setIsRunning(true);
    setModelResponse('');
    
    try {
      // In a real app, you would call the API
      // const response = await runPrompt({
      //   messages: editableMessages,
      //   model: selectedModel.id,
      //   temperature,
      //   max_tokens: maxTokens,
      //   top_p: topP
      // });
      
      // Using mock function for now
      const response = await mockRunPrompt(editableMessages, selectedModel.id);
      
      setModelResponse(response.response);
      toast.success(`Successfully ran prompt with ${selectedModel.name}`);
    } catch (error) {
      toast.error('Failed to run prompt');
    } finally {
      setIsRunning(false);
    }
  };
  
  const handleSwitchVersion = (version: Version) => {
    if (!allChangesAreSaved) {
      if (confirm('You have unsaved changes. Are you sure you want to switch versions?')) {
        setActiveVersion(version);
        setEditableMessages([...version.messages]);
        setAllChangesAreSaved(true);
      }
    } else {
      setActiveVersion(version);
      setEditableMessages([...version.messages]);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  
  if (error || !prompt) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error || 'Prompt not found'}</p>
        <Button onClick={() => router.push('/prompts')}>Back to Prompts</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/prompts')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{prompt.title}</h1>
        </div>
        <CreateVersionDialog prompt={prompt} onSuccess={() => {}} />
      </div>
      
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-2 text-lg font-semibold">About this Prompt</h2>
        <p className="text-slate-600">{prompt.description}</p>
      </div>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <History className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Version History</h2>
        </div>
        <div className="space-y-4">
          {prompt.versions
            .slice()
            .reverse()
            .map((version) => (
              <VersionCard key={version.id} version={version} />
            ))}
        </div>
      </div>
    </div>
  );
} 