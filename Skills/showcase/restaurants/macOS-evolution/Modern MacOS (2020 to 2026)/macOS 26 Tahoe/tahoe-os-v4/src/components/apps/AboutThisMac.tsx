import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cancel01Icon } from 'hugeicons-react';
import { useSystem } from '../../contexts/SystemContext';
import { FileSystemResolver } from '../../utils/FileSystemResolver';

export const AboutThisMac: React.FC = () => {
  const { showAboutWindow, setShowAboutWindow, launchApp, battery, hardware } = useSystem();
  
  const [gpuInfo] = useState(() => {
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
    } catch (e) {
      console.warn('WebGL not supported for GPU info');
    }
    return 'Apple M-Series GPU';
  });

  const [memoryInfo, setMemoryInfo] = useState(() => {
    if ((performance as any).memory) {
      const used = Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
      const total = Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024 / 1024);
      return { used, total: total || hardware.memory || 16 };
    }
    return { used: 0, total: hardware.memory || 16 };
  });

  // 1. The Intelligence: Classify the device
  const deviceType = useMemo(() => {
    const ua = navigator.userAgent;
    const isMobile = /Mobi|Android/i.test(ua) || (navigator as any).userAgentData?.mobile;
    const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua) || 
                    (!isMobile && navigator.maxTouchPoints > 0 && window.innerWidth < 1024);

    if (isMobile) return 'Smartphone';
    if (isTablet) return 'Tablet';
    
    if (battery && (battery.level < 1 || !battery.isCharging)) {
      return 'Laptop';
    }
    
    return 'Desktop';
  }, [battery]);

  useEffect(() => {
    if (showAboutWindow) {
      const updateMemory = () => {
        if ((performance as any).memory) {
          const used = Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
          const total = Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024 / 1024); // GB
          setMemoryInfo({ used, total: total || hardware.memory || 16 });
        }
      };
      
      updateMemory();
      const interval = setInterval(updateMemory, 2000);
      return () => clearInterval(interval);
    }
  }, [showAboutWindow, hardware.memory]);

  const handleMoreInfo = () => {
    setShowAboutWindow(false);
    launchApp('settings');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-settings-tab', { detail: { tab: 'General', step: 5 } }));
    }, 100);
  };

  if (!showAboutWindow) return null;

  // 2. The Visuals: High-Res Device Assets
  const renderDeviceImage = () => {
    const base = (import.meta as any).env?.BASE_URL || '/';
    
    switch (deviceType) {
      case 'Smartphone':
        return (
          <div className="relative w-48 h-48 flex items-center justify-center">
            <img 
              src={`${base}${FileSystemResolver.getDeviceIcon('phone-apple-iphone')}`} 
              className="w-32 h-32 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]" 
              alt="iPhone" 
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -z-10" />
          </div>
        );
      case 'Tablet':
        return (
          <div className="relative w-48 h-48 flex items-center justify-center">
            <img 
              src={`${base}${FileSystemResolver.getDeviceIcon('tablet')}`} 
              className="w-40 h-40 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]" 
              alt="iPad" 
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-pink-500/10 rounded-full blur-3xl -z-10" />
          </div>
        );
      case 'Laptop':
        return (
          <div className="relative w-48 h-48 flex items-center justify-center">
            <img 
              src={`${base}${FileSystemResolver.getDeviceIcon('computer-laptop', true)}`} 
              className="w-44 h-44 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]" 
              alt="MacBook" 
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-teal-500/10 rounded-full blur-3xl -z-10" />
          </div>
        );
      case 'Desktop':
      default:
        return (
          <div className="relative w-48 h-48 flex items-center justify-center">
             <img 
              src={`${base}${FileSystemResolver.getDeviceIcon('computer', true)}`} 
              className="w-44 h-44 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]" 
              alt="Mac Studio" 
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl -z-10" />
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none"
      >
        <div className="w-[320px] bg-white/10 dark:bg-black/60 backdrop-blur-[25px] border border-white/20 dark:border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden pointer-events-auto flex flex-col font-sans p-8 items-center text-center">
          
          <div className="absolute top-6 left-6">
            <button 
              onClick={() => setShowAboutWindow(false)}
              className="w-3 h-3 rounded-full bg-[#FF5F56] hover:bg-[#FF5F56]/80 flex items-center justify-center transition-colors group"
            >
              <Cancel01Icon size={8} className="text-black/50 opacity-0 group-hover:opacity-100" />
            </button>
          </div>

          <div className="w-full flex items-center justify-center drop-shadow-2xl mb-8 mt-4">
             {renderDeviceImage()}
          </div>

          <div className="flex flex-col text-black dark:text-white items-center w-full">
             <h1 className="text-2xl font-black tracking-tight mb-1">macOS <span className="font-light">Tahoe</span></h1>
             <p className="text-[10px] text-black/40 dark:text-white/40 mb-8 font-black uppercase tracking-[0.2em]">Version 26.0</p>
             
             <div className="space-y-4 font-mono text-[10px] text-black/60 dark:text-white/60 w-full px-2">
               <div className="flex flex-col gap-1 border-b border-black/5 dark:border-white/5 pb-3">
                 <span className="font-black text-black/90 dark:text-white uppercase tracking-widest text-[8px]">Processor</span>
                 <span className="truncate">{hardware.cores} Cores ({navigator.platform || 'Unknown'})</span>
               </div>
               <div className="flex flex-col gap-1 border-b border-black/5 dark:border-white/5 pb-3">
                 <span className="font-black text-black/90 dark:text-white uppercase tracking-widest text-[8px]">Graphics</span>
                 <span className="truncate">{gpuInfo}</span>
               </div>
               <div className="flex flex-col gap-1 border-b border-black/5 dark:border-white/5 pb-3">
                 <span className="font-black text-black/90 dark:text-white uppercase tracking-widest text-[8px]">Memory</span>
                 <span>{memoryInfo.total} GB</span>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="font-black text-black/90 dark:text-white uppercase tracking-widest text-[8px]">Serial Number</span>
                 <span className="font-bold text-blue-500">Auto-Generated</span>
               </div>
             </div>

             <div className="mt-8 flex flex-col gap-2 w-full">
               <button 
                 onClick={handleMoreInfo}
                 className="w-full py-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/10 rounded-xl text-[10px] font-bold transition-all shadow-sm"
               >
                 More Info...
               </button>
               <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={handleMoreInfo}
                    className="py-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/10 rounded-xl text-[10px] font-bold transition-all"
                  >
                    System Report
                  </button>
                  <a 
                    href="https://github.com/AashmanShukla3223/Gemini-CLI-Prompts-and-Skills/discussions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/10 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center"
                  >
                    Feedback
                  </a>
               </div>
             </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
