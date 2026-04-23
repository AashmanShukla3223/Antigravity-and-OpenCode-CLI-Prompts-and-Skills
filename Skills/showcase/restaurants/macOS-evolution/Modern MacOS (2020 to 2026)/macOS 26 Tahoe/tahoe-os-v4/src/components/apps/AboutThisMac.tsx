import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cancel01Icon } from 'hugeicons-react';
import { useSystem } from '../../contexts/SystemContext';

export const AboutThisMac: React.FC = () => {
  const { showAboutWindow, setShowAboutWindow, launchApp, battery, hardware } = useSystem();
  const [gpuInfo, setGpuInfo] = useState('Apple GPU');
  const [memoryInfo, setMemoryInfo] = useState({ used: 0, total: hardware.memory || 16 });

  // 1. The Intelligence: Classify the device
  const deviceType = useMemo(() => {
    const ua = navigator.userAgent;
    const isMobile = /Mobi|Android/i.test(ua) || (navigator as any).userAgentData?.mobile;
    const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua) || 
                    (!isMobile && navigator.maxTouchPoints > 0 && window.innerWidth < 1024);

    if (isMobile) return 'Smartphone';
    if (isTablet) return 'Tablet';
    
    // If battery.charging is detected on a desktop agent (not mobile/tablet) -> Laptop
    // Otherwise Desktop Monitor
    // We check if battery exists and has a level less than 1, or is charging but not full, 
    // or just rely on the navigator battery API to differentiate. 
    // Note: Chrome on Desktop PC also exposes getBattery. 
    // We'll use a rough heuristic: if battery level is not exactly 1 or charging is false, it's a laptop.
    // Otherwise, assume it's a Mac Studio / Desktop.
    if (battery && (battery.level < 1 || !battery.isCharging)) {
      return 'Laptop';
    }
    
    // Fallback for Desktop
    return 'Desktop';
  }, [battery]);

  useEffect(() => {
    if (showAboutWindow) {
      // 4. Real-Time Flex: CPU/GPU Info
      const getGPU = () => {
        try {
          const canvas = document.createElement('canvas');
          const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
          if (gl) {
            const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
              const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
              // Clean up common messy GPU strings
              return renderer.replace(/ANGLE \(|\)|Direct3D.*|vs_.*|ps_.*/g, '').trim();
            }
          }
        } catch (e) {
          console.warn('WebGL not supported for GPU info');
        }
        return 'Apple M-Series GPU';
      };
      setGpuInfo(getGPU() || 'Apple M-Series GPU');

      // Update memory dynamically using performance API if available
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
    launchApp('system-settings');
    // Give System Settings a moment to mount/open if it wasn't already
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-settings-tab', { detail: { tab: 'General', step: 5 } }));
    }, 100);
  };

  if (!showAboutWindow) return null;

  // 2. The Visuals: 3D Photorealistic Render placeholders
  const renderDeviceImage = () => {
    switch (deviceType) {
      case 'Smartphone':
        return (
          <div className="relative w-32 h-56 bg-zinc-900 rounded-[2rem] border-4 border-zinc-800 shadow-2xl flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20" />
            <div className="w-16 h-16 rounded-full bg-blue-500/30 blur-2xl animate-pulse" />
            <div className="absolute top-2 w-12 h-4 bg-black rounded-full" />
          </div>
        );
      case 'Tablet':
        return (
          <div className="relative w-48 h-64 bg-zinc-900 rounded-[1.5rem] border-4 border-zinc-800 shadow-2xl flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-pink-500/20" />
             <div className="w-24 h-24 rounded-full bg-indigo-500/30 blur-3xl animate-pulse" />
          </div>
        );
      case 'Laptop':
        return (
          <div className="relative w-56 h-36 flex flex-col items-center justify-end">
            {/* Screen */}
            <div className="w-52 h-32 bg-zinc-900 rounded-t-xl border-4 border-zinc-800 shadow-2xl flex items-center justify-center overflow-hidden relative z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-teal-500/10" />
              <div className="w-20 h-20 rounded-full bg-blue-400/30 blur-2xl animate-pulse" />
            </div>
            {/* Base */}
            <div className="w-56 h-3 bg-zinc-400 rounded-b-xl shadow-xl relative z-20">
               <div className="absolute inset-x-20 top-0 h-0.5 bg-zinc-500/50 rounded-b-full" />
            </div>
          </div>
        );
      case 'Desktop':
      default:
        return (
          <div className="relative w-56 h-48 flex flex-col items-center justify-end">
             {/* Display */}
             <div className="w-56 h-36 bg-zinc-900 rounded-xl border-4 border-zinc-800 shadow-2xl flex items-center justify-center overflow-hidden relative z-10">
               <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
               <div className="w-24 h-24 rounded-full bg-purple-500/30 blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
             </div>
             {/* Stand */}
             <div className="w-16 h-12 bg-zinc-300 relative z-0 -mt-2 shadow-inner border-x border-zinc-400" />
             <div className="w-32 h-2 bg-zinc-400 rounded-t-lg shadow-xl relative z-20" />
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
        {/* 2. Visuals: Centered Liquid Glass modal with 25px backdrop blur */}
        <div className="w-[600px] bg-white/10 dark:bg-black/40 backdrop-blur-[25px] border border-white/20 dark:border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden pointer-events-auto flex flex-col font-sans">
          
          {/* Header Controls */}
          <div className="flex items-center px-4 py-3 border-b border-black/5 dark:border-white/5">
            <button 
              onClick={() => setShowAboutWindow(false)}
              className="w-3 h-3 rounded-full bg-[#FF5F56] hover:bg-[#FF5F56]/80 flex items-center justify-center transition-colors group"
            >
              <Cancel01Icon size={8} className="text-black/50 opacity-0 group-hover:opacity-100" />
            </button>
          </div>

          <div className="flex flex-1 p-8 gap-8 items-center">
            {/* Left: Device Render */}
            <div className="w-[240px] flex items-center justify-center drop-shadow-2xl">
               {renderDeviceImage()}
            </div>

            {/* Right: System Specs */}
            <div className="flex-1 flex flex-col text-black dark:text-white">
               <h1 className="text-3xl font-bold tracking-tight mb-1">macOS <span className="font-light">Tahoe</span></h1>
               <p className="text-sm text-black/50 dark:text-white/50 mb-6 font-medium tracking-wide">Version 26.0</p>
               
               <div className="space-y-3 font-mono text-xs text-black/80 dark:text-white/80">
                 <div className="flex items-baseline">
                   <span className="w-24 font-bold text-black/90 dark:text-white">Model</span>
                   <span className="flex-1">{deviceType} (Tahoe-Native)</span>
                 </div>
                 <div className="flex items-baseline">
                   <span className="w-24 font-bold text-black/90 dark:text-white">Processor</span>
                   <span className="flex-1 truncate" title={`Apple Silicon (${hardware.cores} Cores)`}>
                     Apple Silicon ({hardware.cores} Cores)
                   </span>
                 </div>
                 <div className="flex items-baseline">
                   <span className="w-24 font-bold text-black/90 dark:text-white">Graphics</span>
                   <span className="flex-1 truncate" title={gpuInfo}>{gpuInfo}</span>
                 </div>
                 <div className="flex items-baseline">
                   <span className="w-24 font-bold text-black/90 dark:text-white">Memory</span>
                   <span className="flex-1">{memoryInfo.total} GB Unified Memory</span>
                 </div>
                 <div className="flex items-baseline">
                   <span className="w-24 font-bold text-black/90 dark:text-white">Serial Number</span>
                   <span className="flex-1">TH2600X01V3</span>
                 </div>
               </div>

               {/* 3. Navigation: More Info Button */}
               <div className="mt-8">
                 <button 
                   onClick={handleMoreInfo}
                   className="px-6 py-1.5 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/10 rounded-full text-xs font-bold transition-colors shadow-sm"
                 >
                   More Info...
                 </button>
               </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
