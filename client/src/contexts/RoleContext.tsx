import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'PATIENT' | 'ASHA' | 'DOCTOR' | 'ADMIN';

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  facilityName: string;
  phone?: string;
}

export const MOCK_USERS: Record<UserRole, UserProfile> = {
  PATIENT: {
    id: '7b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    username: 'gitanjali_majhi',
    fullName: 'Gitanjali Majhi (ଗୀତାଞ୍ଜଳି ମାଝୀ)',
    role: 'PATIENT',
    facilityName: 'Nuapada Village Sub-Center',
    phone: '+91 98612 00001'
  },
  ASHA: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    username: 'asha_sunita',
    fullName: 'Sunita Behera (ସୁନୀତା ବେହେରା)',
    role: 'ASHA',
    facilityName: 'Nuapada Sub-Center, Nuapada',
    phone: '+91 98612 34567'
  },
  DOCTOR: {
    id: '660e8400-e29b-41d4-a716-446655440001',
    username: 'dr_patnaik',
    fullName: 'Dr. Abhiram Patnaik (ଡା. ଅଭିରାମ ପଟ୍ଟନାୟକ)',
    role: 'DOCTOR',
    facilityName: 'Nuapada Community Health Center (CHC)',
    phone: '+91 94370 12345'
  },
  ADMIN: {
    id: '770e8400-e29b-41d4-a716-446655440002',
    username: 'admin_odisha',
    fullName: 'State Admin (ଓଡ଼ିଶା ସ୍ୱାସ୍ଥ୍ୟ ପ୍ରଶାସନ)',
    role: 'ADMIN',
    facilityName: 'Directorate of Health Services, Bhubaneswar',
    phone: '+91 674 2390123'
  }
};

interface RoleContextType {
  currentUser: UserProfile;
  switchRole: (role: UserRole) => void;
  pendingSyncCount: number;
  setPendingSyncCount: React.Dispatch<React.SetStateAction<number>>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('ss_active_role') as UserRole;
    return (saved && MOCK_USERS[saved]) ? MOCK_USERS[saved] : MOCK_USERS.ASHA;
  });

  const [pendingSyncCount, setPendingSyncCount] = useState<number>(2); // 2 offline notes pending by default for demo realism

  const switchRole = (role: UserRole) => {
    setCurrentUser(MOCK_USERS[role]);
    localStorage.setItem('ss_active_role', role);
  };

  return (
    <RoleContext.Provider value={{ currentUser, switchRole, pendingSyncCount, setPendingSyncCount }}>
      {children}
    </RoleContext.Provider>
  );
};

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
