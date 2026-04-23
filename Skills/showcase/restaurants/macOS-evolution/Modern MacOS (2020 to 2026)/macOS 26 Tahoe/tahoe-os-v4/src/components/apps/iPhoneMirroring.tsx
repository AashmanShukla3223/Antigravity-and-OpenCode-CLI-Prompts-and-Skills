import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SmartPhone01Icon, 
  Wifi01Icon, 
  BatteryFullIcon,
  SignalIcon,
  Settings01Icon,
  Search01Icon,
  File01Icon
} from 'hugeicons-react';

const SCAN_RESULTS = [
  { name: 'iPhone Mirroring.png', path: 'public/icons/' },
  { name: 'iPhoneMirroring.tsx', path: 'src/components/apps/' },
  { name: 'iPhone Mirroring.md', path: 'macOS 26 Tahoe/' },
  { name: 'iPhone Mirroring PRD.md', path: 'PRDs/' }
];

export const iPhoneMirroring: React.FC = () => {
  const [stage, setStage] = useState<'connecting' | 'scanning' | 'results'>('connecting');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const stage1 = setTimeout(() => setStage('scanning'), 2000);
    const stage2 = setTimeout(() => setStage('results'), 5000);
    const interval = setInterval(() => setTime(new Date()), 1000);
    
    return () => {
      clearTimeout(stage1);
      clearTimeout(stage2);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center relative overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {stage === 'connecting' && (
          <motion.div 
            key="connecting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative">
               <div className="w-24 h-24 rounded-full border-2 border-white/5 animate-spin border-t-blue-500" />
               <SmartPhone01Icon size={48} className="absolute inset-0 m-auto text-white" />
            </div>
            <div className="text-center">
               <h3 className="text-xl font-bold text-white mb-1">Connecting to iPhone...</h3>
               <p className="text-white/40 text-xs uppercase tracking-widest font-black">Tahoe Continuity Bridge</p>
            </div>
          </motion.div>
        )}

        {stage === 'scanning' && (
          <motion.div 
            key="scanning"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-8 w-full max-w-md p-12 bg-white/5 backdrop-blur-2xl rounded-[3rem] border border-white/10"
          >
             <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                />
             </div>
             <div className="text-center">
                <Search01Icon size={32} className="text-blue-500 mb-4 mx-auto animate-pulse" />
                <h3 className="text-lg font-bold text-white mb-1">Scanning Restaurants Folder</h3>
                <p className="text-white/40 text-[10px] uppercase tracking-[0.2em]">Searching for iPhone & iOS Keywords...</p>
             </div>
             <div className="grid grid-cols-2 gap-4 w-full">
                <div className="h-2 bg-white/5 rounded-full animate-pulse" />
                <div className="h-2 bg-white/5 rounded-full animate-pulse delay-75" />
                <div className="h-2 bg-white/5 rounded-full animate-pulse delay-150" />
                <div className="h-2 bg-white/5 rounded-full animate-pulse delay-300" />
             </div>
          </motion.div>
        )}

        {stage === 'results' && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-[320px] h-[640px] bg-zinc-900 rounded-[3rem] border-[8px] border-zinc-800 shadow-2xl relative flex flex-col overflow-hidden"
          >
            {/* iPhone Status Bar */}
            <div className="h-10 flex justify-between items-center px-8 pt-4 z-20">
               <span className="text-[10px] font-black text-white">
                 {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </span>
               <div className="w-16 h-5 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-2 flex items-center justify-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
               </div>
               <div className="flex items-center gap-1 text-white/80">
                  <SignalIcon size={10} />
                  <Wifi01Icon size={10} />
                  <BatteryFullIcon size={10} className="text-green-400" />
               </div>
            </div>

            {/* Results UI */}
            <div className="flex-1 p-6 overflow-y-auto scrollbar-hide flex flex-col gap-4">
               <div className="mt-8 mb-4">
                  <h2 className="text-2xl font-black text-white">Scan Results</h2>
                  <p className="text-white/30 text-[9px] uppercase tracking-widest font-black">Filtered by: iPhone | iOS</p>
               </div>
               
               <div className="space-y-2">
                  {SCAN_RESULTS.map((res, i) => (
                    <motion.div 
                      key={res.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 group hover:bg-white/10 transition-all cursor-pointer"
                    >
                       <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                          <File01Icon size={18} className="text-blue-500" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-bold text-white truncate">{res.name}</div>
                          <div className="text-[8px] font-black text-white/20 uppercase truncate">{res.path}</div>
                       </div>
                    </motion.div>
                  ))}
               </div>
            </div>

            {/* iOS Dock */}
            <div className="h-20 bg-black/40 backdrop-blur-3xl border-t border-white/5 flex items-center justify-around px-4 mb-2">
               <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 shadow-lg" />
               <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg" />
               <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center shadow-lg"><Settings01Icon size={20} className="text-white/40" /></div>
               <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-lg" />
            </div>

            {/* Home Indicator */}
            <div className="h-8 flex justify-center items-end pb-2">
               <div className="w-24 h-1 bg-white/20 rounded-full" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
