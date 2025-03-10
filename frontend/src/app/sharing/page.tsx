'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import { 
  Users, 
  Globe, 
  Lock, 
  Copy, 
  Share2, 
  UserPlus, 
  Search,
  Link as LinkIcon
} from 'lucide-react';

// Mock data for shared prompts
const mockSharedPrompts = [
  {
    id: '1',
    title: 'Customer Support Assistant',
    description: 'A prompt for handling customer support inquiries',
    owner: 'John Doe',
    shared_with: ['Team A', 'Marketing'],
    visibility: 'team',
    created_at: '2023-06-15',
    updated_at: '2023-06-20'
  },
  {
    id: '2',
    title: 'Product Recommendation',
    description: 'Generates personalized product recommendations',
    owner: 'Jane Smith',
    shared_with: ['Sales'],
    visibility: 'private',
    created_at: '2023-06-10',
    updated_at: '2023-06-18'
  },
  {
    id: '3',
    title: 'Code Explanation Assistant',
    description: 'Explains code snippets in simple language',
    owner: 'Alex Johnson',
    shared_with: ['Engineering', 'Product'],
    visibility: 'public',
    created_at: '2023-06-05',
    updated_at: '2023-06-12'
  }
];

function VisibilityBadge({ visibility }: { visibility: string }) {
  const badges = {
    private: {
      icon: Lock,
      text: 'Private',
      className: 'bg-slate-100 text-slate-700'
    },
    team: {
      icon: Users,
      text: 'Team',
      className: 'bg-blue-100 text-blue-700'
    },
    public: {
      icon: Globe,
      text: 'Public',
      className: 'bg-green-100 text-green-700'
    }
  };
  
  const badge = badges[visibility as keyof typeof badges] || badges.private;
  const Icon = badge.icon;
  
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
      <Icon className="mr-1 h-3 w-3" />
      {badge.text}
    </div>
  );
}

export default function SharingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredPrompts = mockSharedPrompts.filter(prompt => 
    prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sharing</h1>
        <Button>
          <Share2 className="mr-2 h-4 w-4" />
          Share Prompt
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search shared prompts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Tabs defaultValue="shared-with-me">
        <div className="border-b">
          <Tabs.List>
            <Tabs.Trigger value="shared-with-me">Shared with me</Tabs.Trigger>
            <Tabs.Trigger value="my-shares">My shares</Tabs.Trigger>
            <Tabs.Trigger value="public">Public library</Tabs.Trigger>
          </Tabs.List>
        </div>
        
        <Tabs.Content value="shared-with-me" className="pt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPrompts.map((prompt) => (
              <Card key={prompt.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{prompt.title}</CardTitle>
                    <VisibilityBadge visibility={prompt.visibility} />
                  </div>
                  <div className="text-sm text-slate-500">
                    Shared by {prompt.owner}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm">{prompt.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {prompt.shared_with.map((team) => (
                      <div key={team} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">
                        {team}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between">
                    <Button variant="outline" size="sm">
                      <Copy className="mr-1 h-4 w-4" />
                      Clone
                    </Button>
                    <Button variant="outline" size="sm">
                      <LinkIcon className="mr-1 h-4 w-4" />
                      Copy Link
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredPrompts.length === 0 && (
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <p className="text-slate-500">No shared prompts found</p>
              <Button variant="link" onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
            </div>
          )}
        </Tabs.Content>
        
        <Tabs.Content value="my-shares" className="pt-4">
          <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <p className="text-slate-500">Prompts you've shared will appear here</p>
            <Button variant="link">
              <UserPlus className="mr-1 h-4 w-4" />
              Share a prompt
            </Button>
          </div>
        </Tabs.Content>
        
        <Tabs.Content value="public" className="pt-4">
          <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <p className="text-slate-500">Public prompts will be shown here</p>
            <Button variant="link">
              <Globe className="mr-1 h-4 w-4" />
              Browse public library
            </Button>
          </div>
        </Tabs.Content>
      </Tabs>
    </div>
  );
} 