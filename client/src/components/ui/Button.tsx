import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-xl font-semibold transition-all select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E88924] focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs active:scale-[0.99]';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2 gap-2',
    lg: 'text-sm sm:text-base px-6 py-2.5 gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-[#E88924] hover:bg-[#D27315] text-white shadow-orange-950/20 active:bg-[#B75C0B]',
    secondary:
      'bg-[#17191C] hover:bg-[#26292E] text-white active:bg-[#111315]',
    outline:
      'bg-white border border-[#E6E7E9] text-[#202124] hover:bg-[#F5F5F2] hover:border-[#D5D7DA] active:bg-[#ECECE8]',
    danger:
      'bg-[#C44747] hover:bg-[#A93636] text-white shadow-red-950/20 active:bg-[#8C2929]',
    ghost:
      'bg-transparent hover:bg-[#F5F5F2] text-[#202124] shadow-none active:bg-[#ECECE8]',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
