'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Star, StarHalf, Plus, Filter, SlidersHorizontal } from 'lucide-react';

// Mock data for evaluations
const mockEvals = [
  {
    id: '1',
    promptId: 'prompt-1',
    promptTitle: 'Customer Support Assistant',
    score: 4.5,
    evaluator: 'John Doe',
    date: '2023-06-15',
    notes: 'Good response quality, but could improve response time.',
    metrics: {
      accuracy: 4.2,
      helpfulness: 4.7,
      safety: 4.8,
      efficiency: 4.3
    }
  },
  {
    id: '2',
    promptId: 'prompt-2',
    promptTitle: 'Product Recommendation',
    score: 3.8,
    evaluator: 'Jane Smith',
    date: '2023-06-14',
    notes: 'Recommendations are relevant but sometimes miss user preferences.',
    metrics: {
      accuracy: 3.5,
      helpfulness: 4.0,
      safety: 4.5,
      efficiency: 3.2
    }
  },
  {
    id: '3',
    promptId: 'prompt-3',
    promptTitle: 'Code Explanation Assistant',
    score: 4.9,
    evaluator: 'Alex Johnson',
    date: '2023-06-13',
    notes: 'Excellent explanations with good examples.',
    metrics: {
      accuracy: 4.9,
      helpfulness: 5.0,
      safety: 4.8,
      efficiency: 4.9
    }
  }
];

function ScoreDisplay({ score }: { score: number }) {
  const fullStars = Math.floor(score);
  const hasHalfStar = score % 1 >= 0.5;
  
  return (
    <div className="flex items-center">
      <div className="flex text-yellow-500">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-5 w-5 fill-current" />
        ))}
        {hasHalfStar && <StarHalf className="h-5 w-5 fill-current" />}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
        ))}
      </div>
      <span className="ml-2 font-medium">{score.toFixed(1)}</span>
    </div>
  );
}

export default function EvalsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredEvals = mockEvals.filter(evalItem => 
    evalItem.promptTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Evaluations</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Evaluation
        </Button>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search evaluations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Options
        </Button>
      </div>
      
      <Tabs defaultValue="all">
        <div className="border-b">
          <Tabs.List>
            <Tabs.Trigger value="all">All Evaluations</Tabs.Trigger>
            <Tabs.Trigger value="recent">Recent</Tabs.Trigger>
            <Tabs.Trigger value="highest">Highest Rated</Tabs.Trigger>
            <Tabs.Trigger value="lowest">Lowest Rated</Tabs.Trigger>
          </Tabs.List>
        </div>
        
        <Tabs.Content value="all" className="pt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvals.map((evalItem) => (
              <Card key={evalItem.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-lg">{evalItem.promptTitle}</CardTitle>
                    <ScoreDisplay score={evalItem.score} />
                  </div>
                  <div className="text-sm text-slate-500">
                    Evaluated by {evalItem.evaluator} on {new Date(evalItem.date).toLocaleDateString()}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm">{evalItem.notes}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Accuracy</span>
                      <ScoreDisplay score={evalItem.metrics.accuracy} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Helpfulness</span>
                      <ScoreDisplay score={evalItem.metrics.helpfulness} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Safety</span>
                      <ScoreDisplay score={evalItem.metrics.safety} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Efficiency</span>
                      <ScoreDisplay score={evalItem.metrics.efficiency} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredEvals.length === 0 && (
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <p className="text-slate-500">No evaluations found</p>
              <Button variant="link" onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
            </div>
          )}
        </Tabs.Content>
        
        <Tabs.Content value="recent" className="pt-4">
          <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <p className="text-slate-500">Recent evaluations will be shown here</p>
          </div>
        </Tabs.Content>
        
        <Tabs.Content value="highest" className="pt-4">
          <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <p className="text-slate-500">Highest rated evaluations will be shown here</p>
          </div>
        </Tabs.Content>
        
        <Tabs.Content value="lowest" className="pt-4">
          <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <p className="text-slate-500">Lowest rated evaluations will be shown here</p>
          </div>
        </Tabs.Content>
      </Tabs>
    </div>
  );
} 