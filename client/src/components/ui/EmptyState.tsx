import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white border border-[#E6E7E9] rounded-2xl shadow-xs font-sans ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#F5F5F2] border border-[#E6E7E9] flex items-center justify-center text-[#73777F] mb-3 shadow-xs">
        {icon || <Inbox className="w-6 h-6 text-[#73777F]" />}
      </div>
      <h3 className="text-sm sm:text-base font-bold text-[#202124] tracking-tight">{title}</h3>
      <p className="text-xs text-[#73777F] max-w-sm mt-1 mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
