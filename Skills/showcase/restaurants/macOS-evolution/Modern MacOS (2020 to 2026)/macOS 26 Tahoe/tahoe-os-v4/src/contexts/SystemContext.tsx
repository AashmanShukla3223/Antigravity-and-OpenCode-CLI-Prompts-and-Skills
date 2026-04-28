import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { songs } from '../utils/MusicData';

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
  playbackProgress: number;
  volume: number;
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
  type?: 'standard' | 'vertical_stretch' | 'horizontal_glitch';
  orientation?: 'vertical' | 'horizontal';
  buttons?: string[];
}

export interface SystemDialogConfig {
  type: 'alert' | 'confirm' | 'prompt';
  title: string;
  message: string;
  defaultValue?: string;
  onConfirm: (value?: string) => void;
  onCancel: () => void;
}

export interface TahoeV3State {
  setup_complete: boolean;
  isSystemInfected: boolean;
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
  isSystemInfected: false,
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
    isPlaying: false,
    playbackProgress: 0,
    volume: 0.8
  },
  runningApps: [],
  pinnedApps: ['finder', 'safari', 'messages', 'music', 'photos', 'calendar', 'soundtest', 'appstore', 'itunes', 'notes', 'settings'],
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
  isShuttingDown: boolean;
  shutdownStep: number;
  initiateRestart: () => void;
  isHandoff: boolean;
  handoffTarget: BootState | null;
  initiateSystemHandoff: (target: BootState) => void;
  systemDialog: SystemDialogConfig | null;
  setSystemDialog: (config: SystemDialogConfig | null) => void;
  showAlert: (message: string, title?: string) => Promise<void>;
  showConfirm: (message: string, title?: string) => Promise<boolean>;
  showPrompt: (message: string, defaultValue?: string, title?: string) => Promise<string | null>;
  // Music Controls
  playSong: (index?: number) => void;
  pauseSong: () => void;
  nextSong: () => void;
  prevSong: () => void;
  setVolume: (val: number) => void;
  updatePlaybackProgress: (val: number) => void;
}

