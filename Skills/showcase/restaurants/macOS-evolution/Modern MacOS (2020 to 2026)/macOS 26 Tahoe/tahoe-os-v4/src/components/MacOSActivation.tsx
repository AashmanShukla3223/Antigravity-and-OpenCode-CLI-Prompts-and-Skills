import React from 'react';
import { motion } from 'framer-motion';
import { useSystem } from '../contexts/SystemContext';
import { SystemMenuBar } from './common/SystemMenuBar';

export const MacOSActivation: React.FC = () => {
  const { setBootState } = useSystem();

  return (
    <div className="fixed inset-0 bg-[#050505] text-white flex items-center justify-center font-sans select-none overflow-hidden z-[150]">
      {/* Background ambient glow + deep blur */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(30,58,138,0.1),_transparent_70%)]" />
      <div className="absolute inset-0 backdrop-blur-[100px] bg-black/40" />

      <SystemMenuBar mode="Activation Lock" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center max-w-md w-full p-12 text-center"
      >
        <div className="w-32 h-32 mb-8 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
          <img 
            src="/icons/finder.png" 
            alt="Activation" 
            className="w-full h-full object-contain"
            style={{ willChange: 'transform' }}
          />
        </div>
        
        <h1 className="text-4xl font-semibold mb-2 tracking-tight">macOS Activation</h1>
        <p className="text-white/40 mb-12 text-lg">Activation Lock ensures your Mac is secure.</p>
        
        <button 
          onClick={() => setBootState('setup')}
          className="w-48 py-3 bg-white text-black rounded-xl font-bold text-lg hover:bg-white/90 active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
          style={{ willChange: 'transform' }}
        >
          Next
        </button>
      </motion.div>
    </div>
  );
};
