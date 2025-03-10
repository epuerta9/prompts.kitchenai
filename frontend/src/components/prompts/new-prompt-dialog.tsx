'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { createPrompt } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { PromptForm } from '@/components/prompts/prompt-form';

export interface NewPromptDialogProps {
  onSuccess: () => void;
}

export function NewPromptDialog({ onSuccess }: NewPromptDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (data: { title: string; description: string }) => {
    try {
      await createPrompt(data);
      toast.success('Prompt created successfully');
      setIsOpen(false);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create prompt';
      toast.error(message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button onClick={() => setIsOpen(true)}>New Prompt</Button>
      <PromptForm onSubmit={handleSubmit} />
    </Dialog>
  );
} 