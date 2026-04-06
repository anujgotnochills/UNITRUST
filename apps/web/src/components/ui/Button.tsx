'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  href,
  icon,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 cursor-pointer select-none';

  const variants = {
    primary:
      'bg-accent-green text-black hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] hover:-translate-y-0.5 active:translate-y-0',
    secondary:
      'bg-surface/10 text-background hover:bg-surface/15 hover:-translate-y-0.5 border border-white/10',
    outline:
      'bg-transparent text-background border border-white/20 hover:border-white/40 hover:bg-surface/5 hover:-translate-y-0.5',
    ghost:
      'bg-transparent text-muted hover:text-background hover:bg-surface/5',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  const classes = cn(baseStyles, variants[variant], sizes[size], className);

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
        {icon}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
      {icon}
    </button>
  );
}
