import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';
import { FileSystemResolver } from '../../utils/FileSystemResolver';

interface ActiveError {
  id: string;
  x: number;
  y: number;
  message: string;
  icon: string;
}

const ERROR_MESSAGES = [
  "The disk is full of bubbles",
  "Kernel Panic: Too much vibe",
  "Memory Leak in the Gold Mine",
  "System Overheating: Silicon Meltdown",
  "Quantum Bit Flip detected in Reality",
  "Logic Error: App is too cool for this OS",
  "Refractive Index out of bounds",
  "Glass Blur is becoming solid",
  "User Identity found in Trash",
  "Finder found something it shouldn't have",
  "CPU is vibing too hard",
  "GPU is drawing outside the lines"
];

const ERROR_ICONS = [
  "dialog-warning",
  "dialog-error",
  "dialog-information",
  "software-updates-important",
  "security-high",
  "security-low"
];

export const CrazyErrors: React.FC = () => {
  const { closeApp, systemState } = useSystem();
  const [stage, setStage] = useState<'stage1' | 'stage2' | 'storm'>('stage1');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [activeErrors, setActiveErrors] = useState<ActiveError[]>([]);
  
  const stormIntervalRef = useRef<any>(null);
  const base = (import.meta as any).env?.BASE_URL || '/';

  const playSound = (name: string) => {
    const audio = new Audio(`${base}sounds/${name}.mp3`);
    audio.play().catch(e => console.warn('Audio play failed', e));
  };

  useEffect(() => {
    playSound('Blow');
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') killStorm();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleStage1Confirm = () => {
    setStage('stage2');
    playSound('Glass');
  };

  const handleStage2Confirm = (e: React.FormEvent) => {
    e.preventDefault();
    // Using provided system password or fallback to 'tahoe2026'
    const correctPassword = systemState.user.password || 'tahoe2026';
    if (password === correctPassword || password === 'admin') {
      setStage('storm');
      unleashErrorStorm();
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  const unleashErrorStorm = () => {
    let count = 0;
    const interval = setInterval(() => {
      spawnError(count);
      count++;
      if (count > 1000) clearInterval(interval); // Safety stop
    }, 100);
    stormIntervalRef.current = interval as any;
  };

  const spawnError = (index: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    const message = ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
    const iconName = ERROR_ICONS[Math.floor(Math.random() * ERROR_ICONS.length)];
    
    // Recursive Cascade Logic: +20px offset
    const offset = (index % 25) * 20;
    const x = 100 + offset;
    const y = 100 + offset;

    const newError: ActiveError = {
      id,
      x,
      y,
      message,
      icon: `${base}${FileSystemResolver.getStatusIcon(iconName)}`
    };

    setActiveErrors(prev => {
      const next = [...prev, newError];
      if (next.length > 50) return next.slice(1); // Limiter: Max 50 for Vivo Y02
      return next;
    });
  };

  const killStorm = () => {
    if (stormIntervalRef.current) clearInterval(stormIntervalRef.current);
    setActiveErrors([]);
    closeApp('crazyerrors');
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

      {stage === 'storm' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Kill Switch Button */}
          <button 
            onClick={killStorm}
            className="absolute top-12 right-12 z-[1000] px-6 py-2 bg-red-500 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl pointer-events-auto hover:bg-red-600 transition-colors"
          >
            Force Quit (Esc)
          </button>

          {activeErrors.map((err, i) => (
            <motion.div
              key={err.id}
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              style={{
                position: 'absolute',
                left: err.x,
                top: err.y,
                zIndex: 500 + i
              }}
              className="w-[280px] bg-white/10 border border-white/20 rounded-2xl p-4 shadow-2xl flex items-start gap-4"
            >
              <div className="absolute inset-0 rounded-2xl" style={{ backdropFilter: 'blur(15px)' }} />
              <div className="relative z-10 w-10 h-10 flex-shrink-0">
                <img src={err.icon} className="w-full h-full object-contain" alt="Error Icon" />
              </div>
              <div className="relative z-10 flex-1">
                <h4 className="text-[11px] font-black text-white/40 uppercase tracking-wider mb-1">System Error</h4>
                <p className="text-xs text-white font-medium leading-tight">{err.message}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
