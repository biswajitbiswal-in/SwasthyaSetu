import React, { useState } from 'react';
import {
  RefreshCw,
  Clock,
  ShieldCheck,
  Database,
  HardDrive,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRole } from '../../contexts/RoleContext';
import { useNetwork } from '../../contexts/NetworkContext';
import { useToast } from '../../contexts/ToastContext';
import { ItemSyncStatusTag } from '../../components/common/SyncBadge';

interface QueueItem {
  operationId: string;
  entityType: string;
  action: string;
  title: string;
  createdAt: string;
  status: 'SAVED_LOCAL' | 'PENDING_SYNC' | 'SYNCED' | 'SYNC_FAILED';
  retryCount: number;
}

const INITIAL_QUEUE: QueueItem[] = [
  {
    operationId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    entityType: 'CONSULTATION_NOTE',
    action: 'CREATE',
    title: 'Visit Observation — Gitanjali Majhi (OD-P-10042)',
    createdAt: 'Today, 10:15 AM',
    status: 'PENDING_SYNC',
    retryCount: 0,
  },
  {
    operationId: 'a2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    entityType: 'PATIENT_VITALS',
    action: 'UPDATE',
    title: 'BP & Vitals Check — Debendra Behera (OD-P-10043)',
    createdAt: 'Today, 09:45 AM',
    status: 'PENDING_SYNC',
    retryCount: 0,
  },
  {
    operationId: 'b3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    entityType: 'PRESCRIPTION_DISPENSE',
    action: 'CONFIRM',
    title: 'ORS Dispensation Record — Gitanjali Majhi',
    createdAt: 'Today, 08:35 AM',
    status: 'SYNCED',
    retryCount: 0,
  },
];

