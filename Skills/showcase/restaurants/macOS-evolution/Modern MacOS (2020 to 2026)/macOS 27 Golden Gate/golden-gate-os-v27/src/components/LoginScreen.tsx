import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../contexts/SystemContext';
import { BatteryCharging01Icon, BatteryFullIcon, BatteryMedium01Icon, BatteryLowIcon } from 'hugeicons-react';
import { WallpaperEngine } from './desktop/WallpaperEngine';

export const LoginScreen: React.FC = () => {
  const { setBootState, updateSystemState, systemState, battery, activeUser, initiateShutdown } = useSystem();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [time, setTime] = useState(new Date());
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const displayUser = selectedUserId
    ? systemState.users.find((u) => u.id === selectedUserId)
    : activeUser;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const playSound = (name: string) => {
    const audio = new Audio(`/sounds/${name}.mp3`);
    audio.play().catch((e) => console.warn('Audio play failed', e));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = selectedUserId ? systemState.users.find((u) => u.id === selectedUserId) : activeUser;
    if (!targetUser) return;
    if (password === targetUser.password || !targetUser.password) {
      setIsLoggingIn(true);
      playSound('Glass');
      if (selectedUserId) updateSystemState({ activeUserId: selectedUserId });

      // Wait for progress bar (2s) + a small buffer
      setTimeout(() => {
        setBootState('desktop');
      }, 2100);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
      setPassword('');
    }
  };

  const handlePowerAction = (action: string) => {
    if (action === 'restart') {
      setBootState('booting');
    } else if (action === 'shutdown') {
      initiateShutdown();
    }
  };

  return (
    <main className="w-screen h-screen bg-[#111] relative overflow-hidden flex flex-col items-center select-none">
      <WallpaperEngine
        url={systemState.wallpaperUrl}
        type={systemState.wallpaperType}
        fallbackImage="/wallpapers/golden-gate-dark.png"
      />

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
          x: error ? [0, -10, 10, -10, 10, 0] : 0,
        }}
        transition={{
          x: { duration: 0.4, ease: 'easeInOut' },
          default: { duration: 0.5 },
        }}
        className="absolute bottom-24 z-10 flex flex-col items-center gap-6"
      >
        {/* User grid when no user selected */}
        {!selectedUserId && systemState.users.length > 1 && (
          <div className="flex gap-4 mb-2">
            {systemState.users.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelectedUserId(u.id)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center text-4xl shadow-2xl group-hover:bg-white/20 group-hover:scale-105 transition-all overflow-hidden relative">
                  <img
                    src="/assets/categories/user-identity.png"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        const fb = parent.querySelector('[data-fb]');
                        if (fb) (fb as HTMLElement).style.display = '';
                      }
                    }}
                  />
                  <span data-fb style={{ display: 'none' }} className="relative drop-shadow-lg">{u.avatar || '👤'}</span>
                </div>
                <span className="text-sm text-white/70 group-hover:text-white transition-colors">{u.fullName}</span>
              </button>
            ))}
          </div>
        )}

        {/* Selected or single user */}
        {(selectedUserId || systemState.users.length <= 1) && (
          <>
            <div className="w-24 h-24 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center text-5xl shadow-2xl overflow-hidden relative">
              <img
                src="/assets/categories/user-identity.png"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    const fb = parent.querySelector('[data-fb]');
                    if (fb) (fb as HTMLElement).style.display = '';
                  }
                }}
              />
              <span data-fb style={{ display: 'none' }} className="relative drop-shadow-lg">{(displayUser?.avatar) || '👤'}</span>
            </div>
            <h2 className="text-2xl font-semibold text-white tracking-tight drop-shadow-lg">
              {displayUser?.fullName || 'Architect'}
            </h2>
          </>
        )}

        <form onSubmit={handleLogin} className="flex flex-col items-center gap-4">
          {!isLoggingIn ? (
            <>
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
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
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em] mt-2">
                Press Return to Unlock
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 mt-2">
              <div className="w-56 h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5 backdrop-blur-sm">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                  className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                  style={{ willChange: 'width' }}
                />
              </div>
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em] animate-pulse">
                Mounting System...
              </p>
            </div>
          )}
        </form>
      </motion.div>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 z-10 flex gap-8">
        <button onClick={() => handlePowerAction('sleep')} className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors relative">
            <div className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-white transition-colors" />
          </div>
          <span className="text-[10px] font-bold text-white/40 group-hover:text-white uppercase tracking-widest transition-colors">
            Sleep
          </span>
        </button>
        <button onClick={() => handlePowerAction('restart')} className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors relative">
            <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-transparent group-hover:border-white transition-colors animate-[spin_3s_linear_infinite]" />
          </div>
          <span className="text-[10px] font-bold text-white/40 group-hover:text-white uppercase tracking-widest transition-colors">
            Restart
          </span>
        </button>
        <button onClick={() => handlePowerAction('shutdown')} className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors relative">
            <div className="w-4 h-4 border-t-2 border-white/40 group-hover:border-white transition-colors" />
            <div className="absolute w-0.5 h-2.5 bg-white/40 group-hover:bg-white top-2 transition-colors rounded-full" />
          </div>
          <span className="text-[10px] font-bold text-white/40 group-hover:text-white uppercase tracking-widest transition-colors">
            Shut Down
          </span>
        </button>
      </div>
    </main>
  );
};
