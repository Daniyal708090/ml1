'use client';

import { cn } from '@/lib/utils';

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/40',
        'focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20',
        className
      )}
      {...props}
    />
  );
}
