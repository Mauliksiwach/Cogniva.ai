import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'brand',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variants = {
    brand:   'bg-brand-500/10  text-brand-300  border-brand-500/25  ',
    success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    warning: 'bg-amber-500/10  text-amber-300   border-amber-500/25  ',
    danger:  'bg-rose-500/10   text-rose-300    border-rose-500/25   ',
    neutral: 'bg-slate-800/80  text-slate-400   border-slate-700/60  ',
    info:    'bg-sky-500/10    text-sky-300     border-sky-500/25    ',
  }[variant];

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-1',
    sm: 'px-2   py-0.5 text-xs     gap-1',
    md: 'px-2.5 py-1   text-xs     gap-1.5',
  }[size];

  const dotColor = {
    brand:   'bg-brand-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger:  'bg-rose-400',
    neutral: 'bg-slate-400',
    info:    'bg-sky-400',
  }[variant];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border tracking-wide ${variants} ${sizes} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      )}
      {children}
    </span>
  );
};
