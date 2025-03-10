import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Copy, Trash } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from 'date-fns';
import { Prompt } from '@/lib/api';

interface PromptCardProps {
  prompt: Prompt;
  onDelete: (id: string) => void;
}

export function PromptCard({ prompt, onDelete }: PromptCardProps) {
  const timeAgo = prompt.created_at 
    ? formatDistanceToNow(new Date(prompt.created_at), { addSuffix: true })
    : 'recently';

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">
            <Link href={`/prompts/${prompt.id}`} className="hover:underline">
              {prompt.title}
            </Link>
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(prompt.id)}>
                <Copy className="mr-2 h-4 w-4" />
                <span>Copy ID</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(prompt.id)} className="text-red-600">
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="py-2 flex-grow">
        <p className="text-sm text-slate-600 line-clamp-3">{prompt.description}</p>
      </CardContent>
      <CardFooter className="pt-2 text-xs text-slate-500 flex justify-between">
        <span>By {prompt.created_by.name}</span>
        <span>{timeAgo}</span>
      </CardFooter>
    </Card>
  );
}

export default PromptCard; 