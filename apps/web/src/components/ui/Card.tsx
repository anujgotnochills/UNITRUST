'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export function Card({ children, className, hover = true, glow = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/5 bg-surface overflow-hidden',
        hover && 'transition-all duration-300 hover:border-white/15 hover:bg-surface-light',
        glow && 'glow-green',
        className,
      )}
    >
      {children}
    </div>
  );
}
