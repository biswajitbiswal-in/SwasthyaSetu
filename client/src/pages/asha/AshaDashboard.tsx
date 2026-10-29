import React, { useState } from 'react';
import {
  Users,
  Plus,
  RefreshCw,
  HardDrive,
  FileCheck,
  Stethoscope,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRole } from '../../contexts/RoleContext';
import { Link } from 'react-router-dom';
import { ItemSyncStatusTag } from '../../components/common/SyncBadge';

export const AshaDashboard: React.FC = () => {
  const { language } = useLanguage();
  const { currentUser, pendingSyncCount } = useRole();
  const [activeTab, setActiveTab] = useState<'CONSULTATIONS' | 'VITALS'>('CONSULTATIONS');

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. Dashboard Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202124] tracking-tight">
            {language === 'or' ? `ଆଶା କର୍ମୀ ଡ୍ୟାସବୋର୍ଡ (${currentUser.fullName})` : `Community Health Dashboard • ${currentUser.fullName}`}
          </h1>
          <p className="text-xs sm:text-sm text-[#73777F] mt-0.5">
            {language === 'or'
              ? 'ଗ୍ରାମାଞ୍ଚଳ ରୋଗୀ ପରିଦର୍ଶନ, ଟ୍ରାଇଏଜ୍ ଏବଂ ଅଫଲାଇନ୍ ସିଙ୍କ୍ ସ୍ଥିତି।'
              : 'Track community encounters, rural patient triage, and offline sync in real time.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/consultations"
            className="inline-flex items-center gap-2 bg-[#E88924] hover:bg-[#D27315] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'or' ? '+ ନୂତନ କ୍ଷେତ୍ର ନୋଟ୍' : '+ Log Field Visit'}</span>
          </Link>
        </div>
      </div>

      {/* 2. Four Compact Summary Cards Row (Matching Reference Screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Dark Charcoal Hero Feature Card */}
        <div className="bg-[#17191C] text-white rounded-2xl p-5 border border-[#2B2F36] shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#E88924]/20 border border-[#E88924]/40 flex items-center justify-center text-[#E88924]">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold text-[#287D65] bg-[#287D65]/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-[#287D65]/30">
                <TrendingUp className="w-3 h-3" />
                <span>+12.5%</span>
              </span>
            </div>

            <p className="text-xs text-[#8C9199] font-medium">Total Field Encounters</p>
            <p className="text-2xl font-bold text-white mt-1">42 Patients</p>
          </div>

          {/* Glowing Orange Wave Sparkline */}
          <div className="mt-3 pt-2">
            <svg className="w-full h-10 overflow-visible" viewBox="0 0 160 40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E88924" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#E88924" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0,32 Q25,28 50,18 T100,24 T140,8 L160,12 L160,40 L0,40 Z"
                fill="url(#heroGradient)"
              />
              <path
                d="M0,32 Q25,28 50,18 T100,24 T140,8 L160,12"
                fill="none"
                stroke="#E88924"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 2: Completed Consultations (White Card) */}
        <div className="bg-white rounded-2xl p-5 border border-[#E6E7E9] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#F5F5F2] flex items-center justify-center text-[#202124]">
                <FileCheck className="w-4 h-4 text-[#E88924]" />
              </div>
              <span className="text-[11px] font-semibold text-[#287D65] bg-[#EBF5F1] px-2.5 py-0.5 rounded-full border border-[#B7DFD2]">
                +8.4%
              </span>
            </div>

            <p className="text-xs text-[#73777F] font-medium">Doctor Referrals Sent</p>
            <p className="text-2xl font-bold text-[#202124] mt-1">28 Cases</p>
          </div>

          {/* Amber Sparkline */}
          <div className="mt-3 pt-2">
            <svg className="w-full h-10 overflow-visible" viewBox="0 0 160 40" preserveAspectRatio="none">
              <path
                d="M0,30 Q30,35 60,20 T110,22 T160,14"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 3: Cached Village Records (White Card) */}
        <div className="bg-white rounded-2xl p-5 border border-[#E6E7E9] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#F5F5F2] flex items-center justify-center text-[#202124]">
                <Users className="w-4 h-4 text-[#287D65]" />
              </div>
              <span className="text-[11px] font-semibold text-[#287D65] bg-[#EBF5F1] px-2.5 py-0.5 rounded-full border border-[#B7DFD2]">
                Offline Ready
              </span>
            </div>

            <p className="text-xs text-[#73777F] font-medium">Cached in IndexedDB</p>
            <p className="text-2xl font-bold text-[#202124] mt-1">14 Profiles</p>
          </div>

          {/* Sparkline */}
          <div className="mt-3 pt-2">
            <svg className="w-full h-10 overflow-visible" viewBox="0 0 160 40" preserveAspectRatio="none">
              <path
                d="M0,28 Q40,15 80,25 T160,10"
                fill="none"
                stroke="#287D65"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 4: Device Sync Queue (White Card) */}
        <div className="bg-white rounded-2xl p-5 border border-[#E6E7E9] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#F5F5F2] flex items-center justify-center text-[#202124]">
                <HardDrive className="w-4 h-4 text-[#73777F]" />
              </div>
              <span className="text-[11px] font-semibold text-[#C96E14] bg-[#FFF7ED] px-2.5 py-0.5 rounded-full border border-[#FED7AA]">
                {pendingSyncCount > 0 ? 'Queue Active' : 'Synced'}
              </span>
            </div>

            <p className="text-xs text-[#73777F] font-medium">Pending Sync Operations</p>
            <p className="text-2xl font-bold text-[#202124] mt-1">
              {pendingSyncCount} <span className="text-xs font-normal text-[#73777F]">Drafts</span>
            </p>
          </div>

          {/* Sparkline */}
          <div className="mt-3 pt-2">
            <svg className="w-full h-10 overflow-visible" viewBox="0 0 160 40" preserveAspectRatio="none">
              <path
                d="M0,20 Q35,32 70,16 T120,24 T160,8"
                fill="none"
                stroke="#E88924"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Mid-section: Activity Overview Chart (8 cols) + Triage Distribution Donut (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Card: Area Chart for Activity (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#E6E7E9] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-[#E6E7E9]">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#FFF7ED] text-[#E88924]">
                  <Activity className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-[#202124] text-sm">
                  {language === 'or' ? 'କ୍ଷେତ୍ର ପରିଦର୍ଶନ ଓ ସିଙ୍କ୍ କାର୍ଯ୍ୟକଳାପ' : 'Field Encounters & Sync Activity'}
                </h3>
              </div>
              <p className="text-xs text-[#73777F] mt-0.5">
                Total encounters and synchronized records from 01 Oct - 29 Oct 2026
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2">
              <div className="inline-flex p-0.5 rounded-xl bg-[#F5F5F2] border border-[#E6E7E9]">
                <button
                  onClick={() => setActiveTab('CONSULTATIONS')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === 'CONSULTATIONS'
                      ? 'bg-[#17191C] text-white'
                      : 'text-[#73777F] hover:text-[#202124]'
                  }`}
                >
                  Field Visits
                </button>
                <button
                  onClick={() => setActiveTab('VITALS')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === 'VITALS'
                      ? 'bg-[#17191C] text-white'
                      : 'text-[#73777F] hover:text-[#202124]'
                  }`}
                >
                  Vitals Checked
                </button>
              </div>

              <span className="text-xs font-medium text-[#73777F] bg-[#F5F5F2] px-2.5 py-1 rounded-lg border border-[#E6E7E9]">
                This month ▾
              </span>
            </div>
          </div>

          {/* SVG Area Chart with High-Quality Bezier Curve and Tooltip */}
          <div className="relative pt-2">
            <div className="h-52 w-full flex flex-col justify-between text-[11px] text-[#73777F] font-mono">
              <div className="flex justify-between items-center border-b border-dashed border-[#E6E7E9] pb-1">
                <span>30 cases</span>
              </div>
              <div className="flex justify-between items-center border-b border-dashed border-[#E6E7E9] pb-1">
                <span>20 cases</span>
              </div>
              <div className="flex justify-between items-center border-b border-dashed border-[#E6E7E9] pb-1">
                <span>10 cases</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#E6E7E9] pb-1">
                <span>0</span>
              </div>
            </div>

            {/* Rendered Smooth SVG Curves overlaying grid */}
            <svg className="absolute inset-0 w-full h-52 pt-3" viewBox="0 0 500 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0,130 C60,110 110,135 170,80 C230,25 290,105 350,55 C410,15 450,45 500,30 L500,150 L0,150 Z"
                fill="url(#chartGradient)"
              />
              <path
                d="M0,130 C60,110 110,135 170,80 C230,25 290,105 350,55 C410,15 450,45 500,30"
                fill="none"
                stroke="#E88924"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Highlight Data Point Tooltip Pin */}
              <circle cx="350" cy="55" r="5" fill="#E88924" stroke="#FFFFFF" strokeWidth="2.5" />
            </svg>

            {/* Realistic Tooltip Card (Reference Style) */}
            <div className="absolute top-10 left-[62%] -translate-x-1/2 bg-[#17191C] text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-md border border-[#2B2F36] pointer-events-none">
              18 Visits • 24 Oct
            </div>

            {/* X-axis date labels */}
            <div className="flex justify-between text-[11px] text-[#73777F] font-mono pt-2 px-1">
              <span>Oct 01</span>
              <span>Oct 08</span>
              <span>Oct 15</span>
              <span>Oct 22</span>
              <span>Oct 29</span>
            </div>
          </div>
        </div>

        {/* Right Card: Triage Breakdown Donut (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#E6E7E9] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#E6E7E9]">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#F5F5F2] text-[#202124]">
                <Stethoscope className="w-4 h-4 text-[#E88924]" />
              </span>
              <h3 className="font-bold text-[#202124] text-sm">
                {language === 'or' ? 'ଲକ୍ଷଣ ଓ ରୋଗ ବିଭାଜନ' : 'Triage by Category'}
              </h3>
            </div>
            <span className="text-xs text-[#73777F]">This month ▾</span>
          </div>

          {/* Donut SVG with Center Label */}
          <div className="flex items-center justify-center relative py-2">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
              {/* Circle 1: Acute Febrile 38% */}
              <circle
                cx="50"
                cy="50"
                r="36"
                fill="transparent"
                stroke="#F59E0B"
                strokeWidth="14"
                strokeDasharray="86 140"
                strokeDashoffset="0"
              />
              {/* Circle 2: Antenatal 24% */}
              <circle
                cx="50"
                cy="50"
                r="36"
                fill="transparent"
                stroke="#E88924"
                strokeWidth="14"
                strokeDasharray="54 172"
                strokeDashoffset="-86"
              />
              {/* Circle 3: Hypertension 18% */}
              <circle
                cx="50"
                cy="50"
                r="36"
                fill="transparent"
                stroke="#17191C"
                strokeWidth="14"
                strokeDasharray="41 185"
                strokeDashoffset="-140"
              />
              {/* Circle 4: Child Health 12% */}
              <circle
                cx="50"
                cy="50"
                r="36"
                fill="transparent"
                stroke="#287D65"
                strokeWidth="14"
                strokeDasharray="27 199"
                strokeDashoffset="-181"
              />
              {/* Circle 5: General 8% */}
              <circle
                cx="50"
                cy="50"
                r="36"
                fill="transparent"
                stroke="#73777F"
                strokeWidth="14"
                strokeDasharray="18 208"
                strokeDashoffset="-208"
              />
            </svg>

            {/* Donut Hole Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-base font-bold text-[#202124]">42</span>
              <span className="text-[10px] text-[#73777F] uppercase tracking-wider">Cases</span>
            </div>
          </div>

          {/* Legend Items (Reference Style) */}
          <div className="space-y-1.5 text-xs text-[#202124] pt-1 border-t border-[#E6E7E9]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <span className="text-[#202124]">Acute Febrile (Fever/RDT)</span>
              </span>
              <span className="font-semibold text-[#73777F]">38%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E88924]" />
                <span className="text-[#202124]">Maternal & Antenatal (ANC)</span>
              </span>
              <span className="font-semibold text-[#73777F]">24%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#17191C]" />
                <span className="text-[#202124]">Hypertension & Chronic</span>
              </span>
              <span className="font-semibold text-[#73777F]">18%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#287D65]" />
                <span className="text-[#202124]">Child Health / Nutrition</span>
              </span>
              <span className="font-semibold text-[#73777F]">12%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#73777F]" />
                <span className="text-[#202124]">General Screening</span>
              </span>
              <span className="font-semibold text-[#73777F]">8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Structured Row: Recent Patient Records (7 cols) + Pending Sync Queue (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Bottom Card: Recent Village Patient Encounters (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E6E7E9] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E7E9]">
            <div>
              <h3 className="font-bold text-[#202124] text-sm">
                {language === 'or' ? 'ସାମ୍ପ୍ରତିକ ରୋଗୀ ବିବରଣୀ' : 'Recent Patient Encounters'}
              </h3>
              <p className="text-xs text-[#73777F]">Directly accessible offline from local IndexedDB cache</p>
            </div>
            <Link
              to="/patients"
              className="text-xs font-semibold text-[#E88924] hover:text-[#D27315] flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Structured List / Table */}
          <div className="divide-y divide-[#E6E7E9] text-xs">
            <div className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FFF7ED] text-[#E88924] font-bold flex items-center justify-center shrink-0 border border-[#FED7AA]">
                  GM
                </div>
                <div>
                  <p className="font-bold text-[#202124]">Gitanjali Majhi (ଗୀତାଞ୍ଜଳି ମାଝୀ)</p>
                  <p className="text-[#73777F] text-[11px]">OD-P-10042 • Nuapada • High Fever (101.4°F)</p>
                </div>
              </div>
              <ItemSyncStatusTag status="PENDING_SYNC" />
            </div>

            <div className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#EBF5F1] text-[#287D65] font-bold flex items-center justify-center shrink-0 border border-[#B7DFD2]">
                  DB
                </div>
                <div>
                  <p className="font-bold text-[#202124]">Debendra Behera (ଦେବେନ୍ଦ୍ର ବେହେରା)</p>
                  <p className="text-[#73777F] text-[11px]">OD-P-10043 • Nuapada • Hypertension Review</p>
                </div>
              </div>
              <ItemSyncStatusTag status="SYNCED" />
            </div>

            <div className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#F5F5F2] text-[#202124] font-bold flex items-center justify-center shrink-0 border border-[#E6E7E9]">
                  PR
                </div>
                <div>
                  <p className="font-bold text-[#202124]">Padmini Rout (ପଦ୍ମିନୀ ରାଉତ)</p>
                  <p className="text-[#73777F] text-[11px]">OD-P-10044 • Badapada • Bronchial Wheezing</p>
                </div>
              </div>
              <ItemSyncStatusTag status="SAVED_LOCAL" />
            </div>
          </div>
        </div>

        {/* Right Bottom Card: Pending Sync Operations (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E6E7E9] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E7E9]">
            <div>
              <h3 className="font-bold text-[#202124] text-sm">
                {language === 'or' ? 'ଅପଲୋଡ୍ କ୍ୟୁ' : 'Pending Synchronization Queue'}
              </h3>
              <p className="text-xs text-[#73777F]">Deterministic FIFO sequence with UUID keys</p>
            </div>
            <Link
              to="/sync"
              className="text-xs font-semibold text-[#E88924] hover:text-[#D27315] flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-[#F5F5F2] border border-[#E6E7E9] flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] bg-white text-[#E88924] px-1.5 py-0.5 rounded border border-[#E6E7E9] font-bold">
                  CREATE
                </span>
                <p className="font-semibold text-[#202124] mt-1">Visit Note — Gitanjali Majhi</p>
                <p className="text-[11px] text-[#73777F]">Today, 10:15 AM • 120/80 BP, 101.4°F</p>
              </div>
              <span className="text-[10px] font-semibold text-[#C96E14] bg-[#FFF7ED] px-2 py-0.5 rounded border border-[#FED7AA] shrink-0">
                Queued
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F5F5F2] border border-[#E6E7E9] flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] bg-white text-[#287D65] px-1.5 py-0.5 rounded border border-[#E6E7E9] font-bold">
                  UPDATE
                </span>
                <p className="font-semibold text-[#202124] mt-1">BP Measurement — Debendra Behera</p>
                <p className="text-[11px] text-[#73777F]">Today, 09:45 AM • 138/88 mmHg</p>
              </div>
              <span className="text-[10px] font-semibold text-[#C96E14] bg-[#FFF7ED] px-2 py-0.5 rounded border border-[#FED7AA] shrink-0">
                Queued
              </span>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px] text-[#73777F]">
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3 text-[#287D65]" />
              <span>Background sync retries automatically</span>
            </span>
            <Link to="/sync" className="font-semibold text-[#E88924] hover:underline">
              Force Sync Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
