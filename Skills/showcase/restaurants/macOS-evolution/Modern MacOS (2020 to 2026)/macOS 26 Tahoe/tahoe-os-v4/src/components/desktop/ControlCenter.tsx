import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi01Icon, BluetoothIcon, Sun01Icon, VolumeHighIcon, MoonIcon, Mic01Icon, BatteryCharging01Icon } from 'hugeicons-react';
import { useSystem } from '../../contexts/SystemContext';

const ViscousSlider = ({ icon: Icon, defaultValue = 50 }: { icon: any, defaultValue?: number }) => {
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
      <Icon size={14} className="text-gray-500 relative z-10 mix-blend-difference ml-2 pointer-events-none hugeicon-tahoe" />
    </div>
  );
};

export const ControlCenter: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { battery, wifi, setWifi, bluetooth, setBluetooth, systemState } = useSystem();

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
                    <Wifi01Icon size={16} className={`${wifi ? 'text-white' : 'text-gray-400'} hugeicon-tahoe`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Wi-Fi</div>
                    <div className="text-xs text-white/50">{wifi ? 'Home_Network' : 'Off'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setBluetooth(!bluetooth)}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${bluetooth ? 'bg-blue-500' : 'bg-gray-500/50'}`}>
                    <BluetoothIcon size={16} className={`${bluetooth ? 'text-white' : 'text-gray-400'} hugeicon-tahoe`} />
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
              <ViscousSlider icon={Sun01Icon} defaultValue={66} />
            </div>
            
            <div className="bg-white/10 rounded-2xl p-3 flex flex-col gap-3">
              <div className="font-medium text-xs text-white/50 pl-1">Sound</div>
              <ViscousSlider icon={VolumeHighIcon} defaultValue={50} />
            </div>

            {/* Bottom Row: Mic & Battery */}
            <div className="flex gap-4">
               <div className="flex-1 bg-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/20 transition-colors">
                  <Mic01Icon size={20} className="text-orange-400 hugeicon-tahoe" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/50">Microphone</span>
               </div>
               <div className="flex-1 bg-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
                  <div className="flex items-center gap-2">
                     <span className="text-lg font-black">{Math.round(battery.level * 100)}%</span>
                     {battery.isCharging && <BatteryCharging01Icon size={14} className="text-green-400" />}
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
