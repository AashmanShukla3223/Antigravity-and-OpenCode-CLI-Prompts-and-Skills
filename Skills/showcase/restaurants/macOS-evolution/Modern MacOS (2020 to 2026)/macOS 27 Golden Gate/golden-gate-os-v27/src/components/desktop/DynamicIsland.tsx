import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';
import { songs } from '../../utils/MusicData';

const IDLE_WIDTH = 126;
const EXPANDED_WIDTH = 300;
const PHONE_WIDTH = 260;

type IslandMode = 'idle' | 'music' | 'notification' | 'camera' | 'phone';

export const DynamicIsland: React.FC = () => {
  const { systemState, incomingCall } = useSystem();
  const [mode, setMode] = useState<IslandMode>('idle');
  const currentSong = songs[systemState.music.currentSongIndex];
  const notificationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasMusic = systemState.music.isPlaying && currentSong;

  useEffect(() => {
    if (incomingCall) {
      setMode('phone');
      return;
    }
    if (hasMusic) {
      setMode('music');
      return;
    }
    if (systemState.isCameraOn) {
      setMode('camera');
      return;
    }
    if (systemState.notifications.length > 0) {
      setMode('notification');
      if (notificationTimer.current) clearTimeout(notificationTimer.current);
      notificationTimer.current = setTimeout(() => setMode('idle'), 3000);
      return;
    }
    setMode('idle');
  }, [incomingCall, hasMusic, systemState.isCameraOn, systemState.notifications.length]);

  useEffect(() => {
    return () => {
      if (notificationTimer.current) clearTimeout(notificationTimer.current);
    };
  }, []);

  const latestNotification = systemState.notifications[systemState.notifications.length - 1];

  const getWidth = () => {
    switch (mode) {
      case 'phone': return PHONE_WIDTH;
      case 'music': return EXPANDED_WIDTH;
      case 'notification': return EXPANDED_WIDTH;
      case 'camera': return IDLE_WIDTH;
      default: return IDLE_WIDTH;
    }
  };

  const getHeight = () => {
    switch (mode) {
      case 'phone': return 72;
      case 'music': return 60;
      case 'notification': return 56;
      default: return 30;
    }
  };

  return (
    <motion.div
      data-testid="dynamic-island"
      layout
      transition={{ type: 'spring', damping: 25, stiffness: 250, mass: 0.8 }}
      className="fixed top-2 left-1/2 -translate-x-1/2 z-50"
    >
      <motion.div
        layout
        animate={{
          width: getWidth(),
          height: getHeight(),
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 250, mass: 0.8 }}
        className="bg-black rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-white/10 flex items-center overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {mode === 'music' && (
            <motion.div
              key="music"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-4 w-full"
            >
              <img
                src={currentSong.cover}
                alt=""
                className="w-10 h-10 rounded-lg object-cover shrink-0 shadow-lg"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{currentSong.title}</p>
                <p className="text-white/50 text-[10px] truncate">{currentSong.artist}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5 items-end h-4">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: [4, 12, 6, 14, 4][i - 1],
                      }}
                      transition={{
                        duration: 0.5 + i * 0.1,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut',
                      }}
                      className="w-[2px] bg-white/80 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {mode === 'notification' && latestNotification && (
            <motion.div
              key="notification"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 px-4 w-full"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <span className="text-lg">{latestNotification.icon || '🔔'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[11px] font-semibold truncate">{latestNotification.title}</p>
                <p className="text-white/50 text-[9px] truncate">{latestNotification.message}</p>
              </div>
            </motion.div>
          )}

          {mode === 'phone' && incomingCall && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-3 px-4 w-full"
            >
              <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <span className="text-lg">{incomingCall.contact.avatar || '📞'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{incomingCall.contact.name}</p>
                <p className="text-green-400 text-[9px] font-bold uppercase tracking-widest">
                  {incomingCall.type === 'facetime' ? 'FaceTime...' : 'Incoming Call...'}
                </p>
              </div>
              <div className="flex gap-1.5">
                <motion.div
                  className="w-2 h-2 rounded-full bg-green-500"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              </div>
            </motion.div>
          )}

          {mode === 'camera' && (
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center w-full h-full px-4 gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
              <span className="text-[9px] text-green-400 font-bold uppercase tracking-widest">Camera</span>
            </motion.div>
          )}

          {mode === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center w-full h-full px-4"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#222]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
