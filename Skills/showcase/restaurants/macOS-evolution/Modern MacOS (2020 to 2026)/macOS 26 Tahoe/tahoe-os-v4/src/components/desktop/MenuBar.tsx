import React, { useState, useEffect, useRef } from 'react';
import { useSystem } from '../../contexts/SystemContext';
import { 
  BatteryFullIcon, 
  BatteryCharging01Icon, 
  BatteryLowIcon, 
  BatteryMedium01Icon, 
  Wifi01Icon, 
  Settings01Icon, 
  Search01Icon,
  MagicWand01Icon
} from 'hugeicons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppIcon } from '../common/AppIcon';

interface MenuBarProps {
  toggleControlCenter: (e: React.MouseEvent) => void;
}

const IntelligencePopup: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { systemState, updateSystemState } = useSystem();
  const [key, setKey] = useState(systemState.apiKey || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    updateSystemState({ apiKey: key });
    setIsSaved(true);
    // In a real environment, we would trigger a backend/CLI write here.
    // For this simulation, we'll signal the "pulse" bridge.
    console.log('STARDUST_API_KEY_SYNC', key);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="absolute top-10 right-0 w-80 bg-black/60 backdrop-blur-[60px] saturate-[200%] border border-white/20 rounded-[28px] shadow-[0_30px_60px_rgba(0,0,0,0.5)] p-5 z-50 text-white overflow-hidden"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <MagicWand01Icon size={20} />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">Apple Intelligence</div>
            <div className="text-[10px] text-white/40 font-medium uppercase tracking-widest">System Controller</div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[11px] text-white/60 leading-relaxed">
            Configure your Gemini API key to enable system-wide natural language control and predictive intelligence.
          </p>

          <div className="relative">
            <input 
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Enter Gemini API Key..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-white/20"
            />
            {isSaved && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-green-400"
              >
                SAVED
              </motion.div>
            )}
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="flex-1 bg-white/10 hover:bg-white/20 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/5"
            >
              Update Pulse Key
            </button>
          </div>
          
          <div className="text-[9px] text-center text-white/20 uppercase font-bold tracking-[0.2em] pt-2">
            Encrypted & Silicon-Native
          </div>
        </div>

        {/* Starlight Ambient Glow */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/20 blur-[50px] pointer-events-none" />
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500/10 blur-[50px] pointer-events-none" />
      </motion.div>
    </>
  );
};

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

const MenuDropdown: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  items: { label?: string; action?: () => void; disabled?: boolean; shortcut?: string; separator?: boolean }[];
  style?: React.CSSProperties;
}> = ({ isOpen, onClose, items, style }) => {
  const { systemState } = useSystem();
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -5 }}
        transition={{ duration: 0.1 }}
        style={style}
        className={`absolute top-8 w-64 bg-black/60 saturate-[190%] border border-white/20 rounded-[20px] shadow-2xl py-2 z-50 overflow-hidden ${systemState.lowPowerMode ? '' : 'backdrop-blur-[50px]'}`}
      >
        {items.map((item, i) => (
          item.separator ? (
            <div key={i} className="border-b border-white/10 my-1 mx-2" />
          ) : (
            <div 
              key={i} 
              className={`px-4 py-1.5 text-[13px] flex justify-between items-center transition-colors ${item.disabled ? 'text-white/30 cursor-default' : 'text-white hover:bg-blue-500 cursor-pointer'}`}
              onClick={() => { if (!item.disabled && item.action) { item.action(); onClose(); } }}
            >
              <span>{item.label}</span>
              {item.shortcut && <span className="text-[10px] opacity-40 font-medium tracking-widest">{item.shortcut}</span>}
            </div>
          )
        ))}
      </motion.div>
    </>
  );
};

