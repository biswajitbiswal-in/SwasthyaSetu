import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Home,
  Users,
  Video,
  FileCheck,
  ShieldAlert,
  Settings,
  RefreshCw,
  Stethoscope,
  Building2,
  Pill,
  PhoneCall,
  HardDrive,
  ArrowRight,
  PanelLeftClose,
  PanelLeftOpen,
  User
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRole } from '../../contexts/RoleContext';

interface NavLinkItem {
  to: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavSection {
  title: string;
  links: NavLinkItem[];
}

export const Sidebar: React.FC = () => {
  const { t, language } = useLanguage();
  const { currentUser, pendingSyncCount } = useRole();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('ss_sidebar_collapsed') === 'true';
  });

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('ss_sidebar_collapsed', String(next));
      return next;
    });
  };

  const getSections = (): NavSection[] => {
    if (currentUser.role === 'PATIENT') {
      return [
        {
          title: language === 'or' ? 'ମୋର ସ୍ୱାସ୍ଥ୍ୟ' : 'My Healthcare',
          links: [
            { to: '/patient', label: language === 'or' ? 'ସ୍ୱାସ୍ଥ୍ୟ କାର୍ଡ' : 'Health Pass', icon: Home },
            { to: '/patient/prescriptions', label: language === 'or' ? 'ଔଷଧ ଓ ପ୍ରେସକ୍ରିପସନ୍' : 'Prescriptions', icon: Pill },
            { to: '/patient/call', label: language === 'or' ? 'ଡାକ୍ତରୀ କଲ୍' : 'Consultation Call', icon: Video },
          ]
        },
        {
          title: language === 'or' ? 'ସହାୟତା' : 'Emergency',
          links: [
            { to: '/patient/emergency', label: language === 'or' ? '୧୦୮ ଆମ୍ବୁଲାନ୍ସ' : '108 Ambulance', icon: PhoneCall },
          ]
        }
      ];
    }

    if (currentUser.role === 'DOCTOR') {
      return [
        {
          title: language === 'or' ? 'କ୍ଲିନିକାଲ୍ ସେବା' : 'Clinical Care',
          links: [
            { to: '/doctor', label: language === 'or' ? 'ଟ୍ରାଏଜ୍ କ୍ୟୁ' : 'Triage Queue', icon: Stethoscope },
            { to: '/patients', label: t('navPatients'), icon: Users },
          ]
        },
        {
          title: language === 'or' ? 'ଡାଟା ସ୍ଥିତି' : 'Data & Sync',
          links: [
            { to: '/sync', label: t('navSync'), icon: RefreshCw, badge: pendingSyncCount > 0 ? pendingSyncCount : undefined },
          ]
        }
      ];
    }

    if (currentUser.role === 'ADMIN') {
      return [
        {
          title: language === 'or' ? 'ପ୍ରଶାସନ' : 'Operations',
          links: [
            { to: '/admin', label: language === 'or' ? 'ଓଭରଭିୟୁ' : 'System Overview', icon: Building2 },
            { to: '/admin/audit', label: t('navAudit'), icon: ShieldAlert },
            { to: '/admin/settings', label: t('navSettings'), icon: Settings },
          ]
        },
        {
          title: language === 'or' ? 'ଡାଟାବେସ୍' : 'Database & Sync',
          links: [
            { to: '/sync', label: t('navSync'), icon: RefreshCw },
          ]
        }
      ];
    }

    // Default ASHA Worker Navigation
    return [
      {
        title: language === 'or' ? 'କ୍ଷେତ୍ର ପରିଦର୍ଶନ' : 'Community Care',
        links: [
          { to: '/', label: t('navHome'), icon: Home },
          { to: '/patients', label: t('navPatients'), icon: Users },
          { to: '/consultations', label: language === 'or' ? 'କ୍ଷେତ୍ର ରେକର୍ଡ' : 'Field Records', icon: FileCheck },
        ]
      },
      {
        title: language === 'or' ? 'ଅଫଲାଇନ୍ ଡାଟା' : 'Offline Storage',
        links: [
          { to: '/sync', label: t('navSync'), icon: RefreshCw, badge: pendingSyncCount > 0 ? pendingSyncCount : undefined },
        ]
      }
    ];
  };

  const sections = getSections();

  return (
    <aside
      className={`hidden md:flex flex-col bg-[#17191C] text-white min-h-[calc(100vh-3.5rem)] p-3 shrink-0 font-sans border-r border-[#26292E] select-none transition-all duration-200 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-2 py-2 mb-3">
        <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-[#F5F5F2] p-1 flex items-center justify-center shrink-0 border border-[#2B2F36] shadow-sm overflow-hidden">
            <img
              src="/logo-square.jpg"
              alt="Swasthya Setu Logo"
              className="w-full h-full object-contain"
            />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center text-base font-bold tracking-tight leading-none truncate">
                <span className="text-white">Swasthya</span>
                <span className="text-[#F59E0B] ml-1">Setu</span>
              </div>
              <p className="text-[11px] text-[#8C9199] mt-1 font-medium tracking-tight truncate">
                {language === 'or' ? 'ସ୍ୱାସ୍ଥ୍ୟର ସେତୁ' : 'Bridge to Health'}
              </p>
            </div>
          )}
        </Link>

        {/* Collapse / Expand Toggle Button */}
        <button
          type="button"
          onClick={toggleCollapsed}
          className="p-1.5 rounded-lg text-[#8C9199] hover:text-white hover:bg-[#23262B] transition-colors shrink-0"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="space-y-4 flex-1 overflow-y-auto">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <p className="text-[10px] font-semibold text-[#5A5E66] uppercase tracking-wider px-3 mb-1.5 truncate">
                {section.title}
              </p>
            )}
            {section.links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/' || link.to === '/doctor' || link.to === '/admin' || link.to === '/patient'}
                  title={isCollapsed ? link.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#23262B] text-white font-semibold border-l-2 border-[#E88924] shadow-xs'
                        : 'text-[#8C9199] hover:text-white hover:bg-[#1E2125]'
                    }`
                  }
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{link.label}</span>}
                  </div>
                  {!isCollapsed && link.badge !== undefined && (
                    <span className="bg-[#E88924] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs shrink-0">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom User Profile & Storage Section */}
      <div className="mt-auto pt-3 space-y-2 border-t border-[#26292E]">
        {/* User Profile Card */}
        <div
          className={`flex items-center ${
            isCollapsed ? 'justify-center p-1.5' : 'gap-3 p-2.5'
          } rounded-xl bg-[#1E2125] border border-[#2B2F36]`}
        >
          <div className="w-8 h-8 rounded-lg bg-[#287D65]/20 border border-[#287D65]/30 text-[#287D65] flex items-center justify-center font-bold text-xs shrink-0">
            <User className="w-4 h-4 text-[#F59E0B]" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {currentUser.fullName.split(' (')[0]}
              </p>
              <p className="text-[10px] text-[#73777F] truncate">
                {currentUser.role} • {currentUser.facilityName.split(',')[0]}
              </p>
            </div>
          )}
        </div>

        {/* Offline Engine Indicator Card */}
        {!isCollapsed ? (
          <div className="rounded-xl bg-[#1E2125]/80 border border-[#2B2F36] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-6 h-6 rounded-md bg-[#E88924]/20 border border-[#E88924]/30 flex items-center justify-center text-[#E88924]">
                <HardDrive className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-semibold text-[#287D65] bg-[#287D65]/15 px-2 py-0.5 rounded-full border border-[#287D65]/25 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#287D65]" />
                <span>IndexedDB</span>
              </span>
            </div>

            <div>
              <p className="text-[11px] text-[#8C9199] leading-tight">
                {pendingSyncCount > 0 ? `${pendingSyncCount} drafts queued on device` : 'Local vault ready & synced'}
              </p>
            </div>

            <Link
              to="/sync"
              className="flex items-center justify-center gap-1 w-full py-1.5 bg-[#E88924] hover:bg-[#D27315] text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
            >
              <span>{pendingSyncCount > 0 ? 'Sync Now' : 'Sync Hub'}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <Link
            to="/sync"
            className="flex items-center justify-center p-2 rounded-xl bg-[#1E2125] hover:bg-[#26292E] text-[#E88924] border border-[#2B2F36] transition-colors"
            title="Open Offline Sync Hub"
          >
            <HardDrive className="w-4 h-4" />
          </Link>
        )}
      </div>
    </aside>
  );
};
