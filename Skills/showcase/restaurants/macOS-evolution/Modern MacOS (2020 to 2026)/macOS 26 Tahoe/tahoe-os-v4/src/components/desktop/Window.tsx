import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';
import { useTelemetry } from '../../hooks/useTelemetry';
import { Finder } from '../apps/Finder';
import { Safari } from '../apps/Safari';
import { SystemSettings } from '../apps/SystemSettings';
import { TerminalApp } from '../apps/TerminalApp';
import { ActivityMonitor } from '../apps/ActivityMonitor';

import { Messages } from '../apps/Messages';
import { Photos } from '../apps/Photos';
import { Phone } from '../apps/Phone';
import { Maps } from '../apps/Maps';
import { Mail } from '../apps/Mail';
import { AppStore } from '../apps/AppStore';
import { AppleBooks } from '../apps/AppleBooks';
import { AppleWallet } from '../apps/AppleWallet';
import { Reminders } from '../apps/Reminders';
import { Stickies } from '../apps/Stickies';
import { Launchpad } from '../apps/Launchpad';
import { FaceTime } from '../apps/FaceTime';
import { Contacts } from '../apps/Contacts';

import { AppleMusic } from '../apps/AppleMusic';
import { AppleTVPlus } from '../apps/AppleTVPlus';
import { ITunesStore } from '../apps/iTunesStore';
import { SoundTest } from '../apps/SoundTest';
import { Installer } from '../apps/Installer';
import { TimeMachine } from '../apps/TimeMachine';
import { DiskUtility } from '../apps/DiskUtility';

import { IPhoneMirroring } from '../apps/iPhoneMirroring';
import { Weather } from '../apps/Weather';
import { Notes } from '../apps/Notes';
import { Calendar } from '../apps/Calendar';
import { CrazyErrors } from '../apps/CrazyErrors';
import { GitHubNavigator } from '../apps/GitHubNavigator';
import { CodeViewer } from '../apps/CodeViewer';
import { SamsungLCDApp } from '../apps/SamsungLCDApp';

type WindowState = 'normal' | 'maximized' | 'fullscreen';

interface WindowProps {
  appId: string;
}

const AppMap: Record<string, React.FC<any>> = {
  finder: Finder,
  safari: Safari,
  settings: SystemSettings,
  terminal: TerminalApp,
  activitymonitor: ActivityMonitor,
  messages: Messages,
  photos: Photos,
  phone: Phone,
  maps: Maps,
  mail: Mail,
  appstore: AppStore,
  books: AppleBooks,
  wallet: AppleWallet,
  reminders: Reminders,
  stickies: Stickies,
  launchpad: Launchpad,
  facetime: FaceTime,
  contacts: Contacts,
  music: AppleMusic,
  tv: AppleTVPlus,
  itunes: ITunesStore,
  soundtest: SoundTest,
  installer: Installer,
  timemachine: TimeMachine,
  diskutility: DiskUtility,
  iphonemirroring: IPhoneMirroring,
  weather: Weather,
  notes: Notes,
  calendar: Calendar,
  crazyerrors: CrazyErrors,
  githubnavigator: GitHubNavigator,
  codeviewer: CodeViewer,
  samsunglcdtv: SamsungLCDApp,
};

const AppNotFound: React.FC<{ appId: string }> = ({ appId }) => (
  <div className="p-8 text-white">App not found: {appId}</div>
);

