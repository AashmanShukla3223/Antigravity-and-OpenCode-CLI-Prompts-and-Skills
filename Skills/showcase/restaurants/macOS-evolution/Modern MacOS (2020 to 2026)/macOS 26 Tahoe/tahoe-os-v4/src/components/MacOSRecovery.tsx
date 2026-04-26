import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../contexts/SystemContext';
import { SystemMenuBar } from './common/SystemMenuBar';

export const MacOSRecovery: React.FC = () => {
  const { setBootState } = useSystem();
  const [terminalOpen, setTerminalOpen] = useState(false);

  const recoveryApps = [
    { id: 'tm', name: 'Time Machine', icon: 'time-machine.png' },
    { id: 'install', name: 'Reinstall macOS', icon: 'tahoe-installer.png' },
    { id: 'safari', name: 'Safari', icon: 'safari.png' },
    { id: 'disk', name: 'Disk Utility', icon: 'disk-utility.png' },
  ];

  return (
    <div className="fixed inset-0 bg-[#050505] text-white flex items-center justify-center font-sans select-none overflow-hidden z-[150]">
      {/* Background ambient glow + deep blur */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(30,58,138,0.1),_transparent_70%)]" />
      <div className="absolute inset-0 backdrop-blur-[120px] bg-black/60" />

      <SystemMenuBar 
        mode="Recovery" 
        showUtilities={true} 
        onTerminalOpen={() => setTerminalOpen(true)} 
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex flex-col items-center max-w-4xl w-full p-8"
      >
        <h1 className="text-4xl font-semibold mb-16 tracking-tight text-white/90">macOS Recovery</h1>

        <div className="grid grid-cols-2 gap-12">
          {recoveryApps.map(app => (
            <motion.div
              key={app.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center group cursor-pointer"
              style={{ willChange: 'transform' }}
            >
              <div className="relative w-28 h-28 mb-4">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img 
                  src={`/icons/${app.icon}`} 
                  alt={app.name} 
                  className="w-full h-full object-contain drop-shadow-2xl relative z-10" 
                />
              </div>
              <span className="text-lg font-medium text-white/60 group-hover:text-white transition-colors">{app.name}</span>
            </motion.div>
          ))}
        </div>

        <button 
          onClick={() => setBootState('booting')}
          className="mt-20 text-white/30 hover:text-white transition-colors text-sm font-medium uppercase tracking-[0.2em]"
        >
          Restart System...
        </button>
      </motion.div>

      {/* Terminal Simulation */}
      <AnimatePresence>
        {terminalOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-20 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="w-full max-w-3xl h-[500px] bg-black/90 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col pointer-events-auto"
            >
              <div className="h-10 bg-white/5 border-b border-white/10 flex items-center justify-between px-4">
                <div className="flex gap-2">
                  <div onClick={() => setTerminalOpen(false)} className="w-3 h-3 rounded-full bg-red-500 cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                </div>
                <span className="text-xs font-bold opacity-40 uppercase tracking-widest">Recovery Terminal — zsh</span>
                <div className="w-12" />
              </div>
              <div className="flex-1 p-6 font-mono text-sm text-green-400 space-y-2 overflow-y-auto">
                <p># macOS Recovery Terminal v4.0.26</p>
                <p># System: M5 Max Neural Architecture</p>
                <p className="pt-4">root@recovery ~ % <span className="animate-pulse">_</span></p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
