import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Prompt } from '@/lib/api';

const promptSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
});

type PromptFormValues = z.infer<typeof promptSchema>;

interface PromptFormProps {
  prompt?: Partial<Prompt>;
  onSubmit: (values: PromptFormValues) => void;
  isLoading?: boolean;
}

export function PromptForm({ prompt, onSubmit, isLoading = false }: PromptFormProps) {
  const form = useForm<PromptFormValues>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      title: prompt?.title || '',
      description: prompt?.description || '',
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <Input {...register('title')} placeholder="Enter prompt title" />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea 
          {...register('description')} 
          placeholder="Enter prompt description" 
          className="min-h-[100px]" 
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : prompt?.id ? 'Update Prompt' : 'Create Prompt'}
      </Button>
    </form>
  );
}

export default PromptForm; 