import React, { useState } from 'react';
import {
  X,
  User,
  MapPin,
  Building2,
  Activity,
  Video,
  AlertCircle,
  Wifi,
  WifiOff,
  SignalLow,
  ChevronRight,
  RotateCcw,
  PhoneCall,
  Send
} from 'lucide-react';
import { PatientRecord } from '../../data/patients';
import { UrgencyBadge } from './UrgencyBadge';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNetwork } from '../../contexts/NetworkContext';
import { useRole } from '../../contexts/RoleContext';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

interface PatientDetailsModalProps {
  patient: PatientRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
  patient,
  isOpen,
  onClose,
}) => {
  const { language } = useLanguage();
  const { isOnline, isServerReachable } = useNetwork();
  const { currentUser } = useRole();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Connecting Flow States
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingStep, setConnectingStep] = useState<string>('');
  const [connectionFailed, setConnectionFailed] = useState(false);

  if (!isOpen || !patient) return null;

  const isConnected = isOnline && isServerReachable;

  const handleStartConsultation = () => {
    setIsConnecting(true);
    setConnectionFailed(false);
    setConnectingStep('Validating patient record & vitals checksum...');

    setTimeout(() => {
      setConnectingStep(
        currentUser.role === 'DOCTOR'
          ? 'Verifying WebRTC signaling channel with Sub-Center...'
          : 'Connecting to Dr. A. Patnaik at CHC...'
      );
      
      setTimeout(() => {
        if (!isConnected && patient.connectionStatus === 'OFFLINE') {
          // Honest failure state when offline
          setIsConnecting(false);
          setConnectionFailed(true);
        } else {
          setConnectingStep('Requesting camera & microphone access...');
          setTimeout(() => {
            setIsConnecting(false);
            onClose();
            if (currentUser.role === 'DOCTOR') {
              navigate(`/doctor/telemedicine?patientId=${patient.patientCode}`);
            } else {
              // ASHA or Patient connects via the rural teleconsult call room
              navigate(`/patient/call?patientId=${patient.patientCode}`);
            }
          }, 700);
        }
      }, 700);
    }, 600);
  };

  const handleQueueReferral = () => {
    showToast(
      language === 'or'
        ? `${patient.fullName}ଙ୍କ ରେଫରାଲ୍ ଅନୁରୋଧ ଡାକ୍ତର ପଟ୍ଟନାୟକଙ୍କ କ୍ୟୁକୁ ସଫଳତାର ସହ ପଠାଗଲା (IndexedDB)।`
        : `Teleconsult referral for ${patient.fullName} queued for Dr. Patnaik in local IndexedDB.`,
      'success',
      4000
    );
    onClose();
  };

  const handleProceedOfflineDraft = () => {
    setIsConnecting(false);
    setConnectionFailed(false);
    onClose();
    navigate(`/doctor/telemedicine?patientId=${patient.patientCode}&mode=offline`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-surface border border-subtleBorder rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-subtleBorder bg-canvas flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#17191C] text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              <User className="w-6 h-6 text-amberOrange-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-primaryText">
                  {patient.fullName}
                </h2>
                <span className="text-xs text-secondaryText font-medium">({patient.fullNameOdia})</span>
                <span className="font-mono text-xs bg-surface text-primaryText px-2 py-0.5 rounded border border-subtleBorder font-semibold">
                  {patient.patientCode}
                </span>
              </div>
              <p className="text-xs text-secondaryText mt-0.5">
                {patient.age} yrs • {patient.gender} • Contact: {patient.phone}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-secondaryText hover:text-primaryText hover:bg-surface border border-transparent hover:border-subtleBorder transition-colors shrink-0"
            title="Close patient details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-primaryText flex-1">
          {/* Facility, Location & Assigned ASHA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-canvas border border-subtleBorder rounded-2xl">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-secondaryText uppercase tracking-wider block">
                Hamlet &amp; Health Center
              </span>
              <p className="font-semibold text-primaryText flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amberOrange-600" />
                <span>{patient.village}</span>
              </p>
              <p className="text-[11px] text-secondaryText flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-secondaryText" />
                <span>{patient.subCenter} ({patient.phcName})</span>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-secondaryText uppercase tracking-wider block">
                Assigned Frontline Healthcare Worker
              </span>
              <p className="font-semibold text-primaryText">
                {patient.assignedAsha}
              </p>
              <p className="text-[11px] text-forestGreen-500 font-medium">
                Verified Health Mission Roster
              </p>
            </div>
          </div>

          {/* Urgency Classification & Explanation Box */}
          <div className="p-4 rounded-2xl border border-subtleBorder bg-surface space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-secondaryText uppercase tracking-wider">
                  Triage Urgency:
                </span>
                <UrgencyBadge urgency={patient.urgency} patient={patient} />
              </div>
              <span className="text-[11px] text-secondaryText font-mono">
                {patient.waitingTime}
              </span>
            </div>

            <p className="text-secondaryText leading-relaxed pt-1">
              <strong className="text-primaryText font-semibold">Triage Reason: </strong>
              {patient.urgencyReason}
            </p>

            <div className="p-2.5 rounded-xl bg-canvas border border-subtleBorder text-[11px] text-secondaryText flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amberOrange-600 shrink-0 mt-0.5" />
              <p>
                <strong>Recommended Workflow: </strong>
                {patient.triageWorkflow}
              </p>
            </div>
          </div>

          {/* Chief Complaint */}
          <div className="p-4 rounded-2xl bg-canvas border border-subtleBorder space-y-1.5">
            <span className="text-[10px] font-bold text-secondaryText uppercase tracking-wider block">
              Chief Complaint &amp; Reported Symptoms
            </span>
            <p className="text-sm font-semibold text-primaryText">
              {patient.chiefComplaint}
            </p>
            <p className="text-xs text-secondaryText italic">
              {patient.chiefComplaintOdia}
            </p>
          </div>

          {/* Recorded Vital Signs Strip */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-secondaryText uppercase tracking-wider block">
              Field Vitals Recorded by ASHA Worker
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-center">
              <div className="p-3 bg-surface border border-subtleBorder rounded-xl shadow-2xs">
                <span className="text-secondaryText block text-[10px] font-semibold uppercase font-sans">BP</span>
                <span className="font-bold text-primaryText text-sm">{patient.vitals.bp}</span>
                <span className="text-[9px] text-secondaryText block font-sans">mmHg</span>
              </div>
              <div className="p-3 bg-surface border border-subtleBorder rounded-xl shadow-2xs">
                <span className="text-secondaryText block text-[10px] font-semibold uppercase font-sans">Pulse</span>
                <span className="font-bold text-primaryText text-sm">{patient.vitals.pulse}</span>
                <span className="text-[9px] text-secondaryText block font-sans">bpm</span>
              </div>
              <div className="p-3 bg-surface border border-subtleBorder rounded-xl shadow-2xs">
                <span className="text-secondaryText block text-[10px] font-semibold uppercase font-sans">SpO2</span>
                <span className="font-bold text-forestGreen-500 text-sm">{patient.vitals.spo2}%</span>
                <span className="text-[9px] text-secondaryText block font-sans">Blood Oxygen</span>
              </div>
              <div className="p-3 bg-red-50/50 border border-red-200 rounded-xl shadow-2xs">
                <span className="text-crimsonRed-500 block text-[10px] font-bold uppercase font-sans">Temp</span>
                <span className="font-bold text-crimsonRed-500 text-sm">{patient.vitals.tempF}°F</span>
                <span className="text-[9px] text-crimsonRed-500/80 block font-sans">Oral / Axillary</span>
              </div>
            </div>
          </div>

          {/* Chronic Conditions & Allergies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-canvas border border-subtleBorder rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-secondaryText uppercase tracking-wider block">
                Known Chronic Conditions
              </span>
              <p className="font-medium text-primaryText">
                {patient.chronicConditions.join(', ')}
              </p>
            </div>
            <div className="p-3 bg-canvas border border-subtleBorder rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-secondaryText uppercase tracking-wider block">
                Documented Allergies
              </span>
              <p className="font-semibold text-crimsonRed-500">
                {patient.allergies.join(', ')}
              </p>
            </div>
          </div>

          {/* Past Encounters & Synchronised History */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-secondaryText uppercase tracking-wider block">
              Relevant Previously Synchronised Medical History
            </span>
            <div className="space-y-2">
              {patient.pastEncounters.map((enc, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-surface border border-subtleBorder flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primaryText">{enc.type}</span>
                      <span className="text-secondaryText font-mono text-[11px]">• {enc.date}</span>
                    </div>
                    <p className="text-secondaryText text-[11px] mt-0.5">
                      Diagnosis: {enc.diagnosis} • Provider: {enc.prescribedBy}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold bg-emerald-50 text-forestGreen-500 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {enc.syncState}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-Center Channel Readiness Status */}
          <div className="p-3.5 rounded-xl bg-canvas border border-subtleBorder flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amberOrange-600" />
              <span className="text-secondaryText">Sub-Center Network Link:</span>
            </div>
            {patient.connectionStatus === 'ONLINE_READY' ? (
              <span className="font-semibold text-forestGreen-500 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" />
                <span>Online (Video &amp; Audio Ready)</span>
              </span>
            ) : patient.connectionStatus === 'LOW_BANDWIDTH_2G' ? (
              <span className="font-semibold text-amberOrange-700 bg-amberOrange-50 border border-amberOrange-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <SignalLow className="w-3.5 h-3.5" />
                <span>Weak 2G (Audio Fallback Ready)</span>
              </span>
            ) : (
              <span className="font-semibold text-secondaryText bg-surface border border-subtleBorder px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline (Local Cache Only)</span>
              </span>
            )}
          </div>
        </div>

        {/* Modal Connecting Status State */}
        {isConnecting && (
          <div className="p-4 bg-amberOrange-50/80 border-t border-amberOrange-200 flex items-center gap-3 text-xs text-amberOrange-800">
            <div className="w-4 h-4 rounded-full border-2 border-amberOrange-600 border-t-transparent animate-spin shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">Establishing Telemedicine Channel:</span>
              <p className="text-[11px] text-amberOrange-700">{connectingStep}</p>
            </div>
          </div>
        )}

        {/* Connection Failure Warning */}
        {connectionFailed && (
          <div className="p-4 bg-red-50 border-t border-red-200 text-xs text-crimsonRed-500 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <WifiOff className="w-4 h-4 shrink-0" />
              <span>Nuapada Sub-Center is currently offline (0 kbps). Live call cannot connect.</span>
            </div>
            <p className="text-[11px] text-secondaryText">
              You can retry connection or open the consultation workspace to prepare an offline consultation note.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleStartConsultation}
                className="px-3 py-1.5 bg-surface border border-red-200 text-crimsonRed-500 rounded-lg font-semibold flex items-center gap-1 hover:bg-red-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
              <button
                type="button"
                onClick={handleProceedOfflineDraft}
                className="px-3 py-1.5 bg-primaryText text-white rounded-lg font-semibold hover:bg-black"
              >
                Open Offline Notes Pad
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-subtleBorder bg-surface flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-subtleBorder text-secondaryText hover:text-primaryText hover:bg-canvas text-xs font-semibold transition-colors order-2 sm:order-1"
          >
            {language === 'or' ? 'ବନ୍ଦ କରନ୍ତୁ' : 'Close Details'}
          </button>

          {/* Role-Specific Actions */}
          {currentUser.role === 'DOCTOR' && (
            <button
              type="button"
              onClick={handleStartConsultation}
              disabled={isConnecting}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amberOrange-600 hover:bg-amberOrange-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors disabled:opacity-50 order-1 sm:order-2"
            >
              <Video className="w-4 h-4" />
              <span>{language === 'or' ? 'ଡାକ୍ତରୀ କଲ୍ ଆରମ୍ଭ କରନ୍ତୁ' : 'Start Doctor Consultation'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {currentUser.role === 'ASHA' && (
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <button
                type="button"
                onClick={handleQueueReferral}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F5F5F2] hover:bg-[#E6E7E9] text-[#202124] text-xs font-semibold border border-[#E6E7E9] transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-[#287D65]" />
                <span>{language === 'or' ? 'ରେଫରାଲ୍ ପଠାନ୍ତୁ' : 'Queue Referral'}</span>
              </button>

              <button
                type="button"
                onClick={handleStartConsultation}
                disabled={isConnecting}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amberOrange-600 hover:bg-amberOrange-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors disabled:opacity-50"
              >
                <PhoneCall className="w-4 h-4" />
                <span>
                  {patient.urgency === 'EMERGENCY' || patient.urgency === 'URGENT'
                    ? (language === 'or' ? 'ସିଏଚ୍‌ସି ଡାକ୍ତରଙ୍କ ସହ କଲ୍ ସଂଯୋଗ' : 'Connect to CHC Doctor')
                    : (language === 'or' ? 'ଡାକ୍ତରଙ୍କ ସହ କଲ୍ ସଂଯୋଗ' : 'Facilitate Doctor Call')}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {currentUser.role === 'PATIENT' && (
            <button
              type="button"
              onClick={handleStartConsultation}
              disabled={isConnecting}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amberOrange-600 hover:bg-amberOrange-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors disabled:opacity-50 order-1 sm:order-2"
            >
              <Video className="w-4 h-4" />
              <span>{language === 'or' ? 'ଡାକ୍ତରୀ କଲ୍‌ରେ ଯୋଗ ଦିଅନ୍ତୁ' : 'Join Video Consultation'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
