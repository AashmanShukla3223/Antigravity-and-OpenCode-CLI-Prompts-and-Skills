import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock01Icon, ArrowRight01Icon } from 'hugeicons-react';
import { useSystem } from '../../contexts/SystemContext';

export const TimeMachine: React.FC = () => {
  const { setBootState } = useSystem();
  const [restoring, setRestoring] = useState(false);
  const [progress, setProgress] = useState(0);

  const startRestore = () => {
    setRestoring(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 1;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => setBootState('booting'), 1000);
      }
    }, 50);
  };

  return (
    <div className="h-full w-full bg-[#111] text-white flex flex-col items-center justify-center p-12 text-center">
      {!restoring ? (
        <div className="max-w-md w-full">
          <Clock01Icon size={80} className="text-green-500 mb-8 mx-auto drop-shadow-[0_0_30px_rgba(34,197,94,0.3)]" />
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Time Machine Restore</h2>
          <p className="text-white/40 mb-10 font-medium">Select a snapshot to restore your neural workspace to a previous point in time.</p>
          
          <div className="bg-white/5 border border-white/10 rounded-3xl p-2 mb-10">
            <div className="p-4 bg-white/10 rounded-2xl flex justify-between items-center border border-white/20">
              <div className="text-left">
                <div className="font-bold">Today, 10:45 AM</div>
                <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">Incremental Snapshot</div>
              </div>
              <span className="text-green-400 text-[10px] font-black uppercase tracking-widest bg-green-400/10 px-2 py-1 rounded-md border border-green-400/20">Latest</span>
            </div>
          </div>

          <button 
            onClick={startRestore}
            className="w-full py-4 bg-green-500 hover:bg-green-600 rounded-2xl font-bold transition shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
          >
            Restore This Snapshot
            <ArrowRight01Icon size={20} />
          </button>
        </div>
      ) : (
        <div className="max-w-md w-full">
          <Clock01Icon size={64} className="text-green-500 mb-12 animate-pulse mx-auto" />
          <h3 className="text-2xl font-bold mb-2">Restoring Workspace...</h3>
          <p className="text-white/40 text-xs font-black uppercase tracking-[0.3em] mb-12">Silicon Enclave Decrypting</p>
          
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-4 border border-white/5">
            <motion.div 
              className="h-full bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.8)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