export const AshaSync: React.FC = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const { setPendingSyncCount } = useRole();
  const { isOnline, isServerReachable } = useNetwork();
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Today at 08:30 AM');

  const triggerSync = async () => {
    if (!isOnline || !isServerReachable) {
      showToast(
        language === 'or'
          ? 'ଇଣ୍ଟରନେଟ୍ ସଂଯୋଗ ଉପଲବ୍ଧ ନାହିଁ। ତଥ୍ୟ ସ୍ଥାନୀୟ ଫୋନ୍‌ରେ ସୁରକ୍ଷିତ ଅଛି।'
          : 'Internet connection is unavailable. Queued records remain safely in local device storage.',
        'warning',
        4500
      );
      return;
    }

    setIsSyncing(true);

    // Simulate batch sync API call
    setTimeout(() => {
      setQueue((prev) =>
        prev.map((q) => (q.status === 'PENDING_SYNC' || q.status === 'SAVED_LOCAL' ? { ...q, status: 'SYNCED' } : q))
      );
      setPendingSyncCount(0);
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      showToast(
        language === 'or'
          ? 'ସମସ୍ତ ସାଇତା ନୋଟ୍ ସର୍ଭର ସହ ସଫଳତାର ସହ ସିଙ୍କ୍ ହେଲା!'
          : 'Batch of pending records successfully synchronized with CHC server!',
        'success',
        4000
      );
    }, 1200);
  };

  const pendingCount = queue.filter((q) => q.status === 'PENDING_SYNC' || q.status === 'SAVED_LOCAL').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-6 rounded-2xl border border-subtleBorder shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-amberOrange-50 text-amberOrange-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amberOrange-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amberOrange-500 animate-pulse" />
              <span>Offline-First Engine • Dexie.js Persistence</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-primaryText tracking-tight">
            {language === 'or' ? 'ଅଫଲାଇନ୍ ସିଙ୍କ୍ରୋନାଇଜେସନ କେନ୍ଦ୍ର' : 'Offline Synchronization Center'}
          </h1>
          <p className="text-xs sm:text-sm text-secondaryText mt-0.5">
            {language === 'or'
              ? 'ସ୍ଥାନୀୟ କ୍ୟାସ୍ ଏବଂ ହସ୍ପିଟାଲ୍ ସର୍ଭର ମଧ୍ୟରେ ସୁରକ୍ଷିତ ତଥ୍ୟ ଆଦାନପ୍ରଦାନ।'
              : 'Deterministic FIFO queue with UUIDv4 idempotency keys to guarantee zero clinical data loss.'}
          </p>
        </div>

        <button
          type="button"
          onClick={triggerSync}
          disabled={isSyncing || pendingCount === 0}
          className="inline-flex items-center justify-center gap-2 bg-amberOrange-600 hover:bg-amberOrange-700 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>
            {isSyncing
              ? language === 'or' ? 'ସିଙ୍କ୍ ଚାଲିଛି...' : 'Syncing Batch to Server...'
              : language === 'or' ? 'ବର୍ତ୍ତମାନ ସିଙ୍କ୍ କରନ୍ତୁ' : 'Sync All Pending Now'}
          </span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Pending Operations (Reference Charcoal Style) */}
        <div className="bg-[#17191C] text-white rounded-2xl p-5 border border-white/10 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-white/10 text-amberOrange-500">
                <Database className="w-4 h-4" />
              </span>
              <p className="text-xs font-medium text-slate-300">
                {language === 'or' ? 'ଅପଲୋଡ୍ ବାକି ଥିବା ତଥ୍ୟ' : 'Pending Operations'}
              </p>
            </div>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${pendingCount > 0 ? 'bg-amberOrange-500/20 text-amberOrange-400 border border-amberOrange-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
              {pendingCount > 0 ? 'Queued' : 'Synced'}
            </span>
          </div>

          <div className="flex items-end justify-between mt-3">
            <div>
              <p className="text-2xl font-bold tracking-tight text-white">{pendingCount}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {pendingCount > 0 ? 'Local mutations waiting for network' : 'Zero uncommitted drafts'}
              </p>
            </div>
            {/* Native SVG Sparkline */}
            <div className="w-20 h-9">
              <svg viewBox="0 0 80 36" className="w-full h-full overflow-visible">
                <path
                  d="M0 26 Q 20 28, 40 16 T 80 8"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 2: Last Confirmed Sync (White Card) */}
        <div className="bg-surface rounded-2xl p-5 border border-subtleBorder shadow-xs flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-50 text-forestGreen-500 border border-emerald-100">
                <Clock className="w-4 h-4" />
              </span>
              <p className="text-xs font-medium text-secondaryText">
                {language === 'or' ? 'ଶେଷ ସଫଳ ସିଙ୍କ୍' : 'Last Confirmed Sync'}
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-forestGreen-500 border border-emerald-200">
              Verified
            </span>
          </div>

          <div className="flex items-end justify-between mt-3">
            <div>
              <p className="text-lg font-bold tracking-tight text-primaryText">{lastSyncTime}</p>
              <p className="text-[11px] text-secondaryText mt-0.5">Automated handshake at reconnection</p>
            </div>
            <div className="w-20 h-9">
              <svg viewBox="0 0 80 36" className="w-full h-full overflow-visible">
                <path
                  d="M0 22 Q 25 10, 50 20 T 80 6"
                  fill="none"
                  stroke="#287D65"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 3: Storage Engine Integrity (White Card) */}
        <div className="bg-surface rounded-2xl p-5 border border-subtleBorder shadow-xs flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-slate-50 text-primaryText border border-subtleBorder">
                <HardDrive className="w-4 h-4 text-amberOrange-600" />
              </span>
              <p className="text-xs font-medium text-secondaryText">
                {language === 'or' ? 'ସ୍ଥାନୀୟ ଡାଟାବେସ୍' : 'IndexedDB Storage'}
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-primaryText border border-subtleBorder">
              Dexie.js v4
            </span>
          </div>

          <div className="flex items-end justify-between mt-3">
            <div>
              <p className="text-lg font-bold tracking-tight text-primaryText">Encrypted &amp; Persistent</p>
              <p className="text-[11px] text-secondaryText mt-0.5">Survives full device restarts</p>
            </div>
            <div className="w-20 h-9">
              <svg viewBox="0 0 80 36" className="w-full h-full overflow-visible">
                <path
                  d="M0 18 Q 20 8, 45 22 T 80 12"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Table for FIFO Sync Queue */}
      <div className="bg-surface border border-subtleBorder rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-subtleBorder flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-primaryText flex items-center gap-2">
              <Database className="w-4 h-4 text-amberOrange-600" />
              <span>{language === 'or' ? 'କ୍ୟୁରେ ଥିବା ଅପରେସନ ତାଲିକା' : 'Pending Operations Queue (FIFO)'}</span>
            </h2>
            <p className="text-xs text-secondaryText mt-0.5">
              Sequentially executed mutations sorted chronologically to eliminate race conditions
            </p>
          </div>
          <span className="text-xs font-medium text-secondaryText bg-canvas px-3 py-1 rounded-lg border border-subtleBorder">
            {queue.length} Queue entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] border-b border-subtleBorder text-secondaryText font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Operation ID</th>
                <th className="p-4">Entity &amp; Action</th>
                <th className="p-4">Clinical Description</th>
                <th className="p-4">Queued Timestamp</th>
                <th className="p-4 text-right">Synchronization Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtleBorder">
              {queue.map((item) => (
                <tr key={item.operationId} className="hover:bg-canvas/60 transition-colors">
                  <td className="p-4 font-mono text-secondaryText font-medium text-[11px]">
                    {item.operationId.substring(0, 16)}...
                  </td>

                  <td className="p-4">
                    <span className="bg-canvas border border-subtleBorder text-primaryText px-2 py-0.5 rounded font-mono text-[11px] font-semibold mr-1.5">
                      {item.entityType}
                    </span>
                    <span className="text-secondaryText font-semibold text-[11px]">
                      {item.action}
                    </span>
                  </td>

                  <td className="p-4 font-semibold text-primaryText">
                    {item.title}
                  </td>

                  <td className="p-4 text-secondaryText font-mono text-[11px]">
                    {item.createdAt}
                  </td>

                  <td className="p-4 text-right">
                    <ItemSyncStatusTag status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Footer: Idempotency & Conflict Resolution Protocol */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-subtleBorder shadow-xs flex items-start gap-3.5">
          <ShieldCheck className="w-5 h-5 text-amberOrange-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-bold text-primaryText uppercase tracking-wider">
              {language === 'or' ? 'ଡୁପ୍ଲିକେସନ୍ ପ୍ରତିରୋଧକ ସୁରକ୍ଷା' : 'Idempotency Guarantee'}
            </h3>
            <p className="text-xs text-secondaryText mt-1 leading-relaxed">
              {language === 'or'
                ? 'ପ୍ରତ୍ୟେକ ନୋଟ୍ ଏବଂ ଅପଡେଟ୍ ଏକ ନିର୍ଦ୍ଦିଷ୍ଟ UUID କୀ ଦ୍ୱାରା ଚିହ୍ନିତ। ନେଟୱର୍କ ବାଧାପ୍ରାପ୍ତ ହେଲେ ମଧ୍ୟ କୌଣସି ଡୁପ୍ଲିକେଟ୍ ଏଣ୍ଟ୍ରି ହେବ ନାହିଁ।'
                : 'Every queued mutation is tagged with a client-generated UUIDv4 idempotency key. Network retries safely return previous responses without creating duplicate prescriptions or records.'}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-subtleBorder shadow-xs flex items-start gap-3.5">
          <CheckCircle2 className="w-5 h-5 text-forestGreen-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-bold text-primaryText uppercase tracking-wider">
              {language === 'or' ? 'ସ୍ୱୟଂଚାଳିତ କନଫ୍ଲିକ୍ଟ ନିଷ୍ପତ୍ତି' : 'Deterministic Conflict Policy'}
            </h3>
            <p className="text-xs text-secondaryText mt-1 leading-relaxed">
              Clinical doctor notes take absolute precedence over field drafts via timestamped version vectors. If two workers edit simultaneously, the later verified observation is retained and logged to the audit ledger.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
