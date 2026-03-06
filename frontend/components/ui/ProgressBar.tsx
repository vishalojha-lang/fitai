import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  showValues?: boolean;
  color?: 'green' | 'blue' | 'yellow' | 'red';
  size?: 'sm' | 'md';
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = false,
  showValues = false,
  color = 'green',
  size = 'md',
  className,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
  };

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage || showValues) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>}
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-auto">
            {showValues ? `${value} / ${max}` : showPercentage ? `${Math.round(percentage)}%` : null}
          </span>
        </div>
      )}
      <div className={cn('w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
