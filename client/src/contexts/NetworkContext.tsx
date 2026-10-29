import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type NetworkSimulationMode = 'REAL' | 'FORCE_ONLINE_4G' | 'FORCE_LOW_2G' | 'FORCE_OFFLINE';

interface NetworkContextType {
  isOnline: boolean;
  isServerReachable: boolean;
  isLowBandwidth: boolean;
  simulationMode: NetworkSimulationMode;
  setSimulationMode: (mode: NetworkSimulationMode) => void;
  lastHeartbeat: Date | null;
  checkConnectivity: () => Promise<boolean>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [realOnline, setRealOnline] = useState<boolean>(navigator.onLine);
  const [realReachable, setRealReachable] = useState<boolean>(true);
  const [simulationMode, setSimulationMode] = useState<NetworkSimulationMode>('REAL');
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null);

  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    if (!navigator.onLine) {
      setRealOnline(false);
      setRealReachable(false);
      return false;
    }

    try {
      const res = await fetch('/api/v1/health', {
        method: 'HEAD',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const reachable = res.ok;
      setRealReachable(reachable);
      setRealOnline(true);
      if (reachable) setLastHeartbeat(new Date());
      return reachable;
    } catch {
      setRealReachable(false);
      return false;
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setRealOnline(true);
      checkConnectivity();
    };

    const handleOffline = () => {
      setRealOnline(false);
      setRealReachable(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    checkConnectivity();
    const interval = setInterval(checkConnectivity, 20000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [checkConnectivity]);

  // Derived effective state based on simulation mode
  const effectiveOnline = simulationMode === 'FORCE_OFFLINE'
    ? false
    : simulationMode === 'FORCE_ONLINE_4G' || simulationMode === 'FORCE_LOW_2G'
    ? true
    : realOnline && realReachable;

  const effectiveReachable = simulationMode === 'FORCE_OFFLINE'
    ? false
    : simulationMode === 'FORCE_ONLINE_4G' || simulationMode === 'FORCE_LOW_2G'
    ? true
    : realReachable;

  const isLowBandwidth = simulationMode === 'FORCE_LOW_2G';

  return (
    <NetworkContext.Provider
      value={{
        isOnline: effectiveOnline,
        isServerReachable: effectiveReachable,
        isLowBandwidth,
        simulationMode,
        setSimulationMode,
        lastHeartbeat,
        checkConnectivity,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}