export const Window: React.FC<WindowProps> = ({ appId }) => {
  const { activeApp, setActiveApp, closeApp, quitApp, openApps, minimizedApps, minimizeApp, powerMode } = useSystem();
  const telemetry = useTelemetry();
  const controls = useDragControls();
  const windowRef = useRef<HTMLDivElement>(null);

  const [windowState, setWindowState] = useState<WindowState>('normal');
  const [size, setSize] = useState({ width: 800, height: 500 });
  const [position] = useState({ top: 80, left: 80 });
  const resizing = useRef<'right' | 'bottom' | 'corner' | null>(null);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const isActive = activeApp === appId;
  const isMinimized = minimizedApps.includes(appId);
  const isMaximized = windowState === 'maximized';
  const isFullscreen = windowState === 'fullscreen';
  const zIndex = appId === 'installer' ? 10000 : (isActive ? 50 : openApps.indexOf(appId) + 10);

  const AppContent = AppMap[appId];

  const appNames: Record<string, string> = {
    finder: 'Finder',
    safari: 'Safari',
    settings: 'System Settings',
    terminal: 'Terminal',
    activitymonitor: 'Activity Monitor',
    messages: 'Messages',
    photos: 'Photos',
    phone: 'Phone',
    maps: 'Maps',
    mail: 'Mail',
    appstore: 'App Store',
    books: 'Books',
    wallet: 'Wallet',
    reminders: 'Reminders',
    stickies: 'Stickies',
    launchpad: 'Launchpad',
    facetime: 'FaceTime',
    contacts: 'Contacts',
    music: 'Music',
    tv: 'Apple TV+',
    itunes: 'iTunes Store',
    soundtest: 'Sound Test',
    installer: 'Installer',
    timemachine: 'Time Machine',
    diskutility: 'Disk Utility',
    iphonemirroring: 'iPhone Mirroring',
    weather: 'Weather',
    notes: 'Notes',
    calendar: 'Calendar',
    crazyerrors: 'Crazy Errors',
    githubnavigator: 'GitHub Navigator',
    codeviewer: 'Code Viewer',
    samsunglcdtv: 'Samsung LCD TV Simulator',
  };

  const displayName = appNames[appId] || appId.charAt(0).toUpperCase() + appId.slice(1);

  const dragElastic = Math.max(0.1, 0.5 - (telemetry.cpuPressure * 0.4));

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!resizing.current) return;
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      setSize({
        width: Math.max(400, resizeStart.current.w + (resizing.current === 'right' || resizing.current === 'corner' ? dx : 0)),
        height: Math.max(300, resizeStart.current.h + (resizing.current === 'bottom' || resizing.current === 'corner' ? dy : 0)),
      });
    };
    const onMouseUp = () => { resizing.current = null; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const handleGreenDot = useCallback(() => {
    setWindowState(prev => {
      if (prev === 'normal') return 'maximized';
      if (prev === 'maximized') return 'fullscreen';
      return 'normal';
    });
  }, []);

  const handleClose = useCallback(() => {
    setWindowState('normal');
    if (appId === 'terminal' || appId === 'activitymonitor' || appId === 'installer') {
      quitApp(appId);
    } else {
      closeApp(appId);
    }
  }, [appId, closeApp, quitApp]);

  const handleMinimize = useCallback(() => {
    minimizeApp(appId);
  }, [appId, minimizeApp]);

  const handleDragEnd = () => {
    if (navigator.vibrate) {
      navigator.vibrate([15, 30, 15]);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen && isActive) {
        setWindowState(prev => prev === 'fullscreen' ? 'maximized' : prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen, isActive]);

  const genieVariants: Variants = {
    initial: {
      opacity: 0,
      scaleX: 0.1,
      scaleY: 0,
      y: 600,
      filter: "blur(40px) saturate(200%) brightness(1.2)",
    },
    animate: {
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
      scale: 1,
      y: 0,
      width: isFullscreen ? '100vw' : isMaximized ? '100vw' : size.width,
      height: isFullscreen ? '100vh' : isMaximized ? 'calc(100vh - 30px)' : size.height,
      top: isFullscreen ? 0 : isMaximized ? '30px' : position.top,
      left: isFullscreen ? 0 : isMaximized ? 0 : position.left,
      borderRadius: isFullscreen ? 0 : isMaximized ? 0 : '1rem',
      filter: "blur(0px) saturate(100%) brightness(1)",
      transition: {
        type: "spring",
        stiffness: 180,
        damping: 24,
        mass: 1.2,
        opacity: { duration: 0.4 },
        y: { type: "spring", stiffness: 220, damping: 28 }
      }
    },
    exit: {
      opacity: 0,
      scaleX: 0.2,
      scaleY: 0,
      y: 600,
      filter: "blur(40px) saturate(200%) brightness(1.5)",
      transition: {
        duration: 0.4,
        ease: [0.32, 0, 0.67, 0]
      }
    }
  };

  if (isMinimized) return null;

  const isEndurance = powerMode === 'Low Power';
  const isProMotion = powerMode === 'High Performance';

  const greenDotIcon: Record<WindowState, React.ReactNode> = {
    normal: null,
    maximized: (
      <svg width="6" height="6" viewBox="0 0 6 6" className="absolute text-white/80">
        <rect x="0.5" y="0.5" width="5" height="5" rx="1" fill="none" stroke="currentColor" strokeWidth="0.8" />
      </svg>
    ),
    fullscreen: (
      <svg width="6" height="6" viewBox="0 0 6 6" className="absolute text-white/80">
        <path d="M1 1h4v4H1z" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <path d="M0 0h2v2H0zM4 0h2v2H4zM0 4h2v2H0zM4 4h2v2H4z" fill="currentColor" />
      </svg>
    ),
  };

  return (
    <motion.div
      ref={windowRef}
      drag={!isMaximized && !isFullscreen}
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={dragElastic}
      onDragEnd={handleDragEnd}
      onPointerDown={() => setActiveApp(appId)}
      variants={genieVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        zIndex: isFullscreen ? 9999 : zIndex,
        position: 'fixed',
        ...(isFullscreen ? { width: '100vw', height: '100vh', top: 0, left: 0 } : {}),
      }}
      className={`overflow-hidden flex flex-col pointer-events-auto shadow-2xl transition-shadow ${isActive ? 'shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'shadow-[0_10px_30px_rgba(0,0,0,0.3)]'} ${isEndurance ? 'bg-amber-900/40 border-amber-500/30' : 'bg-white/5 dark:bg-black/20'} ${isProMotion ? 'border-white/40' : 'border-white/20'} ${isFullscreen ? 'rounded-none' : 'rounded-2xl'}`}
    >
      <div className={`absolute inset-0 saturate-[150%] pointer-events-none transition-all duration-1000 ${isEndurance ? '' : 'backdrop-blur-[40px]'} ${isProMotion ? 'backdrop-blur-[50px] saturate-[200%]' : ''}`} />

      {isFullscreen ? null : (
        <div
          className={`h-12 w-full flex items-center justify-between px-4 border-b border-white/10 select-none cursor-default relative z-10 transition-colors ${isActive ? 'bg-white/10' : 'bg-white/5'} ${isEndurance ? 'bg-amber-900/60' : ''}`}
          onPointerDown={(e) => {
            if (!isMaximized) {
              setActiveApp(appId);
              controls.start(e);
              if (navigator.vibrate) {
                navigator.vibrate(10);
              }
            }
          }}
        >
          <div className="flex items-center gap-2 w-20">
            <button
              onClick={(e) => { e.stopPropagation(); handleClose(); }}
              className="w-3.5 h-3.5 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 flex items-center justify-center border border-black/10"
            />
            <button
              onClick={(e) => { e.stopPropagation(); handleMinimize(); }}
              className="w-3.5 h-3.5 rounded-full bg-[#FEBC2E] hover:bg-[#FEBC2E]/80 flex items-center justify-center border border-black/10"
            />
            <button
              onClick={(e) => { e.stopPropagation(); handleGreenDot(); }}
              className="w-3.5 h-3.5 rounded-full bg-[#28C840] hover:bg-[#28C840]/80 flex items-center justify-center border border-black/10 relative group"
              title={windowState === 'normal' ? 'Maximize' : windowState === 'maximized' ? 'Enter Fullscreen' : 'Exit Fullscreen'}
            >
              {greenDotIcon[windowState]}
            </button>
          </div>

          <div className={`text-sm font-medium flex-1 text-center truncate pointer-events-none transition-opacity ${isActive ? 'text-white' : 'text-white/50'} ${isEndurance ? 'text-amber-100' : ''}`}>
            {displayName}
          </div>

          <div className="w-20" />
        </div>
      )}

      <div className={`flex-1 relative z-10 overflow-hidden ${isEndurance ? 'bg-amber-950/80' : 'bg-white/5'}`}>
        {AppContent ? <AppContent /> : <AppNotFound appId={appId} />}
      </div>

      {!isMaximized && !isFullscreen && (
        <>
          <div
            className="absolute right-0 top-0 w-1.5 h-full cursor-ew-resize z-20 hover:bg-blue-400/30"
            onPointerDown={(e) => {
              e.stopPropagation();
              resizing.current = 'right';
              resizeStart.current = { x: e.clientX, y: e.clientY, w: size.width, h: size.height };
            }}
          />
          <div
            className="absolute bottom-0 left-0 h-1.5 w-full cursor-ns-resize z-20 hover:bg-blue-400/30"
            onPointerDown={(e) => {
              e.stopPropagation();
              resizing.current = 'bottom';
              resizeStart.current = { x: e.clientX, y: e.clientY, w: size.width, h: size.height };
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-20 hover:bg-blue-400/40 rounded-bl"
            onPointerDown={(e) => {
              e.stopPropagation();
              resizing.current = 'corner';
              resizeStart.current = { x: e.clientX, y: e.clientY, w: size.width, h: size.height };
            }}
          />
        </>
      )}
    </motion.div>
  );
};
