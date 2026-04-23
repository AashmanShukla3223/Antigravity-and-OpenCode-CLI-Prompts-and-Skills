import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi01Icon, 
  BatteryFullIcon,
  SignalIcon,
  Settings01Icon,
  Search01Icon,
  File01Icon,
  AiCloudIcon
} from 'hugeicons-react';

const HARDCODED_LOCK_PATH = 'Skills/showcase/restaurants';

// Strict logic assets discovered ONLY in the hardcoded path
const AUTHORIZED_ASSETS = [
  { name: 'iPhone Mirroring.md', type: 'System Logic', path: 'macOS 26 Tahoe/' },
  { name: 'iPhone Mirroring PRD.md', type: 'Design Specs', path: 'PRDs/' }
];

export const iPhoneMirroring: React.FC = () => {
  const [stage, setStage] = useState<'idle' | 'authorizing' | 'scanning' | 'booting' | 'active'>('idle');
  const [bootProgress, setBootProgress] = useState(0);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Initial stage: Authorize the hardcoded path
    setStage('authorizing');
    
    const authTimer = setTimeout(() => setStage('scanning'), 2000);
    const scanTimer = setTimeout(() => setStage('booting'), 5000);
    const interval = setInterval(() => setTime(new Date()), 1000);
    
    return () => {
      clearTimeout(authTimer);
      clearTimeout(scanTimer);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (stage === 'booting') {
      const timer = setInterval(() => {
        setBootProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setStage('active');
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [stage]);

  return (
    <div className="w-full h-full bg-[#020202] flex flex-col items-center justify-center relative overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {stage === 'authorizing' && (
          <motion.div 
            key="authorizing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
               <motion.div
                 animate={{ opacity: [0.4, 1, 0.4] }}
                 transition={{ duration: 1.5, repeat: Infinity }}
               >
                 <Settings01Icon size={32} className="text-blue-500" />
               </motion.div>
            </div>
            <div className="text-center">
               <h3 className="text-lg font-bold text-white mb-1 tracking-tight">Security Validation</h3>
               <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em]">Validating Hard-Lock Policy...</p>
            </div>
          </motion.div>
        )}

        {stage === 'scanning' && (
          <motion.div 
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-8 w-full max-w-sm"
          >
            <div className="relative">
               <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center bg-white/[0.02]">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-t-2 border-blue-500 rounded-full"
                  />
                  <Search01Icon size={30} className="text-white" />
               </div>
            </div>
            <div className="text-center w-full">
               <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
                  <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Authorized Path Only</span>
               </div>
               <h3 className="text-xl font-bold text-white mb-2">Surgical Scan</h3>
               <p className="text-white/40 text-[10px] font-mono mb-6 truncate px-8">ROOT: .../{HARDCODED_LOCK_PATH}</p>
               
               <div className="space-y-1.5 px-12">
                  <div className="flex justify-between items-center text-[9px] font-mono">
                     <span className="text-white/20">ACCESSING RESTAURANTS</span>
                     <span className="text-green-500">OK</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-mono opacity-50">
                     <span className="text-white/20">BLOCKING EXTERNAL</span>
                     <span className="text-blue-500">ACTIVE</span>
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {stage === 'booting' && (
          <motion.div 
            key="booting"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 w-full max-w-xs"
          >
             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                <svg viewBox="0 0 384 512" className="w-7 h-7 fill-black">
                   <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.3 48.6-.7 90.4-82.5 102.7-119.3-65.2-30.7-61.7-90-61.8-91.3zM250.8 131c22.9-26.7 20.8-63.6 15-84.2-22.7 1.8-59 16.5-80.4 39.8-19.7 21-24.9 57.5-17.3 84.4 25.1 1.7 56.4-16.2 82.7-40z"/>
                </svg>
             </div>
             <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  className="h-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${bootProgress}%` }}
                />
             </div>
             <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Booting Secure Logic</p>
          </motion.div>
        )}

        {stage === 'active' && (
          <motion.div 
            key="active"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-[320px] h-[640px] bg-zinc-950 rounded-[3.5rem] border-[10px] border-zinc-900 shadow-2xl relative flex flex-col overflow-hidden ring-1 ring-white/10"
          >
            {/* Dynamic Island Area */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-50 flex items-center justify-end px-4 gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]" />
               <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            </div>

            {/* Status Bar */}
            <div className="h-12 flex justify-between items-end px-8 pb-1 z-20">
               <span className="text-[11px] font-bold text-white">
                 {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </span>
               <div className="flex items-center gap-1.5 text-white/90">
                  <SignalIcon size={12} />
                  <Wifi01Icon size={12} />
                  <BatteryFullIcon size={12} className="text-green-400" />
               </div>
            </div>

            {/* iOS 27 Main Interface */}
            <div className="flex-1 p-6 flex flex-col gap-6">
               <header className="mt-4 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tighter">Continuity</h2>
                    <p className="text-blue-500 text-[8px] font-black uppercase tracking-widest">Locked: Restaurants</p>
                  </div>
                  <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                     <AiCloudIcon size={16} className="text-blue-500" />
                  </div>
               </header>

               <div className="space-y-2.5">
                  {AUTHORIZED_ASSETS.map((logic, i) => (
                    <motion.div 
                      key={logic.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-2xl flex items-center gap-4 group hover:bg-white/[0.08] transition-all cursor-pointer"
                    >
                       <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center border border-white/5">
                          <File01Icon size={16} className="text-blue-400" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-bold text-white truncate">{logic.name}</div>
                          <div className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">{logic.type}</div>
                       </div>
                    </motion.div>
                  ))}

                  <div className="mt-6 p-5 bg-blue-600 rounded-[2rem] shadow-xl relative overflow-hidden group">
                     <div className="relative z-10 flex flex-col gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                           <Wifi01Icon size={16} className="text-white" />
                        </div>
                        <div>
                           <h4 className="text-white font-black text-sm">Hardware Handoff</h4>
                           <p className="text-white/60 text-[10px] leading-tight">Surgical link verified for {HARDCODED_LOCK_PATH}</p>
                        </div>
                     </div>
                     <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl" />
                  </div>
               </div>
            </div>

            {/* iOS Dock */}
            <div className="h-20 bg-white/5 backdrop-blur-[30px] border-t border-white/5 flex items-center justify-around px-4 mb-4 mx-4 rounded-[2rem]">
               <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-green-400 to-green-600" />
               <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600" />
               <div className="w-11 h-11 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/5"><Settings01Icon size={20} className="text-white/40" /></div>
               <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600" />
            </div>

            {/* Home Indicator */}
            <div className="h-4 flex justify-center items-end pb-2">
               <div className="w-24 h-1 bg-white/10 rounded-full" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
