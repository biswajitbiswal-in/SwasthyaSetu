import React, { useState } from 'react';
import {
  Video,
  Pill,
  PhoneCall,
  ChevronRight,
  CheckCircle2,
  Mic,
  Square,
  HardDrive,
  User
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRole } from '../../contexts/RoleContext';
import { useNetwork } from '../../contexts/NetworkContext';
import { useToast } from '../../contexts/ToastContext';
import { Link } from 'react-router-dom';

interface DailyDose {
  id: string;
  drug: string;
  timeLabel: string;
  timeLabelOdia: string;
  instructions: string;
  instructionsOdia: string;
  taken: boolean;
}

const INITIAL_DOSES: DailyDose[] = [
  {
    id: 'd1',
    drug: 'Paracetamol 500mg',
    timeLabel: 'Morning (8:00 AM)',
    timeLabelOdia: 'ସକାଳ (୮:୦୦)',
    instructions: '1 Tablet after food',
    instructionsOdia: 'ଜଳଖିଆ ପରେ ୧ ଟାବଲେଟ୍',
    taken: true,
  },
  {
    id: 'd2',
    drug: 'Oral Rehydration Salts (ORS)',
    timeLabel: 'Afternoon (1:00 PM)',
    timeLabelOdia: 'ଦ୍ୱିପ୍ରହର (୧:୦୦)',
    instructions: '1 Glass of prepared solution',
    instructionsOdia: '୧ ଗ୍ଲାସ ପାଣିରେ ଗୋଳାଇ ପିଅନ୍ତୁ',
    taken: false,
  },
  {
    id: 'd3',
    drug: 'Paracetamol 500mg',
    timeLabel: 'Night (9:00 PM)',
    timeLabelOdia: 'ରାତି (୯:୦୦)',
    instructions: '1 Tablet after dinner (if fever persists)',
    instructionsOdia: 'ରାତ୍ରି ଭୋଜନ ପରେ (ଯଦି ଜ୍ୱର ଥାଏ)',
    taken: false,
  },
];

