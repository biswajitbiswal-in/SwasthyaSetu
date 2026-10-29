import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'or' | 'en';

interface Translations {
  [key: string]: {
    or: string;
    en: string;
  };
}

export const translations: Translations = {
  appName: {
    or: 'ସ୍ୱାସ୍ଥ୍ୟ ସେତୁ',
    en: 'Swasthya Setu',
  },
  tagline: {
    or: 'ନିମ୍ନ-ନେଟୱର୍କ ଟେଲିମେଡିସିନ ପ୍ଲାଟଫର୍ମ',
    en: 'Low-Network Telemedicine Platform',
  },
  online: {
    or: 'ଅନଲାଇନ୍',
    en: 'Online',
  },
  offline: {
    or: 'ଅଫଲାଇନ୍ ମୋଡ୍',
    en: 'Offline Mode',
  },
  synced: {
    or: 'ସବୁ ତଥ୍ୟ ସିଙ୍କ୍ ହୋଇଛି',
    en: 'All Synced',
  },
  pendingSync: {
    or: 'ସିଙ୍କ୍ ବାକି ଅଛି',
    en: 'Pending Sync',
  },
  syncFailed: {
    or: 'ସିଙ୍କ୍ ବିଫଳ ହୋଇଛି',
    en: 'Sync Failed',
  },
  rolePatient: {
    or: 'ରୋଗୀ / ନାଗରିକ (Patient)',
    en: 'Patient / Citizen',
  },
  myHealthCard: {
    or: 'ମୋର ସ୍ୱାସ୍ଥ୍ୟ କାର୍ଡ',
    en: 'My Health Card',
  },
  myPrescriptions: {
    or: 'ମୋର ଔଷଧ ଓ ଉପଦେଶ',
    en: 'My Prescriptions',
  },
  joinDoctorCall: {
    or: 'ଡାକ୍ତରଙ୍କ ସହ କଲ୍ ଯୋଡ଼ନ୍ତୁ',
    en: 'Join Doctor Call',
  },
  emergencyHelplines: {
    or: 'ଜରୁରୀକାଳୀନ ସହାୟତା',
    en: 'Emergency & Helplines',
  },
  roleAsha: {
    or: 'ଆଶା କର୍ମୀ (ASHA)',
    en: 'ASHA Worker',
  },
  roleDoctor: {
    or: 'ଡାକ୍ତର (Doctor)',
    en: 'Doctor',
  },
  roleAdmin: {
    or: 'ପ୍ରଶାସକ (Admin)',
    en: 'Administrator',
  },
  navHome: {
    or: 'ମୁଖ୍ୟ ପୃଷ୍ଠା',
    en: 'Home',
  },
  navPatients: {
    or: 'ରୋଗୀ ତାଲିକା',
    en: 'Patients',
  },
  navConsultations: {
    or: 'ପରାମର୍ଶ',
    en: 'Consultations',
  },
  navSync: {
    or: 'ସିଙ୍କ୍ କେନ୍ଦ୍ର',
    en: 'Sync Center',
  },
  navAudit: {
    or: 'ଅଡିଟ୍ ଲଗ୍',
    en: 'Audit Logs',
  },
  navSettings: {
    or: 'ସେଟିଙ୍ଗ୍ସ',
    en: 'Settings',
  },
  quickActions: {
    or: 'ତ୍ୱରିତ କାର୍ଯ୍ୟ',
    en: 'Quick Actions',
  },
  newPatient: {
    or: '+ ନୂତନ ରୋଗୀ ଯୋଡନ୍ତୁ',
    en: '+ Register Patient',
  },
  newConsultation: {
    or: '+ ପରାମର୍ଶ ଅନୁରୋଧ',
    en: '+ Request Consultation',
  },
  offlineWarning: {
    or: 'ଆପଣ ଅଫଲାଇନ୍ ଅଛନ୍ତି। ପୂର୍ବରୁ ସାଇତିତ ତଥ୍ୟ ଉପଲବ୍ଧ ଅଛି ଏବଂ ନୂତନ ନୋଟ୍ ସ୍ଥାନୀୟ ଭାବରେ ସଂରକ୍ଷିତ ହେବ।',
    en: 'You are working offline. Cached records are available and new notes will be safely preserved locally.',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('ss_lang') as Language) || 'or';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ss_lang', lang);
  };

  const t = (key: keyof typeof translations): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return key as string;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
