import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, FileText, RefreshCw, Pill, Video, PhoneCall, Stethoscope } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRole } from '../../contexts/RoleContext';

export const BottomNav: React.FC = () => {
  const { t, language } = useLanguage();
  const { currentUser, pendingSyncCount } = useRole();

  const getNavItems = () => {
    if (currentUser.role === 'PATIENT') {
      return [
        { to: '/patient', label: t('navHome'), icon: Home },
        { to: '/patient/prescriptions', label: language === 'or' ? 'ଔଷଧ' : 'Rx', icon: Pill },
        { to: '/patient/call', label: language === 'or' ? 'କଲ୍' : 'Call', icon: Video },
        { to: '/patient/emergency', label: language === 'or' ? '୧୦୮' : '108 Help', icon: PhoneCall },
      ];
    }

    if (currentUser.role === 'DOCTOR') {
      return [
        { to: '/doctor', label: language === 'or' ? 'ଟ୍ରାଏଜ୍' : 'Triage', icon: Stethoscope },
        { to: '/patients', label: t('navPatients'), icon: Users },
        {
          to: '/sync',
          label: t('navSync'),
          icon: RefreshCw,
          badge: pendingSyncCount > 0 ? pendingSyncCount : undefined,
        },
      ];
    }

    // Default ASHA Worker Navigation
    return [
      { to: '/', label: t('navHome'), icon: Home },
      { to: '/patients', label: t('navPatients'), icon: Users },
      {
        to: '/consultations',
        label: language === 'or' ? 'ରେକର୍ଡ' : 'Field Records',
        icon: FileText
      },
      {
        to: '/sync',
        label: t('navSync'),
        icon: RefreshCw,
        badge: pendingSyncCount > 0 ? pendingSyncCount : undefined,
      },
    ];
  };

  const navItems = getNavItems();
  const colCount = navItems.length === 3 ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E6E7E9] shadow-md md:hidden font-sans select-none">
      <div className={`grid ${colCount} h-14`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/' || item.to === '/doctor' || item.to === '/patient'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 transition-all relative ${
                  isActive
                    ? 'text-[#E88924] font-bold before:absolute before:top-0 before:w-8 before:h-0.5 before:bg-[#E88924] before:rounded-full'
                    : 'text-[#73777F] hover:text-[#202124]'
                }`
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-0.5" />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-[#E88924] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] truncate max-w-[70px] leading-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
