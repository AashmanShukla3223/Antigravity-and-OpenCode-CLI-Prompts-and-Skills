import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';
import { FileSystemResolver } from '../../utils/FileSystemResolver';

const ViscousSlider = ({ iconSrc, value, onValueChange }: { iconSrc: string; value: number; onValueChange: (val: number) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="h-8 bg-black/40 rounded-full flex items-center relative overflow-hidden" ref={containerRef}>
      <motion.div
        className="absolute left-0 top-0 bottom-0 bg-white/90 rounded-full"
        animate={{ width: `${value}%` }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
      <div
        className="absolute inset-0 z-20 cursor-pointer"
        onPointerDown={(e) => {
          if (containerRef.current) {
            const { width, left } = containerRef.current.getBoundingClientRect();
            const x = e.clientX - left;
            onValueChange(Math.max(0, Math.min(100, (x / width) * 100)));
          }
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1 && containerRef.current) {
            const { width, left } = containerRef.current.getBoundingClientRect();
            const x = e.clientX - left;
            onValueChange(Math.max(0, Math.min(100, (x / width) * 100)));
          }
        }}
      />
      <img
        src={iconSrc}
        alt="slider icon"
        className="w-3.5 h-3.5 relative z-10 mix-blend-difference ml-2 pointer-events-none"
        loading="lazy"
      />
    </div>
  );
};

