import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { NetworkSimulatorBar } from '../common/NetworkSimulatorBar';
import { useNetwork } from '../../contexts/NetworkContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { AlertTriangle } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { isOnline, isServerReachable, isLowBandwidth } = useNetwork();
  const { t, language } = useLanguage();
  const location = useLocation();

  const isDisconnected = !isOnline || !isServerReachable;
  const isImmersiveCallRoute =
    location.pathname === '/doctor/telemedicine' ||
    location.pathname === '/patient/call';

  // Dedicated Immersive Viewport Mode for Telemedicine Consultations
  if (isImmersiveCallRoute) {
    return (
      <div className="min-h-screen bg-[#F5F5F2] flex flex-col text-[#202124] font-sans antialiased">
        {/* Interactive Simulator & Tester Bar */}
        <NetworkSimulatorBar />

        {/* Immersive Main Container spanning 92-96% of available viewport */}
        <main className="flex-1 w-full max-w-[1750px] mx-auto p-2 sm:p-4 lg:p-6 flex flex-col min-h-0">
          <Outlet />
        </main>
      </div>
    );
  }

  // Standard Dashboard & Administrative Layout
  return (
    <div className="min-h-screen bg-[#F5F5F2] flex text-[#202124] font-sans antialiased">
      {/* Desktop Navigation Dark Charcoal Sidebar */}
      <Sidebar />

      {/* Main Content Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Interactive Simulator & Tester Bar */}
        <NetworkSimulatorBar />

        {/* Global Navigation Header */}
        <AppHeader />

        {/* Low-Bandwidth 2G Alert Banner */}
        {isLowBandwidth && (
          <div className="bg-[#FFF7ED] border-b border-[#FED7AA] text-[#C96E14] px-4 py-1.5 text-xs font-semibold flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E88924] animate-ping"></span>
            <span>
              {language === 'or'
                ? 'ଦୁର୍ବଳ ନେଟୱର୍କ ସୂଚନା: କଲ୍ ଗୁଡ଼ିକ ଅଡିଓ-ମୋଡ୍‌ରେ କରାଯିବ ଏବଂ ଫଟୋ ଅପଲୋଡ୍ କ୍ୟୁରେ ରହିବ।'
                : 'Low-Bandwidth Detected: Real-time calls will operate in audio-only mode to conserve data.'}
            </span>
          </div>
        )}

        {/* Offline Mode Alert Banner (Honest state indicator) */}
        {isDisconnected && (
          <div className="bg-[#FFF7ED] border-b border-[#FED7AA] text-[#C96E14] px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs">
            <AlertTriangle className="w-4 h-4 text-[#E88924] shrink-0" />
            <span>{t('offlineWarning')}</span>
          </div>
        )}

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile-First Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
};
