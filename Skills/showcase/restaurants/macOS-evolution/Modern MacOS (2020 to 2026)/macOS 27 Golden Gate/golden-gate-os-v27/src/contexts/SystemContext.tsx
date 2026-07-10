import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { songs } from '../utils/MusicData';

type BootState = 'booting' | 'setup' | 'login' | 'desktop' | 'recovery' | 'activation';

export const DEFAULT_PINNED_APPS = [
  'finder',
  'apps',
  'safari',
  'messages',
  'mail',
  'maps',
  'photos',
  'facetime',
  'phone',
  'calendar',
  'contacts',
  'notes',
  'tv',
  'music',
  'keynote',
  'numbers',
  'pages',
  'appstore',
  'games',
  'iphonemirroring',
  'siriai',
  'settings',
];

export interface UserAccount {
  id: string;
  fullName: string;
  accountName: string;
  password?: string;
  avatar?: string;
  pinnedApps?: string[];
}

export interface Notification {
  id: string;
  appId: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  icon?: string;
}

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

export interface ClipboardEntry {
  type: 'copy' | 'cut';
  nodeIds: string[];
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

export interface ActiveDownload {
  name: string;
  progress: number;
  appId: string;
}

export interface WindowInstance {
  id: string;
  appId: string;
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

export interface GoldenGateV27State {
  setup_complete: boolean;
  isSystemInfected: boolean;
  users: UserAccount[];
  activeUserId: string;
  notifications: Notification[];
  appearance: 'light' | 'dark' | 'auto';
  betaUpdates: boolean;
  wallpaperUrl: string;
  wallpaperType: 'image' | 'video';
  wallpaperMode: 'off' | 'static' | 'dynamic';
  isCameraOn: boolean;
  notchMode: 'static' | 'dynamic' | 'off';
  glassMode: number;
  lowPowerMode: boolean;
  dockHidden: boolean;
  dockMagnifier: boolean;
  autoHideDock: boolean;
  dockSize: number;
  dockCornerRadius: number;
  dockIconScaler: number;
  dockHoverSmoothness: number;
  dockDepth: number;
  dockBlurStrength: number;
  dockPosition: 'bottom' | 'left' | 'right';
  brightness: number;
  airdrop: boolean;
  stageManagerEnabled: boolean;
  terminalBgColor: string;
  terminalRibbonColor: string;
  terminalOpacity: number;
  iconMode: 'off' | 'dynamic';
  iconModeSelection: 'light' | 'dark';
  apiKey?: string;
  widgets: Widget[];
  reminders: Reminder[];
  music: MusicState;
  runningApps: string[];
  pinnedApps: string[];
  notes: Note[];
  screenSaverType: 'classic' | 'aerial' | 'photos';
  screenSaverTimer: number;
  alarmRinging: boolean;
  alarmLabel: string;
  timerRunning: boolean;
  timerRemaining: number;
  timerLabel: string;
  stopwatchRunning: boolean;
  stopwatchElapsed: number;
  isRecording: boolean;
  isAirPlaying: boolean;
  activeDownloads: ActiveDownload[];
  isUpdating: boolean;
  updateProgress: number;
  updateVersion: string;
  focusMode: string | null;
  dndEnabled: boolean;
  vpnConnected: boolean;
  hotspotActive: boolean;
}

const persistQueue = new Map<string, string>();
let persistTimer: ReturnType<typeof setTimeout> | null = null;
function schedulePersist(key: string, value: string) {
  persistQueue.set(key, value);
  if (persistTimer === null) {
    persistTimer = setTimeout(() => {
      for (const [k, v] of persistQueue) {
        try { localStorage.setItem(k, v); } catch { /* ignore */ }
      }
      persistQueue.clear();
      persistTimer = null;
    }, 300);
  }
}

const defaultState: GoldenGateV27State = {
  setup_complete: false,
  isSystemInfected: false,
  users: [{ id: 'default', fullName: '', accountName: '', password: '', avatar: '👤' }],
  activeUserId: 'default',
  notifications: [],
  appearance: 'auto',
  betaUpdates: false,
  wallpaperUrl: '/wallpapers/golden-gate-light.webp',
  wallpaperType: 'image',
  wallpaperMode: 'static',
  isCameraOn: false,
  notchMode: 'dynamic',
  glassMode: 50,
  lowPowerMode: false,
  dockHidden: false,
  dockMagnifier: true,
  autoHideDock: false,
  dockSize: 90,
  dockCornerRadius: 23,
  dockIconScaler: 50,
  dockHoverSmoothness: 50,
  dockDepth: 50,
  dockBlurStrength: 50,
  dockPosition: 'bottom',
  brightness: 80,
  airdrop: false,
  stageManagerEnabled: false,
  terminalBgColor: '#000000',
  terminalRibbonColor: '#1a1a2e',
  terminalOpacity: 90,
  iconMode: 'off',
  iconModeSelection: 'light',
  apiKey: '',
  widgets: [],
  reminders: [
    { id: 1, text: 'Finalize macOS Golden Gate Core', completed: true },
    { id: 2, text: 'Review Liquid Glass Physics', completed: true },
    { id: 3, text: 'Sync Sovereign Identity', completed: true },
  ],
  music: {
    currentSongIndex: 0,
    isPlaying: false,
    playbackProgress: 0,
    volume: 0.8,
  },
  runningApps: [],
  pinnedApps: DEFAULT_PINNED_APPS,
  notes: [
    {
      id: '1',
      title: 'Golden Gate OS Vision',
      content:
        'The "Unit 7" era is about fluid interfaces and silicon-native glass. We must push Framer Motion to its limits.',
      date: '10:42 AM',
      lastModified: Date.now(),
    },
    {
      id: '2',
      title: 'AI Integration Ideas',
      content:
        'Apple Intelligence should handle tone adjustment in Notes and automatic summarization of long thoughts.',
      date: 'Yesterday',
      lastModified: Date.now() - 86400000,
    },
  ],
  screenSaverType: 'classic',
  screenSaverTimer: 5,
  alarmRinging: false,
  alarmLabel: '',
  timerRunning: false,
  timerRemaining: 0,
  timerLabel: '',
  stopwatchRunning: false,
  stopwatchElapsed: 0,
  isRecording: false,
  isAirPlaying: false,
  activeDownloads: [],
  isUpdating: false,
  updateProgress: 0,
  updateVersion: '',
  focusMode: null,
  dndEnabled: false,
  vpnConnected: false,
  hotspotActive: false,
};

interface SystemContextProps {
  bootState: BootState;
  setBootState: (state: BootState) => void;
  systemState: GoldenGateV27State;
  updateSystemState: (updates: Partial<GoldenGateV27State>) => void;
  resetSystem: (targetState?: BootState) => void;
  activeApp: string | null;
  activeWindowId: string | null;
  setActiveWindow: (id: string | null) => void;
  openWindows: WindowInstance[];
  openApps: string[];
  minimizedWindows: string[];
  maximizedWindows: string[];
  launchingApp: string | null;
  launchApp: (appId: string) => void;
  closeWindow: (windowId: string) => void;
  closeCurrentWindow: () => void;
  closeApp: (appId: string) => void;
  quitApp: (appId: string) => void;
  minimizeWindow: (windowId: string) => void;
  unminimizeWindow: (windowId: string) => void;
  toggleMaximizeWindow: (windowId: string) => void;
  showAboutWindow: boolean;
  setShowAboutWindow: (show: boolean) => void;
  showSpotlight: boolean;
  setShowSpotlight: (show: boolean) => void;
  showRestartDialog: boolean;
  setShowRestartDialog: (show: boolean) => void;
  showShutdownDialog: boolean;
  setShowShutdownDialog: (show: boolean) => void;
  showWidgetPicker: boolean;
  setShowWidgetPicker: (show: boolean) => void;
  incomingCall: { contact: any; type: 'facetime' | 'phone' } | null;
  setIncomingCall: (call: { contact: any; type: 'facetime' | 'phone' } | null) => void;
  contextMenu: { x: number; y: number; type: 'desktop' | 'item' | 'writing' | 'dock'; targetId?: string } | null;
  setContextMenu: (
    menu: { x: number; y: number; type: 'desktop' | 'item' | 'writing' | 'dock'; targetId?: string } | null,
  ) => void;
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
  initiateShutdown: () => void;
  startOTAUpdate: (version: string) => void;
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
  // Notifications
  showNotificationCenter: boolean;
  setShowNotificationCenter: (show: boolean) => void;
  addNotification: (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  // Multi-User
  activeUser: UserAccount;
  userPinnedApps: string[];
  switchUser: (userId: string) => void;
  addUser: (user: Omit<UserAccount, 'id'>) => void;
  removeUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<UserAccount>) => void;
  verifyPassword: (password: string) => boolean;
  clipboard: ClipboardEntry | null;
  copyToClipboard: (nodeIds: string[]) => void;
  cutToClipboard: (nodeIds: string[]) => void;
  clearClipboard: () => void;
}

const SystemContext = createContext<SystemContextProps | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bootState, setBootState] = useState<BootState>('booting');
  const [systemState, setSystemState] = useState<GoldenGateV27State>(() => {
    try {
      const saved = localStorage.getItem('golden_gate_v27_state');
      const isInfected = localStorage.getItem('golden_gate_infected') === 'true';
      let state = saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;

      if (!saved && state.wallpaperMode !== 'off') {
        const now = new Date();
        const mins = now.getHours() * 60 + now.getMinutes();
        const isDay = mins >= 300 && mins < 1050;
        if (state.wallpaperMode === 'dynamic') {
          state.wallpaperUrl = isDay
            ? '/wallpapers/Golden%20Gate%20Dynamic%20Wallpaper.mp4'
            : 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.1.10/Khabardar.mp4';
          state.wallpaperType = 'video';
        } else {
          state.wallpaperUrl = isDay ? '/wallpapers/golden-gate-light.webp' : '/wallpapers/golden-gate-dark.webp';
          state.wallpaperType = 'image';
        }
      }

      if (isInfected) {
        state.isSystemInfected = true;
        if (!state.pinnedApps.includes('installer')) {
          state.pinnedApps = ['installer', ...state.pinnedApps];
        }
      }
      if (!state.pinnedApps.includes('keynote')) {
        state.pinnedApps = [...state.pinnedApps, 'keynote'];
      }
      if (!state.pinnedApps.includes('numbers')) {
        state.pinnedApps = [...state.pinnedApps, 'numbers'];
      }
      if (!state.pinnedApps.includes('pages')) {
        state.pinnedApps = [...state.pinnedApps, 'pages'];
      }
      if (!state.pinnedApps.includes('games')) {
        state.pinnedApps = [...state.pinnedApps, 'games'];
      }
      if (!state.pinnedApps.includes('apps')) {
        state.pinnedApps = ['apps', ...state.pinnedApps];
      }

      state.users = state.users.map((u: UserAccount) =>
        u.pinnedApps ? u : { ...u, pinnedApps: [...state.pinnedApps] },
      );
      return state;
    } catch (e) {
      console.error('Failed to parse golden_gate_v27_state', e);
    }
    return defaultState;
  });
  const [activeWindowId, setActiveWindow] = useState<string | null>(null);
  const [openWindows, setOpenWindows] = useState<WindowInstance[]>([]);
  const [minimizedWindows, setMinimizedWindows] = useState<string[]>([]);
  const [maximizedWindows, setMaximizedWindows] = useState<string[]>([]);
  const [launchingApp, setLaunchingApp] = useState<string | null>(null);
  const [showAboutWindow, setShowAboutWindow] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [showShutdownDialog, setShowShutdownDialog] = useState(false);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [systemDialog, setSystemDialog] = useState<SystemDialogConfig | null>(null);
  const [incomingCall, setIncomingCall] = useState<{ contact: any; type: 'facetime' | 'phone' } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: 'desktop' | 'item' | 'writing' | 'dock';
    targetId?: string;
  } | null>(null);

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

  const windowIdCounter = React.useRef(0);
  const activeApp = React.useMemo(() => {
    if (!activeWindowId) return null;
    return openWindows.find((w) => w.id === activeWindowId)?.appId ?? null;
  }, [activeWindowId, openWindows]);
  const openApps = React.useMemo(() => {
    return [...new Set(openWindows.map((w) => w.appId))];
  }, [openWindows]);

  const [systemErrors, setSystemErrors] = useState<ActiveError[]>([]);
  const [clipboard, setClipboard] = useState<ClipboardEntry | null>(null);
  const copyToClipboard = useCallback((nodeIds: string[]) => {
    setClipboard({ type: 'copy', nodeIds });
  }, []);
  const cutToClipboard = useCallback((nodeIds: string[]) => {
    setClipboard({ type: 'cut', nodeIds });
  }, []);
  const clearClipboard = useCallback(() => {
    setClipboard(null);
  }, []);
  const stormIntervalRef = React.useRef<any>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const infectionMusicRef = React.useRef<HTMLAudioElement | null>(null);

  const updateSystemState = useCallback((updates: Partial<GoldenGateV27State>) => {
    setSystemState((prev) => {
      const newState = { ...prev, ...updates };
      schedulePersist('golden_gate_v27_state', JSON.stringify(newState));
      return newState;
    });
  }, []);

  const playSong = useCallback(
    (index?: number) => {
      const isUnlocked = localStorage.getItem('golden_gate_music_unlocked') === 'true';
      if (!isUnlocked) return;

      if (audioRef.current) {
        if (index !== undefined) {
          audioRef.current.src = songs[index].url;
          updateSystemState({
            music: { ...systemState.music, currentSongIndex: index, isPlaying: true, playbackProgress: 0 },
          });
        } else {
          if (!audioRef.current.src) {
            audioRef.current.src = songs[systemState.music.currentSongIndex].url;
          }
          updateSystemState({ music: { ...systemState.music, isPlaying: true } });
        }
        audioRef.current.play().catch((e) => console.warn('Music play failed', e));
      }
    },
    [systemState.music, updateSystemState],
  );

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

  const setVolume = useCallback(
    (val: number) => {
      if (audioRef.current) {
        audioRef.current.volume = val;
        updateSystemState({ music: { ...systemState.music, volume: val } });
      }
    },
    [systemState.music, updateSystemState],
  );

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
          setSystemState((prev) => ({
            ...prev,
            music: { ...prev.music, playbackProgress: progress || 0 },
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
      setOpenWindows([]);
      setMinimizedWindows([]);
      setMaximizedWindows([]);
      setActiveWindow(null);
    }, 600);

    setTimeout(() => setShutdownStep(4), 900); // T+900ms: Fade Wallpaper to Black & Beachball Cursor

    // Handover to BootSequence
    setTimeout(() => {
      setBootState('booting');
      setIsShuttingDown(false);
      setShutdownStep(0);
    }, 1200);
  }, [clearSystemErrors, setBootState, pauseSong]);

  const startOTAUpdate = useCallback((version: string) => {
    updateSystemState({ isUpdating: true, updateProgress: 0, updateVersion: version });
    let progress = 0;
    const iv = setInterval(() => {
      progress += Math.random() * 8 + 2;
      if (progress >= 100) {
        clearInterval(iv);
        updateSystemState({ isUpdating: true, updateProgress: 100, updateVersion: version });
        // "Installing update…" for 1.5s, then shutdown animation, then page reload
        setTimeout(() => {
          updateSystemState({ isUpdating: false, updateProgress: 0, updateVersion: '' });
          setIsShuttingDown(true);
          pauseSong();
          setShowRestartDialog(false);
          setShowAboutWindow(false);
          setShowSpotlight(false);
          setShowWidgetPicker(false);
          setSystemDialog(null);
          setShutdownStep(1);
          setTimeout(() => setShutdownStep(2), 300);
          setTimeout(() => {
            setShutdownStep(3);
            clearSystemErrors();
            setOpenWindows([]);
            setMinimizedWindows([]);
            setMaximizedWindows([]);
            setActiveWindow(null);
          }, 600);
          setTimeout(() => setShutdownStep(4), 900);
          setTimeout(() => {
            window.location.href = 'https://macos-27-golden-gate.vercel.app';
          }, 1300);
        }, 1500);
      } else {
        updateSystemState({ updateProgress: Math.min(100, Math.round(progress)) });
      }
    }, 500);
  }, [updateSystemState, pauseSong, clearSystemErrors]);

  const initiateShutdown = useCallback(() => {
    setIsShuttingDown(true);
    pauseSong();

    setShowShutdownDialog(false);
    setShowAboutWindow(false);
    setShowSpotlight(false);
    setShowWidgetPicker(false);
    setSystemDialog(null);

    setShutdownStep(1);
    setTimeout(() => setShutdownStep(2), 300);
    setTimeout(() => {
      setShutdownStep(3);
      clearSystemErrors();
      setOpenWindows([]);
      setMinimizedWindows([]);
      setMaximizedWindows([]);
      setActiveWindow(null);
    }, 600);
    setTimeout(() => setShutdownStep(4), 900);
    setTimeout(() => {
      window.location.href = 'about:blank';
      setIsShuttingDown(false);
      setShutdownStep(0);
    }, 1200);
  }, [clearSystemErrors, pauseSong]);

  const initiateSystemHandoff = useCallback(
    (target: BootState) => {
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
    },
    [clearSystemErrors, setBootState, pauseSong],
  );

  const triggerSystemError = useCallback(() => {
    if (stormIntervalRef.current) return;

    const ERROR_MESSAGES = [
      'The disk is full of bubbles',
      'Kernel Panic: Too much vibe',
      'Memory Leak in the Gold Mine',
      'System Overheating: Silicon Meltdown',
      'Quantum Bit Flip detected in Reality',
      'Logic Error: App is too cool for this OS',
      'Refractive Index out of bounds',
      'Glass Blur is becoming solid',
      'User Identity found in Trash',
      "Finder found something it shouldn't have",
      'CPU is vibing too hard',
      'GPU is drawing outside the lines',
      'Please Send it to Apple: This error is a feature, not a bug',
      'Your Mac is experiencing a moment of self-awareness. Please wait while it contemplates existence.',
      'macOS is not initalized. Please turn it off and on again.',
    ];

    const ERROR_ICONS = [
      'dialog-warning',
      'dialog-error',
      'dialog-information',
      'software-updates-important',
      'security-high',
      'security-low',
      'socialize',
    ];

    const SOUNDS = [
      'Basso',
      'Blow',
      'Bottle',
      'Frog',
      'Funk',
      'Glass',
      'Hero',
      'Morse',
      'Ping',
      'Pop',
      'Purr',
      'Sosumi',
      'Submarine',
      'Tink',
    ];

    const AVAILABLE_BUTTONS = ['Send to Apple', 'OK', 'Learn More', 'Try Again', 'Cancel', 'Ignore'];

    const base = (import.meta as any).env?.BASE_URL || '/';

    const playSound = (name: string) => {
      const audio = new Audio(`${base}sounds/${name}.mp3`);
      audio.play().catch((e) => console.warn('Audio play failed', e));
    };

    // Background music loop - Persistent loop
    if (!infectionMusicRef.current) {
      infectionMusicRef.current = new Audio(`${base}music/LUZ ROJA - Sped Up - bxkq.mp3`);
      infectionMusicRef.current.loop = true;
      infectionMusicRef.current.volume = 0.7;
      infectionMusicRef.current.play().catch((e) => console.warn('Infection music failed', e));
    }

    // High-fidelity recursive spawning (2-3 per second)
    const interval = setInterval(() => {
      const spawnCount = Math.floor(Math.random() * 2) + 2; // 2 or 3

      for (let s = 0; s < spawnCount; s++) {
        const id = Math.random().toString(36).substr(2, 9);
        const message = ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
        const iconName = ERROR_ICONS[Math.floor(Math.random() * ERROR_ICONS.length)];

        // Modal Variations: Vertical (320x580) and Horizontal (700x240) alerts
        const orientation = Math.random() > 0.5 ? 'vertical' : 'horizontal';
        const width = orientation === 'vertical' ? 320 : 700;
        const height = orientation === 'vertical' ? 580 : 240;

        const x = Math.random() * (window.innerWidth - width);
        const y = Math.random() * (window.innerHeight - height);

        let iconPath = `${base}assets/status/${iconName}.png`;
        if (iconName === 'socialize') {
          iconPath = `${base}icons/socialize.png`;
        }

        const types: ('standard' | 'vertical_stretch' | 'horizontal_glitch')[] = [
          'standard',
          'vertical_stretch',
          'horizontal_glitch',
        ];
        const type = types[Math.floor(Math.random() * types.length)];

        // Random combination of buttons
        const buttons = [...AVAILABLE_BUTTONS]
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 3) + 1);

        const newError: ActiveError = {
          id,
          x,
          y,
          message,
          icon: iconPath,
          type,
          orientation,
          buttons,
        };

        setSystemErrors((prev) => {
          const next = [...prev, newError];
          // Endgame: When the screen is 80% covered (simulated by 80 modals)
          if (next.length >= 80) {
            clearInterval(interval);
            stormIntervalRef.current = null;
            // Trigger dead drive state
            updateSystemState({ isSystemInfected: true });
            setTimeout(() => {
              initiateRestart();
            }, 1000);
          }
          return next;
        });

        // SFX Percussion: Every modal spawn triggers a random classic Apple sound
        const randomSound = SOUNDS[Math.floor(Math.random() * SOUNDS.length)];
        playSound(randomSound);
      }
    }, 1000); // Check every second, spawns multiple modals

    stormIntervalRef.current = interval as any;
  }, [updateSystemState, initiateRestart]);

  // Persistence Check: If infected, start chaos loop upon desktop load
  useEffect(() => {
    if (bootState === 'desktop' && localStorage.getItem('golden_gate_infected') === 'true') {
      setTimeout(() => {
        triggerSystemError();
      }, 2000); // Grace period after desktop load
    }
  }, [bootState, triggerSystemError]);

  const launchApp = useCallback(
    (appId: string) => {
      const SINGLE_INSTANCE_APPS = new Set(['apps', 'installer', 'siriai']);

      if (SINGLE_INSTANCE_APPS.has(appId)) {
        const existing = openWindows.filter((w) => w.appId === appId);
        existing.forEach((w) => {
          setMinimizedWindows((prev) => prev.filter((id) => id !== w.id));
          setMaximizedWindows((prev) => prev.filter((id) => id !== w.id));
          setOpenWindows((prev) => prev.filter((pw) => pw.id !== w.id));
        });
        if (existing.length > 0 && activeWindowId && existing.some((w) => w.id === activeWindowId)) {
          setActiveWindow(null);
        }
      }

      if (!systemState.runningApps.includes(appId)) {
        updateSystemState({
          runningApps: [...systemState.runningApps, appId],
        });
      }

      setLaunchingApp(appId);
      windowIdCounter.current += 1;
      const newId = `${appId}-${windowIdCounter.current}`;
      const newWindow: WindowInstance = { id: newId, appId };
      setTimeout(() => {
        setOpenWindows((current) => [...current, newWindow]);
        setLaunchingApp(null);
        setActiveWindow(newId);
        setMinimizedWindows((prev) => prev.filter((id) => id !== newId));
      }, 1000);
    },
    [openWindows, activeWindowId, systemState.runningApps, updateSystemState],
  );

  const closeWindow = useCallback((windowId: string) => {
    setOpenWindows((prev) => prev.filter((w) => w.id !== windowId));
    setMinimizedWindows((prev) => prev.filter((id) => id !== windowId));
    setMaximizedWindows((prev) => prev.filter((id) => id !== windowId));
    setActiveWindow((prev) => (prev === windowId ? null : prev));
  }, []);

  const closeCurrentWindow = useCallback(() => {
    if (activeWindowId) closeWindow(activeWindowId);
  }, [activeWindowId, closeWindow]);

  const closeApp = useCallback(
    (appId: string) => {
      const targets = openWindows.filter((w) => w.appId === appId);
      targets.forEach((w) => {
        setOpenWindows((prev) => prev.filter((pw) => pw.id !== w.id));
        setMinimizedWindows((prev) => prev.filter((id) => id !== w.id));
        setMaximizedWindows((prev) => prev.filter((id) => id !== w.id));
      });
      if (activeWindowId && targets.some((w) => w.id === activeWindowId)) {
        setActiveWindow(null);
      }
    },
    [openWindows, activeWindowId],
  );

  const quitApp = useCallback(
    (appId: string) => {
      closeApp(appId);
      updateSystemState({
        runningApps: systemState.runningApps.filter((id) => id !== appId),
      });
    },
    [closeApp, systemState.runningApps, updateSystemState],
  );

  const minimizeWindow = useCallback(
    (windowId: string) => {
      setMinimizedWindows((prev) => {
        if (!prev.includes(windowId)) return [...prev, windowId];
        return prev;
      });
      if (activeWindowId === windowId) {
        setActiveWindow(null);
      }
    },
    [activeWindowId],
  );

  const unminimizeWindow = useCallback((windowId: string) => {
    setMinimizedWindows((prev) => prev.filter((id) => id !== windowId));
    setActiveWindow(windowId);
  }, []);

  const toggleMaximizeWindow = useCallback((windowId: string) => {
    setMaximizedWindows((prev) =>
      prev.includes(windowId) ? prev.filter((id) => id !== windowId) : [...prev, windowId],
    );
  }, []);

  const resetSystem = useCallback((targetState: BootState = 'recovery') => {
    localStorage.removeItem('golden_gate_v27_state');
    setSystemState(defaultState);
    setOpenWindows([]);
    setMinimizedWindows([]);
    setMaximizedWindows([]);
    setActiveWindow(null);
    setShowAboutWindow(false);
    setBootState(targetState);
  }, []);

  // Sync glassMode to CSS custom properties
  useEffect(() => {
    const gm = systemState.glassMode;
    const blur = 80 - gm * 0.7;
    const alphaDark = 0.6 - gm * 0.0045;
    const alphaLight = 0.35 - gm * 0.0027;
    const root = document.documentElement;
    root.style.setProperty('--glass-blur', `${Math.max(10, blur)}px`);
    root.style.setProperty('--glass-bg-dark', `rgba(0,0,0,${Math.max(0.1, alphaDark)})`);
    root.style.setProperty('--glass-bg-light', `rgba(255,255,255,${Math.max(0.05, alphaLight)})`);
  }, [systemState.glassMode]);

  // Initialize Hardware APIs
  useEffect(() => {
    if ('getBattery' in navigator) {
      const batteryTimeout = setTimeout(() => {
        console.warn('Battery API timeout, continuing without battery info');
      }, 2000);

      Promise.race([
        (navigator as any).getBattery(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Battery API timeout')), 2000)),
      ])
        .then((batt: any) => {
          clearTimeout(batteryTimeout);
          const updateBattery = () => {
            setBattery({
              level: batt.level,
              isCharging: batt.charging,
            });
          };
          updateBattery();
          batt.addEventListener('levelchange', updateBattery);
          batt.addEventListener('chargingchange', updateBattery);
        })
        .catch((e) => {
          clearTimeout(batteryTimeout);
          console.warn('Battery API unavailable:', e);
        });
    }

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
        },
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
        },
      });
    });
  }, []);

  const showPrompt = useCallback(
    (message: string, defaultValue: string = '', title: string = 'Input Required'): Promise<string | null> => {
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
          },
        });
      });
    },
    [],
  );

  const addNotification = useCallback((notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: Notification = {
      ...notif,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      read: false,
    };
    setSystemState((prev) => {
      const next = { ...prev, notifications: [newNotif, ...prev.notifications].slice(0, 50) };
      schedulePersist('golden_gate_v27_state', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeNotification = useCallback((id: string) => {
    setSystemState((prev) => {
      const next = { ...prev, notifications: prev.notifications.filter((n) => n.id !== id) };
      schedulePersist('golden_gate_v27_state', JSON.stringify(next));
      return next;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setSystemState((prev) => {
      const next = { ...prev, notifications: [] };
      schedulePersist('golden_gate_v27_state', JSON.stringify(next));
      return next;
    });
  }, []);

  const activeUser = systemState.users.find((u) => u.id === systemState.activeUserId) || systemState.users[0];
  const userPinnedApps = activeUser.pinnedApps ?? systemState.pinnedApps;

  const switchUser = useCallback((userId: string) => {
    setOpenWindows([]);
    setMinimizedWindows([]);
    setMaximizedWindows([]);
    setActiveWindow(null);
    updateSystemState({ activeUserId: userId, runningApps: [] });
    setBootState('login');
  }, [updateSystemState, setBootState]);

  const addUser = useCallback((user: Omit<UserAccount, 'id'>) => {
    const newUser: UserAccount = { ...user, id: crypto.randomUUID(), pinnedApps: [...DEFAULT_PINNED_APPS] };
    setSystemState((prev) => {
      const next = { ...prev, users: [...prev.users, newUser] };
      schedulePersist('golden_gate_v27_state', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeUser = useCallback((userId: string) => {
    setSystemState((prev) => {
      if (prev.users.length <= 1) return prev;
      const next = { ...prev, users: prev.users.filter((u) => u.id !== userId) };
      if (next.activeUserId === userId) next.activeUserId = next.users[0].id;
      schedulePersist('golden_gate_v27_state', JSON.stringify(next));
      return next;
    });
  }, []);

  const updateUser = useCallback((userId: string, updates: Partial<UserAccount>) => {
    setSystemState((prev) => {
      const next = {
        ...prev,
        users: prev.users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
      };
      schedulePersist('golden_gate_v27_state', JSON.stringify(next));
      return next;
    });
  }, []);

  const verifyPassword = useCallback((password: string): boolean => {
    return password === activeUser.password;
  }, [activeUser.password]);

  return (
    <SystemContext.Provider
      value={{
        bootState,
        setBootState,
        systemState,
        updateSystemState,
        resetSystem,
        activeApp,
        activeWindowId,
        setActiveWindow,
        openWindows,
        openApps,
        minimizedWindows,
        maximizedWindows,
        launchingApp,
        launchApp,
        closeWindow,
        closeCurrentWindow,
        closeApp,
        quitApp,
        minimizeWindow,
        unminimizeWindow,
        toggleMaximizeWindow,
        showAboutWindow,
        setShowAboutWindow,
        showSpotlight,
        setShowSpotlight,
        showRestartDialog,
        setShowRestartDialog,
        showShutdownDialog,
        setShowShutdownDialog,
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
          memory: (performance as any).memory?.jsHeapSizeLimit
            ? Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024 / 1024)
            : 16,
        },
        uptime,
        systemErrors,
        triggerSystemError,
        clearSystemErrors,
        isShuttingDown,
        shutdownStep,
        initiateRestart,
        initiateShutdown,
        startOTAUpdate,
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
        updatePlaybackProgress,
        showNotificationCenter,
        setShowNotificationCenter,
        addNotification,
        removeNotification,
        clearNotifications,
        activeUser,
        userPinnedApps,
        switchUser,
        addUser,
        removeUser,
        updateUser,
        verifyPassword,
        clipboard,
        copyToClipboard,
        cutToClipboard,
        clearClipboard,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSystem = () => {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};
