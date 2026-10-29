import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface BrandLogoProps {
  variant?: 'mark' | 'horizontal' | 'badge';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showTagline?: boolean;
}

/**
 * Official Swasthya Setu Emblem Vector Mark
 * Accurately reproduces the dark medical cross intersected with the orange bridge & community figure.
 */
export const BrandEmblemMark: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Swasthya Setu Emblem"
    >
      {/* 1. Dark Charcoal Medical Cross with Rounded Shoulders */}
      <path
        d="M38 12C38 8.68629 40.6863 6 44 6H56C59.3137 6 62 8.68629 62 12V32H82C85.3137 32 88 34.6863 88 38V50C88 53.3137 85.3137 56 82 56H62V76C62 79.3137 59.3137 82 56 82H44C40.6863 82 38 79.3137 38 76V56H18C14.6863 56 12 53.3137 12 50V38C12 34.6863 14.6863 32 18 32H38V12Z"
        fill="#17191C"
      />

      {/* 2. Orange Bridge Arch Sweeping Across */}
      <path
        d="M22 66C32 54 48 38 78 40C88 40.7 94 44 98 48C90 44 82 43 72 45C52 49 38 64 30 76C26 73 24 70 22 66Z"
        fill="#E88924"
      />
      <path
        d="M28 72C38 58 52 46 80 44C86 44 92 46 96 48C90 45 82 45 74 47C54 53 40 68 34 78C32 76 30 74 28 72Z"
        fill="#F59E0B"
      />

      {/* 3. Community Figure - Head Dot */}
      <circle cx="76" cy="31" r="5.5" fill="#E88924" />

      {/* 4. Community Figure - Twin Bridge Support Pillars */}
      <rect x="71" y="48" width="5.5" height="15" rx="2.75" fill="#E88924" />
      <rect x="79" y="48" width="5.5" height="15" rx="2.75" fill="#E88924" />
    </svg>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showTagline = true,
}) => {
  const { language } = useLanguage();

  if (variant === 'mark') {
    const dim = size === 'sm' ? 28 : size === 'lg' ? 48 : 36;
    return <BrandEmblemMark size={dim} className={className} />;
  }

  if (variant === 'badge') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <div className="w-9 h-9 rounded-xl bg-white p-1 border border-[#E6E7E9] shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
          <img
            src="/logo-square.jpg"
            alt="Swasthya Setu Logo"
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback to SVG if image not yet loaded
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div>
          <div className="flex items-center text-sm font-bold tracking-tight leading-none">
            <span className="text-[#17191C]">Swasthya</span>
            <span className="text-[#E88924] ml-1">Setu</span>
          </div>
          {showTagline && (
            <p className="text-[10px] text-[#73777F] tracking-wide mt-0.5 font-medium">
              {language === 'or' ? 'ସ୍ୱାସ୍ଥ୍ୟର ସେତୁ' : 'Bridge to Health'}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Horizontal full brand lockup
  const heightClass = size === 'sm' ? 'h-7' : size === 'lg' ? 'h-11' : 'h-9';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Horizontal Banner */}
      <img
        src="/logo-horizontal.png"
        alt="Swasthya Setu — Bridge to Health"
        className={`${heightClass} w-auto object-contain hidden sm:block`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />

      {/* Compact Fallback / Mobile View Lockup */}
      <div className="flex items-center gap-2 sm:hidden">
        <BrandEmblemMark size={32} />
        <div>
          <div className="flex items-center text-sm font-bold tracking-tight leading-none">
            <span className="text-[#17191C]">Swasthya</span>
            <span className="text-[#E88924] ml-1">Setu</span>
          </div>
          {showTagline && (
            <p className="text-[9px] text-[#73777F] tracking-wide mt-0.5">
              {language === 'or' ? 'ସ୍ୱାସ୍ଥ୍ୟର ସେତୁ' : 'Bridge to Health'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
