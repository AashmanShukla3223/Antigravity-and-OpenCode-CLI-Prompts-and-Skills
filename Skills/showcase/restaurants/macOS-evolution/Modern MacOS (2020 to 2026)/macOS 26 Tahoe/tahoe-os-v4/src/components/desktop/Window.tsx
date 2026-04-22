import React, { useRef } from 'react';
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
import { iTunesStore } from '../apps/iTunesStore';
import { SoundTest } from '../apps/SoundTest';
import { Installer } from '../apps/Installer';

interface WindowProps {
  appId: string;
}

const AppMap: Record<string, React.FC> = {
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
  itunes: iTunesStore,
  soundtest: SoundTest,
  installer: Installer,
};

export const Window: React.FC<WindowProps> = ({ appId }) => {
  const { activeApp, setActiveApp, closeApp, openApps, minimizedApps, maximizedApps, minimizeApp, toggleMaximizeApp, powerMode } = useSystem();
  const telemetry = useTelemetry();
  const controls = useDragControls();
  const windowRef = useRef<HTMLDivElement>(null);

  const isActive = activeApp === appId;
  const isMinimized = minimizedApps.includes(appId);
  const isMaximized = maximizedApps.includes(appId);
  const zIndex = isActive ? 50 : openApps.indexOf(appId) + 10;

  const AppContent = AppMap[appId] || (() => <div className="p-8 text-white">App not found: {appId}</div>);

  // CPU resistance formula: higher cpu pressure = stiffer drag
  const dragElastic = Math.max(0.1, 0.5 - (telemetry.cpuPressure * 0.4));

  const handleDragEnd = () => {
    if (navigator.vibrate) {
      navigator.vibrate([15, 30, 15]); // Physical snap feedback
    }
  };

  // Genie Effect Variants
  const genieVariants: Variants = {
    initial: { 
      opacity: 0,
      scaleX: 0.1,
      scaleY: 0.05,
      y: 500,
      filter: "blur(15px) saturate(200%)",
    },
    animate: { 
      opacity: 1, 
      scaleX: 1,
      scaleY: 1, 
      scale: 1, 
      y: 0,
      width: isMaximized ? '100vw' : '800px',
      height: isMaximized ? 'calc(100vh - 30px)' : '500px',
      top: isMaximized ? '30px' : '80px',
      left: isMaximized ? 0 : '80px',
      borderRadius: isMaximized ? 0 : '1rem',
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 26
      }
    },
    exit: { 
      opacity: 0,
      scaleX: 0.1,
      scaleY: 0.05,
      y: 500, // Aim for Dock
      x: 0,
      filter: "blur(15px) saturate(200%)",
      transition: {
        duration: 0.5,
        ease: [0.645, 0.045, 0.355, 1.000] // Smooth cubic-bezier for "sucking" feel
      }
    }
  };

  if (isMinimized) return null;

  // Determine appearance based on power mode
  const isEndurance = powerMode === 'Low Power';
  const isProMotion = powerMode === 'High Performance';

  return (
    <motion.div
      ref={windowRef}
      drag={!isMaximized}
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
      style={{ zIndex, position: 'absolute' }}
      className={`rounded-2xl overflow-hidden flex flex-col pointer-events-auto shadow-2xl transition-shadow ${isActive ? 'shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'shadow-[0_10px_30px_rgba(0,0,0,0.3)]'} ${isEndurance ? 'bg-amber-900/40 border-amber-500/30' : 'bg-white/5 dark:bg-black/20'} ${isProMotion ? 'border-white/40' : 'border-white/20'}`}
    >
      {/* Liquid Glass Background - Low Power Mode check */}
      <div className={`absolute inset-0 saturate-[150%] pointer-events-none transition-all duration-1000 ${isEndurance ? '' : 'backdrop-blur-[40px]'} ${isProMotion ? 'backdrop-blur-[50px] saturate-[200%]' : ''}`} />

      {/* Title Bar */}
      <div 
        className={`h-12 w-full flex items-center justify-between px-4 border-b border-white/10 select-none cursor-default relative z-10 transition-colors ${isActive ? 'bg-white/10' : 'bg-white/5'} ${isEndurance ? 'bg-amber-900/60' : ''}`}
        onPointerDown={(e) => {
          if (!isMaximized) {
            setActiveApp(appId);
            controls.start(e);
            if (navigator.vibrate) {
              navigator.vibrate(10); // Tap feel
            }
          }
        }}
      >
        {/* Traffic Lights */}
        <div className="flex items-center gap-2 w-20">
          <button 
            onClick={(e) => { e.stopPropagation(); closeApp(appId); }}
            className="w-3.5 h-3.5 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 flex items-center justify-center border border-black/10"
          />
          <button 
            onClick={(e) => { e.stopPropagation(); minimizeApp(appId); }}
            className="w-3.5 h-3.5 rounded-full bg-[#FEBC2E] hover:bg-[#FEBC2E]/80 flex items-center justify-center border border-black/10"
          />
          <button 
            onClick={(e) => { e.stopPropagation(); toggleMaximizeApp(appId); }}
            className="w-3.5 h-3.5 rounded-full bg-[#28C840] hover:bg-[#28C840]/80 flex items-center justify-center border border-black/10"
          />
        </div>

        {/* Title */}
        <div className={`text-sm font-medium flex-1 text-center truncate pointer-events-none transition-opacity ${isActive ? 'text-white' : 'text-white/50'} ${isEndurance ? 'text-amber-100' : ''}`}>
          {appId.charAt(0).toUpperCase() + appId.slice(1)}
        </div>

        {/* Placeholder for right side to balance flex */}
        <div className="w-20" />
      </div>

      {/* Content Area */}
      <div className={`flex-1 relative z-10 overflow-hidden ${isEndurance ? 'bg-amber-950/80' : 'bg-white/5'}`}>
        <AppContent />
      </div>
    </motion.div>
  );
};
