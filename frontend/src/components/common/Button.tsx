import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'amber';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight = false,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ' +
    'disabled:opacity-40 disabled:cursor-not-allowed select-none ' +
    'active:scale-[0.97]';

  const sizes = {
    xs: 'px-2.5 py-1    text-xs  gap-1.5',
    sm: 'px-3.5 py-1.5  text-xs  gap-1.5',
    md: 'px-4.5 py-2.5  text-sm  gap-2',
    lg: 'px-6   py-3    text-sm  gap-2.5',
    xl: 'px-8   py-3.5  text-base gap-3',
  }[size];

  const variants = {
    primary:
      'bg-gradient-to-br from-brand-500 to-brand-700 hover:from-brand-400 hover:to-brand-600 ' +
      'text-white shadow-brand-sm hover:shadow-brand-md focus-visible:ring-brand-500 ' +
      'border border-brand-400/20',
    secondary:
      'bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700/80 ' +
      'hover:border-slate-600 focus-visible:ring-slate-500 shadow-sm hover:shadow-md',
    outline:
      'bg-transparent hover:bg-slate-800/80 text-slate-300 hover:text-white ' +
      'border border-slate-700/80 hover:border-slate-500 focus-visible:ring-brand-500',
    danger:
      'bg-gradient-to-br from-rose-500 to-rose-700 hover:from-rose-400 hover:to-rose-600 ' +
      'text-white shadow-lg shadow-rose-500/20 focus-visible:ring-rose-500 border border-rose-400/20',
    ghost:
      'bg-transparent hover:bg-slate-800/70 text-slate-400 hover:text-slate-100 ' +
      'focus-visible:ring-slate-500 border border-transparent hover:border-slate-700/50',
    amber:
      'bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 ' +
      'text-white shadow-glow-amber focus-visible:ring-amber-500 border border-amber-400/20',
  }[variant];

  const iconEl = loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : icon;

  return (
    <button
      className={`${base} ${sizes} ${variants} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {!iconRight && iconEl}
      {children}
      {iconRight && iconEl}
    </button>
  );
};
