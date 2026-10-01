import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
  shine?: boolean;
  variant?: 'default' | 'elevated' | 'glass' | 'flat';
}

export const Card: React.FC<CardProps> = ({
  children,
  hover = false,
  glow = false,
  shine = false,
  variant = 'default',
  className = '',
  ...props
}) => {
  const base = 'relative rounded-2xl transition-all duration-300 overflow-hidden';

  const variants = {
    default:  'bg-slate-900/70 border border-slate-800/60 backdrop-blur-xl shadow-card',
    elevated: 'bg-slate-900/90 border border-slate-700/50 shadow-card-hover',
    glass:    'bg-white/[0.03] border border-white/[0.06] backdrop-blur-2xl shadow-card',
    flat:     'bg-slate-900/40 border border-slate-800/40',
  }[variant];

  const hoverStyles = hover
    ? 'hover:border-brand-500/30 hover:shadow-card-hover hover:-translate-y-0.5 hover:bg-slate-900/90 cursor-pointer'
    : '';

  const glowStyles = glow
    ? 'before:absolute before:-inset-px before:rounded-2xl before:bg-gradient-to-br before:from-brand-500/10 before:via-transparent before:to-purple-500/10 before:-z-10 shadow-glow-sm hover:shadow-glow'
    : '';

  const shineStyles = shine
    ? 'after:absolute after:inset-0 after:bg-card-shine after:pointer-events-none'
    : '';

  return (
    <div
      className={`${base} ${variants} ${hoverStyles} ${glowStyles} ${shineStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