export const PatientDashboard: React.FC = () => {
  const { language } = useLanguage();
  const { currentUser } = useRole();
  const { isOnline, isServerReachable } = useNetwork();
  const { showToast } = useToast();

  const [doses, setDoses] = useState<DailyDose[]>(INITIAL_DOSES);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioRecordingSeconds, setAudioRecordingSeconds] = useState(0);
  const [recordedVoiceNotes, setRecordedVoiceNotes] = useState<Array<{ id: string; duration: number; time: string }>>([]);

  const isConnected = isOnline && isServerReachable;

  const handleToggleDose = (id: string) => {
    setDoses((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const newState = !d.taken;
          if (newState) {
            showToast(
              language === 'or' ? `✅ ${d.drug} ସେବନ ରେକର୍ଡ ହେଲା!` : `Marked ${d.drug} as taken!`,
              'success'
            );
          }
          return { ...d, taken: newState };
        }
        return d;
      })
    );
  };

  const handleStartRecording = () => {
    setIsRecordingAudio(true);
    setAudioRecordingSeconds(1);

    const timer = setInterval(() => {
      setAudioRecordingSeconds((prev) => {
        if (prev >= 6) {
          clearInterval(timer);
          return 6;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handleStopRecording = () => {
    setIsRecordingAudio(false);
    const duration = audioRecordingSeconds;
    const newNote = {
      id: Math.random().toString(36).substring(2, 7),
      duration,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setRecordedVoiceNotes((prev) => [newNote, ...prev]);

    if (!isConnected) {
      showToast(
        language === 'or'
          ? 'ଭଏସ୍ ନୋଟ୍ ସ୍ଥାନୀୟ ଫୋନ୍‌ରେ ସୁରକ୍ଷିତ ରହିଲା (ନେଟୱର୍କ ଆସିଲେ ପଠାଯିବ)'
          : 'Voice query saved offline. Queued for delivery upon reconnection.',
        'warning'
      );
    } else {
      showToast(
        language === 'or'
          ? 'ଭଏସ୍ ବାର୍ତ୍ତା ଆଶା ଦିଦିଙ୍କୁ ସଫଳତାର ସହ ପଠାଗଲା!'
          : 'Voice message delivered to ASHA worker!',
        'success'
      );
    }
  };

  const takenCount = doses.filter((d) => d.taken).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Patient Passport Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-6 rounded-2xl border border-subtleBorder shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white p-1 border border-[#E6E7E9] shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/logo-square.jpg" alt="Swasthya Setu Emblem" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="bg-amberOrange-50 text-amberOrange-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amberOrange-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amberOrange-500" />
                <span>Odisha Health Mission • Verified Patient Pass</span>
              </span>
              <span className="text-xs text-secondaryText font-mono">
                OD-P-10042
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-primaryText tracking-tight">
              {language === 'or' ? `ସ୍ୱାଗତ, ${currentUser.fullName}` : `Welcome, ${currentUser.fullName}`}
            </h1>
            <p className="text-xs sm:text-sm text-secondaryText mt-0.5">
              {language === 'or'
                ? 'ଡିଜିଟାଲ୍ ସ୍ୱାସ୍ଥ୍ୟ କାର୍ଡ, ଔଷଧ ସୂଚୀ ଓ ଡାକ୍ତରୀ ପରାମର୍ଶ ପୋର୍ଟାଲ୍ (ଅଫଲାଇନ୍ ରେଡି)'
                : 'Permanent offline health card, verified prescription schedule, and teleconsultation portal.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/patient/call"
            className="inline-flex items-center gap-2 bg-amberOrange-600 hover:bg-amberOrange-700 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <Video className="w-4 h-4" />
            <span>{language === 'or' ? 'ଡାକ୍ତରଙ୍କ ସହ କଲ୍ ଯୋଡ଼ନ୍ତୁ' : 'Join Video Consultation'}</span>
          </Link>
        </div>
      </div>

      {/* 4 Reference-Inspired Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Reference Charcoal Style Hero Card */}
        <div className="bg-[#17191C] text-white rounded-2xl p-5 border border-white/10 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-white/10 text-amberOrange-500">
                <User className="w-4 h-4" />
              </span>
              <p className="text-xs font-medium text-slate-300">
                {language === 'or' ? 'ରୋଗୀ ପରିଚୟ' : 'Citizen Health Pass'}
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Active
            </span>
          </div>

          <div className="flex items-end justify-between mt-3">
            <div>
              <p className="text-2xl font-bold tracking-tight text-white">{currentUser.fullName}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">28 Y • Female • Nuapada Village</p>
            </div>
            {/* Native SVG Sparkline */}
            <div className="w-16 h-9">
              <svg viewBox="0 0 64 36" className="w-full h-full overflow-visible">
                <path
                  d="M0 24 Q 16 12, 32 20 T 64 8"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 2: Today's Medication Compliance */}
        <div className="bg-surface rounded-2xl p-5 border border-subtleBorder shadow-xs flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-50 text-forestGreen-500 border border-emerald-100">
                <Pill className="w-4 h-4" />
              </span>
              <p className="text-xs font-medium text-secondaryText">
                {language === 'or' ? 'ଆଜିର ଔଷଧ ସେବନ' : 'Medication Compliance'}
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-forestGreen-500 border border-emerald-200">
              {Math.round((takenCount / doses.length) * 100)}% Done
            </span>
          </div>

          <div className="flex items-end justify-between mt-3">
            <div>
              <p className="text-2xl font-bold tracking-tight text-primaryText">
                {takenCount} <span className="text-sm font-normal text-secondaryText">of {doses.length} doses</span>
              </p>
              <p className="text-[11px] text-secondaryText mt-0.5">Next: Paracetamol at 9:00 PM</p>
            </div>
            <div className="w-16 h-9">
              <svg viewBox="0 0 64 36" className="w-full h-full overflow-visible">
                <path
                  d="M0 20 Q 20 28, 40 10 T 64 6"
                  fill="none"
                  stroke="#287D65"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 3: Doctor Consultation Status */}
        <div className="bg-surface rounded-2xl p-5 border border-subtleBorder shadow-xs flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-amberOrange-50 text-amberOrange-600 border border-amberOrange-100">
                <Video className="w-4 h-4" />
              </span>
              <p className="text-xs font-medium text-secondaryText">
                {language === 'or' ? 'ଡାକ୍ତରୀ ପରାମର୍ଶ' : 'Telemedicine Room'}
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-forestGreen-500 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-forestGreen-500 animate-pulse" />
              <span>Available</span>
            </span>
          </div>

          <div className="flex items-end justify-between mt-3">
            <div>
              <p className="text-lg font-bold tracking-tight text-primaryText">Dr. A. Patnaik</p>
              <p className="text-[11px] text-secondaryText mt-0.5">CHC Nuapada • 2G Audio Ready</p>
            </div>
            <div className="w-16 h-9">
              <svg viewBox="0 0 64 36" className="w-full h-full overflow-visible">
                <path
                  d="M0 22 Q 20 8, 40 18 T 64 8"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 4: Local Device Offline Cache */}
        <div className="bg-surface rounded-2xl p-5 border border-subtleBorder shadow-xs flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-slate-50 text-primaryText border border-subtleBorder">
                <HardDrive className="w-4 h-4 text-amberOrange-600" />
              </span>
              <p className="text-xs font-medium text-secondaryText">
                {language === 'or' ? 'ଅଫଲାଇନ୍ ଷ୍ଟୋରେଜ୍' : 'Offline Vault'}
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-primaryText border border-subtleBorder">
              IndexedDB
            </span>
          </div>

          <div className="flex items-end justify-between mt-3">
            <div>
              <p className="text-lg font-bold tracking-tight text-primaryText">100% Cached</p>
              <p className="text-[11px] text-secondaryText mt-0.5">Prescriptions saved locally</p>
            </div>
            <div className="w-16 h-9">
              <svg viewBox="0 0 64 36" className="w-full h-full overflow-visible">
                <path
                  d="M0 16 Q 18 10, 36 24 T 64 12"
                  fill="none"
                  stroke="#287D65"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout: 7 Cols Left, 5 Cols Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Medication Schedule & Telemedicine Ready Card */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick-Connect Telemedicine Banner */}
          <div className="p-5 rounded-2xl bg-surface border border-subtleBorder shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amberOrange-50 text-amberOrange-600 flex items-center justify-center shrink-0 border border-amberOrange-100">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-primaryText text-sm">
                  {language === 'or' ? 'ଡାକ୍ତରଙ୍କ ସହ ସିଧାସଳଖ ଭିଡିଓ / ଅଡିଓ କଲ୍' : 'Doctor Teleconsultation Room'}
                </h3>
                <p className="text-xs text-secondaryText mt-0.5">
                  {language === 'or'
                    ? 'ନେଟୱର୍କ ଦୁର୍ବଳ ଥିଲେ ମଧ୍ୟ ସ୍ୱୟଂଚାଳିତ ଅଡିଓ-ମୋଡ୍ ସାହାଯ୍ୟରେ କଲ୍ ନିରବଚ୍ଛିନ୍ନ ଚାଲିବ।'
                    : 'Low-bandwidth adaptive WebRTC. Automatically steps down to audio when connection drops to 2G.'}
                </p>
              </div>
            </div>

            <Link
              to="/patient/call"
              className="inline-flex items-center justify-center gap-1.5 bg-amberOrange-600 hover:bg-amberOrange-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors shrink-0"
            >
              <span>{language === 'or' ? 'କଲ୍ ଆରମ୍ଭ କରନ୍ତୁ' : 'Enter Call'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Daily Medication Schedule Checklist */}
          <div className="bg-surface border border-subtleBorder rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-subtleBorder">
              <div>
                <h2 className="text-sm font-bold text-primaryText uppercase tracking-wider flex items-center gap-2">
                  <Pill className="w-4 h-4 text-amberOrange-600" />
                  <span>{language === 'or' ? 'ଆଜିର ଔଷଧ ସେବନ ଟ୍ରାକର୍' : "Today's Prescribed Doses"}</span>
                </h2>
                <p className="text-xs text-secondaryText mt-0.5">
                  Dr. Abhiram Patnaik's verified regimen for Acute Febrile Illness
                </p>
              </div>
              <span className="text-xs font-semibold text-secondaryText bg-canvas px-2.5 py-1 rounded-lg border border-subtleBorder">
                {takenCount} of {doses.length} {language === 'or' ? 'ସେବିତ' : 'Taken'}
              </span>
            </div>

            <div className="space-y-2.5">
              {doses.map((dose) => (
                <div
                  key={dose.id}
                  onClick={() => handleToggleDose(dose.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                    dose.taken
                      ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                      : 'bg-canvas/50 border-subtleBorder hover:bg-canvas text-primaryText'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${dose.taken ? 'line-through text-secondaryText' : 'text-primaryText'}`}>
                        {dose.drug}
                      </span>
                      <span className="text-[11px] text-secondaryText font-medium bg-surface px-2 py-0.5 rounded border border-subtleBorder">
                        {language === 'or' ? dose.timeLabelOdia : dose.timeLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-secondaryText mt-1">
                      {language === 'or' ? dose.instructionsOdia : dose.instructions}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {dose.taken ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-forestGreen-500 bg-surface px-3 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-forestGreen-500" />
                        <span>{language === 'or' ? 'ସେବିତ' : 'Taken'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primaryText bg-surface px-3 py-1 rounded-lg border border-subtleBorder shadow-2xs hover:border-amberOrange-500">
                        <span>{language === 'or' ? 'ଖାଇବି' : 'Mark Taken'}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between text-xs border-t border-subtleBorder">
              <span className="text-secondaryText text-[11px] flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-amberOrange-600" />
                <span>Prescription saved on device (No internet required)</span>
              </span>
              <Link
                to="/patient/prescriptions"
                className="font-semibold text-amberOrange-600 hover:text-amberOrange-700 flex items-center gap-1"
              >
                <span>{language === 'or' ? 'ସମ୍ପୂର୍ଣ୍ଣ ପ୍ରେସକ୍ରିପସନ୍' : 'View Full Schedule'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Emergency Dialers & Voice Query to ASHA */}
        <div className="lg:col-span-5 space-y-6">
          {/* Emergency 108 & Helpline Hub */}
          <div className="bg-surface border border-subtleBorder rounded-2xl p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-subtleBorder">
              <span className="text-xs font-bold text-primaryText uppercase tracking-wider flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-crimsonRed-500" />
                <span>{language === 'or' ? 'ଜରୁରୀକାଳୀନ ହେଲ୍ପଲାଇନ୍' : '24x7 Emergency Helplines'}</span>
              </span>
              <span className="text-[11px] text-crimsonRed-500 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                Direct Dial
              </span>
            </div>

            <div className="space-y-2.5">
              <a
                href="tel:108"
                className="p-3 rounded-xl border border-red-200 bg-red-50/40 hover:bg-red-50/70 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-bold text-red-950 block">108 Ambulance Service</span>
                  <span className="text-[11px] text-red-700">Govt 24x7 Free Emergency Transport</span>
                </div>
                <span className="font-mono font-bold text-xs bg-crimsonRed-500 text-white px-3 py-1.5 rounded-lg shadow-2xs">
                  CALL 108
                </span>
              </a>

              <a
                href="tel:104"
                className="p-3 rounded-xl border border-subtleBorder bg-canvas/40 hover:bg-canvas flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-bold text-primaryText block">104 Medical Advice</span>
                  <span className="text-[11px] text-secondaryText">Odisha Health Guidance & Triage</span>
                </div>
                <span className="font-mono font-semibold text-xs bg-surface border border-subtleBorder text-primaryText px-3 py-1.5 rounded-lg shadow-2xs">
                  CALL 104
                </span>
              </a>
            </div>

            <div className="pt-1 flex items-center justify-end text-xs">
              <Link
                to="/patient/emergency"
                className="text-xs font-semibold text-amberOrange-600 hover:text-amberOrange-700 flex items-center gap-1"
              >
                <span>{language === 'or' ? 'ପ୍ରାଥମିକ ଚିକିତ୍ସା ନିର୍ଦ୍ଦେଶାବଳୀ' : 'Emergency Protocols Guide'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Voice Query to ASHA Didi (Low-literacy friendly) */}
          <div className="bg-surface border border-subtleBorder rounded-2xl p-5 shadow-xs space-y-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-subtleBorder">
                <h3 className="text-xs font-bold text-primaryText uppercase tracking-wider flex items-center gap-2">
                  <Mic className="w-4 h-4 text-amberOrange-600" />
                  <span>{language === 'or' ? 'ଭଏସ୍ ପ୍ରଶ୍ନ (Voice Note)' : 'Voice Query to ASHA Worker'}</span>
                </h3>
                <span className="text-[11px] text-secondaryText font-medium bg-canvas px-2 py-0.5 rounded border border-subtleBorder">
                  Sunita Behera
                </span>
              </div>
              <p className="text-xs text-secondaryText mt-2">
                {language === 'or' ? 'ଟାଇପ୍ ନକରି କହି ପ୍ରଶ୍ନ ପଠାନ୍ତୁ।' : 'No typing required. Record your audio query directly.'}
              </p>

              {/* Record Audio Widget */}
              <div className="p-4 rounded-xl bg-canvas border border-subtleBorder mt-3 text-xs">
                {isRecordingAudio ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-crimsonRed-500 font-mono font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-crimsonRed-500 animate-ping" />
                      <span>Recording... 00:0{audioRecordingSeconds}s</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleStopRecording}
                      className="px-3.5 py-1.5 rounded-lg bg-crimsonRed-500 hover:bg-red-700 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>Stop &amp; Save</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-secondaryText text-[11px]">Tap mic to speak symptoms</span>
                    <button
                      type="button"
                      onClick={handleStartRecording}
                      className="px-4 py-2 rounded-xl bg-amberOrange-600 hover:bg-amberOrange-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Record Voice Note</span>
                    </button>
                  </div>
                )}
              </div>

              {recordedVoiceNotes.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {recordedVoiceNotes.map((vn) => (
                    <div key={vn.id} className="p-2.5 rounded-xl bg-canvas border border-subtleBorder flex items-center justify-between text-xs">
                      <span className="font-mono text-primaryText font-medium text-[11px]">
                        Audio Note ({vn.duration}s • {vn.time})
                      </span>
                      <span className="text-[10px] font-semibold text-forestGreen-500 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {isConnected ? 'Delivered' : 'Queued (Offline)'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[11px] text-secondaryText mt-3 border-t border-subtleBorder pt-2.5 flex items-center gap-1.5">
              <HardDrive className="w-3 h-3 text-secondaryText" />
              <span>Survives zero connectivity. Delivered automatically on sync.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
