import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cancel01Icon, ArrowRight01Icon } from 'hugeicons-react';
import { useSystem } from '../../contexts/SystemContext';

export const AboutThisMac: React.FC = () => {
  const { showAboutWindow, setShowAboutWindow, hardware } = useSystem();

  if (!showAboutWindow) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none"
      >
        <div className="w-[450px] bg-black/40 backdrop-blur-[60px] saturate-[190%] border border-white/20 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col text-white">
          {/* Header */}
          <div className="h-12 flex items-center justify-between px-4">
            <button 
              onClick={() => setShowAboutWindow(false)}
              className="w-3.5 h-3.5 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center"
            >
              <Cancel01Icon size={10} className="text-black opacity-0 hover:opacity-100 hugeicon-tahoe" />
            </button>
            <div className="text-xs font-semibold text-white/50 tracking-widest uppercase">About This Mac</div>
            <div className="w-4" />
          </div>

          {/* Content */}
          <div className="flex-1 p-8 flex flex-col items-center">
            {/* 3D Chip Animation Placeholder */}
            <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
               <motion.div 
                 className="absolute inset-0 bg-gradient-to-br from-[#E3A018] via-[#FDE047] to-[#E3A018] rounded-2xl opacity-20 blur-2xl"
                 animate={{ rotate: 360 }}
                 transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               />
               <motion.div 
                 className="w-32 h-32 bg-gradient-to-br from-[#E3A018] to-[#B45309] rounded-2xl border border-white/20 shadow-2xl flex flex-col items-center justify-center p-4 relative overflow-hidden"
                 animate={{ rotateY: [0, 15, 0, -15, 0], rotateX: [0, 10, 0, -10, 0] }}
                 transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
               >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                  <div className="text-[#FDE047] font-bold text-2xl tracking-tighter z-10">M5</div>
                  <div className="text-[#FDE047] text-[10px] font-bold tracking-[0.2em] uppercase z-10">Max</div>
                  {/* Traces */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#FDE047]/30" />
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FDE047]/30" />
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#FDE047]/30" />
                  <div className="absolute top-0 right-0 w-1 h-full bg-[#FDE047]/30" />
               </motion.div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-white/50 mb-1">
              macOS Tahoe
            </h1>
            <div className="text-xs font-semibold text-white/40 tracking-[0.3em] uppercase mb-8">Version 26.0</div>

            {/* Specs List */}
            <div className="w-full space-y-3 mb-8">
               <div className="flex justify-between text-sm">
                 <span className="text-white/40">Chip</span>
                 <span className="font-medium text-[#FDE047]">Apple Silicon ({hardware.cores}-core CPU)</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-white/40">Memory</span>
                 <span className="font-medium">{hardware.memory} GB Unified Silicon</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-white/40">Neural Engine</span>
                 <span className="font-medium">64-core Tahoe Generation</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-white/40">Serial Number</span>
                 <span className="font-mono text-xs opacity-60">TAHOE-V3-{hardware.cores}C-{(hardware.memory || 0) * 1024}MB</span>
               </div>
            </div>

            {/* Credits Section */}
            <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/10 mb-8">
               <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Lead Architect</div>
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border border-white/20" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white/90">@Aashmanshukla3223</span>
                    <span className="text-[10px] text-white/40 italic">Unit 7 "Silicon Surge" Era</span>
                  </div>
               </div>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <button 
                onClick={() => window.open('https://github.com/AashmanShukla3223/Gemini-CLI-Prompts-and-Skills/issues', '_blank')}
                className="group w-full h-10 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 flex items-center justify-between px-4 transition-all"
              >
                <span className="text-sm font-medium">System Report...</span>
                <ArrowRight01Icon size={14} className="text-white/40 group-hover:translate-x-0.5 transition-transform hugeicon-tahoe" />
              </button>
              
              <button 
                onClick={() => window.open('https://github.com/AashmanShukla3223/Gemini-CLI-Prompts-and-Skills/issues', '_blank')}
                className="group w-full h-10 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 flex items-center justify-between px-4 transition-all"
              >
                <span className="text-sm font-medium">Feedback...</span>
                <ArrowRight01Icon size={14} className="text-white/40 group-hover:translate-x-0.5 transition-transform hugeicon-tahoe" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 text-center border-t border-white/10">
            <p className="text-[10px] text-white/20 leading-relaxed font-medium">
              TM and © 1983-2026 Apple Inc. All Rights Reserved.<br/>
              License Agreement / Regulatory
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
