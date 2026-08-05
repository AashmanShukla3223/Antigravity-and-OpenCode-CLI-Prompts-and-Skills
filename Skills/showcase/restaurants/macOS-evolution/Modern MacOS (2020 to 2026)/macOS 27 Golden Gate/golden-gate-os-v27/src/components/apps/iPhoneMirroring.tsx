import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import {
  Wifi01Icon, SignalIcon, BatteryFullIcon,
  FlashIcon, Settings01Icon, Message01Icon, MusicNote01Icon, Camera01Icon,
  Mail01Icon, Calendar01Icon, Note03Icon, Video01Icon,
  MapsIcon, Clock01Icon, Wallet01Icon,
  LockIcon,
} from 'hugeicons-react';
import { useSystem } from '../../contexts/SystemContext';

type ScreenState = 'lock' | 'home' | 'app';

interface HomeApp {
  name: string;
  icon: React.FC<{ size?: number; className?: string }>;
  color: string;
  action: () => void;
  badge?: number;
}

const timeFormat = (d: Date) =>
  d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

const dateFormat = (d: Date) =>
  d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

export const IPhoneMirroring: React.FC = () => {
  const { launchApp, showAlert } = useSystem();
  const [screen, setScreen] = useState<ScreenState>('lock');
  const [time, setTime] = useState(new Date());
  const [swipeY, setSwipeY] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [tappedApp, setTappedApp] = useState<string | null>(null);
  const [showCC, setShowCC] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSwipe = (_: any, info: PanInfo) => {
    setSwipeY(Math.max(-200, Math.min(0, info.offset.y)));
    setSwiping(true);
  };

  const handleSwipeEnd = (_: any, info: PanInfo) => {
    setSwiping(false);
    if (info.offset.y < -80) {
      setSwipeY(0);
      setScreen('home');
    } else {
      setSwipeY(0);
    }
  };

  const apps: HomeApp[] = [
    { name: 'Phone', icon: (p) => <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>, color: 'bg-green-500', action: () => launchApp('facetime') },
    { name: 'Messages', icon: (p) => <Message01Icon size={p.size || 22} className={p.className} />, color: 'bg-green-600', action: () => launchApp('messages') },
    { name: 'Music', icon: (p) => <MusicNote01Icon size={p.size || 22} className={p.className} />, color: 'bg-red-500', action: () => launchApp('music'), badge: 2 },
    { name: 'Camera', icon: (p) => <Camera01Icon size={p.size || 22} className={p.className} />, color: 'bg-gray-800', action: () => showAlert('📸 Camera opened on iPhone', 'Camera') },
    { name: 'Mail', icon: (p) => <Mail01Icon size={p.size || 22} className={p.className} />, color: 'bg-blue-600', action: () => launchApp('mail') },
    { name: 'Maps', icon: (p) => <MapsIcon size={p.size || 22} className={p.className} />, color: 'bg-green-700', action: () => launchApp('maps') },
    { name: 'Calendar', icon: (p) => <Calendar01Icon size={p.size || 22} className={p.className} />, color: 'bg-red-500', action: () => showAlert('📅 Calendar opened on iPhone', 'Calendar') },
    { name: 'Notes', icon: (p) => <Note03Icon size={p.size || 22} className={p.className} />, color: 'bg-yellow-600', action: () => launchApp('notes') },
    { name: 'Photos', icon: (p) => <Video01Icon size={p.size || 22} className={p.className} />, color: 'bg-cyan-600', action: () => launchApp('photos') },
    { name: 'Settings', icon: (p) => <Settings01Icon size={p.size || 22} className={p.className} />, color: 'bg-gray-600', action: () => launchApp('settings') },
    { name: 'FaceTime', icon: (p) => <Video01Icon size={p.size || 22} className={p.className} />, color: 'bg-green-500', action: () => launchApp('facetime') },
    { name: 'Clock', icon: (p) => <Clock01Icon size={p.size || 22} className={p.className} />, color: 'bg-orange-500', action: () => launchApp('clock') },
    { name: 'Wallet', icon: (p) => <Wallet01Icon size={p.size || 22} className={p.className} />, color: 'bg-black', action: () => showAlert('💳 Wallet opened on iPhone', 'Wallet') },
    { name: 'Weather', icon: (p) => <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="1" y1="12" x2="3" y2="12"/></svg>, color: 'bg-sky-500', action: () => launchApp('weather') },
    { name: 'Books', icon: (p) => <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M4 19.5a2.5 2.5 0 0 1 2.49 0"/></svg>, color: 'bg-orange-600', action: () => launchApp('books') },
    { name: 'Face ID', icon: (p) => <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>, color: 'bg-emerald-600', action: () => showAlert('🔒 Face ID authenticated', 'Face ID') },
  ];

  const dockApps = apps.slice(0, 4);

  return (
    <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
      {/* iPhone 17 Pro Max Body — Silver Titanium */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        className="relative w-[340px] h-[700px] rounded-[52px] bg-gradient-to-b from-[#e8e8e8] via-[#d4d4d4] to-[#c0c0c0] shadow-[0_30px_60px_rgba(0,0,0,0.6),0_0_0_2px_#a0a0a0_inset,0_0_0_4px_#b0b0b0_inset] flex items-center justify-center"
      >
        {/* Antenna bands */}
        <div className="absolute top-[100px] left-0 w-[3px] h-6 bg-[#999] rounded-r-md opacity-30" />
        <div className="absolute top-[100px] right-0 w-[3px] h-6 bg-[#999] rounded-l-md opacity-30" />
        <div className="absolute bottom-[140px] left-0 w-[3px] h-6 bg-[#999] rounded-r-md opacity-30" />
        <div className="absolute bottom-[140px] right-0 w-[3px] h-6 bg-[#999] rounded-l-md opacity-30" />

        {/* Side buttons */}
        <div className="absolute left-[-3px] top-[180px] w-[3px] h-12 bg-[#b0b0b0] rounded-r-md" />
        <div className="absolute left-[-3px] top-[220px] w-[3px] h-12 bg-[#b0b0b0] rounded-r-md" />
        <div className="absolute right-[-3px] top-[160px] w-[3px] h-16 bg-[#b0b0b0] rounded-l-md" />

        {/* Screen bezel */}
        <div className="w-[324px] h-[684px] rounded-[44px] bg-black overflow-hidden relative shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]">
          <div className="w-full h-full relative overflow-hidden">
            {/* Wallpaper */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-20 left-10 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl" />
              <div className="absolute bottom-40 right-10 w-52 h-52 bg-blue-500/20 rounded-full blur-3xl" />
              <div className="absolute top-40 right-20 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl" />
            </div>

            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 z-40 h-12 flex justify-between items-end px-8 pb-1">
              <span className="text-[11px] font-bold text-white/90">
                {timeFormat(time)}
              </span>
              <div className="flex items-center gap-1.5 text-white/80">
                <SignalIcon size={11} />
                <Wifi01Icon size={11} />
                <BatteryFullIcon size={12} className="text-green-400" />
              </div>
            </div>

            {/* Dynamic Island */}
            <div className="absolute top-[6px] left-1/2 -translate-x-1/2 z-50 w-[100px] h-[26px] bg-black rounded-full flex items-center justify-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${flashlightOn ? 'bg-yellow-400 shadow-[0_0_8px_#eab308]' : 'bg-zinc-800'}`} />
              <div className="w-3 h-3 rounded-full bg-zinc-900 border border-zinc-800" />
            </div>

            {/* Lock Screen */}
            {screen === 'lock' && (
              <motion.div
                drag="y"
                dragConstraints={{ top: -300, bottom: 0 }}
                dragElastic={0.3}
                onDrag={handleSwipe}
                onDragEnd={handleSwipeEnd}
                className="absolute inset-0 z-30 cursor-pointer"
                style={{ y: swiping ? swipeY : 0 }}
              >
                <div className="w-full h-full flex flex-col items-center pt-20">
                  <motion.div
                    animate={{ opacity: 1 - Math.abs(swipeY) / 200 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-[72px] font-bold text-white tracking-tight drop-shadow-2xl">
                      {timeFormat(time)}
                    </span>
                    <span className="text-sm font-medium text-white/70 mt-1 drop-shadow-lg">
                      {dateFormat(time)}
                    </span>
                  </motion.div>

                  {/* Lock Screen Widgets */}
                  <motion.div
                    animate={{ opacity: 1 - Math.abs(swipeY) / 200, y: swipeY * 0.3 }}
                    className="mt-8 flex gap-3 px-6"
                  >
                    <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-2xl p-3 border border-white/10">
                      <p className="text-white/50 text-[9px] font-semibold uppercase tracking-wider">Weather</p>
                      <div className="flex items-center gap-2 mt-1">
                        <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><line x1="12" y1="2" x2="12" y2="4"/></svg>
                        <span className="text-white text-xl font-bold">72°</span>
                      </div>
                      <p className="text-white/40 text-[8px] mt-1">Sunny</p>
                    </div>
                    <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-2xl p-3 border border-white/10">
                      <p className="text-white/50 text-[9px] font-semibold uppercase tracking-wider">Calendar</p>
                      <p className="text-white text-lg font-bold mt-1">No Events</p>
                      <p className="text-white/40 text-[8px] mt-1">You're free today</p>
                    </div>
                  </motion.div>

                  {/* Swipe hint */}
                  <motion.div
                    animate={{ opacity: 1 - Math.abs(swipeY) / 150 }}
                    className="absolute bottom-8 flex flex-col items-center gap-1"
                  >
                    <LockIcon size={14} className="text-white/30" />
                    <span className="text-white/20 text-[9px] font-semibold tracking-widest uppercase">Swipe up to unlock</span>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Home Screen */}
            {screen === 'home' && (
              <div className="w-full h-full flex flex-col">
                {/* Control Center swipe area */}
                <div
                  className="h-8 z-20"
                  onPointerDown={(e) => {
                    const startY = e.clientY;
                    const handleMove = (ev: PointerEvent) => {
                      if (ev.clientY - startY < -60) {
                        setShowCC(true);
                        window.removeEventListener('pointermove', handleMove);
                        window.removeEventListener('pointerup', handleUp);
                      }
                    };
                    const handleUp = () => {
                      window.removeEventListener('pointermove', handleMove);
                      window.removeEventListener('pointerup', handleUp);
                    };
                    window.addEventListener('pointermove', handleMove);
                    window.addEventListener('pointerup', handleUp);
                  }}
                />

                {/* Page dots */}
                <div className="flex justify-center gap-1.5 mt-12 z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                </div>

                {/* Widgets Row */}
                <div className="px-4 mt-3 flex gap-3 z-10">
                  <motion.div
                    whileTap={{ scale: 0.96 }}
                    className="flex-1 bg-white/10 backdrop-blur-2xl rounded-2xl p-3 border border-white/10"
                  >
                    <p className="text-white/50 text-[8px] font-semibold uppercase tracking-wider">Weather</p>
                    <div className="flex items-center gap-2 mt-1">
                      <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><line x1="12" y1="2" x2="12" y2="4"/></svg>
                      <span className="text-white text-2xl font-bold">72°</span>
                    </div>
                    <p className="text-white/40 text-[8px] mt-1">H: 78° L: 64°</p>
                  </motion.div>
                  <motion.div
                    whileTap={{ scale: 0.96 }}
                    className="flex-1 bg-white/10 backdrop-blur-2xl rounded-2xl p-3 border border-white/10"
                  >
                    <p className="text-white/50 text-[8px] font-semibold uppercase tracking-wider">Clock</p>
                    <p className="text-white text-xl font-bold mt-1">{timeFormat(time)}</p>
                    <p className="text-white/40 text-[8px] mt-1">
                      {time.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                  </motion.div>
                </div>

                {/* App Grid */}
                <div className="flex-1 px-3 mt-4 overflow-y-auto z-10 scrollbar-hide">
                  <div className="grid grid-cols-4 gap-3">
                    {apps.map((app) => (
                      <motion.div
                        key={app.name}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => {
                          setTappedApp(app.name);
                          app.action();
                          setTimeout(() => setTappedApp(null), 300);
                        }}
                        className="flex flex-col items-center gap-1 cursor-pointer"
                      >
                        <div className={`w-14 h-14 rounded-[16px] ${app.color} flex items-center justify-center shadow-lg ${tappedApp === app.name ? 'ring-2 ring-white/50 scale-110' : ''} relative`}>
                          <app.icon size={24} className="text-white" />
                          {app.badge && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-[8px] font-bold text-white">{app.badge}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] text-white/80 font-medium text-center leading-tight max-w-[64px] truncate">
                          {app.name}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="h-24" />
                </div>

                {/* Dock */}
                <div className="absolute bottom-1 left-3 right-3 z-20">
                  <div className="bg-white/15 backdrop-blur-[30px] border border-white/10 rounded-3xl h-[68px] flex items-center justify-around px-4">
                    {dockApps.map((app) => (
                      <motion.div
                        key={app.name}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => {
                          setTappedApp(app.name);
                          app.action();
                          setTimeout(() => setTappedApp(null), 300);
                        }}
                        className={`w-12 h-12 rounded-[14px] ${app.color} flex items-center justify-center shadow-lg ${tappedApp === app.name ? 'ring-2 ring-white/50' : ''} cursor-pointer`}
                      >
                        <app.icon size={22} className="text-white" />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-2 flex justify-center items-center z-30 pb-1">
                  <div className="w-[120px] h-[4px] bg-white/40 rounded-full" />
                </div>
              </div>
            )}

            {/* Control Center Overlay */}
            <AnimatePresence>
              {showCC && (
                <motion.div
                  initial={{ y: -200, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -200, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="absolute inset-0 z-50 bg-[#1a1a2e]/90 backdrop-blur-2xl"
                  onClick={() => setShowCC(false)}
                >
                  <div className="p-6 pt-14 flex flex-col gap-5" onClick={(e) => e.stopPropagation()}>
                    <div className="text-center">
                      <h2 className="text-4xl font-bold text-white">{timeFormat(time)}</h2>
                    </div>

                    {/* Quick Toggles */}
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { icon: (p: any) => <Wifi01Icon size={p.size || 20} className={p.className} />, label: 'WiFi', active: true },
                        { icon: (p: any) => <SignalIcon size={p.size || 20} className={p.className} />, label: 'Bluetooth', active: true },
                        { icon: (p: any) => <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 2v4M14.5 13.5L17 17M17 17l2.5-3.5M17 17V2"/><path d="M7 7l-2 2.5L7 12"/><path d="M7 22v-6"/><circle cx="7" cy="7" r="1"/><circle cx="7" cy="17" r="1"/></svg>, label: 'AirDrop', active: true },
                        { icon: (p: any) => <FlashIcon size={p.size || 20} className={p.className} />, label: 'Flashlight', active: flashlightOn, action: () => setFlashlightOn(!flashlightOn) },
                      ].map((tile) => (
                        <motion.button
                          key={tile.label}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => tile.action?.()}
                          className={`aspect-square ${tile.active ? 'bg-blue-500/30 text-blue-400' : 'bg-white/10 text-white/60'} rounded-2xl flex flex-col items-center justify-center gap-1 border border-white/5`}
                        >
                          <tile.icon size={20} />
                          <span className="text-[9px] font-semibold">{tile.label}</span>
                        </motion.button>
                      ))}
                    </div>

                    {/* Brightness */}
                    <div className="flex items-center gap-3">
                      <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider w-20">Brightness</span>
                      <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: '75%' }} />
                      </div>
                    </div>

                    {/* Volume */}
                    <div className="flex items-center gap-3">
                      <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider w-20">Volume</span>
                      <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: '60%' }} />
                      </div>
                    </div>

                    {/* Media Player */}
                    <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-4 border border-white/5">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center">
                        <MusicNote01Icon size={18} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-xs font-semibold">Now Playing</p>
                        <p className="text-white/50 text-[9px]">Midnight — $ystem_Overlord</p>
                      </div>
                      <motion.div whileTap={{ scale: 0.85 }} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white rotate-90 ml-0.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      </motion.div>
                    </div>

                    <div className="flex justify-center mt-2">
                      <div className="w-10 h-[3px] bg-white/30 rounded-full" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Camera bump */}
        <div className="absolute top-[100px] right-[5px] w-[20px] h-[90px] rounded-full bg-[#d0d0d0] border border-[#a0a0a0] shadow-inner">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full bg-[#222]" />
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[10px] h-[10px] rounded-full bg-[#111]" />
          <div className="absolute top-9 left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full bg-[#333]" />
          <div className="absolute top-[52px] left-1/2 -translate-x-1/2 w-[4px] h-[4px] bg-yellow-400/40 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
};