const SystemContext = createContext<SystemContextProps | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bootState, setBootState] = useState<BootState>('booting');
  const [systemState, setSystemState] = useState<TahoeV3State>(() => {
    try {
      const saved = localStorage.getItem('tahoe_v3_state');
      const isInfected = localStorage.getItem('tahoe_infected') === 'true';
      let state = saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
      
      if (isInfected) {
        state.isSystemInfected = true;
        if (!state.pinnedApps.includes('installer')) {
          state.pinnedApps = ['installer', ...state.pinnedApps];
        }
      }
      return state;
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
  const [systemDialog, setSystemDialog] = useState<SystemDialogConfig | null>(null);
  const [incomingCall, setIncomingCall] = useState<{ contact: any; type: 'facetime' | 'phone' } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'desktop' | 'item' | 'writing' | 'dock'; targetId?: string } | null>(null);

  // Shutdown Sequence State
  const [isShuttingDown, setIsShuttingDown] = useState(false);
  const [shutdownStep, setShutdownStep] = useState(0);
  const [isHandoff, setIsHandoff] = useState(false);
  const [handoffTarget, setHandoffTarget] = useState<BootState | null>(null);

  // Hardware State
  const [battery, setBattery] = useState({ level: 1, isCharging: true });
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [powerMode, setPowerMode] = useState<'Low Power' | 'Normal' | 'High Performance'>('Normal');
  const [uptime, setUptime] = useState(0);
  const [startTime] = useState(() => Date.now());

  const [systemErrors, setSystemErrors] = useState<ActiveError[]>([]);
  const stormIntervalRef = React.useRef<any>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const infectionMusicRef = React.useRef<HTMLAudioElement | null>(null);

  const updateSystemState = useCallback((updates: Partial<TahoeV3State>) => {
    setSystemState(prev => {
      const newState = { ...prev, ...updates };
      localStorage.setItem('tahoe_v3_state', JSON.stringify(newState));
      return newState;
    });
  }, []);

  const playSong = useCallback((index?: number) => {
    const isUnlocked = localStorage.getItem('tahoe_music_unlocked') === 'true';
    if (!isUnlocked) return;

    if (audioRef.current) {
      if (index !== undefined) {
        audioRef.current.src = songs[index].url;
        updateSystemState({ music: { ...systemState.music, currentSongIndex: index, isPlaying: true, playbackProgress: 0 } });
      } else {
        if (!audioRef.current.src) {
           audioRef.current.src = songs[systemState.music.currentSongIndex].url;
        }
        updateSystemState({ music: { ...systemState.music, isPlaying: true } });
      }
      audioRef.current.play().catch(e => console.warn('Music play failed', e));
    }
  }, [systemState.music, updateSystemState]);

  const pauseSong = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      updateSystemState({ music: { ...systemState.music, isPlaying: false } });
    }
  }, [systemState.music, updateSystemState]);

  const nextSong = useCallback(() => {
    const nextIndex = (systemState.music.currentSongIndex + 1) % songs.length;
    playSong(nextIndex);
  }, [systemState.music.currentSongIndex, playSong]);

  const prevSong = useCallback(() => {
    const prevIndex = (systemState.music.currentSongIndex - 1 + songs.length) % songs.length;
    playSong(prevIndex);
  }, [systemState.music.currentSongIndex, playSong]);

  const setVolume = useCallback((val: number) => {
    if (audioRef.current) {
      audioRef.current.volume = val;
      updateSystemState({ music: { ...systemState.music, volume: val } });
    }
  }, [systemState.music, updateSystemState]);

  const updatePlaybackProgress = useCallback((val: number) => {
     if (audioRef.current && audioRef.current.duration) {
        audioRef.current.currentTime = (val / 100) * audioRef.current.duration;
     }
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setSystemState(prev => ({
            ...prev,
            music: { ...prev.music, playbackProgress: progress || 0 }
          }));
        }
      });
      audioRef.current.addEventListener('ended', () => {
        nextSong();
      });
    }
  }, [nextSong]);

  const clearSystemErrors = useCallback(() => {
    if (stormIntervalRef.current) clearInterval(stormIntervalRef.current);
    stormIntervalRef.current = null;
    if (infectionMusicRef.current) {
      infectionMusicRef.current.pause();
      infectionMusicRef.current = null;
    }
    setSystemErrors([]);
  }, []);

  const initiateRestart = useCallback(() => {
    setIsShuttingDown(true);
    pauseSong(); // Stop music immediately
    
    // Step 0: Clear only dialogs/modals immediately
    setShowRestartDialog(false);
    setShowAboutWindow(false);
    setShowSpotlight(false);
    setShowWidgetPicker(false);
    setSystemDialog(null);

    // Sequential Shutdown Sequence
    setShutdownStep(1); // T+0ms: Slide Dock to extreme bottom
    
    setTimeout(() => setShutdownStep(2), 300); // T+300ms: Slide Menu Bar to extreme top
    
    setTimeout(() => {
      setShutdownStep(3); // T+600ms: Fade/Shrink Widgets/Icons/Windows
      // Clear memory-heavy states only now so they can animate out
      clearSystemErrors();
      setOpenApps([]);
      setMinimizedApps([]);
      setMaximizedApps([]);
      setActiveApp(null);
    }, 600); 

    setTimeout(() => setShutdownStep(4), 900); // T+900ms: Fade Wallpaper to Black & Beachball Cursor
    
    // Handover to BootSequence
    setTimeout(() => {
      setBootState('booting');
      setIsShuttingDown(false);
      setShutdownStep(0);
    }, 1200);
  }, [clearSystemErrors, setBootState, pauseSong]);

  const initiateSystemHandoff = useCallback((target: BootState) => {
    setIsHandoff(true);
    setHandoffTarget(target);
    pauseSong();
    
    // Step 0: Clear only dialogs/modals immediately
    setShowRestartDialog(false);
    setShowAboutWindow(false);
    setShowSpotlight(false);
    setShowWidgetPicker(false);
    setSystemDialog(null);

    // Sequential Shutdown Sequence
    setShutdownStep(1); // T+0ms: Slide Dock
    setTimeout(() => setShutdownStep(2), 300); // T+300ms: Slide Menu Bar
    setTimeout(() => {
      setShutdownStep(3); // T+600ms: Fade Widgets/Icons
      clearSystemErrors();
    }, 600); 

    setTimeout(() => {
      setBootState(target);
      setIsHandoff(false);
      setHandoffTarget(null);
      setShutdownStep(0);
    }, 1200);
  }, [clearSystemErrors, setBootState, pauseSong]);

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
      "GPU is drawing outside the lines",
      "Please Send it to Apple: This error is a feature, not a bug",
      "Your Mac is experiencing a moment of self-awareness. Please wait while it contemplates existence.",
      "macOS is not initalized. Please turn it off and on again."
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

    const AVAILABLE_BUTTONS = ["Send to Apple", "OK", "Learn More", "Try Again", "Cancel"];

    const base = (import.meta as any).env?.BASE_URL || '/';
    
    const playSound = (name: string) => {
      const audio = new Audio(`${base}sounds/${name}.mp3`);
      audio.play().catch(e => console.warn('Audio play failed', e));
    };

    // Background music loop
    if (!infectionMusicRef.current) {
      infectionMusicRef.current = new Audio(`${base}music/jutti-meri.mp3`);
      infectionMusicRef.current.loop = true;
      infectionMusicRef.current.volume = 0.7;
      infectionMusicRef.current.play().catch(e => console.warn('Infection music failed', e));
    }

    const interval = setInterval(() => {
      const id = Math.random().toString(36).substr(2, 9);
      const message = ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
      const iconName = ERROR_ICONS[Math.floor(Math.random() * ERROR_ICONS.length)];
      
      const x = Math.random() * (window.innerWidth - 300);
      const y = Math.random() * (window.innerHeight - 150);

      let iconPath = `${base}assets/status/${iconName}.png`;
      if (iconName === 'socialize') {
        iconPath = `${base}icons/socialize.png`;
      }
      
      const types: ('standard' | 'vertical_stretch' | 'horizontal_glitch')[] = ['standard', 'vertical_stretch', 'horizontal_glitch'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const orientation = Math.random() > 0.5 ? 'vertical' : 'horizontal';
      const buttons = [...AVAILABLE_BUTTONS].sort(() => 0.5 - Math.random()).slice(0, 3);

      const newError: ActiveError = {
        id, x, y, message, icon: iconPath, type, orientation, buttons
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
      if (count >= 10) {
        clearInterval(interval);
        stormIntervalRef.current = null;
        initiateRestart();
      }
    }, 2000); // 2 seconds as requested
    
    stormIntervalRef.current = interval as any;
  }, [clearSystemErrors, initiateRestart]);

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
  }, [startTime, launchApp]);

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

  const showAlert = useCallback((message: string, title: string = 'System Alert'): Promise<void> => {
    return new Promise((resolve) => {
      setSystemDialog({
        type: 'alert',
        title,
        message,
        onConfirm: () => {
          setSystemDialog(null);
          resolve();
        },
        onCancel: () => {
          setSystemDialog(null);
          resolve();
        }
      });
    });
  }, []);

  const showConfirm = useCallback((message: string, title: string = 'Confirm Action'): Promise<boolean> => {
    return new Promise((resolve) => {
      setSystemDialog({
        type: 'confirm',
        title,
        message,
        onConfirm: () => {
          setSystemDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setSystemDialog(null);
          resolve(false);
        }
      });
    });
  }, []);

  const showPrompt = useCallback((message: string, defaultValue: string = '', title: string = 'Input Required'): Promise<string | null> => {
    return new Promise((resolve) => {
      setSystemDialog({
        type: 'prompt',
        title,
        message,
        defaultValue,
        onConfirm: (value) => {
          setSystemDialog(null);
          resolve(value || null);
        },
        onCancel: () => {
          setSystemDialog(null);
          resolve(null);
        }
      });
    });
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
      clearSystemErrors,
      isShuttingDown,
      shutdownStep,
      initiateRestart,
      isHandoff,
      handoffTarget,
      initiateSystemHandoff,
      systemDialog,
      setSystemDialog,
      showAlert,
      showConfirm,
      showPrompt,
      playSong,
      pauseSong,
      nextSong,
      prevSong,
      setVolume,
      updatePlaybackProgress
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
