import React, { useState, useEffect } from 'react';
import { 
  Search01Icon, 
  Settings01Icon, 
  InformationCircleIcon, 
  Database01Icon, 
  Delete02Icon, 
  ArrowLeft01Icon, 
  LockIcon, 
  Alert01Icon, 
  ArrowRight01Icon,
  BatteryCharging01Icon,
  FlashIcon
} from 'hugeicons-react';
import { useSystem } from '../../contexts/SystemContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSystemResolver } from '../../utils/FileSystemResolver';

export const SystemSettings: React.FC = () => {
  const { 
    systemState, 
    updateSystemState, 
    resetSystem, 
    hardware, 
    setShowAboutWindow,
    battery
  } = useSystem();
  
  const [currentTab, setCurrentTab] = useState('Appearance');
  const [resetStep, setResetStep] = useState(0); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  
  const [brightness, setBrightness] = useState(80);
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 512, percent: 0 });

  const username = systemState.user.accountName || systemState.user.fullName || 'Architect';

  useEffect(() => {
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(estimate => {
        const used = Math.round((estimate.usage || 0) / 1024 / 1024);
        const total = 512; // Simulated Chromebook limit
        setStorageInfo({ used, total, percent: (used / total) * 100 });
      });
    }

    const handleOpenTab = (e: any) => {
      if (e.detail?.tab) setCurrentTab(e.detail.tab);
      if (e.detail?.step !== undefined) setResetStep(e.detail.step);
    };
    window.addEventListener('open-settings-tab', handleOpenTab);
    return () => window.removeEventListener('open-settings-tab', handleOpenTab);
  }, []);

  const handleReset = () => resetSystem('activation');
  const handlePasswordUnlock = () => {
    if (password === systemState.user.password || !systemState.user.password) setResetStep(4);
    else { setError(true); setTimeout(() => setError(false), 500); setPassword(''); }
  };
  const checkUpdates = () => { setIsCheckingUpdate(true); setTimeout(() => setIsCheckingUpdate(false), 2500); };

  const BatteryGraph = () => {
    const points = "0,80 20,70 40,85 60,60 80,75 100,40 120,55 140,30 160,45 180,20 200,35";
    return (
      <svg viewBox="0 0 200 100" className="w-full h-24 mt-4 overflow-visible">
        <defs>
          <linearGradient id="graphGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
        />
        <path
          d={`M ${points} V 100 H 0 Z`}
          fill="url(#graphGradient)"
        />
        <line x1="0" y1="20" x2="200" y2="20" stroke="white" strokeOpacity="0.05" strokeDasharray="4" />
        <line x1="0" y1="50" x2="200" y2="50" stroke="white" strokeOpacity="0.05" strokeDasharray="4" />
        <line x1="0" y1="80" x2="200" y2="80" stroke="white" strokeOpacity="0.05" strokeDasharray="4" />
      </svg>
    );
  };

  const [latestCommit, setLatestCommit] = useState<string | null>(null);

  useEffect(() => {
    if (systemState.betaUpdates) {
      fetch('https://api.github.com/repos/AashmanShukla3223/Gemini-CLI-Prompts-and-Skills/commits/main')
        .then(res => res.json())
        .then(data => {
          if (data && data.sha) setLatestCommit(data.sha.substring(0, 7));
        })
        .catch(err => console.error(err));
    }
  }, [systemState.betaUpdates]);

  const [gpuInfo, setGpuInfo] = useState('Apple GPU');
  const [deviceType, setDeviceType] = useState('Desktop');

  useEffect(() => {
    // 1. The Intelligence: Classify the device
    const ua = navigator.userAgent;
    const isMobile = /Mobi|Android/i.test(ua) || (navigator as any).userAgentData?.mobile;
    const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua) || 
                    (!isMobile && navigator.maxTouchPoints > 0 && window.innerWidth < 1024);

    if (isMobile) setDeviceType('Smartphone');
    else if (isTablet) setDeviceType('Tablet');
    else if (battery && (battery.level < 1 || !battery.isCharging)) setDeviceType('Laptop');
    else setDeviceType('Desktop');

    // 4. Real-Time Flex: GPU Info
    const getGPU = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            return renderer.replace(/ANGLE \(|\)|Direct3D.*|vs_.*|ps_.*/g, '').trim();
          }
        }
      } catch (e) {}
      return 'Apple M-Series GPU';
    };
    setGpuInfo(getGPU());
  }, [battery]);

  const renderDeviceImage = () => {
    switch (deviceType) {
      case 'Smartphone':
        return (
          <div className="relative w-20 h-36 bg-zinc-900 rounded-[1.5rem] border-4 border-zinc-800 shadow-2xl flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20" />
            <div className="w-10 h-10 rounded-full bg-blue-500/30 blur-2xl animate-pulse" />
            <div className="absolute top-2 w-8 h-3 bg-black rounded-full" />
          </div>
        );
      case 'Tablet':
        return (
          <div className="relative w-32 h-44 bg-zinc-900 rounded-[1rem] border-4 border-zinc-800 shadow-2xl flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-pink-500/20" />
             <div className="w-16 h-16 rounded-full bg-indigo-500/30 blur-3xl animate-pulse" />
          </div>
        );
      case 'Laptop':
        return (
          <div className="relative w-40 h-28 flex flex-col items-center justify-end">
            <div className="w-36 h-24 bg-zinc-900 rounded-t-lg border-4 border-zinc-800 shadow-2xl flex items-center justify-center overflow-hidden relative z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-teal-500/10" />
              <div className="w-12 h-12 rounded-full bg-blue-400/30 blur-2xl animate-pulse" />
            </div>
            <div className="w-40 h-2 bg-zinc-400 rounded-b-lg shadow-xl relative z-20" />
          </div>
        );
      default:
        return (
          <div className="relative w-40 h-36 flex flex-col items-center justify-end">
             <div className="w-40 h-28 bg-zinc-900 rounded-lg border-4 border-zinc-800 shadow-2xl flex items-center justify-center overflow-hidden relative z-10">
               <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
               <div className="w-16 h-16 rounded-full bg-purple-500/30 blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
             </div>
             <div className="w-10 h-8 bg-zinc-300 relative z-0 -mt-1 shadow-inner" />
             <div className="w-24 h-2 bg-zinc-400 rounded-t-lg shadow-xl relative z-20" />
          </div>
        );
    }
  };

  const renderGeneralContent = () => {
    switch (resetStep) {
      case 5: return (
        <div className="flex flex-col h-full overflow-y-auto pr-4 scrollbar-hide pb-12">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setResetStep(0)} className="p-1 hover:bg-white/10 rounded-full transition"><ArrowLeft01Icon size={20} className="hugeicon-tahoe" /></button>
            <h2 className="text-2xl font-semibold">About</h2>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-3xl p-10 flex flex-col items-center text-center">
             <div className="mb-8 drop-shadow-2xl">
                {renderDeviceImage()}
             </div>
             
             <h3 className="text-3xl font-black mb-1">macOS <span className="font-light">Tahoe</span></h3>
             <p className="text-xs text-white/40 mb-10 font-black uppercase tracking-[0.3em]">Version 26.0 (Build 26A405)</p>
             
             <div className="w-full space-y-6 max-w-md text-left font-mono text-[11px]">
               <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
                 <span className="text-white/30 uppercase tracking-widest font-black text-[9px]">Processor</span>
                 <span className="text-white font-medium">{hardware.cores} Cores ({navigator.platform || 'Unknown'})</span>
               </div>
               <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
                 <span className="text-white/30 uppercase tracking-widest font-black text-[9px]">Graphics</span>
                 <span className="text-white font-medium">{gpuInfo}</span>
               </div>
               <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
                 <span className="text-white/30 uppercase tracking-widest font-black text-[9px]">Memory</span>
                 <span className="text-white font-medium">{hardware.memory} GB</span>
               </div>
               <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
                 <span className="text-white/30 uppercase tracking-widest font-black text-[9px]">Storage</span>
                 <span className="text-white font-medium">{storageInfo.total} GB</span>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-white/30 uppercase tracking-widest font-black text-[9px]">Serial Number</span>
                 <span className="text-blue-500 font-bold">Auto-Generated</span>
               </div>
             </div>

             <div className="mt-12 flex gap-3 w-full max-w-md">
                <button onClick={() => setShowAboutWindow(true)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-bold transition">System Report...</button>
                <a 
                  href="https://github.com/AashmanShukla3223/Gemini-CLI-Prompts-and-Skills/discussions" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-bold transition flex items-center justify-center"
                >
                  Feedback
                </a>
             </div>
          </div>
          
          <div className="mt-8 space-y-2">
             <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                <div>
                   <span className="text-sm font-medium block">Regulatory Certification</span>
                   <span className="text-[10px] text-white/30">United States, European Union, Japan, China</span>
                </div>
                <ArrowRight01Icon size={16} className="text-white/20" />
             </div>
             <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                <div>
                   <span className="text-sm font-medium block">Limited Warranty</span>
                   <span className="text-xs text-green-500 font-bold">Active</span>
                </div>
                <span className="text-xs text-white/40">Expires: June 22, 2027</span>
             </div>
             <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                <div>
                   <span className="text-sm font-medium block">Technical Support</span>
                   <span className="text-xs text-white/40">Complimentary telephone support: Active</span>
                </div>
                <ArrowRight01Icon size={16} className="text-white/20" />
             </div>
          </div>
        </div>
      );
      case 6: return (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setResetStep(0)} className="p-1 hover:bg-white/10 rounded-full transition"><ArrowLeft01Icon size={20} className="hugeicon-tahoe" /></button>
            <h2 className="text-2xl font-semibold">Software Update</h2>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6 flex flex-col items-center justify-center text-center">
            {isCheckingUpdate ? (
              <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-6"/><h3 className="text-xl font-medium">Checking for updates...</h3></>
            ) : (
              <><div className="w-20 h-20 rounded-3xl bg-blue-500/20 flex items-center justify-center text-blue-500 mb-6"><Settings01Icon size={40} /></div><h3 className="text-2xl font-bold mb-2">macOS Tahoe {systemState.betaUpdates && latestCommit ? `(Build ${latestCommit})` : '26.4'}</h3><p className="text-white/50 mb-8">Your Mac is up to date.</p><button onClick={checkUpdates} className="px-8 h-12 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition">Check for Updates</button></>
            )}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm">Beta Updates</h4>
              <p className="text-xs text-white/50">Receive pre-release builds from GitHub.</p>
            </div>
            <button 
              onClick={() => updateSystemState({ betaUpdates: !systemState.betaUpdates })} 
              className={`w-12 h-6 rounded-full relative transition-colors ${systemState.betaUpdates ? 'bg-blue-500' : 'bg-white/10'}`}
            >
              <motion.div animate={{ x: systemState.betaUpdates ? 26 : 2 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow" />
            </button>
          </div>
        </div>
      );
      case 7: return (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setResetStep(0)} className="p-1 hover:bg-white/10 rounded-full transition"><ArrowLeft01Icon size={20} className="hugeicon-tahoe" /></button>
            <h2 className="text-2xl font-semibold">Storage</h2>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
             <div className="flex justify-between items-end mb-4">
               <div className="flex flex-col">
                  <span className="text-lg font-bold">Macintosh HD</span>
                  <span className="text-xs text-white/40">{storageInfo.used} MB of {storageInfo.total} MB used</span>
               </div>
               <span className="text-sm font-black text-blue-400">{Math.round(100 - storageInfo.percent)}% Free</span>
             </div>
             <div className="w-full h-10 bg-white/5 rounded-2xl border border-white/10 overflow-hidden flex shadow-inner">
                <div className="h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]" style={{ width: `${Math.max(2, storageInfo.percent)}%` }} title="Apps" />
                <div className="h-full bg-purple-500" style={{ width: '8%' }} title="System" />
                <div className="h-full bg-orange-500" style={{ width: '4%' }} title="Cache" />
             </div>
             <div className="flex gap-8 mt-8">
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-xs font-bold text-white/60">Apps</span></div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500" /><span className="text-xs font-bold text-white/60">System</span></div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500" /><span className="text-xs font-bold text-white/60">Cache</span></div>
             </div>
             <div className="mt-12 p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Database01Icon size={28} className="text-blue-400" />
                  <div><h4 className="font-bold text-sm">Optimize Storage</h4><p className="text-xs text-white/50">Automatically remove old files to free up space.</p></div>
                </div>
                <button className="px-5 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl text-xs font-black transition">Turn On...</button>
             </div>
          </div>
        </div>
      );
      case 1: return (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setResetStep(0)} className="p-1 hover:bg-white/10 rounded-full transition"><ArrowLeft01Icon size={20} className="hugeicon-tahoe" /></button>
            <h2 className="text-2xl font-semibold">Transfer or Reset</h2>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-start gap-4 mb-8"><div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400"><Database01Icon size={24} /></div><div><h3 className="text-lg font-medium mb-1">Prepare for New Mac</h3><p className="text-sm text-white/50">Move your data to a new Mac seamlessly.</p></div></div>
            <button className="w-full h-12 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition mb-4">Get Started</button>
            <div className="border-t border-white/5 my-6" />
            <button onClick={() => setResetStep(2)} className="w-full h-12 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition px-4 text-left">Erase All Content and Settings...</button>
          </div>
        </div>
      );
      case 2: return (
        <div className="flex flex-col items-center max-w-lg mx-auto py-8">
          <div className="w-20 h-20 rounded-3xl bg-red-500/20 flex items-center justify-center text-red-500 mb-6"><Delete02Icon size={40} /></div>
          <h2 className="text-3xl font-bold mb-4 text-center">Erase All Content and Settings</h2>
          <p className="text-center text-white/60 mb-8">All settings, data, and media will be erased. This cannot be undone.</p>
          <div className="flex gap-4 w-full">
            <button onClick={() => setResetStep(1)} className="flex-1 h-12 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition">Cancel</button>
            <button onClick={() => setResetStep(3)} className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium transition shadow-lg shadow-blue-500/20">Continue</button>
          </div>
        </div>
      );
      case 3: return (
        <div className="flex flex-col items-center max-w-sm mx-auto py-12">
          <motion.div animate={{ x: error ? [0, -10, 10, -10, 10, 0] : 0 }} transition={{ duration: 0.4 }} className="flex flex-col items-center w-full">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6"><LockIcon size={24} className={error ? 'text-red-500' : 'text-white/60'} /></div>
            <h2 className="text-2xl font-bold mb-2">Password Required</h2>
            <p className="text-center text-white/50 text-sm mb-8">Enter password for "{username}".</p>
            <input type="password" placeholder="Password" value={password} onChange={(e) => { setPassword(e.target.value); setError(false); }} className={`w-full h-12 bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/20'} rounded-xl px-4 text-center focus:outline-none transition-all mb-4`} autoFocus />
            <div className="flex gap-4 w-full">
               <button onClick={() => setResetStep(2)} className="flex-1 h-12 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition">Back</button>
               <button onClick={handlePasswordUnlock} className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium transition">Unlock</button>
            </div>
          </motion.div>
        </div>
      );
      case 4: return (
        <div className="flex flex-col items-center max-w-lg mx-auto py-8 text-center">
          <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-white mb-6 shadow-2xl"><Alert01Icon size={40} /></div>
          <h2 className="text-3xl font-bold mb-4">Are you sure?</h2>
          <div className="flex flex-col gap-3 w-full">
             <button onClick={handleReset} className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-lg transition-all">Erase All Content & Settings</button>
             <button onClick={() => setResetStep(0)} className="w-full h-12 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition">Cancel</button>
          </div>
        </div>
      );
      default: return (
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-semibold mb-6">General</h2>
          <div className="space-y-1">
            {[
              { name: 'About', icon: InformationCircleIcon, action: () => setResetStep(5) },
              { name: 'Software Update', icon: Settings01Icon, action: () => setResetStep(6) },
              { name: 'Storage', icon: Database01Icon, action: () => setResetStep(7) },
              { name: 'Transfer or Reset', icon: ArrowLeft01Icon, action: () => setResetStep(1) },
            ].map(item => (
              <div key={item.name} onClick={item.action} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl cursor-pointer transition-colors group">
                <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-gray-500/20 flex items-center justify-center group-hover:bg-gray-500/30 transition-colors"><item.icon size={20} className="text-white/70" /></div><span className="font-medium">{item.name}</span></div>
                <ArrowRight01Icon size={16} className="text-white/20 group-hover:text-white/50" />
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex h-full w-full text-white bg-black/40 backdrop-blur-3xl overflow-hidden">
      <div className="w-56 bg-black/20 border-r border-white/10 flex flex-col">
        <div className="p-3">
          <div className="relative">
            <Search01Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input type="text" placeholder="Search" className="w-full bg-white/10 border border-white/10 rounded-md py-1 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-hide">
          <div className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-xl cursor-pointer mb-4 bg-white/5 border border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl">{systemState.user.avatar || '👤'}</div>
            <div className="flex flex-col"><span className="text-sm font-bold truncate w-24">{systemState.user.fullName || username}</span><span className="text-[9px] uppercase font-black text-white/30 tracking-[0.2em]">Apple Account</span></div>
          </div>
          <div className="text-[10px] font-bold text-white/30 px-2 py-1 mb-1 mt-2 tracking-widest uppercase">Connectivity</div>
          <SidebarItem name="Wi-Fi" iconUrl={FileSystemResolver.getPreferenceIcon('network-wireless-hotspot')} color="bg-blue-500" active={currentTab === 'Wi-Fi'} onClick={() => setCurrentTab('Wi-Fi')} />
          <SidebarItem name="Bluetooth" iconUrl={FileSystemResolver.getPreferenceIcon('preferences-system-bluetooth')} color="bg-blue-600" active={currentTab === 'Bluetooth'} onClick={() => setCurrentTab('Bluetooth')} />
          <div className="text-[10px] font-bold text-white/30 px-2 py-1 mb-1 mt-4 tracking-widest uppercase">Personalization</div>
          <SidebarItem name="Appearance" iconUrl={FileSystemResolver.getPreferenceIcon('preferences-desktop-theme-global')} color="bg-gradient-to-br from-indigo-500 to-blue-600" active={currentTab === 'Appearance'} onClick={() => { setCurrentTab('Appearance'); setResetStep(0); }} />
          <SidebarItem name="Wallpaper" iconUrl={FileSystemResolver.getPreferenceIcon('preferences-desktop-wallpaper')} color="bg-gradient-to-br from-pink-500 to-red-600" active={currentTab === 'Wallpaper'} onClick={() => setCurrentTab('Wallpaper')} />
          <SidebarItem name="General" iconUrl={FileSystemResolver.getPreferenceIcon('preferences-system')} color="bg-gray-500" active={currentTab === 'General'} onClick={() => { setCurrentTab('General'); setResetStep(0); }} />
          <div className="text-[10px] font-bold text-white/30 px-2 py-1 mb-1 mt-4 tracking-widest uppercase">Hardware</div>
          <SidebarItem name="Display" iconUrl={FileSystemResolver.getPreferenceIcon('preferences-desktop-display')} color="bg-blue-400" active={currentTab === 'Display'} onClick={() => setCurrentTab('Display')} />
          <SidebarItem name="Sound" iconUrl={FileSystemResolver.getPreferenceIcon('preferences-desktop-sound')} color="bg-pink-500" active={currentTab === 'Sound'} onClick={() => setCurrentTab('Sound')} />
          <SidebarItem name="Battery" iconUrl={FileSystemResolver.getPreferenceIcon('preferences-system-power')} color="bg-green-500" active={currentTab === 'Battery'} onClick={() => setCurrentTab('Battery')} />
          <SidebarItem name="Wallet & Apple Pay" iconUrl={FileSystemResolver.getPreferenceIcon('preferences-desktop-cryptography')} color="bg-zinc-900" active={currentTab === 'Wallet'} onClick={() => setCurrentTab('Wallet')} />
        </div>
      </div>
      <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          <motion.div key={currentTab + resetStep} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="h-full">
            {currentTab === 'Appearance' && (
              <>
                <h2 className="text-2xl font-semibold mb-6">Appearance</h2>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                  <div><h3 className="font-medium text-lg text-white">Theme</h3><p className="text-sm text-white/50">Choose how macOS Tahoe looks.</p></div>
                  <div className="flex gap-4 mt-4">
                    <AppearanceCard mode="Light" active={systemState.appearance === 'light'} onClick={() => updateSystemState({ appearance: 'light' })} />
                    <AppearanceCard mode="Dark" active={systemState.appearance === 'dark'} onClick={() => updateSystemState({ appearance: 'dark' })} />
                    <AppearanceCard mode="Auto" active={systemState.appearance === 'auto'} onClick={() => updateSystemState({ appearance: 'auto' })} />
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">Sidebar Material</h4>
                    <p className="text-xs text-white/50">Use a Tinted or Clear refractive background for sidebars.</p>
                  </div>
                  <div className="flex bg-black/40 rounded-lg p-1">
                    <button 
                      onClick={() => updateSystemState({ sidebarMaterial: 'tinted' })} 
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${systemState.sidebarMaterial === 'tinted' ? 'bg-white/20 text-white shadow-md' : 'text-white/50 hover:text-white/80'}`}
                    >
                      Tinted
                    </button>
                    <button 
                      onClick={() => updateSystemState({ sidebarMaterial: 'clear' })} 
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${systemState.sidebarMaterial === 'clear' ? 'bg-white/20 text-white shadow-md' : 'text-white/50 hover:text-white/80'}`}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </>
            )}
            {currentTab === 'General' && renderGeneralContent()}
            {currentTab === 'Battery' && (
              <div className="flex flex-col h-full">
                <h2 className="text-2xl font-semibold mb-6">Battery</h2>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
                  <div className="flex justify-between items-center mb-8">
                     <div className="flex flex-col"><span className="text-4xl font-black">{Math.round(battery.level * 100)}%</span><span className="text-sm text-white/40 font-bold uppercase tracking-widest">{battery.isCharging ? 'Power Adapter' : 'On Battery'}</span></div>
                     <div className={`w-16 h-16 rounded-3xl bg-green-500/20 flex items-center justify-center text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)]`}><BatteryCharging01Icon size={32} /></div>
                  </div>
                  <div className="w-full space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <FlashIcon size={24} className="text-yellow-400" />
                        <div><h4 className="font-bold text-sm">Low Power Mode</h4><p className="text-xs text-white/40">Disables Gaussian blurs to preserve RAM.</p></div>
                      </div>
                      <button 
                        onClick={() => updateSystemState({ lowPowerMode: !systemState.lowPowerMode })} 
                        className={`w-12 h-6 rounded-full relative transition-colors ${systemState.lowPowerMode ? 'bg-green-500' : 'bg-white/10'}`}
                      >
                        <motion.div animate={{ x: systemState.lowPowerMode ? 26 : 2 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow" />
                      </button>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <h4 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Battery Health</h4>
                      <div className="flex justify-between items-center mb-2"><span className="text-sm font-medium">Maximum Capacity</span><span className="text-sm font-black">100%</span></div>
                      <p className="text-xs text-white/40">Healthy: Normal. Your battery is currently supporting normal peak performance.</p>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/5">
                     <h4 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">Power Usage (Last 24h)</h4>
                     <BatteryGraph />
                  </div>
                </div>
              </div>
            )}
            {currentTab === 'Wallpaper' && (
              <div className="flex flex-col h-full">
                <h2 className="text-2xl font-semibold mb-6">Wallpaper</h2>
                <div className="grid grid-cols-2 gap-6 pb-8">
                  <div 
                    className={`relative rounded-2xl overflow-hidden cursor-pointer border-4 transition-all ${systemState.wallpaperUrl === '/wallpapers/tahoe-light.png' ? 'border-blue-500 scale-[1.02]' : 'border-white/10 hover:border-white/30'}`}
                    onClick={() => updateSystemState({ wallpaperUrl: '/wallpapers/tahoe-light.png', wallpaperType: 'image' })}
                  >
                    <img src="/wallpapers/tahoe-light.png" alt="Tahoe Light" className="w-full aspect-video object-cover" />
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-wider">Tahoe Light</div>
                  </div>
                  <div 
                    className={`relative rounded-2xl overflow-hidden cursor-pointer border-4 transition-all ${systemState.wallpaperUrl === '/wallpapers/tahoe-dark.png' ? 'border-blue-500 scale-[1.02]' : 'border-white/10 hover:border-white/30'}`}
                    onClick={() => updateSystemState({ wallpaperUrl: '/wallpapers/tahoe-dark.png', wallpaperType: 'image' })}
                  >
                    <img src="/wallpapers/tahoe-dark.png" alt="Tahoe Dark" className="w-full aspect-video object-cover" />
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-wider">Tahoe Dark</div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm">Dynamic Wallpaper</h4>
                      <p className="text-xs text-white/50">Automatically change wallpaper based on time of day.</p>
                    </div>
                    <button 
                      onClick={() => updateSystemState({ dynamicWallpaperEnabled: !systemState.dynamicWallpaperEnabled })} 
                      className={`w-12 h-6 rounded-full relative transition-colors ${systemState.dynamicWallpaperEnabled ? 'bg-blue-500' : 'bg-white/10'}`}
                    >
                      <motion.div animate={{ x: systemState.dynamicWallpaperEnabled ? 26 : 2 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            {currentTab === 'Display' && (
              <div className="flex flex-col h-full">
                <h2 className="text-2xl font-semibold mb-6">Display</h2>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center">
                  <div className="w-full space-y-6">
                    <div><div className="flex justify-between text-sm mb-2"><span className="font-medium">Brightness</span><span className="text-white/50">{brightness}%</span></div><input type="range" value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" /></div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5"><div><h4 className="font-bold text-sm">True Tone</h4><p className="text-xs text-white/40">Automatically adapt display to ambient lighting.</p></div><button className="w-10 h-5 rounded-full bg-blue-500 relative"><div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full" /></button></div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const SidebarItem = ({ name, iconUrl, color, active, onClick }: any) => (
  <div onClick={onClick} className={`px-2 py-1.5 rounded-lg flex items-center gap-3 cursor-pointer transition-all ${active ? 'bg-blue-500 text-white shadow-lg' : 'text-white/80 hover:bg-white/10'}`}>
    <div className={`w-6 h-6 rounded-md ${color} flex items-center justify-center shadow-sm`}>
      {iconUrl ? <img src={iconUrl} alt={name} className="w-4 h-4 object-contain" loading="lazy" /> : null}
    </div>
    <span className="text-sm font-medium">{name}</span>
  </div>
);

const AppearanceCard = ({ mode, active, onClick }: any) => (
  <div className="flex flex-col gap-2 items-center cursor-pointer group" onClick={onClick}>
    <div className={`w-24 h-16 rounded-md border-2 transition-all ${active ? 'border-blue-500 scale-105 shadow-lg shadow-blue-500/20' : 'border-transparent bg-white/5 hover:bg-white/10'}`}>
       <div className={`w-full h-full rounded-sm ${mode === 'Light' ? 'bg-gray-100' : mode === 'Dark' ? 'bg-zinc-800' : 'bg-gradient-to-r from-gray-100 to-zinc-800'}`} />
    </div>
    <span className={`text-xs font-medium ${active ? 'text-blue-400' : 'text-white/70 group-hover:text-white'}`}>{mode}</span>
  </div>
);
