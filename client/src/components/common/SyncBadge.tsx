import React from 'react';
import { CloudCheck, CloudUpload, AlertCircle, HardDrive } from 'lucide-react';
import { useRole } from '../../contexts/RoleContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';

interface SyncBadgeProps {
  mode?: 'compact' | 'detailed';
}

export const SyncBadge: React.FC<SyncBadgeProps> = () => {
  const { pendingSyncCount } = useRole();
  const { t, language } = useLanguage();

  if (pendingSyncCount === 0) {
    return (
      <Link
        to="/sync"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EBF5F1] text-[#287D65] hover:bg-[#DDF0E8] border border-[#B7DFD2] transition-colors"
        title="All records and clinical notes are confirmed by the hospital server."
      >
        <CloudCheck className="w-3.5 h-3.5 text-[#287D65] shrink-0" />
        <span className="hidden sm:inline">{t('synced')}</span>
        <span className="sm:hidden">{language === 'or' ? 'ସିଙ୍କ୍' : 'Synced'}</span>
      </Link>
    );
  }

  return (
    <Link
      to="/sync"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C96E14] hover:bg-[#FEEDD9] border border-[#FED7AA] transition-colors"
      title={`${pendingSyncCount} operations saved locally on this device, pending server transmission.`}
    >
      <CloudUpload className="w-3.5 h-3.5 text-[#E88924] shrink-0" />
      <span>{pendingSyncCount} {language === 'or' ? 'ବାକି (Pending)' : 'Pending Sync'}</span>
    </Link>
  );
};

// Reusable detailed status tag for list items / cards
export const ItemSyncStatusTag: React.FC<{
  status: 'SAVED_LOCAL' | 'PENDING_SYNC' | 'SYNCED' | 'SYNC_FAILED';
}> = ({ status }) => {
  switch (status) {
    case 'SYNCED':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#287D65] bg-[#EBF5F1] px-2.5 py-0.5 rounded-full border border-[#B7DFD2]">
          <CloudCheck className="w-3 h-3 text-[#287D65]" />
          <span>Synced</span>
        </span>
      );
    case 'PENDING_SYNC':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C96E14] bg-[#FFF7ED] px-2.5 py-0.5 rounded-full border border-[#FED7AA]">
          <CloudUpload className="w-3 h-3 text-[#E88924]" />
          <span>Pending Sync</span>
        </span>
      );
    case 'SAVED_LOCAL':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#202124] bg-[#ECECE8] px-2.5 py-0.5 rounded-full border border-[#E6E7E9]">
          <HardDrive className="w-3 h-3 text-[#73777F]" />
          <span>Saved on This Device</span>
        </span>
      );
    case 'SYNC_FAILED':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C44747] bg-[#FDF2F2] px-2.5 py-0.5 rounded-full border border-[#F4C5C5]">
          <AlertCircle className="w-3 h-3 text-[#C44747]" />
          <span>Sync Failed</span>
        </span>
      );
    default:
      return null;
  }
};
