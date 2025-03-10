'use client';

import * as React from 'react';

interface TabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  className?: string;
}

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

function useTabs() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

export function Tabs({ children, defaultValue, className = '' }: TabsProps) {
  const [value, setValue] = React.useState(defaultValue || '');

  return (
    <TabsContext.Provider value={{ value, onValueChange: setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 ${className}`}>
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

function TabsTrigger({ children, value, className = '' }: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useTabs();
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
        ${isSelected 
          ? 'bg-white text-slate-900 shadow-sm' 
          : 'text-slate-500 hover:text-slate-900'}
        ${className}
      `}
      onClick={() => onValueChange(value)}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

function TabsContent({ children, value, className = '' }: TabsContentProps) {
  const { value: selectedValue } = useTabs();
  const isSelected = selectedValue === value;

  if (!isSelected) return null;

  return (
    <div
      role="tabpanel"
      className={className}
    >
      {children}
    </div>
  );
}

// Attach components to Tabs
Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent; 