import React, { useState, useEffect, useRef } from 'react';
import { useSystem } from '../../contexts/SystemContext';
import { 
  BatteryFullIcon, 
  BatteryCharging01Icon, 
  BatteryLowIcon, 
  BatteryMedium01Icon, 
  Wifi01Icon, 
  Settings01Icon, 
  Search01Icon
} from 'hugeicons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppIcon } from '../common/AppIcon';

interface MenuBarProps {
  toggleControlCenter: (e: React.MouseEvent) => void;
}

const ForceQuit: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { openApps, closeApp } = useSystem();
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-[350px] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto text-black dark:text-white"
        >
          <div className="p-4 flex flex-col items-center">
            <h2 className="text-lg font-bold mb-1">Force Quit Applications</h2>
            <p className="text-[11px] opacity-60 mb-4 text-center">If an application isn't responding, select it and click Force Quit.</p>
            
            <div className="w-full h-48 bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-lg overflow-y-auto mb-4">
               {openApps.length === 0 ? (
                 <div className="h-full flex items-center justify-center opacity-30 text-xs">No apps running</div>
               ) : (
                 openApps.map(appId => (
                   <div 
                     key={appId}
                     onClick={() => setSelectedApp(appId)}
                     className={`flex items-center gap-3 px-3 py-2 cursor-default transition-colors ${selectedApp === appId ? 'bg-blue-500 text-white' : 'hover:bg-blue-500/10'}`}
                   >
                     <div className="w-5 h-5">
                       <AppIcon id={appId} size={20} />
                     </div>
                     <span className="text-sm font-medium capitalize">{appId}</span>
                   </div>
                 ))
               )}
            </div>

            <div className="flex justify-end w-full gap-3">
              <button 
                onClick={onClose}
                className="px-4 py-1.5 rounded-md bg-black/5 dark:bg-white/10 text-sm font-medium hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button 
                disabled={!selectedApp}
                onClick={() => {
                  if (selectedApp) {
                    closeApp(selectedApp);
                    setSelectedApp(null);
                  }
                }}
                className="px-4 py-1.5 rounded-md bg-blue-500 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-colors"
              >
                Force Quit
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const MenuBar: React.FC<MenuBarProps> = ({ toggleControlCenter }) => {
  const { activeApp, setShowAboutWindow, launchApp, setBootState, battery, setShowSpotlight, showSpotlight } = useSystem();
  const [time, setTime] = useState(new Date());
  const [appleMenuOpen, setAppleMenuOpen] = useState(false);
  const [showForceQuit, setShowForceQuit] = useState(false);
  const appleMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (appleMenuRef.current && !appleMenuRef.current.contains(event.target as Node)) {
        setAppleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getActiveAppName = () => {
    if (!activeApp) return 'Finder';
    return activeApp.charAt(0).toUpperCase() + activeApp.slice(1);
  };

  const handlePowerAction = (action: string) => {
    setAppleMenuOpen(false);
    if (action === 'restart' || action === 'shutdown') {
      setBootState('booting');
    } else if (action === 'sleep' || action === 'lock' || action === 'logout') {
      setBootState('login');
    }
  };

  return (
    <div className="absolute top-0 left-0 right-0 h-[30px] flex justify-between items-center px-4 text-sm text-white z-40 bg-gradient-to-b from-black/40 to-transparent pointer-events-none">
      
      {/* LEFT SIDE: App Menu */}
      <div className="flex items-center gap-1 pointer-events-auto h-full pr-10">
        <div className="relative h-full" ref={appleMenuRef}>
          <div 
            className={`cursor-pointer px-3 h-full flex items-center rounded transition ${appleMenuOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
            onClick={() => setAppleMenuOpen(!appleMenuOpen)}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.057 10.774c-.024-2.615 2.135-3.87 2.233-3.93-1.215-1.777-3.105-2.019-3.778-2.046-1.61-.164-3.14.95-3.955.95-.815 0-2.09-.932-3.44-.905-1.777.027-3.413 1.034-4.326 2.62-1.84 3.195-.47 7.915 1.312 10.493.872 1.26 1.91 2.673 3.273 2.623 1.313-.05 1.81-.845 3.396-.845 1.586 0 2.033.845 3.421.82 1.412-.025 2.313-1.272 3.179-2.536 1-1.46 1.412-2.873 1.433-2.943-.03-.014-2.763-1.06-2.79-4.252zm-3.085-7.404c.725-.877 1.213-2.094 1.08-3.31-1.045.042-2.31.696-3.058 1.572-.673.782-1.262 2.023-1.102 3.213 1.166.09 2.355-.6 3.08-1.475z"/>
            </svg>
          </div>
          
          <AnimatePresence>
            {appleMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.1 }}
                className="absolute top-8 left-0 w-64 bg-black/60 backdrop-blur-[50px] saturate-[190%] border border-white/20 rounded-xl shadow-2xl py-2 z-50"
              >
                <div className="px-4 py-1.5 text-sm text-white hover:bg-blue-500 cursor-pointer" onClick={() => { setAppleMenuOpen(false); setShowAboutWindow(true); }}>About This Mac</div>
                <div className="border-b border-white/10 my-1 mx-2" />
                <div className="px-4 py-1.5 text-sm text-white hover:bg-blue-500 cursor-pointer" onClick={() => { setAppleMenuOpen(false); launchApp('settings'); }}>System Settings...</div>
                <div className="px-4 py-1.5 text-sm text-white hover:bg-blue-500 cursor-pointer" onClick={() => { setAppleMenuOpen(false); launchApp('appstore'); }}>App Store...</div>
                <div className="border-b border-white/10 my-1 mx-2" />
                <div className="px-4 py-1.5 text-sm text-white/50 cursor-default flex justify-between">Recent Items <span className="text-[10px]">▶</span></div>
                <div className="border-b border-white/10 my-1 mx-2" />
                <div className="px-4 py-1.5 text-sm text-white hover:bg-blue-500 cursor-pointer" onClick={() => { setAppleMenuOpen(false); setShowForceQuit(true); }}>Force Quit...</div>
                <div className="border-b border-white/10 my-1 mx-2" />
                <div className="px-4 py-1.5 text-sm text-white hover:bg-blue-500 cursor-pointer" onClick={() => handlePowerAction('sleep')}>Sleep</div>
                <div className="px-4 py-1.5 text-sm text-white hover:bg-blue-500 cursor-pointer" onClick={() => handlePowerAction('restart')}>Restart...</div>
                <div className="px-4 py-1.5 text-sm text-white hover:bg-blue-500 cursor-pointer" onClick={() => handlePowerAction('shutdown')}>Shut Down...</div>
                <div className="border-b border-white/10 my-1 mx-2" />
                <div className="px-4 py-1.5 text-sm text-white hover:bg-blue-500 cursor-pointer" onClick={() => handlePowerAction('lock')}>Lock Screen</div>
                <div className="px-4 py-1.5 text-sm text-white hover:bg-blue-500 cursor-pointer" onClick={() => handlePowerAction('logout')}>Log Out...</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Force Quit Modal Component will be used here */}
        <ForceQuit isOpen={showForceQuit} onClose={() => setShowForceQuit(false)} />

        <div className="font-semibold cursor-pointer px-3 h-full flex items-center hover:bg-white/10 rounded transition">
          {getActiveAppName()}
        </div>
        <div className="cursor-pointer px-3 h-full flex items-center hover:bg-white/10 rounded transition hidden md:flex">File</div>
        <div className="cursor-pointer px-3 h-full flex items-center hover:bg-white/10 rounded transition hidden md:flex">Edit</div>
        <div className="cursor-pointer px-3 h-full flex items-center hover:bg-white/10 rounded transition hidden md:flex">View</div>
        <div className="cursor-pointer px-3 h-full flex items-center hover:bg-white/10 rounded transition hidden lg:flex">Go</div>
        <div className="cursor-pointer px-3 h-full flex items-center hover:bg-white/10 rounded transition hidden lg:flex">Window</div>
        <div className="cursor-pointer px-3 h-full flex items-center hover:bg-white/10 rounded transition hidden lg:flex">Help</div>
      </div>

      {/* RIGHT SIDE: Status Menu */}
      <div className="flex items-center gap-1 pointer-events-auto h-full pl-10">
        <div className="cursor-pointer px-2 h-full flex items-center hover:bg-white/10 rounded transition gap-1">
          {battery.isCharging ? (
            <BatteryCharging01Icon size={14} className="rotate-90 hugeicon-tahoe text-green-400" />
          ) : battery.level > 0.8 ? (
            <BatteryFullIcon size={14} className="rotate-90 hugeicon-tahoe" />
          ) : battery.level > 0.3 ? (
            <BatteryMedium01Icon size={14} className="rotate-90 hugeicon-tahoe" />
          ) : (
            <BatteryLowIcon size={14} className="rotate-90 hugeicon-tahoe text-red-400" />
          )}
          <span className="text-[11px] font-medium">{Math.round(battery.level * 100)}%</span>
        </div>
        <div className="cursor-pointer px-2 h-full flex items-center hover:bg-white/10 rounded transition">
          <Wifi01Icon size={14} className="hugeicon-tahoe" />
        </div>
        <div 
          className="cursor-pointer px-2 h-full flex items-center hover:bg-white/10 rounded transition"
          onClick={() => setShowSpotlight(!showSpotlight)}
        >
          <Search01Icon size={14} className="hugeicon-tahoe" />
        </div>
        <div 
          className="cursor-pointer px-2 h-full flex items-center hover:bg-white/10 rounded transition"
          onClick={toggleControlCenter}
        >
          <Settings01Icon size={14} className="hugeicon-tahoe" />
        </div>
        <div className="cursor-pointer px-3 h-full flex items-center hover:bg-white/10 rounded transition font-medium">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};
