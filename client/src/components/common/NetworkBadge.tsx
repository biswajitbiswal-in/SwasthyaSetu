import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useNetwork } from '../../contexts/NetworkContext';
import { useLanguage } from '../../contexts/LanguageContext';

export const NetworkBadge: React.FC = () => {
  const { isOnline, isServerReachable, isLowBandwidth } = useNetwork();
  const { t } = useLanguage();

  const isConnected = isOnline && isServerReachable;

  if (!isConnected) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FDF2F2] text-[#C44747] border border-[#F4C5C5] transition-colors"
        title="No active internet connection. Operating offline from local cache."
      >
        <WifiOff className="w-3.5 h-3.5 text-[#C44747] shrink-0" />
        <span>{t('offline')}</span>
      </div>
    );
  }

  if (isLowBandwidth) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C96E14] border border-[#FED7AA] transition-colors"
        title="Weak 2G/EDGE network detected. Voice-only mode prioritized."
      >
        <span className="w-2 h-2 rounded-full bg-[#E88924] shrink-0 animate-pulse" />
        <span>Weak Signal (2G)</span>
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EBF5F1] text-[#287D65] border border-[#B7DFD2] transition-colors"
      title="Connected to healthcare backend server."
    >
      <Wifi className="w-3.5 h-3.5 text-[#287D65] shrink-0" />
      <span>{t('online')}</span>
    </div>
  );
};
