import React, { useState, useEffect, useRef } from 'react';
import { Search, Calendar, User, LogOut } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRole, UserRole } from '../../contexts/RoleContext';
import { NetworkBadge } from '../common/NetworkBadge';
import { SyncBadge } from '../common/SyncBadge';
import { LanguageToggle } from '../common/LanguageToggle';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Breadcrumbs } from '../ui/Breadcrumbs';

export const AppHeader: React.FC = () => {
  const { language } = useLanguage();
  const { currentUser, switchRole } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    switchRole(newRole);
    if (newRole === 'PATIENT') navigate('/patient');
    else if (newRole === 'ASHA') navigate('/');
    else if (newRole === 'DOCTOR') navigate('/doctor');
    else if (newRole === 'ADMIN') navigate('/admin');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/patients?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleResetSession = () => {
    localStorage.removeItem('ss_active_role');
    localStorage.removeItem('ss_sidebar_collapsed');
    window.location.href = '/';
  };

  // Determine breadcrumb path based on current route
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/') {
      return [{ label: language === 'or' ? 'ଡ୍ୟାସବୋର୍ଡ' : 'Community Care' }];
    }
    if (path === '/patients') {
      return [{ label: language === 'or' ? 'ରୋଗୀ ତାଲିକା' : 'Patients Directory' }];
    }
    if (path === '/consultations') {
      return [{ label: language === 'or' ? 'କ୍ଷେତ୍ର ରେକର୍ଡ' : 'Field Records & Referrals' }];
    }
    if (path === '/sync') {
      return [{ label: language === 'or' ? 'ସିଙ୍କ୍ କେନ୍ଦ୍ର' : 'Offline Storage & Sync Hub' }];
    }
    if (path === '/doctor') {
      return [{ label: language === 'or' ? 'ଟ୍ରାଏଜ୍ କ୍ୟୁ' : 'Clinical Triage Queue' }];
    }
    if (path === '/admin') {
      return [{ label: language === 'or' ? 'ପ୍ରଶାସନିକ ଓଭରଭିୟୁ' : 'Administrative Operations' }];
    }
    if (path === '/admin/audit') {
      return [
        { label: 'Admin', to: '/admin' },
        { label: language === 'or' ? 'ଅଡିଟ୍ ଲଗ୍' : 'Security Audit Trail' }
      ];
    }
    if (path === '/patient') {
      return [{ label: language === 'or' ? 'ଡିଜିଟାଲ୍ ସ୍ୱାସ୍ଥ୍ୟ କାର୍ଡ' : 'Digital Health Pass' }];
    }
    if (path === '/patient/prescriptions') {
      return [
        { label: 'Health Pass', to: '/patient' },
        { label: language === 'or' ? 'ଔଷଧ ସୂଚୀ' : 'Prescriptions & Advice' }
      ];
    }
    if (path === '/patient/emergency') {
      return [
        { label: 'Health Pass', to: '/patient' },
        { label: language === 'or' ? 'ଜରୁରୀକାଳୀନ ହେଲ୍ପଲାଇନ୍' : '108 Emergency Helplines' }
      ];
    }
    return [{ label: 'Overview' }];
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E6E7E9] shadow-xs">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Brand Logo OR Desktop Breadcrumb */}
        <div className="flex items-center gap-3">
          {/* Mobile Brand Logo (Visible only on phones) */}
          <Link to="/" className="flex items-center gap-2 md:hidden shrink-0 select-none">
            <div className="w-8 h-8 rounded-lg bg-[#F5F5F2] p-0.5 border border-[#E6E7E9] flex items-center justify-center overflow-hidden">
              <img src="/logo-square.jpg" alt="Swasthya Setu" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-sm text-[#202124] tracking-tight">
              Swasthya <span className="text-[#E88924]">Setu</span>
            </span>
          </Link>

          {/* Desktop Breadcrumbs */}
          <div className="hidden md:block">
            <Breadcrumbs items={getBreadcrumbs()} />
          </div>
        </div>

        {/* Center: Global Patient/Record Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative hidden sm:block">
          <Search className="w-4 h-4 text-[#73777F] absolute left-3.5 top-3" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'or'
                ? 'ରୋଗୀଙ୍କ ନାମ, ଲକ୍ଷଣ କିମ୍ବା OD-P କୋଡ୍ ସର୍ଚ୍ଚ କରନ୍ତୁ... (/)'
                : 'Search records, patients, complaints, OD-P codes... (/)'
            }
            className="w-full pl-10 pr-12 py-2 bg-[#F5F5F2] hover:bg-white focus:bg-white border border-[#E6E7E9] rounded-xl text-xs text-[#202124] placeholder-[#73777F] focus:outline-none focus:border-[#E88924] transition-all"
          />
          <kbd className="absolute right-3 top-2.5 text-[10px] font-mono text-[#73777F] bg-white px-1.5 py-0.5 rounded border border-[#E6E7E9] pointer-events-none">
            /
          </kbd>
        </form>

        {/* Right side: System Info, Network, Sync, Profile */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
          {/* Shift / Facility Context Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F5F2] border border-[#E6E7E9] text-xs text-[#202124] font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#E88924]" />
            <span className="truncate max-w-[180px]">{currentUser.facilityName.split(',')[0]}</span>
          </div>

          {/* Network State Indicator */}
          <NetworkBadge />

          {/* Sync Status Badge */}
          <SyncBadge />

          {/* Odia / English Switcher */}
          <LanguageToggle />

          {/* User Profile Pill & Role Switcher */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#E6E7E9]">
            <div className="w-8 h-8 rounded-full bg-[#17191C] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              <User className="w-4 h-4 text-[#F59E0B]" />
            </div>

            <div className="hidden sm:block text-left">
              <select
                value={currentUser.role}
                onChange={handleRoleChange}
                className="text-xs font-semibold text-[#202124] bg-transparent cursor-pointer focus:outline-none pr-1"
                title="Switch active role"
                aria-label="Switch active role"
              >
                <option value="ASHA">Sunita Behera (ASHA)</option>
                <option value="DOCTOR">Dr. A. Patnaik (Doctor)</option>
                <option value="PATIENT">Gitanjali Majhi (Patient)</option>
                <option value="ADMIN">State Admin (OD-HFW)</option>
              </select>
              <p className="text-[10px] text-[#73777F] -mt-0.5">
                {currentUser.role === 'ASHA' ? 'Frontline Worker' : currentUser.role}
              </p>
            </div>

            {/* Reset / Sign Out */}
            <button
              type="button"
              onClick={handleResetSession}
              className="p-1.5 rounded-lg text-[#73777F] hover:text-[#C44747] hover:bg-[#FDF2F2] transition-colors ml-1"
              title="Reset session / Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
