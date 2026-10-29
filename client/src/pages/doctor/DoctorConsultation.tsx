import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Activity,
  Sliders,
  Plus,
  Trash2,
  Stethoscope,
  Database,
  ArrowLeft,
  Maximize2,
  Minimize2,
  FileText,
  ChevronRight,
  Wifi,
  WifiOff,
  SignalLow,
  Clock,
  CheckCircle2,
  Camera,
  CameraOff
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { useNetwork } from '../../contexts/NetworkContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PATIENTS_DATABASE, PatientRecord } from '../../data/patients';
import { UrgencyBadge } from '../../components/common/UrgencyBadge';

interface PrescribedItem {
  id: string;
  drug: string;
  dosage: string;
  duration: string;
  instructions: string;
}

export const DoctorConsultation: React.FC = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const { isOnline, isServerReachable, isLowBandwidth } = useNetwork();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Dynamic Patient Selection
  const patientIdParam = searchParams.get('patientId');
  const isOfflineModeQuery = searchParams.get('mode') === 'offline';

  const patient: PatientRecord = PATIENTS_DATABASE.find(
    (p) => p.patientCode === patientIdParam || p.id === patientIdParam
  ) || PATIENTS_DATABASE[0];

  // Call & Media States
  const [isAudioOnlyMode, setIsAudioOnlyMode] = useState(isOfflineModeQuery || isLowBandwidth);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(true);
  const [mobileActiveTab, setMobileActiveTab] = useState<'VIDEO' | 'NOTES'>('VIDEO');

  // Consultation Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(334);
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Local Webcam Stream Management
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [hasWebcamPermission, setHasWebcamPermission] = useState<boolean | null>(null);
  const [localMediaStream, setLocalMediaStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    async function initWebcam() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 360 } },
            audio: true
          });
          setLocalMediaStream(stream);
          setHasWebcamPermission(true);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        } else {
          setHasWebcamPermission(false);
        }
      } catch {
        setHasWebcamPermission(false);
      }
    }

    initWebcam();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Sync mute & camera toggles to actual media tracks
  useEffect(() => {
    if (localMediaStream) {
      localMediaStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMicMuted;
      });
      localMediaStream.getVideoTracks().forEach((track) => {
        track.enabled = !isCameraOff && !isAudioOnlyMode;
      });
    }
  }, [isMicMuted, isCameraOff, isAudioOnlyMode, localMediaStream]);

  // Network Telemetry & Degradation Simulator
  const [simulatedPacketLoss, setSimulatedPacketLoss] = useState<number>(isOfflineModeQuery ? 20 : 3);
  const [simulatedBitrateKbps, setSimulatedBitrateKbps] = useState<number>(isOfflineModeQuery ? 22 : 450);
  const [simulatedLatencyMs, setSimulatedLatencyMs] = useState<number>(isOfflineModeQuery ? 190 : 38);
  const [showTelemetryControls, setShowTelemetryControls] = useState(false);

  // Live Clinical Documentation pre-populated from selected patient
  const vitals = patient.vitals;

  const defaultObservations = `Patient: ${patient.fullName} (${patient.age}y ${patient.gender}). Chief complaint: ${patient.chiefComplaint} Triage finding: ${patient.urgencyReason}`;
  const [observations, setObservations] = useState(defaultObservations);

  const initialDiagnosis = patient.patientCode === 'OD-P-10044'
    ? 'Acute Asthmatic Exacerbation & Bronchospasm'
    : patient.patientCode === 'OD-P-10043'
    ? 'Essential Hypertension (Stage 1 Maintenance)'
    : patient.patientCode === 'OD-P-10045'
    ? 'Type-2 Diabetic Foot Ulcer Evaluation'
    : 'Acute Febrile Illness (Suspected Malaria / Viral)';

  const [diagnosis, setDiagnosis] = useState(initialDiagnosis);

  const defaultPrescriptions: PrescribedItem[] = patient.patientCode === 'OD-P-10044'
    ? [
        {
          id: 'rx-1',
          drug: 'Salbutamol Inhaler (100 mcg)',
          dosage: '2 Puffs SOS (When short of breath)',
          duration: '30 Days',
          instructions: 'Inhale with spacer; rinse mouth with water after use',
        },
        {
          id: 'rx-2',
          drug: 'Budesonide Respules 0.5mg',
          dosage: 'Nebulize BD (Twice daily)',
          duration: '5 Days',
          instructions: 'Nebulize with clean oxygen/air compressor at sub-center',
        },
      ]
    : patient.patientCode === 'OD-P-10043'
    ? [
        {
          id: 'rx-1',
          drug: 'Amlodipine 5mg Tab',
          dosage: '1 Tab Daily Morning',
          duration: '30 Days',
          instructions: 'Take after breakfast. Monitor BP weekly at sub-center',
        },
      ]
    : patient.patientCode === 'OD-P-10045'
    ? [
        {
          id: 'rx-1',
          drug: 'Metformin 500mg Tab',
          dosage: '1 Tab BD after food',
          duration: '30 Days',
          instructions: 'Take with major meals. Do not skip breakfast',
        },
        {
          id: 'rx-2',
          drug: 'Povidone Iodine 5% Ointment',
          dosage: 'Apply BD to left heel',
          duration: '10 Days',
          instructions: 'Clean with normal saline before dressing with sterile gauze',
        },
      ]
    : [
        {
          id: 'rx-1',
          drug: 'Paracetamol 500mg Tab',
          dosage: '1 Tab TDS (3 times daily)',
          duration: '3 Days',
          instructions: 'Take after meals for fever > 100°F',
        },
        {
          id: 'rx-2',
          drug: 'Oral Rehydration Salts (ORS)',
          dosage: '1 Sachet in 1L Boiled Water',
          duration: '5 Days',
          instructions: 'Sip throughout the day for hydration',
        },
      ];

  const [prescriptions, setPrescriptions] = useState<PrescribedItem[]>(defaultPrescriptions);
  const [newDrug, setNewDrug] = useState('');
  const [isNoteSavedLocally, setIsNoteSavedLocally] = useState(true);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string>('Just now');
  const [showEndCallModal, setShowEndCallModal] = useState(false);

  // Network Degradation Automatic Handler
  const handlePacketLossChange = (loss: number) => {
    setSimulatedPacketLoss(loss);
    if (loss >= 15) {
      setSimulatedBitrateKbps(24);
      setSimulatedLatencyMs(180);
      if (!isAudioOnlyMode) {
        setIsAudioOnlyMode(true);
        showToast(
          language === 'or'
            ? 'ଦୁର୍ବଳ ନେଟୱର୍କ (>୧୫% କ୍ଷତି)। କଥାବାର୍ତ୍ତା ସ୍ପଷ୍ଟ ରଖିବାକୁ ସ୍ୱୟଂଚାଳିତ ଭାବେ ଅଡିଓ-ମୋଡ୍ ସକ୍ରିୟ ହେଲା।'
            : 'Poor connection detected (>15% loss). Automatically stepped down to Audio-Only Mode to prioritize voice clarity.',
          'warning',
          5000
        );
      }
    } else if (loss < 5 && isAudioOnlyMode) {
      setSimulatedBitrateKbps(450);
      setSimulatedLatencyMs(38);
      showToast(
        language === 'or'
          ? 'ନେଟୱର୍କ ସ୍ଥିର ହେଲା (<୫% କ୍ଷତି)। ଭିଡିଓ ପୁନଃ ଆରମ୍ଭ କରାଯାଇପାରିବ।'
          : 'Network stabilized (<5% loss). High-definition video stream can be safely resumed.',
        'info'
      );
    }
  };

  const toggleAudioOnly = () => {
    const nextMode = !isAudioOnlyMode;
    setIsAudioOnlyMode(nextMode);
    if (nextMode) {
      setSimulatedBitrateKbps(22);
      showToast(
        language === 'or'
          ? 'ଅଡିଓ-ମୋଡ୍ ସକ୍ରିୟ ହେଲା (କମ୍ ବ୍ୟାଣ୍ଡୱିଡ୍‌ଥ ସେଭର୍ <୨୦ kbps)'
          : 'Audio-Only Mode Activated (<20 kbps Bandwidth Saver)',
        'info'
      );
    } else {
      setSimulatedBitrateKbps(450);
      showToast(
        language === 'or' ? 'ଭିଡିଓ ମୋଡ୍ ସକ୍ରିୟ ହେଲା' : 'Full Video Mode Restored',
        'success'
      );
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const handleAddMedication = () => {
    if (!newDrug.trim()) return;
    const item: PrescribedItem = {
      id: Math.random().toString(36).substring(2, 7),
      drug: newDrug.trim(),
      dosage: '1 Tab Once Daily',
      duration: '5 Days',
      instructions: 'Take after food as advised',
    };
    setPrescriptions((prev) => [...prev, item]);
    setNewDrug('');
    setIsNoteSavedLocally(false);
    showToast(`Added ${item.drug} to prescription pad`, 'success');
  };

  const handleRemoveMedication = (id: string) => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== id));
    setIsNoteSavedLocally(false);
  };

  const handleSaveNotes = () => {
    setIsNoteSavedLocally(true);
    setLastSavedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    showToast(
      language === 'or'
        ? 'ନୋଟ୍ ଫୋନ୍‌ରେ ସୁରକ୍ଷିତ ସାଇତା ଗଲା (IndexedDB)।'
        : 'Saved on This Device (IndexedDB). Guaranteed zero clinical data loss.',
      'success'
    );
  };

  const handleInitiateEndCall = () => {
    handleSaveNotes();
    setShowEndCallModal(true);
  };

  const handleConfirmEndCallAndExit = () => {
    if (localMediaStream) {
      localMediaStream.getTracks().forEach((track) => track.stop());
    }
    setShowEndCallModal(false);
    navigate('/doctor');
  };

  const isCallDisconnected = !isOnline || !isServerReachable;

  return (
    <div className="flex flex-col h-[calc(100vh-2.5rem)] w-full font-sans select-none overflow-hidden">
      {/* 1. Compact Patient Information Header Above Video */}
      <div className="bg-surface border border-subtleBorder rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 mb-3 shadow-xs shrink-0 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Patient ID, Name, Sub-Center & Urgency */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/doctor')}
            className="p-2 rounded-xl border border-subtleBorder text-secondaryText hover:text-primaryText hover:bg-canvas transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Return to Doctor Workstation"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">
              {language === 'or' ? 'ଡ୍ୟାସବୋର୍ଡ' : 'Workstation'}
            </span>
          </button>

          <div className="h-6 w-px bg-subtleBorder hidden sm:block" />

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-primaryText text-base">
                {patient.fullName} ({patient.fullNameOdia})
              </span>
              <span className="text-xs font-mono bg-canvas text-primaryText px-2 py-0.5 rounded border border-subtleBorder font-semibold">
                {patient.patientCode}
              </span>
              <UrgencyBadge urgency={patient.urgency} patient={patient} size="sm" />
            </div>
            <p className="text-xs text-secondaryText mt-0.5 flex items-center gap-2">
              <span>{patient.subCenter} • {patient.village}</span>
              <span>•</span>
              <span>Assisted by ASHA: <strong className="text-primaryText">{patient.assignedAsha}</strong></span>
            </p>
          </div>
        </div>

        {/* Right: Duration Timer, Live Network Quality Badge & Telemetry Button */}
        <div className="flex items-center gap-2.5 flex-wrap self-end md:self-auto">
          {/* Ticking Duration Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#17191C] text-white border border-white/10 text-xs font-mono font-bold shadow-xs">
            <Clock className="w-3.5 h-3.5 text-amberOrange-500 animate-pulse" />
            <span>{formatDuration(elapsedSeconds)}</span>
          </div>

          {/* Network Connection Quality Badge */}
          <div className="flex items-center gap-1.5">
            {isCallDisconnected ? (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-red-50 text-crimsonRed-500 border border-red-200 flex items-center gap-1.5">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Connection Lost (Reconnecting...)</span>
              </span>
            ) : isAudioOnlyMode || isLowBandwidth ? (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amberOrange-50 text-amberOrange-700 border border-amberOrange-200 flex items-center gap-1.5">
                <SignalLow className="w-3.5 h-3.5 text-amberOrange-600" />
                <span>Weak 2G • Audio Safe ({simulatedBitrateKbps} kbps)</span>
              </span>
            ) : (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-forestGreen-500 border border-emerald-200 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-forestGreen-500" />
                <span>4G HD Stream ({simulatedBitrateKbps} kbps • {simulatedLatencyMs}ms)</span>
              </span>
            )}
          </div>

          {/* Telemetry Simulator Trigger Button */}
          <button
            type="button"
            onClick={() => setShowTelemetryControls(!showTelemetryControls)}
            className={`p-2 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              showTelemetryControls
                ? 'bg-[#17191C] text-amberOrange-500 border-white/20'
                : 'bg-surface hover:bg-canvas text-secondaryText border-subtleBorder'
            }`}
            title="Toggle WebRTC Telemetry Simulator"
          >
            <Sliders className="w-4 h-4 text-amberOrange-600" />
            <span className="hidden lg:inline">Resilience Bench</span>
          </button>

          {/* Mobile Tab Switcher (Video vs Clinical Notes) */}
          <div className="inline-flex lg:hidden rounded-xl border border-subtleBorder bg-canvas p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMobileActiveTab('VIDEO')}
              className={`px-3 py-1 rounded-lg transition-all ${
                mobileActiveTab === 'VIDEO'
                  ? 'bg-surface text-primaryText shadow-2xs font-bold'
                  : 'text-secondaryText'
              }`}
            >
              Video Call
            </button>
            <button
              type="button"
              onClick={() => setMobileActiveTab('NOTES')}
              className={`px-3 py-1 rounded-lg transition-all ${
                mobileActiveTab === 'NOTES'
                  ? 'bg-surface text-primaryText shadow-2xs font-bold'
                  : 'text-secondaryText'
              }`}
            >
              Notes ({prescriptions.length})
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Telemetry Degradation Slider Drawer */}
      {showTelemetryControls && (
        <div className="bg-[#17191C] text-white rounded-2xl p-4 sm:p-5 border border-white/10 shadow-lg mb-3 shrink-0">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amberOrange-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                WebRTC Network Degradation Bench (Rural Edge Testing)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Simulate packet loss &gt;15% to verify automated audio-only fallback
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Packet Loss Rate:</span>
                <span className={`font-mono font-bold ${simulatedPacketLoss >= 15 ? 'text-crimsonRed-500' : 'text-forestGreen-500'}`}>
                  {simulatedPacketLoss}% {simulatedPacketLoss >= 15 ? '⚠️ Auto-Audio Active' : 'Normal'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={simulatedPacketLoss}
                onChange={(e) => handlePacketLossChange(Number(e.target.value))}
                className="w-full accent-amberOrange-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Uplink Bitrate:</span>
                <span className="font-mono font-bold text-amberOrange-400">{simulatedBitrateKbps} kbps</span>
              </div>
              <input
                type="range"
                min="20"
                max="800"
                step="20"
                value={simulatedBitrateKbps}
                onChange={(e) => setSimulatedBitrateKbps(Number(e.target.value))}
                className="w-full accent-amberOrange-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Round-Trip Latency:</span>
                <span className="font-mono font-bold text-slate-200">{simulatedLatencyMs} ms</span>
              </div>
              <input
                type="range"
                min="20"
                max="600"
                step="20"
                value={simulatedLatencyMs}
                onChange={(e) => setSimulatedLatencyMs(Number(e.target.value))}
                className="w-full accent-amberOrange-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Honest Reconnection Status Banner (When Disconnected) */}
      {isCallDisconnected && (
        <div className="bg-red-50 border border-red-200 text-crimsonRed-500 px-4 py-2.5 rounded-xl mb-3 flex items-center justify-between text-xs shadow-xs shrink-0 animate-pulse">
          <div className="flex items-center gap-2 font-semibold">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>Connection Lost with {patient.subCenter}. Reconnecting automatically... (0 kbps)</span>
          </div>
          <span className="text-[11px] font-mono text-secondaryText bg-surface px-2.5 py-1 rounded-lg border border-subtleBorder">
            Local drafts preserved in IndexedDB
          </span>
        </div>
      )}

      {/* 4. Main Immersive Stage: Dominant 16:9 Video (72-76% / 100%) + Collapsible Clinical Notes */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden relative">
        {/* Left Column: Dominant Video Consultation Stage */}
        <div
          className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ${
            mobileActiveTab === 'NOTES' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Main 16:9 Video Container in Dark Charcoal #17191C */}
          <div className="relative flex-1 bg-[#17191C] rounded-2xl overflow-hidden border border-white/10 shadow-md flex items-center justify-center">
            {/* Remote Patient Video Feed */}
            {isAudioOnlyMode ? (
              /* Audio-Only Placeholder with Active Audio Waveform */
              <div className="text-center p-8 space-y-4 max-w-md mx-auto">
                <div className="relative w-28 h-28 mx-auto">
                  <div className="w-28 h-28 rounded-full bg-amberOrange-500/15 border-2 border-amberOrange-500 text-amberOrange-400 flex items-center justify-center text-3xl font-bold shadow-lg shadow-orange-950/30">
                    {patient.fullName.substring(0, 1)}{patient.fullName.split(' ')[1]?.[0] || ''}
                  </div>
                  <span className="absolute inset-0 rounded-full border-2 border-amberOrange-400/40 animate-ping pointer-events-none" />
                </div>

                <div>
                  <h3 className="text-white font-bold text-xl tracking-tight">{patient.fullName}</h3>
                  <p className="text-amberOrange-400 text-xs font-semibold mt-1">
                    Audio-Only Bandwidth Saver Mode Active
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    Duplex Opus 24kbps voice prioritized for {patient.subCenter} link
                  </p>
                </div>

                {/* Animated Voice Equalizer Waveform */}
                <div className="flex items-center justify-center gap-1.5 h-8 pt-2">
                  <span className="w-1.5 bg-amberOrange-500 rounded-full animate-bounce h-4" />
                  <span className="w-1.5 bg-amberOrange-500 rounded-full animate-bounce h-7 delay-75" />
                  <span className="w-1.5 bg-amberOrange-500 rounded-full animate-bounce h-5 delay-150" />
                  <span className="w-1.5 bg-amberOrange-500 rounded-full animate-bounce h-8 delay-100" />
                  <span className="w-1.5 bg-amberOrange-500 rounded-full animate-bounce h-6 delay-200" />
                  <span className="w-1.5 bg-amberOrange-500 rounded-full animate-bounce h-4 delay-150" />
                </div>
              </div>
            ) : (
              /* Full Remote Video Feed Representation */
              <div className="relative w-full h-full flex items-center justify-center bg-radial from-[#22262C] to-[#17191C]">
                {/* Clinical Ambient Patient Feed */}
                <div className="text-center p-8 space-y-3">
                  <div className="relative w-28 h-28 mx-auto">
                    <div className="w-28 h-28 rounded-full bg-white/10 border-2 border-white/20 text-white flex items-center justify-center text-3xl font-bold shadow-xl">
                      {patient.fullName.substring(0, 1)}{patient.fullName.split(' ')[1]?.[0] || ''}
                    </div>
                    <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-forestGreen-500 border-2 border-[#17191C] flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </span>
                  </div>

                  <div>
                    <h3 className="text-white font-bold text-lg tracking-tight">
                      {patient.fullName} (Patient Video)
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {patient.subCenter} • Camera Assisted by ASHA {patient.assignedAsha.split(' ')[0]}
                    </p>
                    <p className="text-forestGreen-500 text-xs font-mono font-medium mt-1">
                      WebRTC VP8 720p @ 24fps • Adaptive Bitrate: {simulatedBitrateKbps} kbps
                    </p>
                  </div>
                </div>

                {/* Top-Left Telemetry Overlay Tag */}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-[11px] font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-forestGreen-500 animate-pulse" />
                  <span>Nuapada CHC ⇄ {patient.subCenter}</span>
                </div>
              </div>
            )}

            {/* Floating Picture-in-Picture (PiP) Local Webcam in Top-Right Corner */}
            <div className="absolute top-4 right-4 w-40 sm:w-56 aspect-video bg-[#111315] rounded-xl border border-white/20 shadow-2xl overflow-hidden flex flex-col justify-between p-2 z-20 group">
              {/* Local Media View */}
              {isCameraOff || isAudioOnlyMode ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-1">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold">
                    AP
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {isAudioOnlyMode ? 'Video Muted (Audio Mode)' : 'Camera Off'}
                  </span>
                </div>
              ) : hasWebcamPermission ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-1">
                  <CameraOff className="w-5 h-5 text-amberOrange-500" />
                  <span className="text-[10px] text-slate-300 font-semibold">Webcam Standby</span>
                  <span className="text-[9px] text-slate-500">Dr. Abhiram Patnaik</span>
                </div>
              )}

              {/* PiP Overlay Info */}
              <div className="relative z-10 flex items-center justify-between text-[10px] text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md mt-auto">
                <span className="font-semibold truncate">You (Dr. Patnaik)</span>
                {isMicMuted ? (
                  <MicOff className="w-3 h-3 text-crimsonRed-500 shrink-0" />
                ) : (
                  <Mic className="w-3 h-3 text-forestGreen-500 shrink-0" />
                )}
              </div>
            </div>

            {/* Ergonomic Floating HUD Call Controls Bar */}
            <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-3 px-4 z-30">
              <div className="bg-[#17191C]/90 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
                {/* 1. Mic Mute / Unmute */}
                <button
                  type="button"
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  className={`p-3 rounded-xl text-white font-medium text-xs transition-all flex items-center gap-2 ${
                    isMicMuted
                      ? 'bg-crimsonRed-500 hover:bg-red-700 shadow-md'
                      : 'bg-white/10 hover:bg-white/20 border border-white/10'
                  }`}
                  title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isMicMuted ? 'Muted' : 'Mute'}</span>
                </button>

                {/* 2. Camera On / Off */}
                <button
                  type="button"
                  onClick={() => setIsCameraOff(!isCameraOff)}
                  disabled={isAudioOnlyMode}
                  className={`p-3 rounded-xl text-white font-medium text-xs transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                    isCameraOff
                      ? 'bg-crimsonRed-500 hover:bg-red-700 shadow-md'
                      : 'bg-white/10 hover:bg-white/20 border border-white/10'
                  }`}
                  title={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
                >
                  {isCameraOff ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isCameraOff ? 'Cam Off' : 'Cam On'}</span>
                </button>

                {/* 3. Switch to Audio-Only Mode (<20 kbps Bandwidth Saver) */}
                <button
                  type="button"
                  onClick={toggleAudioOnly}
                  className={`px-3.5 py-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shadow-sm ${
                    isAudioOnlyMode
                      ? 'bg-amberOrange-600 hover:bg-amberOrange-700 text-white ring-2 ring-amberOrange-400/40'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                  title="Toggle Audio-Only Mode to conserve cellular data"
                >
                  {isAudioOnlyMode ? <VideoOff className="w-4 h-4 text-white" /> : <Video className="w-4 h-4 text-forestGreen-500" />}
                  <span>{isAudioOnlyMode ? 'Audio Mode (<20k)' : 'Switch to Audio'}</span>
                </button>

                {/* 4. Notes Panel Toggle */}
                <button
                  type="button"
                  onClick={() => setIsNotesPanelOpen(!isNotesPanelOpen)}
                  className={`p-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                    isNotesPanelOpen
                      ? 'bg-white/20 text-white border border-white/20'
                      : 'bg-white/10 hover:bg-white/20 text-slate-300'
                  }`}
                  title="Toggle Clinical Notes Pad"
                >
                  <FileText className="w-4 h-4 text-amberOrange-500" />
                  <span className="hidden sm:inline">
                    {isNotesPanelOpen ? 'Hide Notes' : `Notes (${prescriptions.length})`}
                  </span>
                </button>

                {/* 5. Fullscreen Toggle */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors hidden sm:flex items-center"
                  title="Toggle Fullscreen Viewport"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* 6. End Call Button in Red #C44747 */}
                <button
                  type="button"
                  onClick={handleInitiateEndCall}
                  className="px-5 py-3 rounded-xl bg-crimsonRed-500 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
                  title="End Telemedicine Consultation"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>{language === 'or' ? 'କଲ୍ ଶେଷ କରନ୍ତୁ' : 'End Call'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Collapsible Clinical Consultation Notes Panel */}
        {isNotesPanelOpen && (
          <div
            className={`w-full lg:w-[380px] xl:w-[420px] bg-surface border border-subtleBorder rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between shrink-0 overflow-y-auto ${
              mobileActiveTab === 'VIDEO' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="space-y-4">
              {/* Header with Close / Collapse Button */}
              <div className="flex items-center justify-between pb-3 border-b border-subtleBorder">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amberOrange-50 text-amberOrange-600 border border-amberOrange-100">
                    <Stethoscope className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-primaryText">
                      {language === 'or' ? 'କ୍ଲିନିକାଲ୍ ନୋଟ୍ ଓ ପ୍ରେସକ୍ରିପସନ୍' : 'Clinical Documentation'}
                    </h3>
                    <p className="text-[11px] text-secondaryText">Patient: {patient.fullName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsNotesPanelOpen(false)}
                    className="p-1.5 rounded-lg text-secondaryText hover:text-primaryText hover:bg-canvas transition-colors hidden lg:flex"
                    title="Collapse Notes Panel to maximize video"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Patient Quick Vitals Strip */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-canvas border border-subtleBorder rounded-xl">
                  <span className="text-secondaryText block text-[10px] font-semibold uppercase">BP</span>
                  <span className="font-mono font-bold text-primaryText text-xs">{vitals.bp}</span>
                </div>
                <div className="p-2 bg-canvas border border-subtleBorder rounded-xl">
                  <span className="text-secondaryText block text-[10px] font-semibold uppercase">Pulse</span>
                  <span className="font-mono font-bold text-primaryText text-xs">{vitals.pulse} bpm</span>
                </div>
                <div className="p-2 bg-canvas border border-subtleBorder rounded-xl">
                  <span className="text-secondaryText block text-[10px] font-semibold uppercase">SpO2</span>
                  <span className="font-mono font-bold text-forestGreen-500 text-xs">{vitals.spo2}%</span>
                </div>
                <div className="p-2 bg-red-50/50 border border-red-200 rounded-xl">
                  <span className="text-crimsonRed-500 block text-[10px] font-bold uppercase">Temp</span>
                  <span className="font-mono font-bold text-crimsonRed-500 text-xs">{vitals.tempF}°F</span>
                </div>
              </div>

              {/* Provisional Diagnosis Form */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-primaryText">Provisional Diagnosis:</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => {
                    setDiagnosis(e.target.value);
                    setIsNoteSavedLocally(false);
                  }}
                  className="w-full p-2.5 text-xs bg-canvas border border-subtleBorder rounded-xl focus:bg-white focus:outline-none focus:border-amberOrange-500 font-semibold text-primaryText"
                />
              </div>

              {/* Clinical Observations Textarea */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-primaryText">Clinical Observations &amp; Exam:</label>
                <textarea
                  rows={3}
                  value={observations}
                  onChange={(e) => {
                    setObservations(e.target.value);
                    setIsNoteSavedLocally(false);
                  }}
                  className="w-full p-2.5 text-xs bg-canvas border border-subtleBorder rounded-xl focus:bg-white focus:outline-none focus:border-amberOrange-500 text-primaryText leading-relaxed"
                />
              </div>

              {/* Prescriptions List */}
              <div className="space-y-2 pt-2 border-t border-subtleBorder">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-primaryText">Prescribed Medications (Rx):</label>
                  <span className="text-[11px] text-secondaryText font-medium">{prescriptions.length} items</span>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {prescriptions.map((p) => (
                    <div key={p.id} className="p-2.5 rounded-xl bg-canvas border border-subtleBorder flex items-start justify-between gap-2 text-xs">
                      <div>
                        <p className="font-semibold text-primaryText">{p.drug}</p>
                        <p className="text-[11px] text-secondaryText">{p.dosage} • {p.duration}</p>
                        <p className="text-[10px] text-secondaryText italic">{p.instructions}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedication(p.id)}
                        className="text-secondaryText hover:text-crimsonRed-500 p-1 transition-colors"
                        title="Remove medication"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Quick Add Medication Form */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add medicine (e.g. Azithromycin 500mg)..."
                    value={newDrug}
                    onChange={(e) => setNewDrug(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMedication()}
                    className="flex-1 p-2 text-xs bg-canvas border border-subtleBorder rounded-xl focus:bg-white focus:outline-none focus:border-amberOrange-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddMedication}
                    className="px-3.5 py-2 bg-amberOrange-600 hover:bg-amberOrange-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions & Storage State Guarantee */}
            <div className="pt-3 border-t border-subtleBorder space-y-2.5 mt-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-secondaryText">
                  <Database className="w-3.5 h-3.5 text-amberOrange-600" />
                  <span>{isNoteSavedLocally ? `Saved in IndexedDB (${lastSavedTimestamp})` : 'Uncommitted draft edits'}</span>
                </span>
                <span className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                  isNoteSavedLocally
                    ? 'bg-emerald-50 text-forestGreen-500 border border-emerald-200'
                    : 'bg-amberOrange-50 text-amberOrange-700 border border-amberOrange-200'
                }`}>
                  {isNoteSavedLocally ? 'Saved on Device' : 'Unsaved'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSaveNotes}
                className="w-full py-2.5 bg-amberOrange-600 hover:bg-amberOrange-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Database className="w-4 h-4" />
                <span>Save Notes to Device (IndexedDB Draft)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. End Call Confirmation Modal (Guarantees zero note loss) */}
      {showEndCallModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-subtleBorder max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-forestGreen-500 flex items-center justify-center border border-emerald-200 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-primaryText">Consultation Complete</h3>
                <p className="text-xs text-secondaryText">Encounter notes safely preserved in local vault</p>
              </div>
            </div>

            <div className="bg-canvas p-4 rounded-xl border border-subtleBorder space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-subtleBorder">
                <span className="text-secondaryText">Patient Record:</span>
                <span className="font-semibold text-primaryText">{patient.fullName} ({patient.patientCode})</span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-subtleBorder">
                <span className="text-secondaryText">Call Duration:</span>
                <span className="font-mono font-bold text-primaryText">{formatDuration(elapsedSeconds)}</span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-subtleBorder">
                <span className="text-secondaryText">Provisional Diagnosis:</span>
                <span className="font-semibold text-primaryText text-right truncate max-w-[200px]">
                  {diagnosis}
                </span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-subtleBorder">
                <span className="text-secondaryText">Prescriptions Issued:</span>
                <span className="font-semibold text-primaryText">{prescriptions.length} Meds</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondaryText">Client Sync Status:</span>
                <span className="font-semibold text-forestGreen-500 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" />
                  <span>Saved on This Device (Dexie.js)</span>
                </span>
              </div>
            </div>

            <p className="text-[11px] text-secondaryText leading-relaxed">
              Your consultation notes, vitals, and e-prescription have been cryptographically committed to local device storage with a UUIDv4 idempotency key.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEndCallModal(false)}
                className="px-4 py-2 text-xs font-semibold text-secondaryText hover:text-primaryText hover:bg-canvas rounded-xl transition-colors"
              >
                Resume Call
              </button>
              <button
                type="button"
                onClick={handleConfirmEndCallAndExit}
                className="px-5 py-2.5 bg-amberOrange-600 hover:bg-amberOrange-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Complete &amp; Return to Workstation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
