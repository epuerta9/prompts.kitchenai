'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Eye, 
  EyeOff, 
  Copy, 
  ExternalLink, 
  List, 
  FileText, 
  Sparkles, 
  ArrowRight,
  BookOpen,
  Code,
  Globe,
  FileCode
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('••••••••••••••••••••••••••••••');
  const userName = 'Esteban Puerta';

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    // You could add a toast notification here
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {userName}</h1>
      </div>

      {/* API Key Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium">Your prompts.kitchenai API key</h2>
        </div>
        <div className="relative">
          <Input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="pr-20"
            readOnly
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <button
              onClick={handleCopyApiKey}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <Copy size={18} />
            </button>
          </div>
        </div>

        {/* LLM API Setup Card */}
        <Card className="bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="mt-1 rounded-full bg-purple-200 p-1">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 font-medium">Set up your LLM API keys</h3>
                <p className="mb-4 text-sm text-slate-600">
                  To start using prompts.kitchenai, you'll need to add your LLM API key in the settings.
                </p>
                <Button variant="default" className="bg-slate-800 text-white hover:bg-slate-700">
                  Configure API Key
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracing Card */}
        <Card className="border">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="mt-1 rounded-full bg-slate-100 p-1">
                <List className="h-5 w-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 font-medium">Start tracing your LLM requests</h3>
                <p className="mb-4 text-sm text-slate-600">
                  Monitor your production LLM calls by setting up tracing. Try it out in our sandbox or follow our guide to get started.
                </p>
                <div className="flex space-x-3">
                  <Button variant="outline" className="border-slate-300">
                    Explore Sandbox <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="border-slate-300">
                    View Logging Guide
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flow Building Card */}
        <Card className="border">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="mt-1 rounded-full bg-slate-100 p-1">
                <FileText className="h-5 w-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 font-medium">Try building a flow</h3>
                <p className="mb-4 text-sm text-slate-600">
                  Create an AI flow in seconds using natural language. Describe what you want to build and we'll generate it for you.
                </p>
                <div className="mb-4">
                  <div className="relative">
                    <Input 
                      placeholder="Describe your AI flow..." 
                      className="pl-10 pr-4 py-2"
                    />
                    <Sparkles className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-500" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="rounded-full border-slate-200 bg-white">
                    Research Summary <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full border-slate-200 bg-white">
                    Website Summarizer <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full border-slate-200 bg-white">
                    Web Q&A <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full border-slate-200 bg-white">
                    Content Generation <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learn Section */}
        <div>
          <h2 className="mb-4 text-lg font-medium">Learn how to use prompts.kitchenai</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="overflow-hidden">
              <div className="aspect-video bg-purple-100 p-4">
                <BookOpen className="h-8 w-8 text-purple-500" />
              </div>
              <CardContent className="p-4">
                <h3 className="mb-2 font-medium">Documentation</h3>
                <p className="mb-3 text-sm text-slate-600">
                  Learn how to integrate and use our platform with comprehensive guides.
                </p>
                <Button variant="link" className="h-auto p-0 text-purple-600">
                  Read the docs <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <div className="aspect-video bg-blue-100 p-4">
                <Code className="h-8 w-8 text-blue-500" />
              </div>
              <CardContent className="p-4">
                <h3 className="mb-2 font-medium">API Reference</h3>
                <p className="mb-3 text-sm text-slate-600">
                  Explore our API endpoints and learn how to interact with our services.
                </p>
                <Button variant="link" className="h-auto p-0 text-blue-600">
                  View API docs <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <div className="aspect-video bg-green-100 p-4">
                <FileCode className="h-8 w-8 text-green-500" />
              </div>
              <CardContent className="p-4">
                <h3 className="mb-2 font-medium">Example Projects</h3>
                <p className="mb-3 text-sm text-slate-600">
                  See real-world examples and starter templates to kickstart your project.
                </p>
                <Button variant="link" className="h-auto p-0 text-green-600">
                  Browse examples <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
