import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-lg border border-subtleBorder bg-canvas p-0.5 text-xs font-medium">
      <button
        type="button"
        onClick={() => setLanguage('or')}
        className={`px-2.5 py-1 rounded-md transition-all text-[11px] ${
          language === 'or'
            ? 'bg-surface text-primaryText shadow-2xs font-bold border border-subtleBorder/60'
            : 'text-secondaryText hover:text-primaryText'
        }`}
        title="ଓଡ଼ିଆ ଭାଷା (Odia)"
      >
        ଓଡ଼ିଆ
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-md transition-all text-[11px] ${
          language === 'en'
            ? 'bg-surface text-primaryText shadow-2xs font-bold border border-subtleBorder/60'
            : 'text-secondaryText hover:text-primaryText'
        }`}
        title="English"
      >
        EN
      </button>
    </div>
  );
};
