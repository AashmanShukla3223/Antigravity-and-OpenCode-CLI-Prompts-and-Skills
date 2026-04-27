import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';
import { FileSystemResolver } from '../../utils/FileSystemResolver';

export const CrazyErrors: React.FC = () => {
  const { closeApp, systemState, triggerSystemError, updateSystemState } = useSystem();
  const [stage, setStage] = useState<'stage1' | 'stage2' | 'storm'>('stage1');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  
  const base = (import.meta as any).env?.BASE_URL || '/';

  const playSound = (name: string) => {
    const audio = new Audio(`${base}sounds/${name}.mp3`);
    audio.play().catch(e => console.warn('Audio play failed', e));
  };

  useEffect(() => {
    playSound('Blow');
  }, []);

  const handleStage1Confirm = () => {
    setStage('stage2');
    playSound('Glass');
  };

  const handleStage2Confirm = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = systemState.user.password || 'tahoe2026';
    if (password === correctPassword || password === 'admin') {
      setStage('storm');
      updateSystemState({ isSystemInfected: true });
      triggerSystemError();
      closeApp('crazyerrors');
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center overflow-hidden pointer-events-none">
      <AnimatePresence>
        {stage === 'stage1' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[340px] glass-dark border border-white/20 rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center text-center gap-6 pointer-events-auto"
            style={{ backdropFilter: 'blur(20px)' }}
          >
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-500/20">
              <img src={`${base}${FileSystemResolver.getStatusIcon('dialog-warning')}`} className="w-10 h-10 object-contain" alt="Warning" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white tracking-tight">System Instability</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Warning: High system instability detected. Continue?
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => closeApp('crazyerrors')}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold transition-all border border-white/10"
              >
                Cancel
              </button>
              <button 
                onClick={handleStage1Confirm}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-red-500/20"
              >
                Yes
              </button>
            </div>
          </motion.div>
        )}

        {stage === 'stage2' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[340px] glass-dark border border-white/20 rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center text-center gap-6 pointer-events-auto"
            style={{ backdropFilter: 'blur(20px)' }}
          >
            <div className="w-20 h-20 rounded-full border-2 border-white/10 p-1 bg-white/5">
               <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center text-4xl shadow-inner">
                 {systemState.user.avatar || '👤'}
               </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-md font-bold text-white">{systemState.user.fullName || systemState.user.accountName || 'Administrator'}</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Enter Admin Password</p>
            </div>
            <form onSubmit={handleStage2Confirm} className="w-full space-y-4">
              <motion.input 
                animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full h-12 bg-black/40 border border-white/10 rounded-2xl px-4 text-white text-center focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-white/10"
              />
              <div className="flex gap-3">
                 <button 
                   type="button"
                   onClick={() => closeApp('crazyerrors')}
                   className="flex-1 h-11 text-white/40 text-xs font-bold hover:text-white transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit"
                   className="flex-1 h-11 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition-all border border-white/10"
                 >
                   OK
                 </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
