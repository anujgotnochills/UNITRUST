'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'green' | 'purple' | 'yellow' | 'muted';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-white/10 text-white/80 border-white/10',
    green: 'bg-accent-green/10 text-accent-green border-accent-green/20',
    purple: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    muted: 'bg-white/5 text-muted border-white/5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider border',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
