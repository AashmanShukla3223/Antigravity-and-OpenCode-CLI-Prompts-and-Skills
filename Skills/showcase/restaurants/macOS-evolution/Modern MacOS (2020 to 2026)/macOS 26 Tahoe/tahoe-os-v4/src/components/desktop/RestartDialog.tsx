import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert01Icon, Restart01Icon } from 'hugeicons-react';
import { useSystem } from '../../contexts/SystemContext';

export const RestartDialog: React.FC = () => {
  const { showRestartDialog, setShowRestartDialog, initiateRestart, setBootState, systemState } = useSystem();
  const [countdown, setCountdown] = useState(60);

  const handleRestart = () => {
    initiateRestart();
  };

  useEffect(() => {
    let timer: any;
    if (showRestartDialog) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            handleRestart();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(60);
    }
    return () => timer && clearInterval(timer);
  }, [showRestartDialog]);

  const handleRecovery = () => {
    setShowRestartDialog(false);
    setBootState('recovery');
  };

  if (!showRestartDialog) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-center justify-center z-[200] bg-black/20 backdrop-blur-sm pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-[400px] glass-dark border border-white/20 rounded-[2.5rem] shadow-2xl overflow-hidden p-10 flex flex-col items-center text-center text-white"
          style={{ backdropFilter: 'blur(40px)' }}
        >
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/10 shadow-inner">
            <Restart01Icon 
              size={40} 
              className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]" 
            />
          </div>
          
          <h2 className="text-2xl font-black mb-3 tracking-tight">Restart Mac</h2>
          <p className="text-white/50 text-sm leading-relaxed mb-10 px-4">
            Are you sure you want to restart your computer now? It will restart automatically in <span className="text-white font-bold">{countdown}</span> seconds.
          </p>

          <div className="flex flex-col gap-4 w-full">
            <div className="flex gap-3 w-full">
              {!systemState.isSystemInfected && (
                <button 
                  onClick={() => setShowRestartDialog(false)}
                  className="flex-1 h-12 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border border-white/10"
                >
                  Cancel
                </button>
              )}
              <button 
                onClick={handleRestart}
                className="flex-1 h-12 bg-white text-black hover:bg-white/90 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-white/10"
              >
                Restart Now
              </button>
            </div>
            
            <div className="h-[1px] w-full bg-white/10 my-2" />

            <button 
              onClick={handleRecovery}
              className="w-full h-12 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border border-red-500/10"
            >
              <Alert01Icon size={16} />
              <span>Enter Recovery Mode</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
