import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HardDriveIcon, Database01Icon, MagicWand01Icon, PlusSignIcon, Shield01Icon, LockIcon } from 'hugeicons-react';
import { useSystem } from '../../contexts/SystemContext';

export const DiskUtility: React.FC = () => {
  const { showAlert } = useSystem();
  const [action, setAction] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const runFirstAid = () => {
    setAction('Running First Aid on "M5 Max SSD"...');
    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setAction(null);
          setProgress(0);
          showAlert('First Aid process has completed successfully. No neural corruption detected.', 'First Aid Complete');
        }, 500);
      }
    }, 30);
  };

  return (
    <div className="h-full w-full bg-[#111] text-white flex select-none relative">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 flex flex-col p-6 bg-black/20">
        <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-6 px-2">Internal</div>
        <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-2xl border border-blue-500/30">
          <HardDriveIcon size={24} className="text-blue-400" />
          <div>
            <div className="text-xs font-bold">M5 Max SSD</div>
            <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">512 GB APFS</div>
          </div>
        </div>
        
        <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-10 mb-6 px-2">External</div>
        <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl cursor-pointer transition-colors opacity-40">
          <Database01Icon size={24} className="text-white/60" />
          <div>
            <div className="text-xs font-bold text-white/70">No device detected</div>
            <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Thunderbolt 5</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className="h-14 border-b border-white/10 flex items-center justify-end px-6 gap-6 bg-white/5">
          <button onClick={runFirstAid} className="flex flex-col items-center gap-0.5 group">
            <div className="w-9 h-9 rounded-xl hover:bg-white/5 flex items-center justify-center transition-colors border border-transparent hover:border-white/10">
              <MagicWand01Icon size={18} className="text-white/60 group-hover:text-blue-400" />
            </div>
            <span className="text-[8px] uppercase font-black text-white/30 tracking-widest">First Aid</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 group opacity-50 cursor-default">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors border border-transparent">
              <PlusSignIcon size={18} className="text-white/60" />
            </div>
            <span className="text-[8px] uppercase font-black text-white/30 tracking-widest">Partition</span>
          </button>
        </div>

        <div className="flex-1 p-12 flex flex-col items-center overflow-y-auto scrollbar-hide">
          <div className="w-32 h-32 mb-10 relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-[40px] rounded-full" />
            <HardDriveIcon size={128} className="text-blue-500 opacity-20 relative z-10 hugeicon-tahoe" />
          </div>
          <h2 className="text-3xl font-bold mb-2 tracking-tight">M5 Max SSD</h2>
          <p className="text-xs text-white/20 mb-12 font-black uppercase tracking-[0.3em]">Apple Neural Storage 2.0</p>
          
          <div className="w-full max-w-lg h-14 bg-white/5 border border-white/10 rounded-3xl flex overflow-hidden p-1.5 shadow-inner">
             <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} transition={{ duration: 1.5, ease: "circOut" }} className="h-full bg-blue-500 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
             <motion.div initial={{ width: 0 }} animate={{ width: '15%' }} transition={{ duration: 1.5, delay: 0.2, ease: "circOut" }} className="h-full bg-purple-500 rounded-2xl ml-1 shadow-[0_0_20px_rgba(168,85,247,0.3)]" />
          </div>

          <div className="flex justify-between w-full max-w-lg mt-12 space-y-3 flex-col">
            <div className="p-5 bg-white/5 rounded-[24px] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Shield01Icon size={20} className="text-green-400" />
                <span className="text-sm font-bold">Health Status</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-green-400 bg-green-400/10 px-3 py-1.5 rounded-xl border border-green-400/20">Operational</span>
            </div>
            <div className="p-5 bg-white/5 rounded-[24px] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <LockIcon size={20} className="text-blue-400" />
                <span className="text-sm font-bold">Neural Encryption</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-xl border border-blue-400/20">Active</span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {action && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-12">
               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-md bg-[#222] border border-white/10 rounded-[40px] p-10 flex flex-col items-center shadow-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-8 border border-blue-500/20"><MagicWand01Icon size={32} className="text-blue-400 animate-pulse" /></div>
                  <h3 className="text-xl font-bold mb-2 text-center">{action}</h3>
                  <p className="text-white/40 text-[10px] mb-10 font-black uppercase tracking-[0.2em]">Verifying volume consistency...</p>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
                     <motion.div 
                       className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                       initial={{ width: 0 }}
                       animate={{ width: `${progress}%` }}
                     />
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
