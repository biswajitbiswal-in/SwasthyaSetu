import React from 'react';
import { ShieldAlert, ShieldCheck, UserCheck, Lock, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';

interface MockAuditEvent {
  id: string;
  actor: string;
  action: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'RECORD_READ' | 'SYNC_SUBMIT' | 'RBAC_DENIED';
  resourceType: string;
  ipAddress: string;
  timestamp: string;
}

const AUDIT_EVENTS: MockAuditEvent[] = [
  {
    id: 'ae-1',
    actor: 'sunita_asha',
    action: 'SYNC_SUBMIT',
    resourceType: 'CONSULTATION_NOTE',
    ipAddress: '103.24.120.45',
    timestamp: 'Today, 10:15:22 AM',
  },
  {
    id: 'ae-2',
    actor: 'dr_patnaik',
    action: 'RECORD_READ',
    resourceType: 'PATIENT_SUMMARY',
    ipAddress: '14.139.221.10',
    timestamp: 'Today, 09:55:10 AM',
  },
  {
    id: 'ae-3',
    actor: 'sunita_asha',
    action: 'LOGIN_SUCCESS',
    resourceType: 'AUTH_SESSION',
    ipAddress: '103.24.120.45',
    timestamp: 'Today, 08:30:00 AM',
  },
  {
    id: 'ae-4',
    actor: 'unknown_ip',
    action: 'LOGIN_FAILED',
    resourceType: 'AUTH_SESSION',
    ipAddress: '198.51.100.22',
    timestamp: 'Yesterday, 11:42:15 PM',
  },
];

export const AdminAuditLogs: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 bg-surface p-6 rounded-2xl border border-subtleBorder shadow-xs">
        <Link
          to="/admin"
          className="p-2.5 rounded-xl border border-subtleBorder text-primaryText hover:bg-canvas transition-colors"
          title="Back to Admin Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amberOrange-50 text-amberOrange-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-amberOrange-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amberOrange-600" />
              <span>Immutable Ledger • PostgreSQL Audit Trail</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-primaryText tracking-tight">
            {language === 'or' ? 'ଅପରିବର୍ତ୍ତନୀୟ ସୁରକ୍ଷା ଅଡିଟ୍ ଲଗ୍' : 'Security & Access Audit Trail'}
          </h1>
          <p className="text-xs sm:text-sm text-secondaryText mt-0.5">
            {language === 'or'
              ? 'ସମସ୍ତ ଲଗଇନ୍, ତଥ୍ୟ ପଠନ ଏବଂ ସିଙ୍କ୍ କାର୍ଯ୍ୟକଳାପର ଅଡିଟ୍ ରେକର୍ଡ।'
              : 'Verifiable log of authentication challenges, record accesses, and batch sync operations.'}
          </p>
        </div>
      </div>

      {/* Structured SaaS Audit Log Table */}
      <div className="bg-surface border border-subtleBorder rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-subtleBorder flex items-center justify-between">
          <h2 className="text-sm font-bold text-primaryText">Security Event Records</h2>
          <span className="text-xs text-secondaryText font-medium bg-canvas px-3 py-1 rounded-lg border border-subtleBorder">
            {AUDIT_EVENTS.length} Events Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] border-b border-subtleBorder text-secondaryText font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Action Event</th>
                <th className="p-4">Actor (Subject)</th>
                <th className="p-4">Resource Entity</th>
                <th className="p-4">Client IP Address</th>
                <th className="p-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtleBorder">
              {AUDIT_EVENTS.map((evt) => (
                <tr key={evt.id} className="hover:bg-canvas/60 transition-colors">
                  <td className="p-4 font-semibold">
                    {evt.action === 'LOGIN_SUCCESS' ? (
                      <span className="inline-flex items-center gap-1.5 text-forestGreen-500 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-forestGreen-500" />
                        <span>{evt.action}</span>
                      </span>
                    ) : evt.action === 'SYNC_SUBMIT' ? (
                      <span className="inline-flex items-center gap-1.5 text-amberOrange-700 bg-amberOrange-50 px-2.5 py-0.5 rounded-full border border-amberOrange-200 font-semibold text-[11px]">
                        <UserCheck className="w-3.5 h-3.5 text-amberOrange-600" />
                        <span>{evt.action}</span>
                      </span>
                    ) : evt.action === 'LOGIN_FAILED' ? (
                      <span className="inline-flex items-center gap-1.5 text-crimsonRed-500 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200 font-semibold text-[11px]">
                        <ShieldAlert className="w-3.5 h-3.5 text-crimsonRed-500" />
                        <span>{evt.action}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-primaryText bg-canvas border border-subtleBorder px-2.5 py-0.5 rounded-full font-semibold text-[11px]">
                        <span>{evt.action}</span>
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-mono text-primaryText font-semibold">{evt.actor}</td>
                  <td className="p-4 text-secondaryText font-mono text-[11px]">{evt.resourceType}</td>
                  <td className="p-4 text-secondaryText font-mono text-[11px]">{evt.ipAddress}</td>
                  <td className="p-4 text-secondaryText text-right font-mono text-[11px]">{evt.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
