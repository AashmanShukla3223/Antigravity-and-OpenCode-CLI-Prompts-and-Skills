import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoonIcon } from 'hugeicons-react';
import { useSystem } from '../../contexts/SystemContext';
import { FileSystemResolver } from '../../utils/FileSystemResolver';

const ViscousSlider = ({ iconSrc, defaultValue = 50 }: { iconSrc: string, defaultValue?: number }) => {
  const [value, setValue] = useState(defaultValue);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="h-8 bg-black/40 rounded-full flex items-center relative overflow-hidden" ref={containerRef}>
      <motion.div 
        className="absolute left-0 top-0 bottom-0 bg-white/90 rounded-full" 
        animate={{ width: `${value}%` }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
      <div 
        className="absolute inset-0 z-20 cursor-pointer"
        onPointerDown={(e) => {
          if (containerRef.current) {
            const { width, left } = containerRef.current.getBoundingClientRect();
            const x = e.clientX - left;
            setValue(Math.max(0, Math.min(100, (x / width) * 100)));
          }
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1 && containerRef.current) {
            const { width, left } = containerRef.current.getBoundingClientRect();
            const x = e.clientX - left;
            setValue(Math.max(0, Math.min(100, (x / width) * 100)));
          }
        }}
      />
      <img src={iconSrc} alt="slider icon" className="w-3.5 h-3.5 relative z-10 mix-blend-difference ml-2 pointer-events-none" loading="lazy" />
    </div>
  );
};

export const ControlCenter: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { battery, wifi, setWifi, bluetooth, setBluetooth, systemState } = useSystem();
  const base = (import.meta as any).env?.BASE_URL || '/';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[9990]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
            className={`fixed top-10 right-4 w-80 rounded-3xl p-4 shadow-2xl z-[9995] flex flex-col gap-4 border border-white/20 text-white ${systemState.lowPowerMode ? 'bg-zinc-900' : 'glass-dark'}`}
          >
            {/* Top row toggles */}
            <div className="flex gap-4">
              <div className="flex-1 bg-white/10 rounded-2xl p-3 flex flex-col gap-3">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setWifi(!wifi)}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${wifi ? 'bg-blue-500' : 'bg-gray-500/50'}`}>
                    <img src={`${base}${FileSystemResolver.getDeviceIcon('network-wireless')}`} alt="Wi-Fi" className={`w-4 h-4 ${!wifi && 'opacity-50 grayscale'}`} loading="lazy" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Wi-Fi</div>
                    <div className="text-xs text-white/50">{wifi ? 'Home_Network' : 'Off'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setBluetooth(!bluetooth)}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${bluetooth ? 'bg-blue-500' : 'bg-gray-500/50'}`}>
                    <img src={`${base}${FileSystemResolver.getDeviceIcon('bluetooth')}`} alt="Bluetooth" className={`w-4 h-4 ${!bluetooth && 'opacity-50 grayscale'}`} loading="lazy" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Bluetooth</div>
                    <div className="text-xs text-white/50">{bluetooth ? 'On' : 'Off'}</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex-1 bg-white/10 rounded-2xl flex items-center justify-center p-4 gap-2 cursor-pointer hover:bg-white/20 transition-colors">
                  <MoonIcon size={20} className="text-purple-400 hugeicon-tahoe" />
                  <span className="font-semibold text-sm">Focus</span>
                </div>
              </div>
            </div>

            {/* Sliders */}
            <div className="bg-white/10 rounded-2xl p-3 flex flex-col gap-3">
              <div className="font-medium text-xs text-white/50 pl-1">Display</div>
              <ViscousSlider iconSrc={`${base}${FileSystemResolver.getStatusIcon('video-display-brightness')}`} defaultValue={66} />
            </div>
            
            <div className="bg-white/10 rounded-2xl p-3 flex flex-col gap-3">
              <div className="font-medium text-xs text-white/50 pl-1">Sound</div>
              <ViscousSlider iconSrc={`${base}${FileSystemResolver.getStatusIcon('audio-volume-high')}`} defaultValue={50} />
            </div>

            {/* Bottom Row: Mic & Battery */}
            <div className="flex gap-4">
               <div className="flex-1 bg-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/20 transition-colors">
                  <img src={`${base}${FileSystemResolver.getDeviceIcon('audio-input-microphone')}`} alt="Mic" className="w-5 h-5" loading="lazy" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/50">Microphone</span>
               </div>
               <div className="flex-1 bg-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
                  <div className="flex items-center gap-2">
                     <span className="text-lg font-black">{Math.round(battery.level * 100)}%</span>
                     <img src={`${base}${FileSystemResolver.getStatusIcon(battery.isCharging ? 'battery-100-charging' : 'battery-100')}`} alt="Battery" className="w-4 h-4" loading="lazy" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/50">Battery</span>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
