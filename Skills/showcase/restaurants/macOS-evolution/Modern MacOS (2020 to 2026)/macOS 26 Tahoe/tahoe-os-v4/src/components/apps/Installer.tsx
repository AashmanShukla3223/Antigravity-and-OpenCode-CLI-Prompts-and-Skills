import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings01Icon, CpuIcon, CheckmarkBadge01Icon } from 'hugeicons-react';

export const Installer: React.FC = () => {
  const [step, setStep] = useState(1);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (step === 2) {
      setChecking(true);
      const timer = setTimeout(() => setChecking(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-zinc-950 text-black dark:text-white font-sans">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white mb-6 shadow-2xl"
        >
          <Settings01Icon size={48} className="animate-spin-slow" />
        </motion.div>
        
        <h1 className="text-3xl font-bold mb-2">macOS 27 Installer</h1>
        <p className="text-zinc-500 mb-8 font-medium text-center">Unit 7 Era • Beta 1</p>

        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center max-w-sm text-center">
            <p className="text-sm leading-relaxed mb-8">
              macOS 27 drops support for Intel architecture, bringing unprecedented performance to Apple Silicon. This installation will upgrade your virtual environment to the next generation of Liquid Glass UI.
            </p>
            <button 
              onClick={() => setStep(2)}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-bold shadow-lg shadow-blue-500/30 transition-all"
            >
              Continue
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center max-w-sm w-full">
             <div className="w-full p-6 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl flex items-start gap-4 mb-8 relative overflow-hidden">
                {checking && (
                  <motion.div 
                    animate={{ x: ['-100%', '200%'] }} 
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                  />
                )}
                
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
                  <CpuIcon size={24} />
                </div>
                
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="font-bold text-sm mb-1">Hardware Check</h3>
                  {checking ? (
                    <p className="text-xs text-zinc-500">Verifying System Architecture...</p>
                  ) : (
                    <div>
                      <p className="text-xs text-green-500 font-bold flex items-center gap-1">
                        <CheckmarkBadge01Icon size={12} />
                        M5 Virtual Silicon Detected
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-1">Compatible with macOS 27</p>
                    </div>
                  )}
                </div>
             </div>

             <button 
               disabled={checking}
               onClick={() => setStep(3)}
               className={`px-8 py-3 rounded-full font-bold transition-all w-full ${checking ? 'bg-zinc-200 dark:bg-white/10 text-zinc-400' : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30'}`}
             >
               Agree and Install
             </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center w-full max-w-xs">
            <p className="font-bold text-sm mb-4">Downloading macOS 27...</p>
            <div className="w-full h-2 bg-zinc-200 dark:bg-white/10 rounded-full overflow-hidden mb-2">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 10, ease: "easeInOut" }}
                className="h-full bg-blue-500"
              />
            </div>
            <p className="text-[10px] text-zinc-500">About 5 minutes remaining</p>
          </motion.div>
        )}

      </div>
    </div>
  );
};
