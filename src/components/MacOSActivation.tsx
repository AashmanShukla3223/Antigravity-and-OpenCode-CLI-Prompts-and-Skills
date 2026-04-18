import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi01Icon, LockIcon, Shield01Icon } from 'hugeicons-react';
import { useSystem } from '../contexts/SystemContext';

export const MacOSActivation: React.FC = () => {
  const { setBootState } = useSystem();
  const [activationStep, setActivationStep] = useState(1); // 1: Select WiFi, 2: Enter Password, 3: Activating, 4: Installing
  const [wifiPassword, setWifiPassword] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (activationStep === 3) {
      const timer = setTimeout(() => {
        setActivationStep(4);
      }, 3000); // 3 seconds activating
      return () => clearTimeout(timer);
    }
    if (activationStep === 4) {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => setBootState('setup'), 1000);
            return 100;
          }
          return p + (100 / (15 * 10)); // ~15 seconds to install for demo
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [activationStep, setBootState]);

  return (
    <div className="fixed inset-0 bg-[#050505] text-white flex items-center justify-center font-sans select-none overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(30,58,138,0.05),_transparent_70%)]" />

      <AnimatePresence mode="wait">
        {activationStep === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 flex flex-col items-center max-w-md w-full p-8">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/20"><Shield01Icon size={32} className="text-blue-500 hugeicon-tahoe" /></div>
            <h1 className="text-3xl font-bold mb-2">Activate Mac</h1>
            <p className="text-white/40 text-center mb-8 text-sm">Select a Wi-Fi network to activate your Mac and continue installation.</p>
            
            <div className="w-full space-y-2 mb-8">
               <div onClick={() => setActivationStep(2)} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition border border-white/5 hover:border-white/10">
                 <div className="flex items-center gap-3">
                   <Wifi01Icon size={20} className="text-white/70 hugeicon-tahoe" />
                   <span className="font-medium">Apple Store Wi-Fi</span>
                 </div>
                 <LockIcon size={14} className="text-white/30 hugeicon-tahoe" />
               </div>
               <div onClick={() => setActivationStep(2)} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition border border-white/5 hover:border-white/10">
                 <div className="flex items-center gap-3">
                   <Wifi01Icon size={20} className="text-white/70 hugeicon-tahoe" />
                   <span className="font-medium">Home Network 5G</span>
                 </div>
                 <LockIcon size={14} className="text-white/30 hugeicon-tahoe" />
               </div>
            </div>
            
            <button onClick={() => setBootState('recovery')} className="text-sm font-medium text-white/40 hover:text-white transition">Cancel</button>
          </motion.div>
        )}

        {activationStep === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="relative z-10 flex flex-col items-center max-sm w-full p-8">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10"><Wifi01Icon size={24} className="hugeicon-tahoe" /></div>
            <h1 className="text-2xl font-bold mb-2">Enter Password</h1>
            <p className="text-white/40 text-sm mb-8">Enter the password for "Home Network 5G"</p>
            <input 
              type="password" 
              autoFocus 
              value={wifiPassword}
              onChange={e => setWifiPassword(e.target.value)}
              className="w-full h-12 bg-white/5 border border-white/20 rounded-xl px-4 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 mb-8"
              placeholder="Password"
            />
            <div className="flex gap-4 w-full">
              <button onClick={() => setActivationStep(1)} className="flex-1 h-12 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition">Back</button>
              <button onClick={() => setActivationStep(3)} disabled={!wifiPassword} className="flex-1 h-12 bg-white text-black disabled:opacity-50 rounded-xl font-bold transition">Join</button>
            </div>
          </motion.div>
        )}

        {activationStep === 3 && (
          <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 flex flex-col items-center justify-center h-screen w-full">
             <div className="w-16 h-16 mb-8 relative">
               <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
               <div className="absolute inset-0 border-4 border-white rounded-full border-t-transparent animate-spin" />
             </div>
             <h2 className="text-xl font-medium text-white/80">Activating your Mac...</h2>
             <p className="text-white/40 text-sm mt-2">This may take a few minutes.</p>
          </motion.div>
        )}

        {activationStep === 4 && (
          <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 flex flex-col items-center justify-center w-full max-w-md">
             <div className="w-24 h-24 mb-16 flex items-center justify-center text-white">
               <svg viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20"><path d="M12.15 4.39A2.95 2.95 0 0 0 14 3a2.82 2.82 0 0 0-2-1A2.83 2.83 0 0 0 10 4a2.7 2.7 0 0 0 2 1zm4.84 4.88c-.09-2.35 1.76-3.4 1.83-3.44a3.52 3.52 0 0 0-2.82-1.78c-1.2-.13-2.35.7-2.95.7s-1.55-.68-2.55-.65A4.6 4.6 0 0 0 6.6 6.37C5.35 8.5 4.7 11.83 6 14.1c.6 1.05 1.3 2.2 2.45 2.15 1.1-.05 1.55-.7 2.9-.7s1.75.7 2.9.7 1.75-1.15 2.4-2.15a6.45 6.45 0 0 0 1-2.05 3.33 3.33 0 0 1-1.9-3.32z" /></svg>
             </div>
             
             <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mb-4 relative">
                <div 
                  className="absolute top-0 left-0 h-full bg-white transition-all duration-100 ease-linear" 
                  style={{ width: `${progress}%` }} 
                />
             </div>
             <p className="text-sm font-medium text-white/60 font-sans tracking-tight">About 1 hour remaining</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};