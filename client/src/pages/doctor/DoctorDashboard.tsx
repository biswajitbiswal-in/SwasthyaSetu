import React, { useState } from 'react';
import {
  Clock,
  Stethoscope,
  ChevronRight,
  Activity,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Building2,
  Calendar,
  Eye,
  MapPin
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRole } from '../../contexts/RoleContext';
import { useNetwork } from '../../contexts/NetworkContext';
import { PATIENTS_DATABASE, PatientRecord } from '../../data/patients';
import { UrgencyBadge } from '../../components/common/UrgencyBadge';
import { PatientDetailsModal } from '../../components/common/PatientDetailsModal';

export const DoctorDashboard: React.FC = () => {
  const { language } = useLanguage();
  const { currentUser } = useRole();
  const { isOnline, isServerReachable, isLowBandwidth } = useNetwork();

  // Patient Selection & Details State
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const isConnected = isOnline && isServerReachable;

  const handleOpenDetails = (patient: PatientRecord) => {
    setSelectedPatient(patient);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E6E7E9] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="bg-[#FFF7ED] text-[#C96E14] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#FED7AA] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#E88924]" />
              <span>Nuapada CHC • General Medicine</span>
            </span>
            <span className="text-xs text-[#73777F] font-mono flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#73777F]" />
              <span>Duty Shift: 08:00 - 16:00 IST</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-[#202124] tracking-tight">
            {language === 'or' ? `ସ୍ୱାଗତ, ${currentUser.fullName}` : `Clinical Workstation • ${currentUser.fullName}`}
          </h1>
          <p className="text-xs sm:text-sm text-[#73777F] mt-0.5">
            {language === 'or'
              ? 'ସକ୍ରିୟ ଟେଲିମେଡିସିନ ପରାମର୍ଶ ଧାରା ଏବଂ ଗ୍ରାମାଞ୍ଚଳ ଆଶା କର୍ମୀଙ୍କ ଅନୁରୋଧ କ୍ୟୁ।'
              : 'Review incoming teleconsultations and triage rural patient cases from sub-centers.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleOpenDetails(PATIENTS_DATABASE[0])}
            className="inline-flex items-center gap-2 bg-[#E88924] hover:bg-[#D27315] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>{language === 'or' ? 'ପ୍ରଥମ ରୋଗୀ ଯାଞ୍ଚ କରନ୍ତୁ' : 'Review Top Triage Case'}</span>
          </button>
        </div>
      </div>

      {/* 2. Four Summary Cards (Reference Dashboard Composition) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Dark Charcoal Hero Feature Card */}
        <div className="bg-[#17191C] text-white rounded-2xl p-5 border border-[#2B2F36] shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#E88924]/20 border border-[#E88924]/40 flex items-center justify-center text-[#E88924]">
                <Stethoscope className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold text-[#C44747] bg-[#FDF2F2]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-[#C44747]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C44747] animate-pulse" />
                <span>3 Priority</span>
              </span>
            </div>

            <p className="text-xs text-[#8C9199] font-medium">Pending Triage Queue</p>
            <p className="text-2xl font-bold text-white mt-1">{PATIENTS_DATABASE.length} Patients</p>
          </div>

          {/* Sparkline curve */}
          <div className="mt-3 pt-2">
            <svg className="w-full h-10 overflow-visible" viewBox="0 0 160 40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="doctorHeroGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E88924" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#E88924" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0,32 Q30,20 65,30 T120,15 T160,8 L160,40 L0,40 Z"
                fill="url(#doctorHeroGradient)"
              />
              <path
                d="M0,32 Q30,20 65,30 T120,15 T160,8"
                fill="none"
                stroke="#E88924"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 2: Completed Today (White Card) */}
        <div className="bg-white rounded-2xl p-5 border border-[#E6E7E9] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#F5F5F2] flex items-center justify-center text-[#202124]">
                <FileText className="w-4 h-4 text-[#287D65]" />
              </div>
              <span className="text-[11px] font-semibold text-[#287D65] bg-[#EBF5F1] px-2.5 py-0.5 rounded-full border border-[#B7DFD2]">
                All Synced
              </span>
            </div>

            <p className="text-xs text-[#73777F] font-medium">Concluded Today</p>
            <p className="text-2xl font-bold text-[#202124] mt-1">4 Cases</p>
          </div>

          <div className="mt-3 pt-2">
            <svg className="w-full h-10 overflow-visible" viewBox="0 0 160 40" preserveAspectRatio="none">
              <path
                d="M0,28 Q40,35 80,18 T160,10"
                fill="none"
                stroke="#287D65"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 3: Urgent Referrals (White Card) */}
        <div className="bg-white rounded-2xl p-5 border border-[#E6E7E9] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#F5F5F2] flex items-center justify-center text-[#202124]">
                <ShieldCheck className="w-4 h-4 text-[#E88924]" />
              </div>
              <span className="text-[11px] font-semibold text-[#C96E14] bg-[#FFF7ED] px-2.5 py-0.5 rounded-full border border-[#FED7AA]">
                1 Transfer
              </span>
            </div>

            <p className="text-xs text-[#73777F] font-medium">Referred to District Hospital</p>
            <p className="text-2xl font-bold text-[#202124] mt-1">1 Transfer</p>
          </div>

          <div className="mt-3 pt-2">
            <svg className="w-full h-10 overflow-visible" viewBox="0 0 160 40" preserveAspectRatio="none">
              <path
                d="M0,25 Q35,15 70,25 T160,12"
                fill="none"
                stroke="#E88924"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 4: Channel Readiness (White Card) */}
        <div className="bg-white rounded-2xl p-5 border border-[#E6E7E9] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#F5F5F2] flex items-center justify-center text-[#202124]">
                <Activity className="w-4 h-4 text-[#287D65]" />
              </div>
              <span className="text-[11px] font-semibold text-[#287D65] bg-[#EBF5F1] px-2.5 py-0.5 rounded-full border border-[#B7DFD2]">
                Adaptive WebRTC
              </span>
            </div>

            <p className="text-xs text-[#73777F] font-medium">Network Degradation Mode</p>
            <p className="text-sm font-bold text-[#202124] mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#287D65]" />
              <span>Opus 24k / VP8 Ready</span>
            </p>
          </div>

          <div className="mt-3 pt-2">
            <svg className="w-full h-10 overflow-visible" viewBox="0 0 160 40" preserveAspectRatio="none">
              <path
                d="M0,20 Q40,30 80,15 T160,22"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Mid-section: Active Immediate Triage Queue (8 cols) + Telemedicine Readiness (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Card: Immediate Triage Cases List (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#E6E7E9] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E7E9]">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FFF7ED] text-[#E88924]">
                <Stethoscope className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-bold text-[#202124] text-sm">
                  {language === 'or' ? 'ଅପେକ୍ଷାରତ ପରାମର୍ଶ ଧାରା (Triage Queue)' : 'Immediate Teleconsultation Queue'}
                </h3>
                <p className="text-xs text-[#73777F]">
                  Select any patient to review clinical history and vital signs before starting consultation
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold bg-[#FFF7ED] text-[#C96E14] border border-[#FED7AA] px-2.5 py-0.5 rounded-full">
              {PATIENTS_DATABASE.length} Patients Waiting
            </span>
          </div>

          {/* List of Patients in Triage Queue with Proper Spacing & Non-Overlapping Urgency Badges */}
          <div className="space-y-3">
            {PATIENTS_DATABASE.map((pt) => (
              <div
                key={pt.id}
                onClick={() => handleOpenDetails(pt)}
                className="border border-[#E6E7E9] bg-[#F5F5F2] hover:bg-white hover:border-amberOrange-500/40 rounded-xl p-4 sm:p-5 space-y-3 transition-all cursor-pointer shadow-2xs group"
              >
                {/* Header Row: Initials + Name + ID + Waiting Time + Urgency Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E6E7E9] pb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#17191C] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      <span className="text-amberOrange-500">
                        {pt.fullName.substring(0, 1)}
                      </span>
                      <span>{pt.fullName.split(' ')[1]?.[0] || ''}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#202124] text-base group-hover:text-amberOrange-600 transition-colors truncate">
                          {pt.fullName}
                        </span>
                        <span className="text-xs text-[#73777F]">({pt.fullNameOdia})</span>
                        <span className="text-xs font-mono bg-white text-[#202124] px-2 py-0.5 rounded border border-[#E6E7E9] font-medium shrink-0">
                          {pt.patientCode}
                        </span>
                      </div>
                      <p className="text-xs text-[#73777F] mt-0.5 truncate">
                        {pt.age} yrs • {pt.gender} • {pt.village} • Assisted by {pt.assignedAsha}
                      </p>
                    </div>
                  </div>

                  {/* Clearly Defined Urgency Area: Badge & Waiting Time (Never Overlaps) */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    <span className="text-xs font-medium text-[#73777F] flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-secondaryText" />
                      <span>{pt.waitingTime}</span>
                    </span>

                    <UrgencyBadge urgency={pt.urgency} patient={pt} />
                  </div>
                </div>

                {/* Vitals Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs font-mono">
                  <div className="bg-white p-2.5 rounded-xl border border-[#E6E7E9]">
                    <span className="text-[#73777F] block text-[10px] uppercase font-semibold font-sans">BP</span>
                    <span className="font-bold text-[#202124] text-sm">{pt.vitals.bp}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#E6E7E9]">
                    <span className="text-[#73777F] block text-[10px] uppercase font-semibold font-sans">Pulse</span>
                    <span className="font-bold text-[#202124] text-sm">{pt.vitals.pulse} bpm</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#E6E7E9]">
                    <span className="text-[#73777F] block text-[10px] uppercase font-semibold font-sans">SpO2</span>
                    <span className="font-bold text-[#287D65] text-sm">{pt.vitals.spo2}%</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#F4C5C5] bg-[#FDF2F2]/50">
                    <span className="text-[#C44747] block text-[10px] uppercase font-bold font-sans">Temp</span>
                    <span className="font-bold text-[#C44747] text-sm">{pt.vitals.tempF}°F</span>
                  </div>
                </div>

                {/* Chief Complaint */}
                <div className="text-xs text-[#202124] space-y-1 bg-white p-3.5 rounded-xl border border-[#E6E7E9]">
                  <p className="font-semibold text-[#202124] line-clamp-2">
                    Chief Complaint: <span className="font-normal text-[#52555A]">{pt.chiefComplaint}</span>
                  </p>
                  <p className="text-[#73777F] text-[11px] truncate">
                    Chronic: {pt.chronicConditions.join(', ')} • Allergies: <span className="text-crimsonRed-500 font-medium">{pt.allergies.join(', ')}</span>
                  </p>
                </div>

                {/* Card Action Row: Clicking opens Patient Details Modal (Does NOT start call) */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#73777F] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amberOrange-600" />
                    <span>{pt.subCenter}</span>
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetails(pt);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-canvas text-primaryText border border-subtleBorder text-xs font-semibold px-4 py-2 rounded-xl shadow-2xs hover:border-amberOrange-500/40 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-amberOrange-600" />
                    <span>View Details &amp; Triage</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Card: Telemedicine Readiness & Sub-Center Network (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#E6E7E9] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E7E9]">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#F5F5F2] text-[#202124]">
                <Activity className="w-4 h-4 text-[#287D65]" />
              </span>
              <h3 className="font-bold text-[#202124] text-sm">
                {language === 'or' ? 'ନେଟୱର୍କ ଓ ଚ୍ୟାନେଲ୍ ସ୍ଥିତି' : 'Telemedicine Readiness'}
              </h3>
            </div>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
              isConnected
                ? 'bg-[#EBF5F1] text-[#287D65] border-[#B7DFD2]'
                : 'bg-[#FFF7ED] text-[#C96E14] border-[#FED7AA]'
            }`}>
              {isConnected ? (isLowBandwidth ? 'Adaptive 2G' : 'Online Ready') : 'Offline Mode'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F5F5F2] border border-[#E6E7E9] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#73777F]">Signaling Server:</span>
                <span className="font-mono font-semibold text-[#287D65] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ws:// Connected</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#73777F]">STUN / TURN Relay:</span>
                <span className="font-mono font-semibold text-[#202124]">Google STUN Ready</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#73777F]">Codec Profile:</span>
                <span className="font-mono font-semibold text-[#202124]">Opus 24kbps / VP8</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E6E7E9] space-y-2">
              <span className="text-[10px] font-bold text-secondaryText uppercase tracking-wider block">
                Sub-Centers on Duty
              </span>
              <div className="flex items-center justify-between">
                <span>Nuapada Sub-Center:</span>
                <span className="font-mono text-forestGreen-500 font-semibold">Online (4G)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Badapada Hamlet:</span>
                <span className="font-mono text-amberOrange-600 font-semibold">Weak 2G (Audio Safe)</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F5F5F2] border border-[#E6E7E9] text-xs text-[#73777F] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#287D65] shrink-0 mt-0.5" />
            <p>
              Teleconsultation conforms to Odisha State Health Mission encryption standards. Prescriptions issued are permanently archived to IndexedDB on rural client tablets.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Patient Details Drawer/Modal */}
      <PatientDetailsModal
        patient={selectedPatient}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
};
