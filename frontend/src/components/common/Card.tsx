import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hover = false,
  glow = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl transition-all duration-200 ${
        hover ? 'hover:border-slate-700 hover:bg-slate-900/90 hover:shadow-2xl hover:-translate-y-0.5' : ''
      } ${glow ? 'relative before:absolute before:-inset-px before:bg-gradient-to-r before:from-brand-500/20 before:to-purple-500/20 before:rounded-2xl before:-z-10' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
