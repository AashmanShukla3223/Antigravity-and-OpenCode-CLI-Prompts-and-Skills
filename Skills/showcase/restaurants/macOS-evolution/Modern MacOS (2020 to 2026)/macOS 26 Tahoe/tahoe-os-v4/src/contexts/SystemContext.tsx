import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type BootState = 'booting' | 'setup' | 'login' | 'desktop' | 'recovery' | 'activation';

export interface TahoeV3State {
  setup_complete: boolean;
  user: {
    fullName: string;
    accountName: string;
    password?: string;
    avatar?: string;
  };
  appearance: 'light' | 'dark' | 'auto';
  sidebarMaterial: 'clear' | 'tinted';
  betaUpdates: boolean;
  wallpaperUrl: string;
  wallpaperType: 'image' | 'video';
  dynamicWallpaperEnabled: boolean;
  isCameraOn: boolean;
  notchVisible: boolean;
  glassBlurIntensity: number;
  lowPowerMode: boolean;
  apiKey?: string;
}

const defaultState: TahoeV3State = {
  setup_complete: false,
  user: { fullName: '', accountName: '', password: '', avatar: '👤' },
  appearance: 'auto',
  sidebarMaterial: 'tinted',
  betaUpdates: false,
  wallpaperUrl: '/wallpapers/tahoe-light.png',
  wallpaperType: 'image',
  dynamicWallpaperEnabled: true,
  isCameraOn: false,
  notchVisible: true,
  glassBlurIntensity: 50,
  lowPowerMode: false,
  apiKey: (import.meta as any).env?.VITE_GEMINI_API_KEY || '',
};

interface SystemContextProps {
  bootState: BootState;
  setBootState: (state: BootState) => void;
  systemState: TahoeV3State;
  updateSystemState: (updates: Partial<TahoeV3State>) => void;
  resetSystem: (targetState?: BootState) => void;
  activeApp: string | null;
  setActiveApp: (appId: string | null) => void;
  openApps: string[];
  minimizedApps: string[];
  maximizedApps: string[];
  launchingApp: string | null;
  launchApp: (appId: string) => void;
  closeApp: (appId: string) => void;
  minimizeApp: (appId: string) => void;
  unminimizeApp: (appId: string) => void;
  toggleMaximizeApp: (appId: string) => void;
  showAboutWindow: boolean;
  setShowAboutWindow: (show: boolean) => void;
  showSpotlight: boolean;
  setShowSpotlight: (show: boolean) => void;
  showRestartDialog: boolean;
  setShowRestartDialog: (show: boolean) => void;
  contextMenu: { x: number; y: number; type: 'desktop' | 'item' | 'writing'; targetId?: string } | null;
  setContextMenu: (menu: { x: number; y: number; type: 'desktop' | 'item' | 'writing'; targetId?: string } | null) => void;
  // Hardware Info
  battery: { level: number; isCharging: boolean };
  wifi: boolean;
  setWifi: (val: boolean) => void;
  bluetooth: boolean;
  setBluetooth: (val: boolean) => void;
  powerMode: 'Low Power' | 'Normal' | 'High Performance';
  setPowerMode: (mode: 'Low Power' | 'Normal' | 'High Performance') => void;
  hardware: { cores: number; memory?: number };
  uptime: number;
}

