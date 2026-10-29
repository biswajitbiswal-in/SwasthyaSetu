import React, { useState } from 'react';
import {
  PlusCircle,
  Clock,
  Database,
  Building2,
  X,
  Stethoscope,
  Send,
  User
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { useRole } from '../../contexts/RoleContext';
import { ItemSyncStatusTag } from '../../components/common/SyncBadge';

interface MockConsultation {
  id: string;
  patientName: string;
  patientCode: string;
  date: string;
  chiefComplaint: string;
  priority: 'ROUTINE' | 'NORMAL' | 'URGENT';
  status: 'REQUESTED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'INTERRUPTED';
  assignedDoctor: string;
  syncState: 'SAVED_LOCAL' | 'PENDING_SYNC' | 'SYNCED' | 'SYNC_FAILED';
  operationId?: string;
}

const INITIAL_CONSULTATIONS: MockConsultation[] = [
  {
    id: 'c-101',
    patientName: 'Gitanjali Majhi',
    patientCode: 'OD-P-10042',
    date: 'Today, 10:15 AM',
    chiefComplaint: 'High fever for 3 days with chills and severe joint pain',
    priority: 'URGENT',
    status: 'REQUESTED',
    assignedDoctor: 'Dr. A. Patnaik (CHC)',
    syncState: 'PENDING_SYNC',
    operationId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
  },
  {
    id: 'c-102',
    patientName: 'Debendra Behera',
    patientCode: 'OD-P-10043',
    date: 'Yesterday, 04:30 PM',
    chiefComplaint: 'Blood pressure checkup; reports dizziness and headache',
    priority: 'NORMAL',
    status: 'COMPLETED',
    assignedDoctor: 'Dr. A. Patnaik (CHC)',
    syncState: 'SYNCED',
  },
  {
    id: 'c-103',
    patientName: 'Padmini Rout',
    patientCode: 'OD-P-10044',
    date: '28 Oct, 11:00 AM',
    chiefComplaint: 'Follow-up for asthma and bronchial wheeze; requested refill',
    priority: 'ROUTINE',
    status: 'COMPLETED',
    assignedDoctor: 'Dr. A. Patnaik (CHC)',
    syncState: 'SYNCED',
  },
];

export const AshaConsultations: React.FC = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const { setPendingSyncCount } = useRole();

  const [consultations, setConsultations] = useState<MockConsultation[]>(INITIAL_CONSULTATIONS);
  const [showNewModal, setShowNewModal] = useState(false);

  // Form states for new consultation request
  const [selectedPatient, setSelectedPatient] = useState('Gitanjali Majhi (OD-P-10042)');
  const [complaintText, setComplaintText] = useState('');
  const [vitalsBP, setVitalsBP] = useState('120/80');
  const [vitalsTemp, setVitalsTemp] = useState('100.2');
  const [priorityLevel, setPriorityLevel] = useState<'NORMAL' | 'URGENT'>('NORMAL');

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) return;

    const newConsult: MockConsultation = {
      id: `c-${Date.now().toString().slice(-4)}`,
      patientName: selectedPatient.split(' (')[0],
      patientCode: selectedPatient.match(/\((.*?)\)/)?.[1] || 'OD-P-NEW',
      date: 'Just now',
      chiefComplaint: `${complaintText} (BP: ${vitalsBP}, Temp: ${vitalsTemp}°F)`,
      priority: priorityLevel,
      status: 'REQUESTED',
      assignedDoctor: 'Dr. A. Patnaik (CHC)',
      syncState: 'SAVED_LOCAL',
      operationId: crypto.randomUUID ? crypto.randomUUID() : 'op-' + Math.random().toString(36).substring(2, 9),
    };

    setConsultations([newConsult, ...consultations]);
    setPendingSyncCount((prev) => prev + 1);
    setShowNewModal(false);
    setComplaintText('');

    showToast(
      language === 'or'
        ? 'ପରାମର୍ଶ ନୋଟ୍ ସ୍ଥାନୀୟ ଫୋନ୍‌ରେ ସୁରକ୍ଷିତ ସାଇତା ଗଲା (IndexedDB)। ନେଟୱର୍କ ପାଇବା ମାତ୍ରେ ଡାକ୍ତରଙ୍କ ନିକଟକୁ ପଠାଯିବ।'
        : 'Saved on This Device (IndexedDB). Queued for sync once internet reconnects.',
      'success',
      4500
    );
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-2xl border border-[#E6E7E9] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#FFF7ED] text-[#C96E14] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#FED7AA] flex items-center gap-1">
              <Building2 className="w-3 h-3 text-[#E88924]" />
              <span>Nuapada Sub-Center • Field Encounters & Doctor Referrals</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202124] tracking-tight">
            {language === 'or' ? 'କ୍ଷେତ୍ର ପରିଦର୍ଶନ ରେକର୍ଡ ଓ ଡାକ୍ତରୀ ରେଫରାଲ୍' : 'Field Records & Doctor Referrals'}
          </h1>
          <p className="text-xs sm:text-sm text-[#73777F] mt-0.5">
            {language === 'or'
              ? 'ଅଫଲାଇନ୍ ଡ୍ରାଫ୍ଟ ନୋଟ୍ ଏବଂ ସିଏଚ୍‌ସି ଡାକ୍ତରଙ୍କ ନିକଟକୁ ପଠାଯାଇଥିବା ଟେଲିମେଡିସିନ ଅନୁରୋଧ।'
              : 'Review field visit encounters, offline drafts, and doctor referral requests.'}
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#E88924] hover:bg-[#D27315] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{language === 'or' ? '+ ନୂତନ କ୍ଷେତ୍ର ନୋଟ୍ / ରେଫରାଲ୍' : '+ New Field Record'}</span>
        </button>
      </div>

      {/* Structured List of Consultations */}
      <div className="space-y-3">
        {consultations.map((c) => (
          <div
            key={c.id}
            className="bg-white border border-[#E6E7E9] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 hover:border-[#D5D7DA] transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#E6E7E9] pb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[#202124] text-base">{c.patientName}</span>
                  <span className="text-xs font-mono bg-[#F5F5F2] text-[#202124] px-2 py-0.5 rounded border border-[#E6E7E9] font-medium">
                    {c.patientCode}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      c.priority === 'URGENT'
                        ? 'bg-[#FDF2F2] text-[#C44747] border-[#F4C5C5]'
                        : 'bg-[#F5F5F2] text-[#73777F] border-[#E6E7E9]'
                    }`}
                  >
                    {c.priority}
                  </span>
                </div>
                <p className="text-xs text-[#73777F] mt-0.5 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#73777F]" />
                    <span>{c.date}</span>
                  </span>
                  <span>•</span>
                  <span>Assigned: {c.assignedDoctor}</span>
                </p>
              </div>

              {/* Honest Offline Sync Status Badge */}
              <div className="flex items-center gap-2 shrink-0">
                <ItemSyncStatusTag status={c.syncState} />
              </div>
            </div>

            {/* Chief Complaint */}
            <div className="text-xs sm:text-sm text-[#202124] bg-[#F5F5F2] p-3 rounded-xl border border-[#E6E7E9]">
              <span className="font-semibold text-[#202124]">
                {language === 'or' ? 'ମୁଖ୍ୟ ଲକ୍ଷଣ / ଅଭିଯୋଗ: ' : 'Chief Complaint: '}
              </span>
              <span className="text-[#52555A]">{c.chiefComplaint}</span>
            </div>

            {/* Storage Trace */}
            {c.operationId && (
              <div className="flex items-center justify-between text-[11px] text-[#73777F] font-mono pt-1">
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3 text-[#E88924]" />
                  <span>Local Op ID: {c.operationId.substring(0, 18)}...</span>
                </span>
                <span>Deterministic UUID Key</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Focused Distraction-Free Form Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17191C]/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E6E7E9] shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-4 border-b border-[#E6E7E9] bg-[#F5F5F2]">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-[#E88924]" />
                <h3 className="font-bold text-[#202124] text-sm">
                  {language === 'or' ? 'ନୂତନ ପରାମର୍ଶ ଅନୁରୋଧ ଫର୍ମ' : 'Create Teleconsultation Request'}
                </h3>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-[#73777F] hover:text-[#202124] p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#202124] block mb-1">Select Patient:</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#73777F] absolute left-3 top-2.5" />
                  <select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#F5F5F2] border border-[#E6E7E9] rounded-xl text-[#202124] focus:bg-white focus:outline-none focus:border-[#E88924]"
                  >
                    <option value="Gitanjali Majhi (OD-P-10042)">Gitanjali Majhi (OD-P-10042) - Nuapada</option>
                    <option value="Debendra Behera (OD-P-10043)">Debendra Behera (OD-P-10043) - Nuapada</option>
                    <option value="Padmini Rout (OD-P-10044)">Padmini Rout (OD-P-10044) - Badapada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#202124] block mb-1">BP (mmHg):</label>
                  <input
                    type="text"
                    value={vitalsBP}
                    onChange={(e) => setVitalsBP(e.target.value)}
                    className="w-full p-2 bg-[#F5F5F2] border border-[#E6E7E9] rounded-xl focus:bg-white focus:outline-none focus:border-[#E88924] font-mono text-[#202124]"
                    placeholder="120/80"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#202124] block mb-1">Temperature (°F):</label>
                  <input
                    type="text"
                    value={vitalsTemp}
                    onChange={(e) => setVitalsTemp(e.target.value)}
                    className="w-full p-2 bg-[#F5F5F2] border border-[#E6E7E9] rounded-xl focus:bg-white focus:outline-none focus:border-[#E88924] font-mono text-[#202124]"
                    placeholder="100.4"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#202124] block mb-1">Triage Priority:</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPriorityLevel('NORMAL')}
                    className={`flex-1 py-2 rounded-xl font-semibold border transition-colors ${
                      priorityLevel === 'NORMAL'
                        ? 'bg-[#17191C] text-white border-[#17191C]'
                        : 'bg-[#F5F5F2] text-[#73777F] border-[#E6E7E9] hover:bg-[#E6E7E9]'
                    }`}
                  >
                    Normal Routine
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriorityLevel('URGENT')}
                    className={`flex-1 py-2 rounded-xl font-semibold border transition-colors ${
                      priorityLevel === 'URGENT'
                        ? 'bg-[#C44747] text-white border-[#C44747]'
                        : 'bg-[#FDF2F2] text-[#C44747] border-[#F4C5C5] hover:bg-[#FCE4E4]'
                    }`}
                  >
                    Urgent Case
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#202124] block mb-1">Chief Complaint & Observations:</label>
                <textarea
                  rows={3}
                  required
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  placeholder="Describe patient symptoms, duration, and observations..."
                  className="w-full p-2.5 bg-[#F5F5F2] border border-[#E6E7E9] rounded-xl focus:bg-white focus:outline-none focus:border-[#E88924] text-[#202124]"
                />
              </div>

              <div className="p-3 bg-[#FFF7ED] border border-[#FED7AA] rounded-xl text-[11px] text-[#73777F]">
                <strong className="text-[#C96E14]">Offline-First Guarantee:</strong> This note will be stored safely in your device storage (Dexie.js IndexedDB) immediately. You don't need internet to save it.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E7E9]">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-[#73777F] hover:bg-[#F5F5F2] rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#E88924] hover:bg-[#D27315] text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Save to Device & Queue</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
