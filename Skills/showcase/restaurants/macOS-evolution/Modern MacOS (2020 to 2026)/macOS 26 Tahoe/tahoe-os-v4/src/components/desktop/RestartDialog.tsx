import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshIcon, Alert01Icon } from 'hugeicons-react';
import { useSystem } from '../../contexts/SystemContext';

export const RestartDialog: React.FC = () => {
  const { showRestartDialog, setShowRestartDialog, setBootState } = useSystem();
  const [countdown, setCountdown] = useState(60);

  const handleRestart = () => {
    setShowRestartDialog(false);
    setBootState('booting');
  };

  useEffect(() => {
    let timer: any;
    if (showRestartDialog && countdown > 60) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      handleRestart();
    }
    return () => timer && clearInterval(timer);
  }, [showRestartDialog, countdown]);

  const handleRecovery = () => {
    setShowRestartDialog(false);
    setBootState('recovery');
  };

  if (!showRestartDialog) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-center justify-center z-[200] bg-black/20 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-[400px] bg-white/10 dark:bg-black/40 backdrop-blur-[60px] saturate-[190%] border border-white/20 rounded-3xl shadow-2xl overflow-hidden p-8 flex flex-col items-center text-center text-white"
        >
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <RefreshIcon size={32} className="text-white/80 animate-spin-slow hugeicon-tahoe" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Restart Mac</h2>
          <p className="text-white/60 text-sm mb-8">
            Are you sure you want to restart your Mac now? Your computer will restart automatically in {countdown} seconds.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setShowRestartDialog(false)}
                className="flex-1 h-12 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleRestart}
                className="flex-1 h-12 bg-white text-black hover:bg-white/90 rounded-xl font-bold transition"
              >
                Restart
              </button>
            </div>
            
            <button 
              onClick={handleRecovery}
              className="w-full h-12 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition flex items-center justify-center gap-2 border border-red-500/20"
            >
              <Alert01Icon size={18} className="hugeicon-tahoe" />
              <span>Enter Recovery Mode</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
