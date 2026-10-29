import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'orange';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const variantClasses = {
    success: 'bg-[#F0F9F5] text-[#287D65] border-[#B7DFD2]',
    warning: 'bg-[#FFFDF0] text-[#B7791F] border-[#FDE68A]',
    error: 'bg-[#FDF2F2] text-[#C44747] border-[#FCE4E4]',
    info: 'bg-[#F0F7FF] text-[#4776A8] border-[#CCE4FF]',
    orange: 'bg-[#FFF7ED] text-[#C96E14] border-[#FED7AA]',
    neutral: 'bg-[#F5F5F2] text-[#73777F] border-[#E6E7E9]',
  };

  const dotColorClasses = {
    success: 'bg-[#287D65]',
    warning: 'bg-[#B7791F]',
    error: 'bg-[#C44747]',
    info: 'bg-[#4776A8]',
    orange: 'bg-[#E88924]',
    neutral: 'bg-[#73777F]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border shadow-2xs leading-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColorClasses[variant]}`} />}
      <span>{children}</span>
    </span>
  );
};
