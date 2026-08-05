import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';
import { songs } from '../../utils/MusicData';
import { BatteryCharging01Icon, BatteryLowIcon, BatteryFullIcon } from 'hugeicons-react';

const IDLE_WIDTH = 126;
const IDLE_STATUS_WIDTH = 200;
const COMPACT_WIDTH = 160;
const EXPANDED_WIDTH = 340;
const PHONE_WIDTH = 260;
const COLLAPSED_HEIGHT = 30;
const COMPACT_HEIGHT = 36;
const EXPANDED_HEIGHT = 72;
const STACK_ITEM_HEIGHT = 72;

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
  | 'airplay'
  | 'update';

interface LiveActivity {
  mode: IslandMode;
  priority: number;
}

export const DynamicIsland: React.FC = () => {
  const { systemState, incomingCall, battery, updateSystemState, pauseSong, playSong, nextSong, prevSong, removeNotification } = useSystem();
  const [isExpanded, setIsExpanded] = useState(false);
  const notificationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentSong = songs[systemState.music.currentSongIndex];
  const [recordingTime, setRecordingTime] = useState(0);

  const hasMusic = systemState.music.isPlaying && currentSong;
  const showDnd = systemState.dndEnabled;
  const showVpn = systemState.vpnConnected;
  const showLowBattery = battery.level < 0.2 && !battery.isCharging;
  const showCharging = battery.isCharging;
  const showHotspot = systemState.hotspotActive;
  const showFocus = systemState.focusMode !== null;
  const hasAnyStatus = showDnd || showVpn || showLowBattery || showCharging || showHotspot || showFocus;

  const activeActivities = useMemo((): LiveActivity[] => {
    const activities: LiveActivity[] = [];
    if (incomingCall) activities.push({ mode: 'phone', priority: 1 });
    if (systemState.alarmRinging) activities.push({ mode: 'alarm', priority: 2 });
    if (systemState.timerRunning) activities.push({ mode: 'timer', priority: 3 });
    if (systemState.isUpdating) activities.push({ mode: 'update', priority: 4 });
    if (systemState.isRecording) activities.push({ mode: 'recording', priority: 5 });
    if (systemState.stopwatchRunning) activities.push({ mode: 'stopwatch', priority: 6 });
    if (systemState.isCameraOn) activities.push({ mode: 'camera', priority: 7 });
    if (hasMusic) activities.push({ mode: 'music', priority: 8 });
    if (systemState.activeDownloads.length > 0) activities.push({ mode: 'download', priority: 9 });
    if (systemState.isAirPlaying) activities.push({ mode: 'airplay', priority: 10 });
    if (systemState.notifications.length > 0) activities.push({ mode: 'notification', priority: 11 });
    return activities.sort((a, b) => a.priority - b.priority);
  }, [incomingCall, systemState.alarmRinging, systemState.timerRunning, systemState.isUpdating, systemState.isRecording,
      systemState.stopwatchRunning, systemState.isCameraOn, hasMusic, systemState.activeDownloads,
      systemState.isAirPlaying, systemState.notifications.length]);

  const primaryMode = activeActivities.length > 0 ? activeActivities[0].mode : 'idle';
  const activityCount = activeActivities.length;
  const showStackIndicator = activityCount > 1 && !isExpanded;

  useEffect(() => {
    if (isExpanded && activityCount === 0) {
      setIsExpanded(false);
    }
  }, [isExpanded, activityCount]);

  // Auto-dismiss notification mode
  useEffect(() => {
    if (primaryMode === 'notification' && !isExpanded && systemState.notifications.length > 0) {
      if (notificationTimer.current) clearTimeout(notificationTimer.current);
      const lastId = systemState.notifications[systemState.notifications.length - 1].id;
      notificationTimer.current = setTimeout(() => {
        removeNotification(lastId);
        setIsExpanded(false);
      }, 2000);
      return;
    }
    if (primaryMode !== 'notification' && notificationTimer.current) {
      clearTimeout(notificationTimer.current);
      notificationTimer.current = null;
    }
  }, [primaryMode, isExpanded, systemState.notifications.length]);

  useEffect(() => {
    return () => {
      if (notificationTimer.current) clearTimeout(notificationTimer.current);
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  // Recording timer
  useEffect(() => {
    if (systemState.isRecording) {
      const start = Date.now();
      const iv = setInterval(() => setRecordingTime(Date.now() - start), 1000);
      return () => clearInterval(iv);
    }
    setRecordingTime(0);
  }, [systemState.isRecording]);

  const handleTap = useCallback(() => {
    if (primaryMode !== 'idle') {
      setIsExpanded((prev) => !prev);
    }
  }, [primaryMode]);

  const handleMouseDown = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      if (primaryMode !== 'idle') {
        setIsExpanded(true);
      }
    }, 400);
  }, [primaryMode]);

  const handleMouseUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const latestNotification = systemState.notifications[systemState.notifications.length - 1];

  const getWidth = () => {
    if (isExpanded) return EXPANDED_WIDTH;
    switch (primaryMode) {
      case 'phone': return PHONE_WIDTH;
      case 'alarm':
      case 'timer':
      case 'download':
      case 'music':
      case 'notification': return showStackIndicator ? EXPANDED_WIDTH - 20 : EXPANDED_WIDTH - 50;
      case 'stopwatch':
      case 'recording':
      case 'airplay':
      case 'camera': return COMPACT_WIDTH;
      case 'update': return EXPANDED_WIDTH - 50;
      case 'idle': return hasAnyStatus ? IDLE_STATUS_WIDTH : IDLE_WIDTH;
      default: return IDLE_WIDTH;
    }
  };

  const getHeight = () => {
    if (isExpanded) {
      if (activityCount <= 1) return EXPANDED_HEIGHT;
      return Math.min(EXPANDED_HEIGHT + (activityCount - 1) * STACK_ITEM_HEIGHT + 16, 400);
    }
    switch (primaryMode) {
      case 'phone': return 72;
      case 'alarm': return 72;
      case 'timer': return 60;
      case 'music': return 60;
      case 'notification': return 56;
      case 'download': return 54;
      case 'update': return 60;
      case 'stopwatch':
      case 'recording':
      case 'airplay':
      case 'camera': return COMPACT_HEIGHT;
      default: return COLLAPSED_HEIGHT;
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

  const formatRecordingDuration = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const renderCompactActivity = (mode: IslandMode) => {
    switch (mode) {
      case 'phone':
        return incomingCall ? (
          <div className="flex items-center gap-3 px-4 w-full h-full">
            <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
              <span className="text-lg">{incomingCall.contact.avatar || '📞'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{incomingCall.contact.name}</p>
              <p className="text-green-400 text-[9px] font-bold uppercase tracking-widest">
                {incomingCall.type === 'facetime' ? 'FaceTime...' : 'Incoming Call...'}
              </p>
            </div>
            <motion.div
              className="w-2 h-2 rounded-full bg-green-500 shrink-0"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          </div>
        ) : null;

      case 'alarm':
        return (
          <div className="flex items-center gap-3 px-4 w-full h-full">
            <motion.div
              animate={{ rotate: [-12, 12, -8, 8, -12] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
              className="w-9 h-9 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0"
            >
              <span className="text-lg">🔔</span>
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold">{systemState.alarmLabel || 'Alarm'}</p>
              <p className="text-orange-400 text-[9px] font-bold uppercase tracking-widest">RINGING</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); updateSystemState({ alarmRinging: false }); }}
              className="px-3 py-1 bg-white/15 hover:bg-white/25 rounded-full text-[10px] font-bold text-white transition-colors shrink-0"
            >
              Stop
            </button>
          </div>
        );

      case 'timer':
        return (
          <div className="flex items-center gap-3 px-4 w-full h-full">
            <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <span className="text-base">⏱️</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/50 text-[10px] font-medium">{systemState.timerLabel || 'Timer'}</p>
              <p className="text-white text-lg font-bold font-mono tracking-wider">{formatTimer(systemState.timerRemaining)}</p>
            </div>
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        );

      case 'recording':
        return (
          <div className="flex items-center justify-center w-full h-full px-4 gap-2">
            <motion.div
              className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] shrink-0"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest">Recording</span>
          </div>
        );

      case 'stopwatch':
        return (
          <div className="flex items-center justify-center w-full h-full px-4 gap-2">
            <span className="text-sm">⏱️</span>
            <span className="text-xs text-white font-mono font-bold tracking-wider">
              {formatStopwatch(systemState.stopwatchElapsed)}
            </span>
          </div>
        );

      case 'camera':
        return (
          <div className="flex items-center justify-center w-full h-full px-4 gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] shrink-0" />
            <span className="text-[9px] text-green-400 font-bold uppercase tracking-widest">Camera</span>
          </div>
        );

      case 'music':
        return currentSong ? (
          <div className="flex items-center gap-3 px-4 w-full h-full">
            <img src={currentSong.cover} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 shadow-lg" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{currentSong.title}</p>
              <p className="text-white/50 text-[10px] truncate">{currentSong.artist}</p>
            </div>
            <div className="flex gap-0.5 items-end h-4 shrink-0">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  animate={{ height: [4, 12, 6, 14, 4][i - 1] }}
                  transition={{ duration: 0.5 + i * 0.1, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                  className="w-[2px] bg-white/80 rounded-full"
                />
              ))}
            </div>
          </div>
        ) : null;

      case 'download':
        return systemState.activeDownloads.length > 0 ? (
          <div className="flex items-center gap-3 px-4 w-full h-full">
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
            <span className="text-[10px] text-white/50 font-mono shrink-0">{systemState.activeDownloads[0].progress}%</span>
          </div>
        ) : null;

      case 'airplay':
        return (
          <div className="flex items-center justify-center w-full h-full px-4 gap-2">
            <span className="text-sm">📺</span>
            <span className="text-[9px] text-white font-bold uppercase tracking-widest">AirPlay</span>
          </div>
        );

      case 'update':
        return (
          <div className="flex items-center gap-3 px-4 w-full h-full">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              className="w-7 h-7 shrink-0"
            >
              <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
                <circle cx="14" cy="14" r="11" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" />
                <motion.path
                  d="M14 3A11 11 0 0 1 25 14"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="52"
                  strokeDashoffset="0"
                  animate={{ strokeDashoffset: [0, -104] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
                <circle cx="14" cy="3" r="2" fill="white" />
              </svg>
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[10px] font-semibold truncate">
                {systemState.updateProgress < 100
                  ? `macOS Golden Gate ${systemState.updateVersion}`
                  : 'Installing update…'}
              </p>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                <motion.div
                  className="h-full bg-white rounded-full"
                  animate={{ width: `${systemState.updateProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            <span className="text-[10px] text-white/50 font-mono shrink-0">{systemState.updateProgress}%</span>
          </div>
        );

      case 'notification':
        return latestNotification ? (
          <div className="flex items-center gap-3 px-4 w-full h-full">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <span className="text-lg">{latestNotification.icon || '🔔'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[11px] font-semibold truncate">{latestNotification.title}</p>
              <p className="text-white/50 text-[9px] truncate">{latestNotification.message}</p>
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  const renderDetailActivity = (mode: IslandMode) => {
    switch (mode) {
      case 'phone':
        return incomingCall ? (
          <div className="flex items-center gap-3 flex-1 w-full">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
              <span className="text-2xl">{incomingCall.contact.avatar || '📞'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">{incomingCall.contact.name}</p>
              <p className="text-green-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Incoming Call...</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-full text-xs font-bold transition-colors">
                Accept
              </button>
              <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full text-xs font-bold transition-colors">
                Decline
              </button>
            </div>
          </div>
        ) : null;

      case 'alarm':
        return (
          <div className="flex items-center gap-3 flex-1 w-full">
            <motion.div
              animate={{ rotate: [-12, 12, -8, 8, -12] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
              className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0"
            >
              <span className="text-2xl">🔔</span>
            </motion.div>
            <div className="flex-1">
              <p className="text-white text-xl font-bold">{systemState.alarmLabel || 'Alarm'}</p>
              <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mt-0.5">RINGING</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); updateSystemState({ alarmRinging: false }); }}
                className="px-5 py-2.5 bg-white/15 hover:bg-white/25 rounded-full text-xs font-bold text-white transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        );

      case 'timer':
        return (
          <div className="flex items-center gap-3 flex-1 w-full">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <span className="text-2xl">⏱️</span>
            </div>
            <div className="flex-1">
              <p className="text-white/50 text-[10px] font-medium">{systemState.timerLabel || 'Timer'}</p>
              <p className="text-white text-3xl font-bold font-mono tracking-wider">
                {formatTimer(systemState.timerRemaining)}
              </p>
            </div>
            <div className="w-1.5 h-10 bg-white/10 rounded-full overflow-hidden shrink-0">
              <motion.div
                className="w-full bg-blue-400 rounded-full"
                animate={{ height: `${(1 - systemState.timerRemaining / Math.max(systemState.timerRemaining, 1)) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        );

      case 'stopwatch':
        return (
          <div className="flex items-center gap-3 flex-1 w-full">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
              <span className="text-2xl">⏱️</span>
            </div>
            <div className="flex-1">
              <p className="text-white text-3xl font-bold font-mono tracking-wider">
                {formatStopwatch(systemState.stopwatchElapsed)}
              </p>
              <p className="text-white/30 text-[10px] font-medium">Stopwatch</p>
            </div>
          </div>
        );

      case 'recording':
        return (
          <div className="flex items-center gap-3 flex-1 w-full">
            <motion.div
              className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <motion.div
                className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444]"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.div>
            <div className="flex-1">
              <p className="text-white text-lg font-bold">Screen Recording</p>
              <p className="text-red-400 text-xs font-mono font-bold mt-0.5">
                {formatRecordingDuration(recordingTime)}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); updateSystemState({ isRecording: false }); }}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full text-xs font-bold transition-colors shrink-0"
            >
              Stop
            </button>
          </div>
        );

      case 'camera':
        return (
          <div className="flex items-center gap-3 flex-1 w-full">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
              <motion.div
                className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_12px_#22c55e]"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            </div>
            <div className="flex-1">
              <p className="text-white text-lg font-bold">Camera Active</p>
              <p className="text-green-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">In Use</p>
            </div>
          </div>
        );

      case 'music':
        return currentSong ? (
          <div className="flex items-center gap-3 flex-1 w-full">
            <img src={currentSong.cover} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-lg" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">{currentSong.title}</p>
              <p className="text-white/50 text-[11px] truncate">{currentSong.artist}</p>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                <motion.div
                  className="h-full bg-white/80 rounded-full"
                  animate={{ width: `${systemState.music.playbackProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); prevSong(); }}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M7 1L3 5L7 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  systemState.music.isPlaying ? pauseSong() : playSong();
                }}
                className="w-8 h-8 rounded-full bg-white hover:bg-white/80 flex items-center justify-center transition-colors"
              >
                {systemState.music.isPlaying ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="black">
                    <rect x="1" y="1" width="2.5" height="8" rx="0.5" />
                    <rect x="6.5" y="1" width="2.5" height="8" rx="0.5" />
                  </svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="black">
                    <polygon points="2,1 9,5 2,9" />
                  </svg>
                )}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextSong(); }}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M3 1L7 5L3 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        ) : null;

      case 'download':
        return systemState.activeDownloads.length > 0 ? (
          <div className="flex items-center gap-3 flex-1 w-full">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <span className="text-xl">⬇️</span>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-bold truncate">{systemState.activeDownloads[0].name}</p>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-2">
                <motion.div
                  className="h-full bg-blue-400 rounded-full"
                  animate={{ width: `${systemState.activeDownloads[0].progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-blue-300 text-[10px] font-mono font-bold mt-1">
                {systemState.activeDownloads[0].progress}% complete
              </p>
            </div>
          </div>
        ) : null;

      case 'airplay':
        return (
          <div className="flex items-center gap-3 flex-1 w-full">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <span className="text-xl">📺</span>
            </div>
            <div className="flex-1">
              <p className="text-white text-lg font-bold">AirPlay</p>
              <p className="text-blue-300 text-xs font-medium mt-0.5">Connected to Apple TV</p>
            </div>
          </div>
        );

      case 'update':
        return (
          <div className="flex items-center gap-4 flex-1 w-full">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 shrink-0"
            >
              <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
                <circle cx="20" cy="20" r="16" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
                <motion.path
                  d="M20 4A16 16 0 0 1 36 20"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="76"
                  animate={{ strokeDashoffset: [0, -152] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
                <circle cx="20" cy="4" r="2.5" fill="white" />
              </svg>
            </motion.div>
            <div className="flex-1">
              <p className="text-white text-sm font-bold">
                {systemState.updateProgress < 100
                  ? `macOS Golden Gate ${systemState.updateVersion}`
                  : 'Installing update…'}
              </p>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-2">
                <motion.div
                  className="h-full bg-white rounded-full"
                  animate={{ width: `${systemState.updateProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-white/40 text-[10px] font-medium mt-1">
                {systemState.updateProgress}% complete
              </p>
            </div>
          </div>
        );

      case 'notification':
        return latestNotification ? (
          <div className="flex items-center gap-3 flex-1 w-full">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <span className="text-xl">{latestNotification.icon || '🔔'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">{latestNotification.title}</p>
              <p className="text-white/60 text-xs mt-0.5 line-clamp-2">{latestNotification.message}</p>
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <motion.div
      data-testid="dynamic-island"
      layout
      transition={{ type: 'spring', damping: 25, stiffness: 250, mass: 0.8 }}
      className="fixed top-2 left-1/2 -translate-x-1/2 z-50 cursor-pointer"
      onClick={handleTap}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <motion.div
        layout
        animate={{ width: getWidth(), height: getHeight() }}
        transition={{ type: 'spring', damping: 25, stiffness: 250, mass: 0.8 }}
        className="bg-black shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-white/10 flex flex-col overflow-hidden"
        style={{ borderRadius: isExpanded ? 28 : 9999 }}
      >
        <AnimatePresence mode="wait">
          {!isExpanded && primaryMode !== 'idle' && (
            <motion.div
              key={`compact-${primaryMode}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center w-full h-full"
            >
              {renderCompactActivity(primaryMode)}
              {showStackIndicator && (
                <div className="flex gap-0.5 pr-3 shrink-0">
                  {Array.from({ length: Math.min(activityCount - 1, 3) }).map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-white/30" />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {!isExpanded && primaryMode === 'idle' && (
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
                    <BatteryCharging01Icon size={11} className="text-green-400" />
                    <span className="text-[8px] text-green-400 font-bold">{Math.round(battery.level * 100)}%</span>
                  </div>
                )}
                {showLowBattery && (
                  <div className="flex items-center gap-1">
                    <BatteryLowIcon size={11} className="text-red-400" />
                    <span className="text-[8px] text-red-400 font-bold">{Math.round(battery.level * 100)}%</span>
                  </div>
                )}
                {!showCharging && !showLowBattery && (
                  <div className="flex items-center gap-1.5">
                    <BatteryFullIcon size={11} className="text-white/60" />
                    <span className="text-[8px] text-white/50 font-bold">{Math.round(battery.level * 100)}%</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {isExpanded && (
            <motion.div
              key="expanded-stack"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col w-full h-full p-4 pt-3 gap-3 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-1 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Live Activities</span>
                  {activityCount > 1 && (
                    <span className="text-[9px] text-white/30 font-mono">{activityCount} active</span>
                  )}
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 1L7 7M7 1L1 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-2 flex-1">
                {activeActivities.map((activity, idx) => (
                  <motion.div
                    key={activity.mode}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center min-h-[64px] bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl px-3 py-2 transition-colors"
                  >
                    {renderDetailActivity(activity.mode)}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
