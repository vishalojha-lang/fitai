'use client';

import React from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <Navigation />
      {/* Main content: offset for sidebar on desktop, bottom nav on mobile */}
      <main className="pt-14 pb-20 md:pb-6 md:pl-56 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AppLayout;
