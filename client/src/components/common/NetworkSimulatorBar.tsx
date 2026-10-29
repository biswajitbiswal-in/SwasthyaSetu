import React, { useState } from 'react';
import { Wifi, SignalLow, WifiOff, RefreshCw, ChevronDown, ChevronUp, Cpu } from 'lucide-react';
import { useNetwork, NetworkSimulationMode } from '../../contexts/NetworkContext';
import { useRole, UserRole } from '../../contexts/RoleContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

export const NetworkSimulatorBar: React.FC = () => {
  const { simulationMode, setSimulationMode } = useNetwork();
  const { currentUser, switchRole } = useRole();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const handleNetworkChange = (mode: NetworkSimulationMode) => {
    setSimulationMode(mode);
    if (mode === 'FORCE_OFFLINE') {
      showToast(
        language === 'or' ? 'ଅଫଲାଇନ୍ ମୋଡ୍ ସକ୍ରିୟ — ସମସ୍ତ ତଥ୍ୟ ସ୍ଥାନୀୟ IndexedDB ରେ ସାଇତା ହେବ' : 'Offline Mode Active: Local storage buffer active (IndexedDB)',
        'warning'
      );
    } else if (mode === 'FORCE_LOW_2G') {
      showToast(
        language === 'or' ? 'ଦୁର୍ବଳ ୨ଜି ନେଟୱର୍କ ସକ୍ରିୟ — ଭିଡିଓ ଅଡିଓ-ମୋଡ୍ କୁ ଖସିଯିବ' : 'Simulating Weak 2G: Video call automatically adapts to audio-only',
        'info'
      );
    } else if (mode === 'FORCE_ONLINE_4G') {
      showToast(
        language === 'or' ? 'ଦ୍ରୁତ ୪ଜି ନେଟୱର୍କ ସଂଯୋଗ ହେଲା — ସିଙ୍କ୍ ଆରମ୍ଭ ହୋଇପାରିବ' : 'Fast 4G Link Active: Server sync ready',
        'success'
      );
    } else {
      showToast('Restored real device network listeners', 'info');
    }
  };

  const handleRoleChange = (role: UserRole) => {
    switchRole(role);
    showToast(
      language === 'or' ? `ସ୍ୱିଚ୍ ହେଲା: ${role}` : `Switched active role: ${role}`,
      'info'
    );
    if (role === 'PATIENT' || role === 'ASHA') navigate('/');
    else if (role === 'DOCTOR') navigate('/doctor');
    else if (role === 'ADMIN') navigate('/admin');
  };

  return (
    <div className="bg-[#17191C] border-b border-white/10 text-slate-300 text-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between gap-3 flex-wrap">
        {/* Left: Indicator & Simulator Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white text-[11px] font-medium transition-colors border border-white/10"
            title="Toggle environment simulation panel"
          >
            <Cpu className="w-3.5 h-3.5 text-amberOrange-500" />
            <span>Network Resilience Test Bench</span>
            {isOpen ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
          </button>

          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-slate-400">
            Network State:
            <span className="font-semibold text-white">
              {simulationMode === 'FORCE_OFFLINE' && 'Offline (0 bps • IndexedDB Buffering)'}
              {simulationMode === 'FORCE_LOW_2G' && 'Weak 2G (High Latency • Audio Fallback)'}
              {simulationMode === 'FORCE_ONLINE_4G' && 'Online (4G / Wi-Fi • Sync Ready)'}
              {simulationMode === 'REAL' && 'Live Device Network'}
            </span>
          </span>
        </div>

        {/* Right: Quick Role Switcher */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 hidden md:inline mr-1">Switch Persona:</span>
          {(['ASHA', 'DOCTOR', 'PATIENT', 'ADMIN'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => handleRoleChange(r)}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                currentUser.role === r
                  ? 'bg-amberOrange-600 text-white font-bold shadow-2xs'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Dropdown Tray */}
      {isOpen && (
        <div className="border-t border-white/10 bg-[#111315] px-4 py-3">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 text-[11px]">
              Simulate real rural edge conditions to test offline queues, idempotent retries, and audio fallback:
            </span>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleNetworkChange('FORCE_ONLINE_4G')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                  simulationMode === 'FORCE_ONLINE_4G'
                    ? 'bg-emerald-950/70 border-forestGreen-500 text-emerald-300 font-semibold'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <Wifi className="w-3.5 h-3.5 text-forestGreen-500" />
                <span>4G (Fast Link)</span>
              </button>

              <button
                onClick={() => handleNetworkChange('FORCE_LOW_2G')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                  simulationMode === 'FORCE_LOW_2G'
                    ? 'bg-amber-950/70 border-amberOrange-500 text-amberOrange-400 font-semibold'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <SignalLow className="w-3.5 h-3.5 text-amberOrange-500" />
                <span>2G (Audio Fallback)</span>
              </button>

              <button
                onClick={() => handleNetworkChange('FORCE_OFFLINE')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                  simulationMode === 'FORCE_OFFLINE'
                    ? 'bg-red-950/70 border-crimsonRed-500 text-red-300 font-semibold'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <WifiOff className="w-3.5 h-3.5 text-crimsonRed-500" />
                <span>Offline (0 bps)</span>
              </button>

              <button
                onClick={() => handleNetworkChange('REAL')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                  simulationMode === 'REAL'
                    ? 'bg-white/15 border-white/30 text-white font-semibold'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Hardware Link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
