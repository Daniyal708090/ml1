'use client';

import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const variants = {
  default: 'text-violet-300 bg-violet-500/10 border-violet-500/20',
  success: 'text-green-400 bg-green-400/10 border-green-400/20',
  warning: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  danger: 'text-red-400 bg-red-400/10 border-red-400/20',
  info: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
