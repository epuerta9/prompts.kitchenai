'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FileText, 
  Settings, 
  Home, 
  ChevronLeft, 
  ChevronRight,
  Star,
  Share2,
  Database,
  Beaker,
  GitBranch,
  BookOpen,
  BarChart2,
  List,
  Activity
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

function Footer() {
  const [year, setYear] = React.useState('');

  React.useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  return (
    <footer className="bg-slate-100 p-2 text-center text-slate-500 text-xs">
      <p>© {year} KitchenAI. All rights reserved.</p>
    </footer>
  );
}

function SideNavItem({ 
  href, 
  icon: Icon, 
  children, 
  isActive = false 
}: { 
  href: string; 
  icon: React.ElementType; 
  children: React.ReactNode; 
  isActive?: boolean;
}) {
  return (
    <Link 
      href={href} 
      className={`
        flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors
        ${isActive 
          ? 'bg-slate-200 text-slate-900' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
      `}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Link>
  );
}

function NavSection({ title, children, collapsed }: { title: string; children: React.ReactNode; collapsed: boolean }) {
  if (collapsed) {
    return <>{children}</>;
  }
  
  return (
    <div className="mb-4">
      <h3 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 items-center gap-4 border-b bg-slate-800 px-4 text-white">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-xl">Prompts.KitchenAI</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/settings" className="text-sm hover:text-slate-300">
            Settings
          </Link>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className={`relative flex flex-col border-r bg-slate-50 ${collapsed ? 'w-14' : 'w-64'}`}>
          <div className="flex-1 overflow-auto p-3">
            <div className="mb-4">
              <button 
                onClick={() => setCollapsed(!collapsed)}
                className="absolute right-2 top-2 rounded-full p-1 text-slate-500 hover:bg-slate-200"
              >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
              {!collapsed && <h2 className="mb-2 px-2 text-lg font-semibold">Navigation</h2>}
            </div>
            
            <nav className="space-y-6">
              <div className="space-y-1">
                <SideNavItem href="/" icon={Home} isActive={pathname === '/'}>
                  {!collapsed && 'Home'}
                </SideNavItem>
              </div>

              <NavSection title="Develop" collapsed={collapsed}>
                <SideNavItem 
                  href="/prompts" 
                  icon={FileText} 
                  isActive={pathname === '/prompts' || pathname.startsWith('/prompts/')}
                >
                  {!collapsed && 'Prompts'}
                </SideNavItem>
                <SideNavItem 
                  href="/datasets" 
                  icon={Database} 
                  isActive={pathname === '/datasets' || pathname.startsWith('/datasets/')}
                >
                  {!collapsed && 'Datasets'}
                </SideNavItem>
                <SideNavItem 
                  href="/experiments" 
                  icon={Beaker} 
                  isActive={pathname === '/experiments' || pathname.startsWith('/experiments/')}
                >
                  {!collapsed && 'Experiments'}
                </SideNavItem>
                <SideNavItem 
                  href="/flows" 
                  icon={GitBranch} 
                  isActive={pathname === '/flows' || pathname.startsWith('/flows/')}
                >
                  {!collapsed && 'Flows'}
                </SideNavItem>
                <SideNavItem 
                  href="/knowledge-base" 
                  icon={BookOpen} 
                  isActive={pathname === '/knowledge-base' || pathname.startsWith('/knowledge-base/')}
                >
                  {!collapsed && 'Knowledge Base'}
                </SideNavItem>
                <SideNavItem 
                  href="/evals" 
                  icon={Star} 
                  isActive={pathname === '/evals' || pathname.startsWith('/evals/')}
                >
                  {!collapsed && 'Evals'}
                </SideNavItem>
              </NavSection>

              <NavSection title="Observe" collapsed={collapsed}>
                <SideNavItem 
                  href="/logs" 
                  icon={List} 
                  isActive={pathname === '/logs' || pathname.startsWith('/logs/')}
                >
                  {!collapsed && 'Logs'}
                </SideNavItem>
                <SideNavItem 
                  href="/analytics" 
                  icon={BarChart2} 
                  isActive={pathname === '/analytics' || pathname.startsWith('/analytics/')}
                >
                  {!collapsed && 'Analytics'}
                </SideNavItem>
                <SideNavItem 
                  href="/compare" 
                  icon={Activity} 
                  isActive={pathname === '/compare' || pathname.startsWith('/compare/')}
                >
                  {!collapsed && 'Compare'}
                </SideNavItem>
              </NavSection>

              <NavSection title="Share" collapsed={collapsed}>
                <SideNavItem 
                  href="/sharing" 
                  icon={Share2} 
                  isActive={pathname === '/sharing' || pathname.startsWith('/sharing/')}
                >
                  {!collapsed && 'Sharing'}
                </SideNavItem>
              </NavSection>

              <div className="space-y-1">
                <SideNavItem href="/settings" icon={Settings} isActive={pathname === '/settings'}>
                  {!collapsed && 'Settings'}
                </SideNavItem>
              </div>
            </nav>
          </div>
          {!collapsed && <Footer />}
        </aside>
        <main className="flex-1 overflow-auto bg-white">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout; 