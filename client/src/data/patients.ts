export type UrgencyCategory = 'ROUTINE' | 'URGENT' | 'EMERGENCY';

export interface PatientRecord {
  id: string;
  patientCode: string;
  fullName: string;
  fullNameOdia: string;
  age: number;
  gender: 'FEMALE' | 'MALE' | 'OTHER';
  village: string;
  subCenter: string;
  phcName: string;
  assignedAsha: string;
  phone: string;
  chiefComplaint: string;
  chiefComplaintOdia: string;
  waitingTime: string;
  lastVisitDate: string;
  urgency: UrgencyCategory;
  urgencyReason: string;
  triageWorkflow: string;
  vitals: {
    bp: string;
    pulse: number;
    spo2: number;
    tempF: number;
    respiratoryRate?: number;
  };
  allergies: string[];
  chronicConditions: string[];
  pastEncounters: Array<{
    date: string;
    type: string;
    diagnosis: string;
    prescribedBy: string;
    syncState: 'SYNCED' | 'SAVED_LOCAL' | 'PENDING_SYNC';
  }>;
  connectionStatus: 'ONLINE_READY' | 'LOW_BANDWIDTH_2G' | 'OFFLINE';
  isCached: boolean;
  lastSyncedAt: string;
}

export const PATIENTS_DATABASE: PatientRecord[] = [
  {
    id: '7b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    patientCode: 'OD-P-10042',
    fullName: 'Gitanjali Majhi',
    fullNameOdia: 'ଗୀତାଞ୍ଜଳି ମାଝୀ',
    age: 28,
    gender: 'FEMALE',
    village: 'Nuapada Village',
    subCenter: 'Nuapada Sub-Center',
    phcName: 'Nuapada Community Health Center (CHC)',
    assignedAsha: 'Sunita Behera (ASHA ID: ASH-NUA-014)',
    phone: '+91 98612 00001',
    chiefComplaint: 'High fever for 3 days with shivering, severe joint pain, fatigue, and dry oral mucosa.',
    chiefComplaintOdia: '୩ ଦିନ ଧରି ଥରି ଉଚ୍ଚ ଜ୍ୱର, ଗଣ୍ଠି ଯନ୍ତ୍ରଣା ଏବଂ ଶୋଷ ହେବା।',
    waitingTime: '12 mins waiting',
    lastVisitDate: '14 Oct 2026',
    urgency: 'URGENT',
    urgencyReason: 'Documented high-grade fever (>101.4°F) with rigors and marked dehydration in a known malaria-endemic sector.',
    triageWorkflow: 'Immediate doctor teleconsultation within 15 minutes. Conduct rapid diagnostic test (RDT) for Plasmodium falciparum/vivax and administer ORS hydration.',
    vitals: {
      bp: '120/80',
      pulse: 78,
      spo2: 98,
      tempF: 101.4,
      respiratoryRate: 18,
    },
    allergies: ['Penicillin (Moderate rash)'],
    chronicConditions: ['Mild Nutritional Anemia (Hb 10.2 g/dL)'],
    pastEncounters: [
      {
        date: '14 Oct 2026',
        type: 'Field ANC Follow-up',
        diagnosis: 'Second Trimester Healthy Routine Check',
        prescribedBy: 'Sunita Behera (ASHA)',
        syncState: 'SYNCED',
      },
      {
        date: '02 Jun 2026',
        type: 'CHC Outpatient',
        diagnosis: 'Acute Gastroenteritis (Resolved)',
        prescribedBy: 'Dr. Abhiram Patnaik',
        syncState: 'SYNCED',
      },
    ],
    connectionStatus: 'ONLINE_READY',
    isCached: true,
    lastSyncedAt: 'Today 08:30 AM',
  },
  {
    id: '8c2a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c',
    patientCode: 'OD-P-10043',
    fullName: 'Debendra Behera',
    fullNameOdia: 'ଦେବେନ୍ଦ୍ର ବେହେରା',
    age: 54,
    gender: 'MALE',
    village: 'Nuapada Village',
    subCenter: 'Nuapada Sub-Center',
    phcName: 'Nuapada Community Health Center (CHC)',
    assignedAsha: 'Sunita Behera (ASHA ID: ASH-NUA-014)',
    phone: '+91 98612 00002',
    chiefComplaint: 'Monthly hypertension routine follow-up and medicine renewal; occasional morning headache.',
    chiefComplaintOdia: 'ଉଚ୍ଚ ରକ୍ତଚାପ ନିୟମିତ ପରୀକ୍ଷା ଏବଂ ଔଷଧ ସରିଯିବା।',
    waitingTime: '28 mins waiting',
    lastVisitDate: '28 Sep 2026',
    urgency: 'ROUTINE',
    urgencyReason: 'Non-emergency maintenance review for essential hypertension. Patient ambulatory with stable vitals.',
    triageWorkflow: 'Standard teleconsultation queue. Verify compliance with Amlodipine 5mg and record bilateral BP readings.',
    vitals: {
      bp: '138/88',
      pulse: 72,
      spo2: 97,
      tempF: 98.4,
      respiratoryRate: 16,
    },
    allergies: ['None reported'],
    chronicConditions: ['Essential Hypertension (Stage 1)', 'Mild Osteoarthritis of knees'],
    pastEncounters: [
      {
        date: '28 Sep 2026',
        type: 'Sub-Center NCD Screening',
        diagnosis: 'Hypertension stable on monotherapy',
        prescribedBy: 'Dr. Abhiram Patnaik',
        syncState: 'SYNCED',
      },
    ],
    connectionStatus: 'ONLINE_READY',
    isCached: true,
    lastSyncedAt: 'Today 08:30 AM',
  },
  {
    id: '9d3a4b5c-6e7f-8a9b-0c1d-2e3f4a5b6c7d',
    patientCode: 'OD-P-10044',
    fullName: 'Padmini Rout',
    fullNameOdia: 'ପଦ୍ମିନୀ ରାଉତ',
    age: 32,
    gender: 'FEMALE',
    village: 'Badapada Hamlet',
    subCenter: 'Badapada Sub-Center',
    phcName: 'Nuapada Community Health Center (CHC)',
    assignedAsha: 'Pramila Majhi (ASHA ID: ASH-BAD-009)',
    phone: '+91 98612 00003',
    chiefComplaint: 'Acute wheezing and shortness of breath exacerbated by seasonal paddy harvesting smoke.',
    chiefComplaintOdia: 'ଶ୍ୱାସକଷ୍ଟ ଏବଂ ଛାତି ଘଡ଼ଘଡ଼ ଶବ୍ଦ ହେବା।',
    waitingTime: '45 mins waiting',
    lastVisitDate: '10 Aug 2026',
    urgency: 'EMERGENCY',
    urgencyReason: 'Severe bronchial spasm with resting SpO2 at 92% and marked expiratory wheeze requiring urgent bronchodilator triage.',
    triageWorkflow: 'High-priority clinical assessment. Prepare Salbutamol nebulization at sub-center; if SpO2 drops below 90%, dispatch 108 ambulance for CHC escalation.',
    vitals: {
      bp: '118/76',
      pulse: 94,
      spo2: 92,
      tempF: 99.1,
      respiratoryRate: 26,
    },
    allergies: ['Sulfa Drugs'],
    chronicConditions: ['Bronchial Asthma (Moderate persistent)'],
    pastEncounters: [
      {
        date: '10 Aug 2026',
        type: 'Emergency Nebulization',
        diagnosis: 'Acute asthmatic exacerbation',
        prescribedBy: 'Dr. Abhiram Patnaik',
        syncState: 'SYNCED',
      },
    ],
    connectionStatus: 'LOW_BANDWIDTH_2G',
    isCached: false,
    lastSyncedAt: 'Yesterday 05:00 PM',
  },
  {
    id: '1e2f3a4b-5c6d-7e8f-9a0b-1c2d3e4f5a6b',
    patientCode: 'OD-P-10045',
    fullName: 'Sitaram Majhi',
    fullNameOdia: 'ସୀତାରାମ ମାଝୀ',
    age: 41,
    gender: 'MALE',
    village: 'Nuapada Village',
    subCenter: 'Nuapada Sub-Center',
    phcName: 'Nuapada Community Health Center (CHC)',
    assignedAsha: 'Sunita Behera (ASHA ID: ASH-NUA-014)',
    phone: '+91 98612 00004',
    chiefComplaint: 'Blood sugar check and non-healing superficial wound on left heel after agricultural field work.',
    chiefComplaintOdia: 'ମଧୁମେହ ପରୀକ୍ଷା ଏବଂ ଗୋଇଠିରେ ଥିବା ଘା ନ ଶୁଖିବା।',
    waitingTime: '1 hr waiting',
    lastVisitDate: '05 Sep 2026',
    urgency: 'URGENT',
    urgencyReason: 'Diabetic foot ulcer risk with random blood glucose 210 mg/dL requiring wound antiseptic dressing and oral antibiotic evaluation.',
    triageWorkflow: 'Clinical review of wound photography. Inspect peripheral pulses and prescribe appropriate topical dressing and glycemic management.',
    vitals: {
      bp: '128/82',
      pulse: 74,
      spo2: 98,
      tempF: 98.6,
      respiratoryRate: 16,
    },
    allergies: ['None reported'],
    chronicConditions: ['Type-2 Diabetes Mellitus (HbA1c 8.4%)'],
    pastEncounters: [
      {
        date: '05 Sep 2026',
        type: 'Routine Diabetic Review',
        diagnosis: 'Type-2 Diabetes uncontrolled on Metformin 500mg',
        prescribedBy: 'Dr. Abhiram Patnaik',
        syncState: 'SYNCED',
      },
    ],
    connectionStatus: 'ONLINE_READY',
    isCached: false,
    lastSyncedAt: 'Yesterday 02:15 PM',
  },
];
