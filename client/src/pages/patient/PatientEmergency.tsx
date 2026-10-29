import React from 'react';
import { PhoneCall, AlertTriangle, ShieldAlert, ArrowLeft, HeartPulse, HardDrive } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';

export const PatientEmergency: React.FC = () => {
  const { language } = useLanguage();

  const emergencyContacts = [
    {
      number: '108',
      label: language === 'or' ? 'ଜରୁରୀକାଳୀନ ଆମ୍ବୁଲାନ୍ସ ସେବା (୨୪x୭)' : 'Free Emergency Ambulance (24x7)',
      desc: 'Government of Odisha Emergency Medical Transport',
      priority: true,
    },
    {
      number: '104',
      label: language === 'or' ? 'ସ୍ୱାସ୍ଥ୍ୟ ପରାମର୍ଶ ହେଲ୍ପଲାଇନ୍' : 'Health Advice & Triage Helpline',
      desc: 'Direct doctor medical consultation & triage',
      priority: false,
    },
    {
      number: '181',
      label: language === 'or' ? 'ମହିଳା ସହାୟତା ହେଲ୍ପଲାଇନ୍' : 'Women Helpline (Mukhyamantri)',
      desc: 'Maternal distress & crisis safety protection',
      priority: false,
    },
    {
      number: '112',
      label: language === 'or' ? 'ସମସ୍ତ ଜରୁରୀକାଳୀନ ନମ୍ବର (ERSS)' : 'National Unified Emergency Response',
      desc: 'Police, Fire, Disaster Management, Medical',
      priority: false,
    },
  ];

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
            <span className="bg-red-50 text-crimsonRed-500 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-red-200 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-crimsonRed-500" />
              <span>Emergency 24x7 Direct Helplines</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-primaryText tracking-tight">
            {language === 'or' ? 'ଜରୁରୀକାଳୀନ ହେଲ୍ପଲାଇନ୍ ଓ ପ୍ରାଥମିକ ଚିକିତ୍ସା' : 'Emergency Helplines & First-Aid'}
          </h1>
          <p className="text-xs sm:text-sm text-secondaryText mt-0.5">
            {language === 'or'
              ? 'ସିଧାସଳଖ ଡାଏଲ୍ କରନ୍ତୁ କିମ୍ବା ଅଫଲାଇନ୍ ପ୍ରାଥମିକ ଚିକିତ୍ସା ନିର୍ଦ୍ଦେଶାବଳୀ ପଢ଼ନ୍ତୁ।'
              : 'Direct dial emergency medical dispatch and review verified offline first-aid protocols.'}
          </p>
        </div>
      </div>

      {/* Emergency Phone Dialer Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {emergencyContacts.map((contact) => (
          <a
            key={contact.number}
            href={`tel:${contact.number}`}
            className="p-5 rounded-2xl bg-surface border border-subtleBorder hover:border-crimsonRed-500/40 shadow-xs hover:shadow-sm transition-all flex items-center justify-between group active:scale-[0.99]"
          >
            <div>
              <span className="text-xs font-bold text-primaryText group-hover:text-crimsonRed-500 transition-colors block">
                {contact.label}
              </span>
              <span className="text-[11px] text-secondaryText mt-1 block">{contact.desc}</span>
            </div>
            <div
              className={`flex items-center gap-2 font-mono font-bold text-sm px-4 py-2.5 rounded-xl shadow-2xs shrink-0 transition-colors ${
                contact.priority
                  ? 'bg-crimsonRed-500 text-white group-hover:bg-red-700'
                  : 'bg-canvas text-primaryText border border-subtleBorder group-hover:border-crimsonRed-500/40'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>{contact.number}</span>
            </div>
          </a>
        ))}
      </div>

      {/* Offline First-Aid Emergency Protocols Guide */}
      <div className="bg-surface border border-subtleBorder rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-subtleBorder">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-red-50 text-crimsonRed-500 border border-red-100">
              <HeartPulse className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-primaryText">
                {language === 'or' ? 'ଅଫଲାଇନ୍ ପ୍ରାଥମିକ ଚିକିତ୍ସା ନିର୍ଦ୍ଦେଶାବଳୀ' : 'Offline First-Aid Clinical Protocols'}
              </h2>
              <p className="text-xs text-secondaryText">Standard emergency SOPs certified by Health Dept</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-secondaryText bg-canvas px-2.5 py-1 rounded-lg border border-subtleBorder flex items-center gap-1">
            <HardDrive className="w-3 h-3 text-amberOrange-600" />
            <span>Cached Offline</span>
          </span>
        </div>

        <div className="space-y-3.5 text-xs text-primaryText">
          <div className="p-4 rounded-xl bg-canvas border border-subtleBorder space-y-1.5">
            <h3 className="font-semibold text-primaryText flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amberOrange-600 shrink-0" />
              <span>{language === 'or' ? '୧. ସର୍ପଦଂଶନ (Snakebite Protocol):' : '1. Snakebite Emergency Protocol:'}</span>
            </h3>
            <p className="text-secondaryText leading-relaxed text-[11px]">
              {language === 'or'
                ? 'ରୋଗୀଙ୍କୁ ଶାନ୍ତ ଓ ସ୍ଥିର ରଖନ୍ତୁ। କୌଣସି ବାନ୍ଧ (Tourniquet) କିମ୍ବା ଚିରା ମାରନ୍ତୁ ନାହିଁ। ତୁରନ୍ତ ୧୦୮ ଆମ୍ବୁଲାନ୍ସ ଡାକନ୍ତୁ ଏବଂ ନିକଟସ୍ଥ CHC କୁ ନିଅନ୍ତୁ ଯେଉଁଠାରେ ଆଣ୍ଟି-ସ୍ନେକ୍ ଭେନମ (ASV) ମାଗଣାରେ ଉପଲବ୍ଧ।'
                : 'Keep patient calm and completely still. Do NOT cut, suck, or apply tight tourniquet. Immediately dial 108 and transport to nearest Community Health Center where Anti-Snake Venom (ASV) is stocked.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-canvas border border-subtleBorder space-y-1.5">
            <h3 className="font-semibold text-primaryText flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-forestGreen-500 shrink-0" />
              <span>{language === 'or' ? '୨. ତରଳ ଝାଡ଼ା ଓ ନିର୍ଜଳନ (Dehydration / Diarrhea):' : '2. Acute Diarrhea & Dehydration:'}</span>
            </h3>
            <p className="text-secondaryText leading-relaxed text-[11px]">
              {language === 'or'
                ? 'ପ୍ରତିଥର ଝାଡ଼ା ପରେ ୧ ଗ୍ଲାସ ପରିଷ୍କାର ଫୁଟା ପାଣିରେ ORS ଘୋଳ ପିଅନ୍ତୁ। ଶିଶୁମାନଙ୍କ କ୍ଷେତ୍ରରେ ସ୍ତନ୍ୟପାନ ବନ୍ଦ କରନ୍ତୁ ନାହିଁ ଏବଂ ୧୪ ଦିନ ପାଇଁ ଜିଙ୍କ୍ (Zinc) ସିରପ୍/ଟାବଲେଟ୍ ଦିଅନ୍ତୁ।'
                : 'Administer 1 glass of properly prepared WHO ORS solution after every loose motion. Continue normal breast feeding for infants and administer zinc tablets for 14 days.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-canvas border border-subtleBorder space-y-1.5">
            <h3 className="font-semibold text-primaryText flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-crimsonRed-500 shrink-0" />
              <span>{language === 'or' ? '୩. ଶିଶୁଙ୍କ ଉଚ୍ଚ ଜ୍ୱର (Febrile Emergency in Infants):' : '3. High Fever in Infants & Children:'}</span>
            </h3>
            <p className="text-secondaryText leading-relaxed text-[11px]">
              {language === 'or'
                ? 'ସାଧାରଣ ତାପମାତ୍ରାର ପାଣିରେ କନା ଭିଜାଇ ଶରୀର ପୋଛନ୍ତୁ (Tepid Sponging)। ଆସ୍ପିରିନ୍ କଦାପି ଦିଅନ୍ତୁ ନାହିଁ। ଆଶା କର୍ମୀଙ୍କୁ ତୁରନ୍ତ ସୂଚନା ଦିଅନ୍ତୁ।'
                : 'Tepid sponge forehead and limbs with room-temperature water. Never administer aspirin without a prescription. Contact your village ASHA worker for an immediate RDT test.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
