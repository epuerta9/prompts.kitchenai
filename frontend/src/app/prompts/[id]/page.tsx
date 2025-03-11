'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Prompt, 
  Message, 
  Version, 
  getPrompt, 
  getVersions, 
  createVersion, 
  runPrompt 
} from '@/lib/api';
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
  AlertCircle
} from 'lucide-react';

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
  updated_at: new Date().toISOString()
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

export default function PromptPage() {
  const params = useParams();
  const router = useRouter();
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
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{prompt.title}</h1>
          {activeVersion && (
            <div className="text-sm text-slate-500">v{activeVersion.version}</div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${allChangesAreSaved ? 'bg-green-500' : 'bg-amber-500'}`}></div>
          <span className="text-sm text-slate-500">
            {allChangesAreSaved ? 'All changes saved' : 'Unsaved changes'}
          </span>
          <Button variant="outline" size="sm" onClick={() => router.push('/prompts')}>
            Back
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSaveChanges} 
            disabled={allChangesAreSaved}
          >
            <Save className="mr-1 h-4 w-4" />
            Save
          </Button>
          <Button 
            size="sm" 
            onClick={handleCommitVersion}
            disabled={isCommitting || !allChangesAreSaved}
          >
            {isCommitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Committing...
              </>
            ) : (
              <>
                <Check className="mr-1 h-4 w-4" />
                Commit
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <Tabs defaultValue="single">
            <div className="mb-4 border-b">
              <Tabs.List>
                <Tabs.Trigger value="single">Single Prompt</Tabs.Trigger>
                <Tabs.Trigger value="compare">Compare Multiple</Tabs.Trigger>
              </Tabs.List>
            </div>
            
            <Tabs.Content value="single" className="space-y-4">
              {editableMessages.map((message, index) => (
                <MessageEditor
                  key={index}
                  role={message.role}
                  content={message.content}
                  onChange={(content) => handleMessageChange(index, content)}
                  onDelete={editableMessages.length > 1 ? () => handleDeleteMessage(index) : undefined}
                />
              ))}
              
              <div className="flex justify-end space-x-2">
                <div className="dropdown relative">
                  <Button variant="outline" size="sm">
                    <MessageSquare className="mr-1 h-4 w-4" />
                    Add Message
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                  <div className="dropdown-menu absolute right-0 top-full z-10 mt-1 hidden w-48 rounded-md border bg-white shadow-lg group-hover:block">
                    <ul className="py-1">
                      <li 
                        className="flex cursor-pointer items-center px-4 py-2 text-sm hover:bg-slate-100"
                        onClick={() => handleAddMessage('system')}
                      >
                        Add System Message
                      </li>
                      <li 
                        className="flex cursor-pointer items-center px-4 py-2 text-sm hover:bg-slate-100"
                        onClick={() => handleAddMessage('user')}
                      >
                        Add User Message
                      </li>
                      <li 
                        className="flex cursor-pointer items-center px-4 py-2 text-sm hover:bg-slate-100"
                        onClick={() => handleAddMessage('assistant')}
                      >
                        Add Assistant Message
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {!allChangesAreSaved && (
                <div className="mt-4 flex items-center rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  You have unsaved changes. Click "Save" to save your changes or "Commit" to create a new version.
                </div>
              )}
            </Tabs.Content>
            
            <Tabs.Content value="compare">
              <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <p className="text-slate-500">Compare multiple prompt versions here</p>
              </div>
            </Tabs.Content>
          </Tabs>
        </div>
        
        <div className="col-span-4 space-y-4">
          <div className="rounded-lg border">
            <div className="border-b bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">Test Prompt</div>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  >
                    {selectedModel.name}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  
                  {isModelDropdownOpen && (
                    <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md border bg-white shadow-lg">
                      <ul className="py-1">
                        {models.map((model) => (
                          <li
                            key={model.id}
                            className={`
                              cursor-pointer px-4 py-2 text-sm hover:bg-slate-100
                              ${selectedModel.id === model.id ? 'bg-slate-50 font-medium' : ''}
                            `}
                            onClick={() => {
                              setSelectedModel(model);
                              setIsModelDropdownOpen(false);
                            }}
                          >
                            {model.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-3">
              <Button 
                className="w-full"
                onClick={handleRunPrompt}
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run
                  </>
                )}
              </Button>
              
              <div className="mt-4 rounded-md bg-slate-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-medium">Response</div>
                  {modelResponse && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(modelResponse);
                        toast.success('Response copied to clipboard');
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {modelResponse ? (
                  <pre className="max-h-[300px] overflow-auto whitespace-pre-wrap text-sm">{modelResponse}</pre>
                ) : (
                  <div className="py-8 text-center text-sm text-slate-500">
                    Run the prompt to see the response
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border">
            <div className="border-b bg-slate-50 p-3">
              <div className="font-medium">Settings</div>
            </div>
            <div className="p-3">
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Temperature</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="range" 
                      min="0" 
                      max="2" 
                      step="0.1" 
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="w-10 text-center text-sm">{temperature}</span>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Max Tokens</label>
                  <Input 
                    type="number" 
                    min="1" 
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Top P</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.01" 
                      value={topP}
                      onChange={(e) => setTopP(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="w-10 text-center text-sm">{topP}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border">
            <div className="border-b bg-slate-50 p-3">
              <div className="font-medium">Version History</div>
            </div>
            <div className="p-3">
              <div className="max-h-[200px] space-y-2 overflow-auto">
                {versions.map((version) => (
                  <div 
                    key={version.id}
                    className={`
                      flex items-center justify-between rounded-md p-2
                      ${activeVersion?.id === version.id ? 'bg-slate-100' : 'hover:bg-slate-50'}
                    `}
                  >
                    <div>
                      <div className="font-medium">v{version.version}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(version.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleSwitchVersion(version)}
                      disabled={activeVersion?.id === version.id}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 