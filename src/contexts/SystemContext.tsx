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
  wallpaperUrl: string;
  wallpaperType: 'image' | 'video';
  isCameraOn: boolean;
  notchVisible: boolean;
  glassBlurIntensity: number;
}

const defaultState: TahoeV3State = {
  setup_complete: false,
  user: { fullName: '', accountName: '', password: '', avatar: '👤' },
  appearance: 'auto',
  wallpaperUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fm=webp',
  wallpaperType: 'image',
  isCameraOn: false,
  notchVisible: true,
  glassBlurIntensity: 50,
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
  contextMenu: { x: number; y: number; type: 'desktop' | 'item'; targetId?: string } | null;
  setContextMenu: (menu: { x: number; y: number; type: 'desktop' | 'item'; targetId?: string } | null) => void;
  // Hardware Info
  battery: { level: number; isCharging: boolean };
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
  const [showAboutWindow, setShowAboutWindow] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'desktop' | 'item'; targetId?: string } | null>(null);

  // Hardware State
  const [battery, setBattery] = useState({ level: 1, isCharging: true });
  const [uptime, setUptime] = useState(0);
  const [startTime] = useState(Date.now());

  // Initialize from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('tahoe_v3_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration check for old wallpaper field
        if (parsed.wallpaper && !parsed.wallpaperUrl) {
          parsed.wallpaperUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fm=webp';
          parsed.wallpaperType = 'image';
          delete parsed.wallpaper;
        }
        setSystemState({ ...defaultState, ...parsed });
      } catch (e) {
        console.error('Failed to parse tahoe_v3_state', e);
      }
    }

    // Battery API
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((batt: any) => {
        const updateBattery = () => {
          setBattery({
            level: batt.level,
            isCharging: batt.charging
          });
        };
        updateBattery();
        batt.addEventListener('levelchange', updateBattery);
        batt.addEventListener('chargingchange', updateBattery);
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

  // Handle System-wide Appearance
  useEffect(() => {
    const root = window.document.documentElement;
    if (systemState.appearance === 'dark') {
      root.classList.add('dark');
    } else if (systemState.appearance === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto
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
      if (!prev.includes(appId)) {
        return [...prev, appId];
      }
      return prev;
    });
    // If it was minimized, unminimize it
    setMinimizedApps(prev => prev.filter(id => id !== appId));
    setActiveApp(appId);
  }, []);

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
