import React from 'react';
import { Pill, Sun, Moon, Utensils, CheckCircle2, ArrowLeft, Building2, HardDrive } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';

interface Medicine {
  name: string;
  generic: string;
  dosage: string;
  duration: string;
  morning: boolean;
  afternoon: boolean;
  night: boolean;
  instructions: {
    or: string;
    en: string;
  };
}

const MEDICINES: Medicine[] = [
  {
    name: 'Paracetamol 500mg',
    generic: 'Acetaminophen Tab IP',
    dosage: '1 Tablet',
    duration: '3 Days',
    morning: true,
    afternoon: false,
    night: true,
    instructions: {
      or: 'ଖାଇବା ପରେ ପ୍ରଚୁର ପାଣି ସହ ସେବନ କରନ୍ତୁ। ଜ୍ୱର କମିଲେ ବନ୍ଦ କରିପାରିବେ।',
      en: 'Take after meals with plenty of clean water. Discontinue once fever subsides.',
    },
  },
  {
    name: 'Oral Rehydration Salts (ORS)',
    generic: 'WHO Formula Sachet (20.5g)',
    dosage: '1 Sachet in 1 Litre Clean Water',
    duration: '5 Days',
    morning: true,
    afternoon: true,
    night: true,
    instructions: {
      or: 'ଫୁଟା ଶୀତଳ ପାଣିରେ ଗୋଳାଇ ଦିନସାରା ଟିକେ ଟିକେ ପିଅନ୍ତୁ।',
      en: 'Dissolve in boiled & cooled water. Sip small quantities throughout the day.',
    },
  },
  {
    name: 'Iron & Folic Acid (IFA)',
    generic: 'Ferrous Sulfate + Folic Acid',
    dosage: '1 Tablet Daily',
    duration: '30 Days',
    morning: false,
    afternoon: false,
    night: true,
    instructions: {
      or: 'ରାତିରେ ଖାଇସାରି ଶୋଇବା ପୂର୍ବରୁ ନିଅନ୍ତୁ। ଚା’ କିମ୍ବା କଫି ସହ ନିଅନ୍ତୁ ନାହିଁ।',
      en: 'Take at night before sleep. Do not consume with tea or coffee.',
    },
  },
];

export const PatientPrescriptions: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 bg-surface p-6 rounded-2xl border border-subtleBorder shadow-xs">
        <Link
          to="/patient"
          className="p-2.5 rounded-xl border border-subtleBorder text-primaryText hover:bg-canvas transition-colors"
          title="Back to Patient Home"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amberOrange-50 text-amberOrange-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-amberOrange-200 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amberOrange-600" />
              <span>Nuapada CHC • Dr. Abhiram Patnaik</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-primaryText tracking-tight">
            {language === 'or' ? 'ମୋର ଡାକ୍ତରୀ ପ୍ରେସକ୍ରିପସନ୍' : 'My Prescriptions & Regimen'}
          </h1>
          <p className="text-xs sm:text-sm text-secondaryText mt-0.5">
            {language === 'or'
              ? 'ଡାକ୍ତରଙ୍କ ନିର୍ଦ୍ଦେଶ ଅନୁଯାୟୀ ସଠିକ୍ ସମୟରେ ଔଷଧ ସେବନ କରନ୍ତୁ।'
              : 'Permanent offline medication schedule with plain language bilingual guidance.'}
          </p>
        </div>
      </div>

      {/* Offline Assurance Callout */}
      <div className="p-4 rounded-2xl bg-surface border border-subtleBorder text-xs text-primaryText flex items-center justify-between shadow-xs">
        <span className="flex items-center gap-2.5 font-medium">
          <CheckCircle2 className="w-4 h-4 text-forestGreen-500 shrink-0" />
          <span>
            {language === 'or'
              ? 'ଏହି ପ୍ରେସକ୍ରିପସନ୍ ଆପଣଙ୍କ ଫୋନ୍‌ରେ ସ୍ଥାୟୀ ଭାବରେ ଅଫଲାଇନ୍ ସାଇତା ଅଛି'
              : 'Prescriptions are permanently preserved on this device in IndexedDB (fully readable offline)'}
          </span>
        </span>
        <span className="text-[11px] font-mono bg-canvas text-secondaryText px-2.5 py-1 rounded-lg border border-subtleBorder font-semibold flex items-center gap-1">
          <HardDrive className="w-3 h-3 text-amberOrange-600" />
          <span>Saved Locally</span>
        </span>
      </div>

      {/* Structured Medicines List */}
      <div className="space-y-4">
        {MEDICINES.map((med) => (
          <div
            key={med.name}
            className="bg-surface border border-subtleBorder rounded-2xl p-6 shadow-xs space-y-4 hover:border-amberOrange-500/30 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-subtleBorder pb-4">
              <div>
                <h3 className="font-bold text-primaryText text-base flex items-center gap-2">
                  <Pill className="w-4 h-4 text-amberOrange-600" />
                  <span>{med.name}</span>
                </h3>
                <p className="text-xs text-secondaryText font-mono mt-0.5">{med.generic}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-amberOrange-50 text-amberOrange-700 px-3 py-1 rounded-lg border border-amberOrange-200">
                  {med.dosage}
                </span>
                <span className="text-xs font-semibold bg-canvas text-primaryText px-3 py-1 rounded-lg border border-subtleBorder">
                  {med.duration}
                </span>
              </div>
            </div>

            {/* Dose Timing Indicator */}
            <div className="flex items-center gap-3 text-xs flex-wrap">
              <span className="text-secondaryText font-semibold uppercase text-[10px] tracking-wider">
                {language === 'or' ? 'ସେବନ ସମୟ:' : 'Timing Schedule:'}
              </span>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${
                    med.morning
                      ? 'bg-amberOrange-50 text-amberOrange-800 border-amberOrange-300'
                      : 'bg-canvas text-secondaryText/40 border-subtleBorder opacity-60'
                  }`}
                >
                  <Sun className={`w-3.5 h-3.5 ${med.morning ? 'text-amberOrange-600' : 'text-secondaryText/40'}`} />
                  <span>{language === 'or' ? 'ସକାଳ' : 'Morning'}</span>
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${
                    med.afternoon
                      ? 'bg-amberOrange-50 text-amberOrange-800 border-amberOrange-300'
                      : 'bg-canvas text-secondaryText/40 border-subtleBorder opacity-60'
                  }`}
                >
                  <Sun className={`w-3.5 h-3.5 ${med.afternoon ? 'text-amberOrange-600' : 'text-secondaryText/40'}`} />
                  <span>{language === 'or' ? 'ଦ୍ୱିପ୍ରହର' : 'Noon'}</span>
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${
                    med.night
                      ? 'bg-[#17191C] text-white border-white/10'
                      : 'bg-canvas text-secondaryText/40 border-subtleBorder opacity-60'
                  }`}
                >
                  <Moon className={`w-3.5 h-3.5 ${med.night ? 'text-amberOrange-500' : 'text-secondaryText/40'}`} />
                  <span>{language === 'or' ? 'ରାତି' : 'Night'}</span>
                </span>
              </div>
            </div>

            {/* Clear Doctor Instructions */}
            <div className="bg-canvas p-4 rounded-xl border border-subtleBorder text-xs text-primaryText flex items-start gap-3">
              <Utensils className="w-4 h-4 text-amberOrange-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-primaryText">
                  {language === 'or' ? 'ଡାକ୍ତରୀ ନିର୍ଦ୍ଦେଶ: ' : 'Physician Guidance: '}
                </span>
                <span className="text-secondaryText">{language === 'or' ? med.instructions.or : med.instructions.en}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
