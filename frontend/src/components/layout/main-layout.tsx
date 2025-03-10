'use client';

import * as React from 'react';
import Link from 'next/link';

interface MainLayoutProps {
  children: React.ReactNode;
}

function Footer() {
  const [year, setYear] = React.useState('');

  React.useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  return (
    <footer className="bg-slate-100 p-4 text-center text-slate-600">
      <div className="container mx-auto">
        <p>© {year} KitchenAI. All rights reserved.</p>
      </div>
    </footer>
  );
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <header className="bg-slate-800 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              Prompts.KitchenAI
            </Link>
            <nav className="space-x-4">
              <Link href="/" className="hover:text-slate-300">
                Prompts
              </Link>
              <Link href="/settings" className="hover:text-slate-300">
                Settings
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-grow container mx-auto p-4">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default MainLayout; 