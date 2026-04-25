import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type BootState = 'booting' | 'setup' | 'login' | 'desktop' | 'recovery' | 'activation';

export interface Widget {
  id: string;
  type: 'reminders' | 'facetime' | 'music' | 'weather' | 'all-apps' | 'connected-devices';
  x: number;
  y: number;
  size: 'small' | 'medium' | 'large';
}

export interface Reminder {
  id: number;
  text: string;
  completed: boolean;
}

export interface MusicState {
  currentSongIndex: number;
  isPlaying: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  lastModified: number;
}

export interface ActiveError {
  id: string;
  x: number;
  y: number;
  message: string;
  icon: string;
}

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
  widgets: Widget[];
  reminders: Reminder[];
  music: MusicState;
  runningApps: string[];
  pinnedApps: string[];
  notes: Note[];
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
  widgets: [],
  reminders: [
    { id: 1, text: 'Finalize macOS Tahoe Core', completed: false },
    { id: 2, text: 'Review Liquid Glass Physics', completed: true },
    { id: 3, text: 'Sync Sovereign Identity', completed: false },
  ],
  music: {
    currentSongIndex: 0,
    isPlaying: false
  },
  runningApps: [],
  pinnedApps: ['finder', 'safari', 'messages', 'music', 'photos', 'calendar', 'appstore', 'notes', 'settings'],
  notes: [
    { 
      id: '1', 
      title: 'Tahoe OS Vision', 
      content: 'The "Unit 7" era is about fluid interfaces and silicon-native glass. We must push Framer Motion to its limits.', 
      date: '10:42 AM', 
      lastModified: Date.now() 
    },
    { 
      id: '2', 
      title: 'AI Integration Ideas', 
      content: 'Apple Intelligence should handle tone adjustment in Notes and automatic summarization of long thoughts.', 
      date: 'Yesterday', 
      lastModified: Date.now() - 86400000 
    }
  ]
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
  quitApp: (appId: string) => void;
  minimizeApp: (appId: string) => void;
  unminimizeApp: (appId: string) => void;
  toggleMaximizeApp: (appId: string) => void;
  showAboutWindow: boolean;
  setShowAboutWindow: (show: boolean) => void;
  showSpotlight: boolean;
  setShowSpotlight: (show: boolean) => void;
  showRestartDialog: boolean;
  setShowRestartDialog: (show: boolean) => void;
  showWidgetPicker: boolean;
  setShowWidgetPicker: (show: boolean) => void;
  incomingCall: { contact: any; type: 'facetime' | 'phone' } | null;
  setIncomingCall: (call: { contact: any; type: 'facetime' | 'phone' } | null) => void;
  contextMenu: { x: number; y: number; type: 'desktop' | 'item' | 'writing' | 'dock'; targetId?: string } | null;
  setContextMenu: (menu: { x: number; y: number; type: 'desktop' | 'item' | 'writing' | 'dock'; targetId?: string } | null) => void;
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
  systemErrors: ActiveError[];
  triggerSystemError: () => void;
  clearSystemErrors: () => void;
}

