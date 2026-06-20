import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';
import { songs } from '../../utils/MusicData';

const IDLE_WIDTH = 126;
const IDLE_STATUS_WIDTH = 200;
const COMPACT_WIDTH = 160;
const EXPANDED_WIDTH = 290;
const PHONE_WIDTH = 260;

type IslandMode =
  | 'idle'
  | 'music'
  | 'notification'
  | 'camera'
  | 'phone'
  | 'alarm'
  | 'timer'
  | 'stopwatch'
  | 'recording'
  | 'download'
  | 'airplay';

export const DynamicIsland: React.FC = () => {
  const { systemState, incomingCall, battery, updateSystemState } = useSystem();
  const [mode, setMode] = useState<IslandMode>('idle');
  const currentSong = songs[systemState.music.currentSongIndex];
  const notificationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasMusic = systemState.music.isPlaying && currentSong;
  const showDnd = systemState.dndEnabled;
  const showVpn = systemState.vpnConnected;
  const showLowBattery = battery.level < 0.2 && !battery.isCharging;
  const showCharging = battery.isCharging;
  const showHotspot = systemState.hotspotActive;
  const showFocus = systemState.focusMode !== null;
  const hasAnyStatus = showDnd || showVpn || showLowBattery || showCharging || showHotspot || showFocus;

  useEffect(() => {
    if (incomingCall) {
      setMode('phone');
      return;
    }
    if (systemState.alarmRinging) {
      setMode('alarm');
      return;
    }
    if (systemState.timerRunning) {
      setMode('timer');
      return;
    }
    if (systemState.isRecording) {
      setMode('recording');
      return;
    }
    if (systemState.stopwatchRunning) {
      setMode('stopwatch');
      return;
    }
    if (systemState.isCameraOn) {
      setMode('camera');
      return;
    }
    if (hasMusic) {
      setMode('music');
      return;
    }
    if (systemState.activeDownloads.length > 0) {
      setMode('download');
      return;
    }
    if (systemState.isAirPlaying) {
      setMode('airplay');
      return;
    }
    if (systemState.notifications.length > 0) {
      setMode('notification');
      if (notificationTimer.current) clearTimeout(notificationTimer.current);
      notificationTimer.current = setTimeout(() => setMode('idle'), 3000);
      return;
    }
    setMode('idle');
  }, [
    incomingCall, systemState.alarmRinging, systemState.timerRunning,
    systemState.isRecording, systemState.stopwatchRunning,
    systemState.isCameraOn, hasMusic, systemState.activeDownloads,
    systemState.isAirPlaying, systemState.notifications.length,
  ]);

  useEffect(() => {
    return () => {
      if (notificationTimer.current) clearTimeout(notificationTimer.current);
    };
  }, []);

  const latestNotification = systemState.notifications[systemState.notifications.length - 1];

  const getWidth = () => {
    switch (mode) {
      case 'phone': return PHONE_WIDTH;
      case 'alarm': return EXPANDED_WIDTH;
      case 'timer': return EXPANDED_WIDTH;
      case 'download': return EXPANDED_WIDTH;
      case 'music': return EXPANDED_WIDTH;
      case 'notification': return EXPANDED_WIDTH;
      case 'stopwatch':
      case 'recording':
      case 'airplay':
      case 'camera': return COMPACT_WIDTH;
      case 'idle': return hasAnyStatus ? IDLE_STATUS_WIDTH : IDLE_WIDTH;
      default: return IDLE_WIDTH;
    }
  };

  const getHeight = () => {
    switch (mode) {
      case 'phone': return 72;
      case 'alarm': return 72;
      case 'timer': return 60;
      case 'music': return 60;
      case 'notification': return 56;
      case 'download': return 54;
      case 'stopwatch':
      case 'recording':
      case 'airplay':
      case 'camera': return 36;
      default: return 30;
    }
  };

  const formatTimer = (s: number) => {
    if (s <= 0) return '00:00';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const formatStopwatch = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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
        animate={{ width: getWidth(), height: getHeight() }}
        transition={{ type: 'spring', damping: 25, stiffness: 250, mass: 0.8 }}
        className="bg-black rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-white/10 flex items-center overflow-hidden"
      >
        <AnimatePresence mode="wait">
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

          {mode === 'alarm' && (
            <motion.div
              key="alarm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 px-4 w-full"
            >
              <motion.div
                animate={{ rotate: [-12, 12, -8, 8, -12] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
                className="w-9 h-9 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0"
              >
                <span className="text-lg">🔔</span>
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold">{systemState.alarmLabel || 'Alarm'}</p>
                <p className="text-orange-400 text-[9px] font-bold uppercase tracking-widest">
                  RINGING
                </p>
              </div>
              <button
                onClick={() => updateSystemState({ alarmRinging: false })}
                className="px-3 py-1 bg-white/15 hover:bg-white/25 rounded-full text-[10px] font-bold text-white transition-colors"
              >
                Stop
              </button>
            </motion.div>
          )}

          {mode === 'timer' && (
            <motion.div
              key="timer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-4 w-full"
            >
              <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <span className="text-base">⏱️</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/50 text-[10px] font-medium">{systemState.timerLabel || 'Timer'}</p>
                <p className="text-white text-lg font-bold font-mono tracking-wider">
                  {formatTimer(systemState.timerRemaining)}
                </p>
              </div>
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-blue-400"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          )}

          {mode === 'recording' && (
            <motion.div
              key="recording"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center w-full h-full px-4 gap-2"
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest">Recording</span>
            </motion.div>
          )}

          {mode === 'stopwatch' && (
            <motion.div
              key="stopwatch"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center w-full h-full px-4 gap-2"
            >
              <span className="text-sm">⏱️</span>
              <span className="text-xs text-white font-mono font-bold tracking-wider">
                {formatStopwatch(systemState.stopwatchElapsed)}
              </span>
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
              <div className="flex gap-0.5 items-end h-4">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [4, 12, 6, 14, 4][i - 1] }}
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
            </motion.div>
          )}

          {mode === 'download' && systemState.activeDownloads.length > 0 && (
            <motion.div
              key="download"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-4 w-full"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <span className="text-sm">⬇️</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[10px] font-semibold truncate">{systemState.activeDownloads[0].name}</p>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                  <motion.div
                    className="h-full bg-blue-400 rounded-full"
                    animate={{ width: `${systemState.activeDownloads[0].progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              <span className="text-[10px] text-white/50 font-mono">{systemState.activeDownloads[0].progress}%</span>
            </motion.div>
          )}

          {mode === 'airplay' && (
            <motion.div
              key="airplay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center w-full h-full px-4 gap-2"
            >
              <span className="text-sm">📺</span>
              <span className="text-[9px] text-white font-bold uppercase tracking-widest">AirPlay</span>
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

          {mode === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between w-full h-full px-4"
            >
              <div className="flex items-center gap-2">
                {showFocus && <span className="text-[11px]" title={`Focus: ${systemState.focusMode}`}>🎯</span>}
                {showDnd && <span className="text-[11px]" title="Do Not Disturb">🌙</span>}
                {showVpn && <span className="text-[11px]" title="VPN Connected">🛡️</span>}
                {showHotspot && <span className="text-[11px]" title="Personal Hotspot">📶</span>}
              </div>
              <div className="flex items-center gap-2">
                {showCharging && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-green-400">⚡</span>
                    <span className="text-[8px] text-green-400 font-bold">{Math.round(battery.level * 100)}%</span>
                  </div>
                )}
                {showLowBattery && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-yellow-400">⚠️</span>
                    <span className="text-[8px] text-yellow-400 font-bold">{Math.round(battery.level * 100)}%</span>
                  </div>
                )}
                {!hasAnyStatus && !showLowBattery && !showCharging && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#222]" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