export const ControlCenter = React.memo<{ isOpen: boolean; onClose: () => void }>(({ isOpen, onClose }) => {
  const { battery, wifi, setWifi, bluetooth, setBluetooth, systemState, updateSystemState, setVolume } = useSystem();
  const base = (import.meta as any).env?.BASE_URL || '/';
  const backdropRef = useRef<HTMLDivElement>(null);
  const [showDisplays, setShowDisplays] = React.useState(false);
  const displays = ['Built-in Display', 'Studio Display', 'iPad Pro (Sidecar)'];
  const [activeDisplay, setActiveDisplay] = React.useState(() => localStorage.getItem('golden_gate_display') || 'Built-in Display');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div
            ref={backdropRef}
            className="fixed inset-0 z-[9990]"
            onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
          />
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
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${wifi ? 'bg-blue-500' : 'bg-gray-500/50'}`}
                  >
                    <img
                      src={`${base}${FileSystemResolver.getDeviceIcon('network-wireless')}`}
                      alt="Wi-Fi"
                      className={`w-4 h-4 ${!wifi && 'opacity-50 grayscale'}`}
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Wi-Fi</div>
                    <div className="text-xs text-white/50">{wifi ? 'Home_Network' : 'Off'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setBluetooth(!bluetooth)}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${bluetooth ? 'bg-blue-500' : 'bg-gray-500/50'}`}
                  >
                    <img
                      src={`${base}${FileSystemResolver.getDeviceIcon('bluetooth')}`}
                      alt="Bluetooth"
                      className={`w-4 h-4 ${!bluetooth && 'opacity-50 grayscale'}`}
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Bluetooth</div>
                    <div className="text-xs text-white/50">{bluetooth ? 'On' : 'Off'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => updateSystemState({ airdrop: !systemState.airdrop })}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${systemState.airdrop ? 'bg-blue-500' : 'bg-gray-500/50'}`}
                  >
                    <img
                      src={`${base}icons/airdrop.png`}
                      alt="AirDrop"
                      className={`w-4 h-4 ${!systemState.airdrop && 'opacity-50 grayscale'}`}
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">AirDrop</div>
                    <div className="text-xs text-white/50">{systemState.airdrop ? 'Contacts Only' : 'Off'}</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-4">
                <div
                  className={`flex-1 bg-white/10 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${systemState.stageManagerEnabled ? 'bg-blue-500/30 ring-2 ring-blue-500' : 'hover:bg-white/20'}`}
                  onClick={() => updateSystemState({ stageManagerEnabled: !systemState.stageManagerEnabled })}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={systemState.stageManagerEnabled ? 'text-blue-400' : 'text-white/50'}>
                    <rect x="2" y="2" width="20" height="20" rx="3" />
                    <line x1="2" y1="9" x2="22" y2="9" />
                    <line x1="9" y1="2" x2="9" y2="22" />
                  </svg>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/50">Stage</span>
                </div>
                <div
                  className="flex-1 bg-white/10 rounded-2xl flex items-center justify-center p-4 gap-2 cursor-pointer hover:bg-white/20 transition-colors"
                  onClick={() => {
                    const newAppearance = systemState.appearance === 'dark' ? 'light' : 'dark';
                    updateSystemState({
                      appearance: newAppearance,
                      wallpaperUrl: newAppearance === 'dark' ? '/wallpapers/golden-gate-dark.png' : '/wallpapers/golden-gate-light.png',
                      wallpaperType: 'image',
                      iconModeSelection: newAppearance === 'dark' ? 'dark' : 'light',
                    });
                  }}
                >
                  <img
                    src={`${base}${FileSystemResolver.getStatusIcon(systemState.appearance === 'dark' ? 'weather-clear' : 'weather-clear-night')}`}
                    alt="Appearance"
                    className="w-5 h-5"
                    loading="lazy"
                  />
                  <span className="font-semibold text-sm">{systemState.appearance === 'dark' ? 'Light' : 'Dark'}</span>
                </div>
              </div>
            </div>

            {/* Sliders */}
            <div className="bg-white/10 rounded-2xl p-3 flex flex-col gap-3">
              <div className="font-medium text-xs text-white/50 pl-1">Display</div>
              <ViscousSlider
                iconSrc={`${base}${FileSystemResolver.getStatusIcon('video-display-brightness')}`}
                value={systemState.brightness}
                onValueChange={(val) => updateSystemState({ brightness: val })}
              />
            </div>

            <div className="bg-white/10 rounded-2xl p-3 flex flex-col gap-3">
              <div className="font-medium text-xs text-white/50 pl-1">Sound</div>
              <ViscousSlider
                iconSrc={`${base}${FileSystemResolver.getStatusIcon('audio-volume-high')}`}
                value={Math.round(systemState.music.volume * 100)}
                onValueChange={(val) => setVolume(val / 100)}
              />
            </div>

            {/* Bottom Row: Mic & Battery */}
            <div className="flex gap-4">
              <div className="flex-1 bg-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/20 transition-colors relative"
                onClick={() => setShowDisplays(!showDisplays)}
              >
                <img
                  src={`${base}${FileSystemResolver.getDeviceIcon('video-display')}`}
                  alt="Displays"
                  className="w-5 h-5"
                  loading="lazy"
                />
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/50">Displays</span>
                {showDisplays && (
                  <div className="absolute bottom-16 left-0 right-0 bg-black/90 backdrop-blur-2xl rounded-2xl border border-white/10 p-2 z-50 shadow-2xl">
                    {displays.map((d) => (
                      <div
                        key={d}
                        onClick={(e) => { e.stopPropagation(); setActiveDisplay(d); localStorage.setItem('golden_gate_display', d); setShowDisplays(false); }}
                        className={`px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors flex items-center gap-2 ${activeDisplay === d ? 'bg-blue-500/20 text-blue-400' : 'text-white/70 hover:bg-white/10'}`}
                      >
                        <div className={`w-2 h-2 rounded-full ${activeDisplay === d ? 'bg-blue-500' : 'bg-white/20'}`} />
                        {d}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 bg-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black">{Math.round(battery.level * 100)}%</span>
                  <img
                    src={`${base}${FileSystemResolver.getStatusIcon(battery.isCharging ? 'battery-100-charging' : 'battery-100')}`}
                    alt="Battery"
                    className="w-4 h-4"
                    loading="lazy"
                  />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/50">Battery</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