const BatteryDropdown: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  battery: { level: number; isCharging: boolean };
}> = ({ isOpen, battery, onClose }) => {
  const { powerMode, setPowerMode, launchApp } = useSystem();
  const [chargeLimit, setChargeLimit] = useState(false);
  
  if (!isOpen) return null;
  
  const modes: ('Low Power' | 'Normal' | 'High Performance')[] = ['Low Power', 'Normal', 'High Performance'];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -5 }}
        transition={{ duration: 0.1 }}
        className="absolute top-8 right-0 w-72 bg-black/60 backdrop-blur-[50px] saturate-[190%] border border-white/20 rounded-[24px] shadow-2xl p-4 z-50 overflow-hidden text-white"
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-white/50 uppercase tracking-widest">Battery</span>
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">Healthy</span>
        </div>
        
        <div className="flex flex-col items-center mb-6">
          <div className="text-4xl font-black mb-1">{Math.round(battery.level * 100)}%</div>
          <div className="text-[10px] text-white/40 font-medium uppercase tracking-[0.2em]">
            {battery.isCharging ? 'Power Adapter' : 'On Battery'}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1 px-1">Power Mode</div>
          {modes.map(mode => (
            <div 
              key={mode}
              onClick={() => setPowerMode(mode)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${powerMode === mode ? 'bg-blue-500/20 border border-blue-500/30' : 'hover:bg-white/5 border border-transparent'}`}
            >
              <span className={`text-xs font-medium ${powerMode === mode ? 'text-blue-400' : 'text-white/70'}`}>{mode}</span>
              {powerMode === mode && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex flex-col">
              <span className="text-xs font-bold">Maximum Capacity</span>
              <span className="text-[10px] text-white/40">Peak Performance Capability</span>
            </div>
            <span className="text-sm font-black">100%</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex flex-col">
              <span className="text-xs font-bold">Charge Limit: 80%</span>
              <span className="text-[10px] text-white/40">Optimized Battery Health</span>
            </div>
            <button 
              onClick={() => setChargeLimit(!chargeLimit)}
              className={`w-10 h-5 rounded-full transition-colors relative ${chargeLimit ? 'bg-blue-500' : 'bg-white/10'}`}
            >
              <motion.div 
                animate={{ x: chargeLimit ? 22 : 2 }}
                className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10">
          <div 
            className="px-2 py-1.5 text-[11px] text-white/60 hover:text-white hover:bg-blue-500 rounded-lg cursor-pointer transition-colors font-medium"
            onClick={() => { onClose(); launchApp('settings'); }}
          >
            Battery Settings...
          </div>
        </div>
      </motion.div>
    </>
  );
};

export const MenuBar: React.FC<MenuBarProps> = ({ toggleControlCenter }) => {
  const { activeApp, setShowAboutWindow, launchApp, setBootState, battery, setShowSpotlight, showSpotlight } = useSystem();
  const [time, setTime] = useState(new Date());
  const [appleMenuOpen, setAppleMenuOpen] = useState(false);
  const [batteryMenuOpen, setBatteryMenuOpen] = useState(false);
  const [intelligenceOpen, setIntelligenceOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showForceQuit, setShowForceQuit] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getActiveAppName = () => {
    if (!activeApp) return 'Finder';
    if (activeApp === 'settings') return 'System Settings';
    if (activeApp === 'appstore') return 'App Store';
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

  const getAppSpecificMenus = () => {
    const app = activeApp || 'finder';
    
    const baseMenus = {
      finder: {
        file: [
          { label: 'New Finder Window', shortcut: '⌘N' },
          { label: 'New Folder', shortcut: '⇧⌘N' },
          { separator: true },
          { label: 'Get Info', shortcut: '⌘I' },
          { label: 'Empty Trash...', action: () => console.log('Empty Trash') },
        ],
        edit: [
          { label: 'Undo', shortcut: '⌘Z' },
          { label: 'Redo', shortcut: '⇧⌘Z' },
          { separator: true },
          { label: 'Select All', shortcut: '⌘A' },
        ],
        go: [
          { label: 'Back', shortcut: '⌘[' },
          { label: 'Forward', shortcut: '⌘]' },
          { separator: true },
          { label: 'Applications', shortcut: '⇧⌘A' },
          { label: 'Documents', shortcut: '⇧⌘O' },
          { label: 'Desktop', shortcut: '⇧⌘D' },
        ]
      },
      safari: {
        file: [
          { label: 'New Tab', shortcut: '⌘T' },
          { label: 'New Window', shortcut: '⌘N' },
          { label: 'New Private Window', shortcut: '⇧⌘N' },
          { separator: true },
          { label: 'Open Location...', shortcut: '⌘L' },
          { label: 'Close Tab', shortcut: '⌘W' },
        ],
        edit: [
          { label: 'Undo', shortcut: '⌘Z' },
          { label: 'Redo', shortcut: '⇧⌘Z' },
          { separator: true },
          { label: 'Cut', shortcut: '⌘X' },
          { label: 'Copy', shortcut: '⌘C' },
          { label: 'Paste', shortcut: '⌘V' },
          { label: 'Writing Tools', shortcut: '⇧⌘W', action: () => console.log('Writing Tools') },
        ],
        view: [
          { label: 'Reload Page', shortcut: '⌘R' },
          { label: 'Show Sidebar', shortcut: '⇧⌘L' },
          { separator: true },
          { label: 'Enter Full Screen', shortcut: '⌃⌘F' },
        ]
      },
      terminal: {
        file: [
          { label: 'New Shell', shortcut: '⌘N' },
          { label: 'New Tab', shortcut: '⌘T' },
          { separator: true },
          { label: 'Close Window', shortcut: '⌘W' },
        ],
        edit: [
          { label: 'Copy', shortcut: '⌘C' },
          { label: 'Paste', shortcut: '⌘V' },
          { separator: true },
          { label: 'Clear Scrollback', shortcut: '⌘K' },
        ]
      }
    };

    return (baseMenus as any)[app] || baseMenus.finder;
  };

  const appMenus = getAppSpecificMenus();
  const menuKeys = Object.keys(appMenus).map(k => k.charAt(0).toUpperCase() + k.slice(1));

  return (
    <div className="absolute top-0 left-0 right-0 h-[30px] flex justify-between items-center px-4 text-sm text-white z-40 bg-gradient-to-b from-black/40 to-transparent pointer-events-none">
      
      <div className="flex items-center gap-1 pointer-events-auto h-full pr-10">
        <div className="relative h-full">
          <div 
            className={`cursor-pointer px-3 h-full flex items-center rounded transition ${appleMenuOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
            onClick={() => setAppleMenuOpen(!appleMenuOpen)}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.057 10.774c-.024-2.615 2.135-3.87 2.233-3.93-1.215-1.777-3.105-2.019-3.778-2.046-1.61-.164-3.14.95-3.955.95-.815 0-2.09-.932-3.44-.905-1.777.027-3.413 1.034-4.326 2.62-1.84 3.195-.47 7.915 1.312 10.493.872 1.26 1.91 2.673 3.273 2.623 1.313-.05 1.81-.845 3.396-.845 1.586 0 2.033.845 3.421.82 1.412-.025 2.313-1.272 3.179-2.536 1-1.46 1.412-2.873 1.433-2.943-.03-.014-2.763-1.06-2.79-4.252zm-3.085-7.404c.725-.877 1.213-2.094 1.08-3.31-1.045.042-2.31.696-3.058 1.572-.673.782-1.262 2.023-1.102 3.213 1.166.09 2.355-.6 3.08-1.475z"/>
            </svg>
          </div>
          
          <MenuDropdown 
            isOpen={appleMenuOpen} 
            onClose={() => setAppleMenuOpen(false)} 
            items={[
              { label: 'About This Mac', action: () => setShowAboutWindow(true) },
              { separator: true },
              { label: 'System Settings...', action: () => launchApp('settings') },
              { label: 'App Store...', action: () => launchApp('appstore') },
              { separator: true },
              { label: 'Force Quit...', action: () => setShowForceQuit(true) },
              { separator: true },
              { label: 'Sleep', action: () => handlePowerAction('sleep') },
              { label: 'Restart...', action: () => handlePowerAction('restart') },
              { label: 'Shut Down...', action: () => handlePowerAction('shutdown') },
              { separator: true },
              { label: 'Lock Screen', action: () => handlePowerAction('lock') },
              { label: 'Log Out...', action: () => handlePowerAction('logout') },
            ]}
          />
        </div>

        <ForceQuit isOpen={showForceQuit} onClose={() => setShowForceQuit(false)} />

        <div className="font-semibold cursor-pointer px-3 h-full flex items-center hover:bg-white/10 rounded transition">
          {getActiveAppName()}
        </div>

        {menuKeys.map((menu) => (
          <div key={menu} className="relative h-full hidden md:flex">
            <div 
              className={`cursor-pointer px-3 h-full flex items-center rounded transition ${activeMenu === menu ? 'bg-white/20' : 'hover:bg-white/10'}`}
              onClick={() => setActiveMenu(activeMenu === menu ? null : menu)}
            >
              {menu}
            </div>
            <MenuDropdown 
              isOpen={activeMenu === menu} 
              onClose={() => setActiveMenu(null)} 
              items={appMenus[menu.toLowerCase()]}
              style={{ left: 0 }}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 pointer-events-auto h-full pl-10">
        <div className="relative h-full">
          <div 
            className={`cursor-pointer px-2 h-full flex items-center rounded transition gap-1 ${batteryMenuOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
            onClick={() => setBatteryMenuOpen(!batteryMenuOpen)}
          >
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
          <BatteryDropdown isOpen={batteryMenuOpen} battery={battery} onClose={() => setBatteryMenuOpen(false)} />
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
        
        {/* Apple Intelligence Icon */}
        <div className="relative h-full">
          <div 
            className={`cursor-pointer px-2 h-full flex items-center rounded transition gap-1 ${intelligenceOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
            onClick={() => setIntelligenceOpen(!intelligenceOpen)}
          >
            <MagicWand01Icon size={16} className={`hugeicon-tahoe ${intelligenceOpen ? 'text-purple-400' : 'text-white/80'}`} />
          </div>
          <IntelligencePopup isOpen={intelligenceOpen} onClose={() => setIntelligenceOpen(false)} />
        </div>

        <div className="cursor-pointer px-3 h-full flex items-center hover:bg-white/10 rounded transition font-medium">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};
