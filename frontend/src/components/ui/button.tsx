'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 border-0',
  secondary: 'bg-white/10 text-white hover:bg-white/15 border border-white/10',
  ghost: 'bg-transparent text-white/80 hover:bg-white/5 hover:text-white',
  danger: 'bg-red-600/90 text-white hover:bg-red-500',
};

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: ButtonProps) {
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2', lg: 'px-6 py-3 text-lg' };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
