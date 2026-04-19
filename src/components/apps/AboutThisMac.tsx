import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cancel01Icon } from 'hugeicons-react';
import { useSystem } from '../../contexts/SystemContext';

export const AboutThisMac: React.FC = () => {
  const { showAboutWindow, setShowAboutWindow, hardware, uptime } = useSystem();
  const [memoryInfo, setMemoryInfo] = useState({ used: 0, total: 512 });

  useEffect(() => {
    if (showAboutWindow) {
      if ((performance as any).memory) {
        const used = Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
        const total = Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024);
        setMemoryInfo({ used, total });
      } else {
        setMemoryInfo({ used: 156, total: 512 }); // Fallback
      }
    }
  }, [showAboutWindow]);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  if (!showAboutWindow) return null;

  const asciiLogo = [
    "       .:'      ",
    "    __ :'__     ",
    " .''  ` '  ``.  ",
    ":          :  : ",
    "'.  .......  .' ",
    "  `'.......''   ",
    "   :       :    ",
    "   :       :    ",
    "   `'.....''    "
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none"
      >
        <div className="w-[420px] h-[280px] bg-black/60 backdrop-blur-[40px] border border-white/20 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col text-[#00FF41] font-mono p-5">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => setShowAboutWindow(false)}
              className="w-3 h-3 rounded-full bg-[#FF5F56] hover:bg-[#FF5F56]/80 flex items-center justify-center transition-colors"
            >
              <Cancel01Icon size={8} className="text-black opacity-0 hover:opacity-100" />
            </button>
            <div className="text-[10px] text-white/40 uppercase tracking-[0.3em]">System Neofetch</div>
            <div className="w-3" />
          </div>

          <div className="flex flex-1 gap-8 items-start">
            <div className="text-[#00FF41] leading-none text-[13px] whitespace-pre font-bold drop-shadow-[0_0_10px_rgba(0,255,65,0.3)]">
               {asciiLogo.join('\n')}
            </div>

            <div className="flex flex-col gap-1.5 text-[12px]">
               <div className="flex gap-2">
                 <span className="text-white font-bold underline decoration-blue-500/50 underline-offset-4">OS:</span>
                 <span className="text-white/90">macOS Tahoe 26.4</span>
               </div>
               <div className="flex gap-2">
                 <span className="text-white font-bold">Host:</span>
                 <span className="text-blue-400">Chromebook VM x86_64</span>
               </div>
               <div className="flex gap-2">
                 <span className="text-white font-bold">Kernel:</span>
                 <span className="text-[#00FF41]">Darwin 26.0.0-unit7</span>
               </div>
               <div className="flex gap-2">
                 <span className="text-white font-bold">Uptime:</span>
                 <span className="text-yellow-400">{formatUptime(uptime)}</span>
               </div>
               <div className="flex gap-2 mt-2">
                 <span className="text-white font-bold">CPU:</span>
                 <span className="text-purple-400">Apple Silicon ({hardware.cores} Cores)</span>
               </div>
               <div className="flex gap-2">
                 <span className="text-white font-bold">Memory:</span>
                 <span className="text-orange-400">{memoryInfo.used}MB / {memoryInfo.total}MB</span>
               </div>
               
               <div className="mt-4 flex flex-col gap-1">
                 <div className="flex justify-between text-[9px] uppercase font-bold text-white/40">
                   <span>Pressure</span>
                   <span className={memoryInfo.used > 400 ? 'text-red-500' : 'text-green-500'}>
                     {memoryInfo.used > 400 ? 'CRITICAL' : 'STABLE'}
                   </span>
                 </div>
                 <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${(memoryInfo.used / memoryInfo.total) * 100}%` }}
                     className={`h-full ${memoryInfo.used > 400 ? 'bg-red-500' : 'bg-[#00FF41]'}`}
                   />
                 </div>
               </div>

               <div className="mt-6 text-[9px] text-white/20 italic tracking-tighter">
                 "Architecture Elite" Build 26A405
               </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
