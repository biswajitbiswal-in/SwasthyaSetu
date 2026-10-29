import React from 'react';
import { Shield, Server, ArrowRight, ShieldCheck, Building, Users, Stethoscope, Activity } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRole } from '../../contexts/RoleContext';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { language } = useLanguage();
  const { currentUser } = useRole();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Admin Header */}
      <section className="bg-surface border border-subtleBorder rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="bg-amberOrange-50 text-amberOrange-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amberOrange-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amberOrange-600" />
              <span>{currentUser.role} • {currentUser.facilityName}</span>
            </span>
            <span className="text-xs text-secondaryText font-mono">
              Least-Privilege RBAC Enforced
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-primaryText tracking-tight">
            {language === 'or' ? 'ପ୍ରଶାସନିକ କାର୍ଯ୍ୟ ପରିଚାଳନା କେନ୍ଦ୍ର' : 'Administrative Operations Center'}
          </h1>
          <p className="text-xs sm:text-sm text-secondaryText mt-1 max-w-2xl">
            {language === 'or'
              ? 'ୟୁଜର୍ ଆକାଉଣ୍ଟ, ସୁରକ୍ଷା ଅଡିଟ୍ ଏବଂ ସିଷ୍ଟମ୍ କାର୍ଯ୍ୟଦକ୍ଷତା ତଦାରଖ। ସର୍ବନିମ୍ନ ଅଧିକାର ନିୟମ ଅନୁଯାୟୀ କୌଣସି ବ୍ୟକ୍ତିଗତ ରୋଗୀ ତଥ୍ୟ ଉପଲବ୍ଧ ନୁହେଁ।'
              : 'Operational system telemetry and role access governance. Enforcing strict least-privilege boundaries with zero clinical surveillance.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/admin/audit"
            className="inline-flex items-center gap-2 bg-amberOrange-600 hover:bg-amberOrange-700 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <Shield className="w-4 h-4" />
            <span>View Audit Trail</span>
          </Link>
        </div>
      </section>

      {/* 4 Reference-Style Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Facilities (Reference Charcoal Hero Card) */}
        <div className="bg-[#17191C] text-white rounded-2xl p-5 border border-white/10 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-white/10 text-amberOrange-500">
                <Building className="w-4 h-4" />
              </span>
              <p className="text-xs font-medium text-slate-300">Active Facilities</p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Online
            </span>
          </div>

          <div className="flex items-end justify-between mt-3">
            <div>
              <p className="text-2xl font-bold tracking-tight text-white">3 Units</p>
              <p className="text-[11px] text-slate-400 mt-0.5">1 CHC • 2 Sub-Centers</p>
            </div>
            <div className="w-16 h-9">
              <svg viewBox="0 0 64 36" className="w-full h-full overflow-visible">
                <path
                  d="M0 24 Q 16 10, 32 20 T 64 6"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 2: ASHA Field Workers */}
        <div className="bg-surface rounded-2xl p-5 border border-subtleBorder shadow-xs flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-50 text-forestGreen-500 border border-emerald-100">
                <Users className="w-4 h-4" />
              </span>
              <p className="text-xs font-medium text-secondaryText">ASHA Field Force</p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-forestGreen-500 border border-emerald-200">
              Active Sync
            </span>
          </div>

          <div className="flex items-end justify-between mt-3">
            <div>
              <p className="text-2xl font-bold tracking-tight text-primaryText">4 Field Workers</p>
              <p className="text-[11px] text-secondaryText mt-0.5">Nuapada Block coverage</p>
            </div>
            <div className="w-16 h-9">
              <svg viewBox="0 0 64 36" className="w-full h-full overflow-visible">
                <path
                  d="M0 20 Q 20 8, 40 22 T 64 8"
                  fill="none"
                  stroke="#287D65"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 3: Doctors On Duty */}
        <div className="bg-surface rounded-2xl p-5 border border-subtleBorder shadow-xs flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-amberOrange-50 text-amberOrange-600 border border-amberOrange-100">
                <Stethoscope className="w-4 h-4" />
              </span>
              <p className="text-xs font-medium text-secondaryText">Doctors on Roster</p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-forestGreen-500 border border-emerald-200">
              2 Connected
            </span>
          </div>

          <div className="flex items-end justify-between mt-3">
            <div>
              <p className="text-2xl font-bold tracking-tight text-primaryText">2 Physicians</p>
              <p className="text-[11px] text-secondaryText mt-0.5">Telemedicine pool ready</p>
            </div>
            <div className="w-16 h-9">
              <svg viewBox="0 0 64 36" className="w-full h-full overflow-visible">
                <path
                  d="M0 22 Q 22 28, 44 12 T 64 6"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 4: System Health */}
        <div className="bg-surface rounded-2xl p-5 border border-subtleBorder shadow-xs flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-50 text-forestGreen-500 border border-emerald-100">
                <Activity className="w-4 h-4" />
              </span>
              <p className="text-xs font-medium text-secondaryText">Express &amp; PostgreSQL</p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-forestGreen-500 border border-emerald-200">
              100% Uptime
            </span>
          </div>

          <div className="flex items-end justify-between mt-3">
            <div>
              <p className="text-2xl font-bold tracking-tight text-primaryText">HTTP 200 OK</p>
              <p className="text-[11px] text-secondaryText mt-0.5">All endpoints healthy</p>
            </div>
            <div className="w-16 h-9">
              <svg viewBox="0 0 64 36" className="w-full h-full overflow-visible">
                <path
                  d="M0 16 Q 18 12, 36 22 T 64 8"
                  fill="none"
                  stroke="#287D65"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Selective Operations Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security Audit Link Card */}
        <div className="bg-surface border border-subtleBorder rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amberOrange-50 text-amberOrange-600 flex items-center justify-center shrink-0 border border-amberOrange-100">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-primaryText text-sm">Security &amp; Access Audit Logs</h3>
                <p className="text-xs text-secondaryText">Immutable trail of authentication and sync events</p>
              </div>
            </div>
            <p className="text-xs text-secondaryText leading-relaxed pt-1">
              Maintains an append-only audit trail of authentication challenges, role checks, and sync operations to ensure verifiable system integrity without exposing clinical patient notes.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/admin/audit"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amberOrange-600 hover:text-amberOrange-700 transition-colors"
            >
              <span>Inspect Audit Trail Records</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Infrastructure Health Card */}
        <div className="bg-surface border border-subtleBorder rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-canvas text-primaryText flex items-center justify-center shrink-0 border border-subtleBorder">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-primaryText text-sm">Infrastructure Topology</h3>
                <p className="text-xs text-secondaryText">PostgreSQL Pool, Express Monolith &amp; WebRTC</p>
              </div>
            </div>
            <div className="text-xs text-secondaryText space-y-2 pt-1">
              <div className="flex items-center justify-between pb-1.5 border-b border-subtleBorder">
                <span className="font-medium">Express REST API Server:</span>
                <span className="font-mono text-forestGreen-500 font-semibold">Active (:5000)</span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-subtleBorder">
                <span className="font-medium">WebSocket Signaling:</span>
                <span className="font-mono text-forestGreen-500 font-semibold">ws:// Ready</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">PostgreSQL Database:</span>
                <span className="font-mono text-primaryText font-semibold">Pool Online</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/sync"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amberOrange-600 hover:text-amberOrange-700 transition-colors"
            >
              <span>Review Synchronization Topology</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
