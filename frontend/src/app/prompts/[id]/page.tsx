'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "sonner";
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { getPrompt, getVersions, createVersion, Prompt, Version } from '@/lib/api';
import { PromptForm } from '@/components/prompts/prompt-form';

export default function PromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newContent, setNewContent] = useState('');
  const promptId = params.id as string;

  useEffect(() => {
    const fetchPromptData = async () => {
      setIsLoading(true);
      try {
        const promptData = await getPrompt(promptId);
        setPrompt(promptData);
        
        const versionsData = await getVersions(promptId);
        setVersions(versionsData);
      } catch (error) {
        console.error('Error fetching prompt data:', error);
        toast.error('Failed to fetch prompt data');
      } finally {
        setIsLoading(false);
      }
    };

    if (promptId) {
      fetchPromptData();
    }
  }, [promptId]);

  const handleUpdatePrompt = async (values: { title: string; description: string }) => {
    if (!prompt) return;
    
    setIsSaving(true);
    try {
      // In a real app, you would call the updatePrompt API here
      // For now, just update the local state
      setPrompt({
        ...prompt,
        title: values.title,
        description: values.description,
      });
      
      toast.success('Prompt updated successfully');
    } catch (error) {
      console.error('Error updating prompt:', error);
      toast.error('Failed to update prompt');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateVersion = async () => {
    if (!prompt || !newContent.trim()) return;
    
    setIsSaving(true);
    try {
      const newVersion = await createVersion(promptId, {
        content: newContent,
        // In a real app, you would get the current user from auth context
        created_by: {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      });
      
      setVersions([...versions, newVersion]);
      setNewContent('');
      
      toast.success('New version created successfully');
    } catch (error) {
      console.error('Error creating version:', error);
      toast.error('Failed to create new version');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <p>Loading prompt...</p>
        </div>
      </MainLayout>
    );
  }

  if (!prompt) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Prompt not found</h3>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Prompts
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Prompts
        </Button>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="versions">Versions ({versions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prompt Details</CardTitle>
            </CardHeader>
            <CardContent>
              <PromptForm 
                prompt={prompt} 
                onSubmit={handleUpdatePrompt} 
                isLoading={isSaving} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Version</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Enter prompt content..."
                  className="min-h-[200px]"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
                <Button onClick={handleCreateVersion} disabled={isSaving || !newContent.trim()}>
                  <Plus className="mr-2 h-4 w-4" />
                  {isSaving ? 'Creating...' : 'Create Version'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {versions.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-lg">
              <p className="text-slate-500">No versions yet. Create your first version above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version) => (
                <Card key={version.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex justify-between">
                      <span>Version {version.version}</span>
                      <span className="text-slate-500 text-xs">
                        {version.created_at ? new Date(version.created_at).toLocaleDateString() : 'Recently'}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-slate-50 p-4 rounded-md overflow-auto text-sm whitespace-pre-wrap">
                      {version.content}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
} 