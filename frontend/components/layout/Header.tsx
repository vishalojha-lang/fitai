'use client';

import React from 'react';
import Link from 'next/link';
import { Sun, Moon, Zap } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 flex items-center px-4">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-1.5 font-bold text-lg">
        <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
          <Zap size={16} className="text-white" fill="white" />
        </div>
        <span className="text-gray-900 dark:text-white">
          Fit<span className="text-green-500">AI</span>
        </span>
      </Link>

      <div className="flex-1" />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Toggle dark mode"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Avatar */}
      <Link
        href="/profile"
        className="ml-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold hover:bg-green-600 transition-colors"
      >
        {initials}
      </Link>
    </header>
  );
}

export default Header;
