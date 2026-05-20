'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hover?: boolean;
}

export function Card({ className, glass, hover, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-6 transition-all duration-300',
        glass
          ? 'border-white/10 bg-white/5 backdrop-blur-xl shadow-xl shadow-violet-500/5'
          : 'border-white/10 bg-white/5',
        hover && 'hover:border-violet-500/30 hover:shadow-violet-500/10 hover:scale-[1.01]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
