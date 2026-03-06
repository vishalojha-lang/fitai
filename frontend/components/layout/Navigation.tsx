'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Utensils,
  Dumbbell,
  ClipboardList,
  TrendingUp,
  MessageSquare,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/food', label: 'Food', icon: Utensils },
  { href: '/workout-plan', label: 'Plan', icon: Dumbbell },
  { href: '/workout-log', label: 'Log', icon: ClipboardList },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/ai-coach', label: 'AI Coach', icon: MessageSquare },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800 fixed left-0 top-0 z-30 pt-16">
        <nav className="flex flex-col gap-1 p-3 mt-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <Icon size={18} className={active ? 'text-green-500' : ''} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 safe-area-pb">
        <div className="flex items-stretch">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors min-w-0',
                  active
                    ? 'text-green-500'
                    : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                )}
              >
                <Icon size={20} />
                <span className="truncate w-full text-center px-0.5" style={{ fontSize: '9px' }}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default Navigation;