const SystemContext = createContext<SystemContextProps | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bootState, setBootState] = useState<BootState>('booting');
  const [systemState, setSystemState] = useState<TahoeV3State>(defaultState);
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [openApps, setOpenApps] = useState<string[]>([]);
  const [minimizedApps, setMinimizedApps] = useState<string[]>([]);
  const [maximizedApps, setMaximizedApps] = useState<string[]>([]);
  const [launchingApp, setLaunchingApp] = useState<string | null>(null);
  const [showAboutWindow, setShowAboutWindow] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'desktop' | 'item' | 'writing'; targetId?: string } | null>(null);

  // Hardware State
  const [battery, setBattery] = useState({ level: 1, isCharging: true });
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [powerMode, setPowerMode] = useState<'Low Power' | 'Normal' | 'High Performance'>('Normal');
  const [uptime, setUptime] = useState(0);
  const [startTime] = useState(Date.now());

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tahoe_v3_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSystemState({ ...defaultState, ...parsed });
      }
    } catch (e) {
      console.error('Failed to parse tahoe_v3_state, clearing corrupted data', e);
      // Clear corrupted data to allow fresh start
      try {
        localStorage.removeItem('tahoe_v3_state');
      } catch (e2) {
        console.error('Failed to clear localStorage', e2);
      }
    }

    // Battery API with timeout to prevent hanging
    if ('getBattery' in navigator) {
      const batteryTimeout = setTimeout(() => {
        console.warn('Battery API timeout, continuing without battery info');
      }, 2000);
      
      Promise.race([
        (navigator as any).getBattery(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Battery API timeout')), 2000))
      ]).then((batt: any) => {
        clearTimeout(batteryTimeout);
        const updateBattery = () => {
          setBattery({
            level: batt.level,
            isCharging: batt.charging
          });
        };
        updateBattery();
        batt.addEventListener('levelchange', updateBattery);
        batt.addEventListener('chargingchange', updateBattery);
      }).catch((e) => {
        clearTimeout(batteryTimeout);
        console.warn('Battery API unavailable:', e);
      });
    }

    // Uptime Ticker
    const ticker = setInterval(() => {
      setUptime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    const handleLaunchApp = (e: any) => {
      if (e.detail) launchApp(e.detail);
    };
    window.addEventListener('launch-app', handleLaunchApp);
    return () => {
      window.removeEventListener('launch-app', handleLaunchApp);
      clearInterval(ticker);
    };
  }, []);

  // Power Mode Logic based on Battery & lowPowerMode state
  useEffect(() => {
    if (systemState.lowPowerMode) {
      setPowerMode('Low Power');
    } else {
      const level = battery.level * 100;
      if (level >= 50) setPowerMode('High Performance');
      else if (level >= 30) setPowerMode('Normal');
      else if (level <= 20) setPowerMode('Low Power');
    }
  }, [battery.level, systemState.lowPowerMode]);

  // Handle System-wide Appearance
  useEffect(() => {
    const root = window.document.documentElement;
    if (systemState.appearance === 'dark') {
      root.classList.add('dark');
    } else if (systemState.appearance === 'light') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [systemState.appearance]);

  const updateSystemState = useCallback((updates: Partial<TahoeV3State>) => {
    setSystemState(prev => {
      const newState = { ...prev, ...updates };
      localStorage.setItem('tahoe_v3_state', JSON.stringify(newState));
      return newState;
    });
  }, []);

  const resetSystem = useCallback((targetState: BootState = 'recovery') => {
    localStorage.removeItem('tahoe_v3_state');
    setSystemState(defaultState);
    setOpenApps([]);
    setMinimizedApps([]);
    setMaximizedApps([]);
    setActiveApp(null);
    setShowAboutWindow(false);
    setBootState(targetState);
  }, []);

  const launchApp = useCallback((appId: string) => {
    setOpenApps(prev => {
      if (prev.includes(appId)) {
        setMinimizedApps(m => m.filter(id => id !== appId));
        setActiveApp(appId);
        return prev;
      }
      return prev;
    });

    if (!openApps.includes(appId)) {
      setLaunchingApp(appId);
      setTimeout(() => {
        setOpenApps(current => {
          if (current.includes(appId)) return current;
          return [...current, appId];
        });
        setLaunchingApp(null);
        setActiveApp(appId);
      }, 1000);
    }
  }, [openApps]);

  const closeApp = useCallback((appId: string) => {
    setOpenApps(prev => prev.filter(id => id !== appId));
    setMinimizedApps(prev => prev.filter(id => id !== appId));
    setMaximizedApps(prev => prev.filter(id => id !== appId));
    setActiveApp(prev => prev === appId ? null : prev);
  }, []);

  const minimizeApp = useCallback((appId: string) => {
    setMinimizedApps(prev => {
      if (!prev.includes(appId)) return [...prev, appId];
      return prev;
    });
    if (activeApp === appId) {
      setActiveApp(null);
    }
  }, [activeApp]);

  const unminimizeApp = useCallback((appId: string) => {
    setMinimizedApps(prev => prev.filter(id => id !== appId));
    setActiveApp(appId);
  }, []);

  const toggleMaximizeApp = useCallback((appId: string) => {
    setMaximizedApps(prev => 
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  }, []);

  return (
    <SystemContext.Provider value={{
      bootState,
      setBootState,
      systemState,
      updateSystemState,
      resetSystem,
      activeApp,
      setActiveApp,
      openApps,
      minimizedApps,
      maximizedApps,
      launchingApp,
      launchApp,
      closeApp,
      minimizeApp,
      unminimizeApp,
      toggleMaximizeApp,
      showAboutWindow,
      setShowAboutWindow,
      showSpotlight,
      setShowSpotlight,
      showRestartDialog,
      setShowRestartDialog,
      contextMenu,
      setContextMenu,
      battery,
      wifi,
      setWifi,
      bluetooth,
      setBluetooth,
      powerMode,
      setPowerMode,
      hardware: { 
        cores: navigator.hardwareConcurrency || 8,
        memory: (performance as any).memory?.jsHeapSizeLimit ? Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024 / 1024) : 16
      },
      uptime
    }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};
