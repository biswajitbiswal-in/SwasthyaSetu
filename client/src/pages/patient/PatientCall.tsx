import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  ArrowLeft,
  ShieldCheck,
  Activity,
  Clock,
  Wifi,
  WifiOff,
  SignalLow,
  CheckCircle2,
  Camera,
  CameraOff,
  Pill,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNetwork } from '../../contexts/NetworkContext';
import { useNavigate, Link } from 'react-router-dom';

export const PatientCall: React.FC = () => {
  const { language } = useLanguage();
  const { isOnline, isServerReachable, isLowBandwidth } = useNetwork();
  const navigate = useNavigate();

  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [showEndCallModal, setShowEndCallModal] = useState(false);

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

  // Local Webcam Stream for Patient PiP
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [localMediaStream, setLocalMediaStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    async function initWebcam() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 360 } },
            audio: true,
          });
          setLocalMediaStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }
      } catch {
        // Graceful fallback if no camera hardware
      }
    }

    initWebcam();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (localMediaStream) {
      localMediaStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
      localMediaStream.getVideoTracks().forEach((track) => {
        track.enabled = !isCameraOff && !isAudioOnly;
      });
    }
  }, [isMuted, isCameraOff, isAudioOnly, localMediaStream]);

  const isCallDisconnected = !isOnline || !isServerReachable;

  return (
    <div className="flex flex-col h-[calc(100vh-2.5rem)] w-full font-sans select-none overflow-hidden">
      {/* 1. Patient Consultation Header */}
      <div className="bg-surface border border-subtleBorder rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 mb-3 shadow-xs shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/patient')}
            className="p-2 rounded-xl border border-subtleBorder text-secondaryText hover:text-primaryText hover:bg-canvas transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">
              {language === 'or' ? 'ପଛକୁ ଫେରନ୍ତୁ' : 'Back to Home'}
            </span>
          </button>

          <div className="h-6 w-px bg-subtleBorder hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-primaryText text-base">
                Dr. Abhiram Patnaik (ଡାକ୍ତର ପଟ୍ଟନାୟକ)
              </h1>
              <span className="text-[11px] bg-emerald-50 text-forestGreen-500 border border-emerald-200 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-forestGreen-500 animate-pulse" />
                <span>Connected</span>
              </span>
            </div>
            <p className="text-xs text-secondaryText mt-0.5">
              Nuapada CHC • General Medicine &amp; Rural Tele-Triage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-end sm:self-auto">
          {/* Duration Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#17191C] text-white border border-white/10 text-xs font-mono font-bold shadow-xs">
            <Clock className="w-3.5 h-3.5 text-amberOrange-500 animate-pulse" />
            <span>{formatDuration(elapsedSeconds)}</span>
          </div>

          {/* Network State Indicator */}
          {isCallDisconnected ? (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-red-50 text-crimsonRed-500 border border-red-200 flex items-center gap-1.5">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Connection Lost</span>
            </span>
          ) : isAudioOnly || isLowBandwidth ? (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amberOrange-50 text-amberOrange-700 border border-amberOrange-200 flex items-center gap-1.5">
              <SignalLow className="w-3.5 h-3.5 text-amberOrange-600" />
              <span>2G Audio Saver Mode</span>
            </span>
          ) : (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-forestGreen-500 border border-emerald-200 flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-forestGreen-500" />
              <span>Stable Video Call</span>
            </span>
          )}
        </div>
      </div>

      {/* Disconnection Warning */}
      {isCallDisconnected && (
        <div className="bg-red-50 border border-red-200 text-crimsonRed-500 px-4 py-2 rounded-xl mb-3 flex items-center justify-between text-xs shadow-xs shrink-0">
          <span className="font-semibold">
            {language === 'or'
              ? 'ନେଟୱର୍କ ସଂଯୋଗ ବିଚ୍ଛିନ୍ନ ହୋଇଛି। ପୁନଃ ସଂଯୋଗ ଚେଷ୍ଟା ଚାଲିଛି... ଆପଣଙ୍କ ପ୍ରେସକ୍ରିପସନ୍ ସୁରକ୍ଷିତ ଅଛି।'
              : 'Network disconnected. Reconnecting... Previously issued prescriptions remain safely cached.'}
          </span>
        </div>
      )}

      {/* 2. Main Dominant Video Stage */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#17191C] rounded-2xl overflow-hidden border border-white/10 shadow-lg relative items-center justify-center">
        {/* Remote Doctor Feed */}
        {isAudioOnly ? (
          <div className="text-center p-8 space-y-4 max-w-md mx-auto">
            <div className="relative w-28 h-28 mx-auto">
              <div className="w-28 h-28 rounded-full bg-amberOrange-500/15 border-2 border-amberOrange-500 text-amberOrange-400 flex items-center justify-center text-3xl font-bold shadow-lg">
                AP
              </div>
              <span className="absolute inset-0 rounded-full border-2 border-amberOrange-400/40 animate-ping pointer-events-none" />
            </div>

            <div>
              <h2 className="text-white font-bold text-xl tracking-tight">Dr. Abhiram Patnaik</h2>
              <p className="text-amberOrange-400 text-xs font-semibold mt-1">
                {language === 'or' ? 'ଅଡିଓ-ମୋଡ୍ ସକ୍ରିୟ (କମ୍ ଡାଟା ଖର୍ଚ୍ଚ)' : 'Audio-Only Bandwidth Saver Mode'}
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Optimized for clear voice quality over 2G / low-signal network
              </p>
            </div>

            <div className="flex items-center justify-center gap-1.5 h-8 pt-2">
              <span className="w-1.5 bg-amberOrange-500 rounded-full animate-bounce h-4" />
              <span className="w-1.5 bg-amberOrange-500 rounded-full animate-bounce h-7 delay-75" />
              <span className="w-1.5 bg-amberOrange-500 rounded-full animate-bounce h-5 delay-150" />
              <span className="w-1.5 bg-amberOrange-500 rounded-full animate-bounce h-8 delay-100" />
              <span className="w-1.5 bg-amberOrange-500 rounded-full animate-bounce h-6 delay-200" />
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center bg-radial from-[#22262C] to-[#17191C]">
            <div className="text-center p-8 space-y-3">
              <div className="w-28 h-28 rounded-full bg-white/10 border-2 border-white/20 text-white flex items-center justify-center text-3xl font-bold shadow-xl mx-auto">
                AP
              </div>
              <div>
                <h2 className="text-white font-bold text-lg tracking-tight">Dr. Abhiram Patnaik</h2>
                <p className="text-slate-400 text-xs mt-0.5">Community Health Center (CHC), Nuapada</p>
                <p className="text-forestGreen-500 text-xs font-mono font-medium mt-1">
                  Secure Video Stream Active
                </p>
              </div>
            </div>

            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-[11px] font-mono flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-amberOrange-500" />
              <span>Nuapada Tele-Care Link</span>
            </div>
          </div>
        )}

        {/* Floating PiP Local Patient Webcam in Top-Right Corner */}
        <div className="absolute top-4 right-4 w-40 sm:w-52 aspect-video bg-[#111315] rounded-xl border border-white/20 shadow-2xl overflow-hidden flex flex-col justify-between p-2 z-20">
          {isCameraOff || isAudioOnly ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-1">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold">
                GM
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {isAudioOnly ? 'Audio Mode' : 'Camera Off'}
              </span>
            </div>
          ) : localMediaStream ? (
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
              <span className="text-[10px] text-slate-300 font-semibold">Self Preview</span>
            </div>
          )}

          <div className="relative z-10 flex items-center justify-between text-[10px] text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md mt-auto">
            <span className="font-semibold truncate">You (Gitanjali)</span>
            {isMuted ? (
              <MicOff className="w-3 h-3 text-crimsonRed-500 shrink-0" />
            ) : (
              <Mic className="w-3 h-3 text-forestGreen-500 shrink-0" />
            )}
          </div>
        </div>

        {/* Floating Bottom HUD Controls */}
        <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-3 px-4 z-30">
          <div className="bg-[#17191C]/90 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            {/* Mic */}
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-xl text-white font-medium text-xs transition-all flex items-center gap-2 ${
                isMuted
                  ? 'bg-crimsonRed-500 hover:bg-red-700 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 border border-white/10'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Mic On'}</span>
            </button>

            {/* Camera */}
            <button
              type="button"
              onClick={() => setIsCameraOff(!isCameraOff)}
              disabled={isAudioOnly}
              className={`p-3 rounded-xl text-white font-medium text-xs transition-all flex items-center gap-2 disabled:opacity-40 ${
                isCameraOff
                  ? 'bg-crimsonRed-500 hover:bg-red-700 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 border border-white/10'
              }`}
            >
              {isCameraOff ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
              <span className="hidden sm:inline">{isCameraOff ? 'Cam Off' : 'Cam On'}</span>
            </button>

            {/* Audio-only toggle */}
            <button
              type="button"
              onClick={() => setIsAudioOnly(!isAudioOnly)}
              className={`px-4 py-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                isAudioOnly
                  ? 'bg-amberOrange-600 hover:bg-amberOrange-700 text-white ring-2 ring-amberOrange-400/40'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
              }`}
            >
              {isAudioOnly ? <VideoOff className="w-4 h-4 text-white" /> : <Video className="w-4 h-4 text-forestGreen-500" />}
              <span>{isAudioOnly ? 'Audio Mode' : 'Switch to Audio'}</span>
            </button>

            {/* End Call */}
            <button
              type="button"
              onClick={() => setShowEndCallModal(true)}
              className="px-5 py-3 rounded-xl bg-crimsonRed-500 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
            >
              <PhoneOff className="w-4 h-4" />
              <span>{language === 'or' ? 'କଲ୍ ଶେଷ କରନ୍ତୁ' : 'End Call'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. End Call Confirmation Modal for Patient */}
      {showEndCallModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-subtleBorder max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-forestGreen-500 flex items-center justify-center border border-emerald-200 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-primaryText">
                  {language === 'or' ? 'ପରାମର୍ଶ ସମାପ୍ତ ହେଲା' : 'Consultation Finished'}
                </h3>
                <p className="text-xs text-secondaryText">
                  {language === 'or' ? 'ଡାକ୍ତରଙ୍କ ପ୍ରେସକ୍ରିପସନ୍ ଆପଣଙ୍କ ଫୋନ୍‌ରେ ସୁରକ୍ଷିତ ଅଛି' : 'Prescription saved to your device'}
                </p>
              </div>
            </div>

            <div className="bg-canvas p-4 rounded-xl border border-subtleBorder space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-subtleBorder">
                <span className="text-secondaryText">Doctor:</span>
                <span className="font-semibold text-primaryText">Dr. Abhiram Patnaik (Nuapada CHC)</span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-subtleBorder">
                <span className="text-secondaryText">Call Duration:</span>
                <span className="font-mono font-bold text-primaryText">{formatDuration(elapsedSeconds)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondaryText">Prescription Status:</span>
                <span className="font-semibold text-forestGreen-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Permanent Offline Access</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEndCallModal(false)}
                className="px-4 py-2 text-xs font-semibold text-secondaryText hover:text-primaryText hover:bg-canvas rounded-xl transition-colors"
              >
                {language === 'or' ? 'ପଛକୁ ଫେରନ୍ତୁ' : 'Resume Call'}
              </button>
              <Link
                to="/patient/prescriptions"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amberOrange-600 hover:bg-amberOrange-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <Pill className="w-4 h-4" />
                <span>{language === 'or' ? 'ପ୍ରେସକ୍ରିପସନ୍ ଦେଖନ୍ତୁ' : 'View Prescriptions'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
