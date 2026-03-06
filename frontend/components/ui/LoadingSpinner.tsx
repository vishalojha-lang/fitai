import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ size = 'md', className, fullScreen = false }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  const spinner = (
    <div
      className={cn(
        'rounded-full border-gray-200 border-t-green-500 animate-spin',
        sizes[size],
        className
      )}
      style={{ borderTopColor: '#22c55e', borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'transparent', borderWidth: size === 'sm' ? '2px' : size === 'md' ? '3px' : '4px', borderStyle: 'solid', borderTopStyle: 'solid' }}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export default LoadingSpinner;
