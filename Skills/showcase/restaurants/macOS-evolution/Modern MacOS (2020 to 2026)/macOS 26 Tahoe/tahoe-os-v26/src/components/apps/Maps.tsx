import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Location01Icon, Search01Icon, Navigation01Icon, Layers01Icon, BookOpen01Icon, SparklesIcon } from 'hugeicons-react';

interface Pin {
  id: number;
  x: number;
  y: number;
  title: string;
  isJournal: boolean;
}

export const Maps: React.FC = () => {
  const [layersOpen, setLayersOpen] = useState(false);
  const [pins, setPins] = useState<Pin[]>([
    { id: 1, x: 30, y: 40, title: 'Golden Gate', isJournal: false },
    { id: 2, x: 60, y: 65, title: 'Coffee Shop (Journal Entry)', isJournal: true },
  ]);

  // RAM Isolation
  useEffect(() => {
    return () => setPins([]);
  }, []);

  return (
    <div className="relative w-full h-full bg-[#E5E3DF] dark:bg-[#2A2C30] overflow-hidden flex flex-col">
      {/* Topographic Glass Layers Simulation */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-20 mix-blend-overlay">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <filter id="displacementFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="50" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <g filter="url(#displacementFilter)">
            <circle cx="50%" cy="50%" r="40%" fill="none" stroke="#4A5568" strokeWidth="1" opacity="0.5" />
            <circle cx="50%" cy="50%" r="30%" fill="none" stroke="#4A5568" strokeWidth="1" opacity="0.5" />
            <circle cx="50%" cy="50%" r="20%" fill="none" stroke="#4A5568" strokeWidth="1" opacity="0.5" />
          </g>
        </svg>
      </div>

      {/* Grid lines */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />

      {/* Floating UI Elements */}
      <div className="absolute top-4 left-4 right-4 z-10 flex gap-4">
        <div className="flex-1 bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl shadow-lg flex items-center px-4 py-2.5">
          <Search01Icon size={18} className="text-gray-500 mr-3 hugeicon-tahoe" />
          <input 
            type="text" 
            placeholder="Search Maps or Ask Visual Intelligence..." 
            className="flex-1 bg-transparent border-none focus:outline-none text-sm dark:text-white"
          />
        </div>
        <button 
          onClick={() => setLayersOpen(!layersOpen)}
          className="w-10 h-10 rounded-xl bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-black transition-colors"
        >
          <Layers01Icon size={20} className="hugeicon-tahoe" />
        </button>
      </div>

      {layersOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-16 right-4 z-20 w-48 bg-white/90 dark:bg-black/80 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-xl shadow-2xl p-2"
        >
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2 pt-1">Map Type</div>
          <button className="w-full text-left px-3 py-1.5 text-sm rounded-lg hover:bg-black/5 dark:hover:bg-white/10 dark:text-white transition-colors">Explore</button>
          <button className="w-full text-left px-3 py-1.5 text-sm rounded-lg hover:bg-black/5 dark:hover:bg-white/10 dark:text-white transition-colors">Transit</button>
          <button className="w-full text-left px-3 py-1.5 text-sm rounded-lg hover:bg-black/5 dark:hover:bg-white/10 dark:text-white transition-colors">Topographic Glass</button>
        </motion.div>
      )}

      {/* Pins Render Layer */}
      <div className="absolute inset-0 z-0">
        {pins.map(pin => (
          <motion.div 
            key={pin.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ top: `${pin.y}%`, left: `${pin.x}%` }}
            className="absolute -translate-x-1/2 -translate-y-full group cursor-pointer"
          >
            {pin.isJournal ? (
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-xl border-2 border-white flex items-center justify-center">
                  <BookOpen01Icon size={14} className="text-white hugeicon-tahoe" />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-md shadow-lg text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity dark:text-white">
                  {pin.title}
                </div>
              </div>
            ) : (
              <div className="relative">
                <Location01Icon size={32} className="text-red-500 drop-shadow-lg fill-red-500/20 hugeicon-tahoe" />
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-md shadow-lg text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity dark:text-white">
                  {pin.title}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
        <button className="w-12 h-12 rounded-full bg-blue-500 text-white shadow-xl flex items-center justify-center hover:bg-blue-600 transition-colors">
          <Navigation01Icon size={20} className="ml-[-2px] mt-[-2px] hugeicon-tahoe" />
        </button>
      </div>

      {/* Visual Intelligence Overlay Demo */}
      <div className="absolute bottom-6 left-6 z-10 max-w-xs">
        <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl text-white">
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1 flex items-center gap-1">
            <SparklesIcon size={12} className="hugeicon-tahoe" /> Visual Intelligence
          </div>
          <p className="text-sm font-medium">Looking at the Golden Gate Bridge.</p>
          <div className="mt-2 text-xs text-white/70">Traffic is light. Estimated toll is $8.75.</div>
        </div>
      </div>

    </div>
  );
};
