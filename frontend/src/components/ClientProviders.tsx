'use client';

import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'sonner';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster />
      <AuthProvider>{children}</AuthProvider>
    </>
  );
} 