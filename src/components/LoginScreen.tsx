import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../contexts/SystemContext';
import { BatteryCharging01Icon, BatteryFullIcon, BatteryMedium01Icon, BatteryLowIcon } from 'hugeicons-react';
import { WallpaperEngine } from './desktop/WallpaperEngine';

export const LoginScreen: React.FC = () => {
  const { setBootState, systemState, battery } = useSystem();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === systemState.user.password || !systemState.user.password) {
      setBootState('desktop');
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
      setPassword('');
    }
  };

  const handlePowerAction = (action: string) => {
    if (action === 'restart' || action === 'shutdown') {
      setBootState('booting');
    }
  };

  return (
    <div className="w-screen h-screen bg-[#111] relative overflow-hidden flex flex-col items-center select-none">
      <WallpaperEngine url={systemState.wallpaperUrl} type={systemState.wallpaperType} blur={true} />

      {/* Top Right: Status */}
      <div className="absolute top-8 right-8 z-10 flex items-center gap-3 text-white/80">
        <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          {battery.isCharging ? (
            <BatteryCharging01Icon size={14} className="rotate-90 text-green-400" />
          ) : battery.level > 0.8 ? (
            <BatteryFullIcon size={14} className="rotate-90" />
          ) : battery.level > 0.3 ? (
            <BatteryMedium01Icon size={14} className="rotate-90" />
          ) : (
            <BatteryLowIcon size={14} className="rotate-90 text-red-400" />
          )}
          <span className="text-xs font-bold">{Math.round(battery.level * 100)}%</span>
        </div>
      </div>

      {/* Top: Clock & Date */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 mt-24 text-center text-white"
      >
        <h1 className="text-8xl font-bold tracking-tight mb-2 drop-shadow-2xl">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
        </h1>
        <p className="text-2xl font-medium opacity-80 tracking-wide">
          {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>
      
      {/* Bottom: User & Password */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          x: error ? [0, -10, 10, -10, 10, 0] : 0
        }}
        transition={{ 
          x: { duration: 0.4, ease: "easeInOut" },
          default: { duration: 0.5 }
        }}
        className="absolute bottom-24 z-10 flex flex-col items-center gap-6"
      >
        <div className="w-24 h-24 rounded-[32px] bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center text-5xl shadow-2xl overflow-hidden">
          {systemState.user.avatar || '👤'}
        </div>
        
        <h2 className="text-2xl font-semibold text-white tracking-tight drop-shadow-lg">
          {systemState.user.fullName || 'Architect'}
        </h2>
        
        <form onSubmit={handleLogin} className="flex flex-col items-center gap-4">
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            className={`w-56 bg-white/10 border ${error ? 'border-red-500/50' : 'border-white/20'} rounded-xl px-4 py-3 text-white placeholder-white/40 backdrop-blur-2xl focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/50' : 'focus:ring-blue-500/50'} text-center transition-all shadow-xl`}
            autoFocus
          />
          <AnimatePresence>
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-xs font-bold"
              >
                Wrong Password
              </motion.p>
            )}
          </AnimatePresence>
          <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em] mt-2">Press Return to Unlock</p>
        </form>
      </motion.div>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 z-10 flex gap-8">
         <button onClick={() => handlePowerAction('sleep')} className="flex flex-col items-center gap-1 group">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors relative">
               <div className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-white transition-colors" />
            </div>
            <span className="text-[10px] font-bold text-white/40 group-hover:text-white uppercase tracking-widest transition-colors">Sleep</span>
         </button>
         <button onClick={() => handlePowerAction('restart')} className="flex flex-col items-center gap-1 group">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors relative">
               <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-transparent group-hover:border-white transition-colors animate-[spin_3s_linear_infinite]" />
            </div>
            <span className="text-[10px] font-bold text-white/40 group-hover:text-white uppercase tracking-widest transition-colors">Restart</span>
         </button>
         <button onClick={() => handlePowerAction('shutdown')} className="flex flex-col items-center gap-1 group">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors relative">
               <div className="w-4 h-4 border-t-2 border-white/40 group-hover:border-white transition-colors" />
               <div className="absolute w-0.5 h-2.5 bg-white/40 group-hover:bg-white top-2 transition-colors rounded-full" />
            </div>
            <span className="text-[10px] font-bold text-white/40 group-hover:text-white uppercase tracking-widest transition-colors">Shut Down</span>
         </button>
      </div>
    </div>
  );
};
