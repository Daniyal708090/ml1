'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, MessageSquare, Settings, Trophy, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { clearTokens } from '@/lib/api';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: MessageSquare, label: 'Interview', path: '/interview' },
  { icon: BarChart3, label: 'Progress', path: '/progress' },
  { icon: Trophy, label: 'Achievements', path: '/achievements' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-white/10 bg-black/40 p-6 backdrop-blur-xl">
      <div className="mb-8">
        <Link href="/dashboard">
          <h1 className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-2xl font-bold text-transparent">
            Interview AI
          </h1>
        </Link>
        <p className="mt-1 text-sm text-white/50">Smart Interview Analyser</p>
      </div>

      <div className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200',
                isActive
                  ? 'border border-violet-500/30 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto border-t border-white/10 pt-6">
        <button
          type="button"
          onClick={() => {
            clearTokens();
            window.location.href = '/login';
          }}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </nav>
  );
}
