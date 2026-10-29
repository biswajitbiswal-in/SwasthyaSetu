import React from 'react';
import { Search, X } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1 font-sans">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[#202124]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-[#73777F] pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full py-2 bg-white border rounded-xl text-xs sm:text-sm text-[#202124] placeholder-[#73777F] transition-all focus:outline-none focus:ring-2 focus:ring-[#E88924] focus:border-transparent disabled:bg-[#F5F5F2] disabled:cursor-not-allowed ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } ${rightIcon ? 'pr-10' : 'pr-3.5'} ${
              error ? 'border-[#C44747] focus:ring-[#C44747]' : 'border-[#E6E7E9] hover:border-[#D5D7DA]'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-[#73777F] flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-[11px] text-[#C44747] font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-[#73777F]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'rightIcon'> {
  onClear?: () => void;
  showKbdShortcut?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  showKbdShortcut = true,
  className = '',
  placeholder = 'Search...',
  ...props
}) => {
  return (
    <div className="relative flex items-center w-full">
      <Search className="w-4 h-4 text-[#73777F] absolute left-3.5 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full pl-10 pr-12 py-2 bg-[#F5F5F2] hover:bg-white focus:bg-white border border-[#E6E7E9] rounded-xl text-xs sm:text-sm text-[#202124] placeholder-[#73777F] focus:outline-none focus:border-[#E88924] focus:ring-2 focus:ring-[#E88924]/20 transition-all ${className}`}
        {...props}
      />
      {value && onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 text-[#73777F] hover:text-[#202124] p-0.5 rounded-md transition-colors"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : showKbdShortcut ? (
        <kbd className="absolute right-3 text-[10px] font-mono text-[#73777F] bg-white px-1.5 py-0.5 rounded border border-[#E6E7E9] pointer-events-none">
          /
        </kbd>
      ) : null}
    </div>
  );
};