const SystemContext = createContext<SystemContextProps | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bootState, setBootState] = useState<BootState>('booting');
  const [systemState, setSystemState] = useState<TahoeV3State>(() => {
    try {
      const saved = localStorage.getItem('tahoe_v3_state');
      if (saved) {
        return { ...defaultState, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to parse tahoe_v3_state', e);
    }
    return defaultState;
  });
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [openApps, setOpenApps] = useState<string[]>([]);
  const [minimizedApps, setMinimizedApps] = useState<string[]>([]);
  const [maximizedApps, setMaximizedApps] = useState<string[]>([]);
  const [launchingApp, setLaunchingApp] = useState<string | null>(null);
  const [showAboutWindow, setShowAboutWindow] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{ contact: any; type: 'facetime' | 'phone' } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'desktop' | 'item' | 'writing' | 'dock'; targetId?: string } | null>(null);

  // Hardware State
  const [battery, setBattery] = useState({ level: 1, isCharging: true });
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [powerMode, setPowerMode] = useState<'Low Power' | 'Normal' | 'High Performance'>('Normal');
  const [uptime, setUptime] = useState(0);
  const [startTime] = useState(() => Date.now());

  // Global Error Storm State
  const [systemErrors, setSystemErrors] = useState<ActiveError[]>([]);
  const stormIntervalRef = React.useRef<any>(null);

  const clearSystemErrors = useCallback(() => {
    if (stormIntervalRef.current) clearInterval(stormIntervalRef.current);
    stormIntervalRef.current = null;
    setSystemErrors([]);
  }, []);

  const triggerSystemError = useCallback(() => {
    if (stormIntervalRef.current) return;
    
    let count = 0;
    const ERROR_MESSAGES = [
      "The disk is full of bubbles",
      "Kernel Panic: Too much vibe",
      "Memory Leak in the Gold Mine",
      "System Overheating: Silicon Meltdown",
      "Quantum Bit Flip detected in Reality",
      "Logic Error: App is too cool for this OS",
      "Refractive Index out of bounds",
      "Glass Blur is becoming solid",
      "User Identity found in Trash",
      "Finder found something it shouldn't have",
      "CPU is vibing too hard",
      "GPU is drawing outside the lines"
    ];
    
    const ERROR_ICONS = [
      "dialog-warning",
      "dialog-error",
      "dialog-information",
      "software-updates-important",
      "security-high",
      "security-low",
      "socialize" // Required constraint
    ];

    const SOUNDS = [
      "Basso", "Blow", "Bottle", "Frog", "Funk", "Glass", "Hero",
      "Morse", "Ping", "Pop", "Purr", "Sosumi", "Submarine", "Tink"
    ];

    const base = (import.meta as any).env?.BASE_URL || '/';
    
    const playSound = (name: string) => {
      const audio = new Audio(`${base}sounds/${name}.mp3`);
      audio.play().catch(e => console.warn('Audio play failed', e));
    };

    const interval = setInterval(() => {
      const id = Math.random().toString(36).substr(2, 9);
      const message = ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
      const iconName = ERROR_ICONS[Math.floor(Math.random() * ERROR_ICONS.length)];
      
      const offset = (count % 25) * 30;
      const x = 100 + offset;
      const y = 100 + offset;

      let iconPath = `${base}assets/status/${iconName}.png`;
      if (iconName === 'socialize') {
        iconPath = `${base}icons/socialize.png`;
      }
      
      const newError: ActiveError = {
        id, x, y, message, icon: iconPath
      };

      setSystemErrors(prev => {
        const next = [...prev, newError];
        if (next.length > 60) return next.slice(1);
        return next;
      });

      // Play a random sound from all 14 for every error
      const randomSound = SOUNDS[Math.floor(Math.random() * SOUNDS.length)];
      playSound(randomSound);

      count++;
      if (count > 1000) clearSystemErrors();
    }, 2000);
    
    stormIntervalRef.current = interval as any;
  }, [clearSystemErrors]);

  const updateSystemState = useCallback((updates: Partial<TahoeV3State>) => {
    setSystemState(prev => {
      const newState = { ...prev, ...updates };
      localStorage.setItem('tahoe_v3_state', JSON.stringify(newState));
      return newState;
    });
  }, []);

  const launchApp = useCallback((appId: string) => {
    // Add to running apps if not there
    if (!systemState.runningApps.includes(appId)) {
      updateSystemState({
        runningApps: [...systemState.runningApps, appId]
      });
    }

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
  }, [openApps, systemState.runningApps, updateSystemState]);

  // Initialize Hardware APIs
  useEffect(() => {
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
  }, [startTime]);

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

  const closeApp = useCallback((appId: string) => {
    setOpenApps(prev => prev.filter(id => id !== appId));
    setMinimizedApps(prev => prev.filter(id => id !== appId));
    setMaximizedApps(prev => prev.filter(id => id !== appId));
    setActiveApp(prev => prev === appId ? null : prev);
  }, []);

  const quitApp = useCallback((appId: string) => {
    closeApp(appId);
    updateSystemState({
      runningApps: systemState.runningApps.filter(id => id !== appId)
    });
  }, [closeApp, systemState.runningApps, updateSystemState]);

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
      quitApp,
      minimizeApp,
      unminimizeApp,
      toggleMaximizeApp,
      showAboutWindow,
      setShowAboutWindow,
      showSpotlight,
      setShowSpotlight,
      showRestartDialog,
      setShowRestartDialog,
      showWidgetPicker,
      setShowWidgetPicker,
      incomingCall,
      setIncomingCall,
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
      uptime,
      systemErrors,
      triggerSystemError,
      clearSystemErrors
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
