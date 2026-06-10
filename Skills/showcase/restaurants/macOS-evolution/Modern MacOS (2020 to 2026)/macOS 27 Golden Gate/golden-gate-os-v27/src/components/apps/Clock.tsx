import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Globe, Timer, Clock as ClockIcon, Plus, Play, Pause, Square, RotateCcw, Music, Trash2, Check, Sun, Moon, Sunrise, Sunset } from 'lucide-react';

const base = (import.meta as any).env?.BASE_URL || '/';

const RINGTONES = [
  { name: 'FaceTime', file: `${base}sounds/opening.mp3` },
  { name: 'Halla Bol', file: 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0.6/halla.bol.mp3' },
  { name: 'Luz Roja', file: 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0.8/LUZ.ROJA.-.Sped.Up.-.bxkq.mp3' },
  { name: 'Reflection', file: `${base}sounds/reflection.mp3` },
];

interface AlarmItem {
  id: string;
  hour: number;
  minute: number;
  ampm: 'AM' | 'PM';
  ringtone: string;
  enabled: boolean;
}

interface WorldCity {
  id: string;
  name: string;
  timezone: string;
}

interface TimerItem {
  id: string;
  label: string;
  hours: number;
  minutes: number;
  seconds: number;
  remaining: number;
  ringtone: string;
  isRunning: boolean;
  isPaused: boolean;
  completed: boolean;
}

const DEFAULT_CITIES: WorldCity[] = [
  { id: 'mumbai', name: 'Mumbai', timezone: 'Asia/Kolkata' },
];

const TIMEZONE_ALIASES: Record<string, string> = {
  'America/New_York': 'New York',
  'America/Chicago': 'Chicago',
  'America/Denver': 'Denver',
  'America/Los_Angeles': 'Los Angeles',
  'Europe/London': 'London',
  'Europe/Paris': 'Paris',
  'Europe/Berlin': 'Berlin',
  'Asia/Tokyo': 'Tokyo',
  'Asia/Shanghai': 'Shanghai',
  'Asia/Dubai': 'Dubai',
  'Asia/Singapore': 'Singapore',
  'Asia/Hong_Kong': 'Hong Kong',
  'Asia/Seoul': 'Seoul',
  'Australia/Sydney': 'Sydney',
  'Pacific/Auckland': 'Auckland',
};

const COMMON_TIMEZONES = Object.keys(TIMEZONE_ALIASES).sort();

const playRingtone = (file: string) => {
  const audio = new Audio(file);
  audio.loop = true;
  audio.play().catch(() => {});
  return audio;
};

function useAlarms() {
  const [alarms, setAlarms] = useState<AlarmItem[]>(() => {
    try {
      const saved = localStorage.getItem('golden_gate_v27_alarms');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const save = useCallback((a: AlarmItem[]) => {
    setAlarms(a);
    localStorage.setItem('golden_gate_v27_alarms', JSON.stringify(a));
  }, []);

  return { alarms, save };
}

function useCities() {
  const [cities, setCities] = useState<WorldCity[]>(() => {
    try {
      const saved = localStorage.getItem('golden_gate_v27_worldcities');
      return saved ? JSON.parse(saved) : DEFAULT_CITIES;
    } catch { return DEFAULT_CITIES; }
  });

  const save = useCallback((c: WorldCity[]) => {
    setCities(c);
    localStorage.setItem('golden_gate_v27_worldcities', JSON.stringify(c));
  }, []);

  return { cities, save };
}

function formatTime(h: number, m: number, ampm: 'AM' | 'PM') {
  const hour = ampm === 'AM' ? (h === 0 ? 12 : h > 12 ? h - 12 : h) : (h === 0 ? 12 : h > 12 ? h - 12 : h);
  return `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function getCityTime(tz: string) {
  try {
    const now = new Date();
    const t = now.toLocaleString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const tzOffset = (() => {
      try {
        const est = now.toLocaleString('en-US', { timeZone: tz, timeZoneName: 'shortOffset' });
        const match = est.match(/([+-]\d+)/);
        return match ? match[1] : '';
      } catch { return ''; }
    })();
    return { time: t, offset: tzOffset };
  } catch {
    return { time: '--:--:--', offset: '' };
  }
}

function getDayState() {
  const h = new Date().getHours();
  if (h < 6) return 'night';
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  if (h < 20) return 'evening';
  return 'night';
}

const DayIcon = ({ state }: { state: string }) => {
  switch (state) {
    case 'morning': return <Sunrise size={14} className="text-amber-400" />;
    case 'afternoon': return <Sun size={14} className="text-yellow-400" />;
    case 'evening': return <Sunset size={14} className="text-orange-400" />;
    default: return <Moon size={14} className="text-blue-300" />;
  }
};

const TabButton = ({ active, label, icon: Icon, onClick }: { active: boolean; label: string; icon: any; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
      active ? 'bg-blue-500/20 text-blue-400 shadow-sm' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
    }`}
  >
    <Icon size={16} />
    {label}
  </button>
);

function TimeWheel({ value, onChange, range, label }: { value: number; onChange: (v: number) => void; range: number[]; label: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ITEM_HEIGHT = 44;

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(range.length - 1, idx));
    if (range[clamped] !== value) {
      onChange(range[clamped]);
    }
  }, [range, value, onChange]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const targetScroll = range.indexOf(value) * ITEM_HEIGHT;
    if (Math.abs(el.scrollTop - targetScroll) > 4) {
      el.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  }, [value, range]);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{label}</span>
      <div className="relative h-[220px] w-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-10 rounded-xl" style={{
          background: 'linear-gradient(to bottom, rgb(24 24 27) 0%, transparent 30%, transparent 70%, rgb(24 24 27) 100%)'
        }} />
        <div className="absolute top-1/2 left-2 right-2 h-11 -translate-y-1/2 rounded-lg bg-blue-500/10 border border-blue-500/20 pointer-events-none z-20" />
        <div
          ref={containerRef}
          className="h-full overflow-y-auto scrollbar-hide [scroll-snap-type:y_mandatory] py-[88px]"
        >
          {range.map((v) => (
            <div
              key={v}
              className="h-11 flex items-center justify-center scroll-snap-align-center text-sm font-bold transition-colors"
              style={{ color: v === value ? '#60a5fa' : 'rgba(255,255,255,0.4)' }}
            >
              {v.toString().padStart(2, '0')}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RingtonePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<HTMLAudioElement | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = RINGTONES.find(r => r.name === value) || RINGTONES[0];

  const handleSelect = (name: string) => {
    onChange(name);
    setOpen(false);
  };

  const handlePreview = (e: React.MouseEvent, file: string) => {
    e.stopPropagation();
    if (preview) { preview.pause(); preview.currentTime = 0; setPreview(null); return; }
    const audio = new Audio(file);
    audio.play().catch(() => {});
    audio.onended = () => setPreview(null);
    setPreview(audio);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-white/70 transition-all w-full justify-between"
      >
        <div className="flex items-center gap-2">
          <Music size={12} />
          {selected.name}
        </div>
        <span className="text-white/30">{open ? '▲' : '▼'}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute bottom-full left-0 right-0 mb-1 bg-zinc-800 border border-white/10 rounded-xl overflow-hidden shadow-xl z-50"
          >
            {RINGTONES.map((r) => (
              <button
                key={r.name}
                onClick={() => handleSelect(r.name)}
                className={`flex items-center gap-2 px-3 py-2 w-full text-xs font-bold hover:bg-white/5 transition-all ${
                  value === r.name ? 'text-blue-400 bg-blue-500/10' : 'text-white/70'
                }`}
              >
                <Music size={12} />
                <span className="flex-1 text-left">{r.name}</span>
                {value === r.name && <Check size={12} />}
                <button
                  onClick={(e) => handlePreview(e, r.file)}
                  className="text-white/30 hover:text-white/60"
                >
                  ▶
                </button>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AlarmTab() {
  const { alarms, save } = useAlarms();
  const [showAdd, setShowAdd] = useState(false);
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');
  const [ringtone, setRingtone] = useState(RINGTONES[0].name);
  const [ringing, setRinging] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const check = setInterval(() => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      alarms.forEach(a => {
        if (!a.enabled) return;
        const alarmH = a.ampm === 'PM' ? (a.hour === 12 ? 12 : a.hour + 12) : (a.hour === 12 ? 0 : a.hour);
        if (alarmH === h && a.minute === m && now.getSeconds() === 0 && ringing !== a.id) {
          setRinging(a.id);
          const rt = RINGTONES.find(r => r.name === a.ringtone) || RINGTONES[0];
          if (audioRef.current) audioRef.current.pause();
          audioRef.current = playRingtone(rt.file);
        }
      });
    }, 1000);
    return () => clearInterval(check);
  }, [alarms, ringing]);

  const dismissAlarm = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; audioRef.current = null; }
    setRinging(null);
  };

  const addAlarm = () => {
    const newAlarm: AlarmItem = {
      id: Date.now().toString(),
      hour,
      minute,
      ampm,
      ringtone,
      enabled: true,
    };
    save([...alarms, newAlarm]);
    setShowAdd(false);
  };

  const toggleAlarm = (id: string) => {
    save(alarms.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const deleteAlarm = (id: string) => {
    save(alarms.filter(a => a.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {ringing && (
        <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-xl z-50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900/90 border border-white/10 rounded-2xl p-8 text-center max-w-xs"
          >
            <Bell size={48} className="mx-auto mb-4 text-blue-400" />
            <h2 className="text-xl font-bold mb-2">Alarm</h2>
            <p className="text-3xl font-bold text-blue-400 mb-6">
              {alarms.find(a => a.id === ringing) ? formatTime(
                alarms.find(a => a.id === ringing)!.hour,
                alarms.find(a => a.id === ringing)!.minute,
                alarms.find(a => a.id === ringing)!.ampm
              ) : ''}
            </p>
            <button
              onClick={dismissAlarm}
              className="px-8 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors"
            >
              Dismiss
            </button>
          </motion.div>
        </div>
      )}

      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <h2 className="text-sm font-bold text-white/60">Alarms</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500/30 transition-all"
        >
          <Plus size={16} />
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/5"
          >
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-center gap-4">
                <TimeWheel value={hour} onChange={setHour} range={Array.from({ length: 12 }, (_, i) => i + 1)} label="Hour" />
                <TimeWheel value={minute} onChange={setMinute} range={Array.from({ length: 60 }, (_, i) => i)} label="Min" />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setAmpm('AM')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${ampm === 'AM' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/40'}`}
                  >
                    AM
                  </button>
                  <button
                    onClick={() => setAmpm('PM')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${ampm === 'PM' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/40'}`}
                  >
                    PM
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40 font-bold">Ringtone</span>
                <div className="w-40">
                  <RingtonePicker value={ringtone} onChange={setRingtone} />
                </div>
              </div>
              <button
                onClick={addAlarm}
                className="w-full py-2.5 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors text-sm"
              >
                Add Alarm
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
        {alarms.length === 0 && (
          <div className="text-center text-white/20 text-sm py-12">
            <Bell size={32} className="mx-auto mb-2 opacity-40" />
            <p>No alarms set</p>
            <p className="text-xs mt-1">Tap + to add an alarm</p>
          </div>
        )}
        {alarms.map(a => (
          <motion.div
            key={a.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/[0.07] transition-all"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <p className={`text-xl font-bold ${a.enabled ? 'text-white' : 'text-white/30'}`}>
                  {formatTime(a.hour, a.minute, a.ampm)}
                </p>
                <span className="text-[10px] text-white/30 font-bold uppercase">{a.ringtone}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleAlarm(a.id)}
                className={`w-10 h-6 rounded-full transition-all ${a.enabled ? 'bg-blue-500' : 'bg-white/20'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-all ${a.enabled ? 'ml-5' : 'ml-1'}`} />
              </button>
              <button onClick={() => deleteAlarm(a.id)} className="text-white/20 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function WorldClockTab() {
  const { cities, save } = useCities();
  const [, setTick] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const filtered = COMMON_TIMEZONES.filter(tz =>
    !cities.find(c => c.timezone === tz) &&
    (TIMEZONE_ALIASES[tz].toLowerCase().includes(search.toLowerCase()) || tz.toLowerCase().includes(search.toLowerCase()))
  );

  const addCity = (tz: string) => {
    save([...cities, { id: Date.now().toString(), name: TIMEZONE_ALIASES[tz], timezone: tz }]);
  };

  const removeCity = (id: string) => {
    save(cities.filter(c => c.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <h2 className="text-sm font-bold text-white/60">World Clock</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500/30 transition-all"
        >
          <Plus size={16} />
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/5"
          >
            <div className="p-4 space-y-2">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search cities..."
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40"
                autoFocus
              />
              <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1">
                {filtered.map(tz => (
                  <button
                    key={tz}
                    onClick={() => { addCity(tz); setSearch(''); setShowAdd(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-white/70 font-bold transition-all"
                  >
                    <Globe size={14} />
                    {TIMEZONE_ALIASES[tz]}
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="text-xs text-white/20 text-center py-4">No more cities to add</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
        {cities.map(c => {
          const ct = getCityTime(c.timezone);
          const ds = getDayState();
          return (
            <div key={c.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <DayIcon state={ds} />
                <div>
                  <p className="text-sm font-bold">{c.name}</p>
                  <p className="text-[10px] text-white/30 font-medium">GMT{ct.offset}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-lg font-bold text-blue-400 font-mono">{ct.time}</p>
                {c.id !== 'mumbai' && (
                  <button onClick={() => removeCity(c.id)} className="text-white/20 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StopwatchTab() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    if (running) {
      startTimeRef.current = Date.now() - time;
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 10);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const format = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    const cent = Math.floor((ms % 1000) / 10);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${cent.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setRunning(true);
  const handleLap = () => {
    if (running) setLaps(prev => [time, ...prev]);
  };
  const handleStop = () => setRunning(false);
  const handleReset = () => {
    setRunning(false);
    setTime(0);
    setLaps([]);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <p className="text-6xl font-bold font-mono text-white mb-8 tracking-wider">{format(time)}</p>
      <div className="flex gap-4">
        {!running ? (
          <>
            {time > 0 ? (
              <>
                <button onClick={handleReset} className="w-16 h-16 rounded-full bg-white/10 text-white/60 flex items-center justify-center hover:bg-white/20 transition-all">
                  <RotateCcw size={20} />
                </button>
                <button onClick={handleStart} className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center hover:bg-green-500/30 transition-all">
                  <Play size={20} />
                </button>
              </>
            ) : (
              <button onClick={handleStart} className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center hover:bg-green-500/30 transition-all">
                <Play size={20} />
              </button>
            )}
          </>
        ) : (
          <>
            <button onClick={handleLap} className="w-16 h-16 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all text-xs font-bold">
              Lap
            </button>
            <button onClick={handleStop} className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-all">
              <Square size={20} />
            </button>
          </>
        )}
      </div>
      {laps.length > 0 && (
        <div className="mt-8 w-full max-w-xs space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
          {laps.map((l, i) => (
            <div key={i} className="flex justify-between px-4 py-1.5 text-sm">
              <span className="text-white/40 font-medium">Lap {laps.length - i}</span>
              <span className="text-white font-mono font-bold">{format(l)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TimerTab() {
  const [timers, setTimers] = useState<TimerItem[]>(() => {
    try {
      const saved = localStorage.getItem('golden_gate_v27_timers');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [showAdd, setShowAdd] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const [label, setLabel] = useState('');
  const [rt, setRt] = useState(RINGTONES[0].name);
  const [completed, setCompleted] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const saveTimers = useCallback((t: TimerItem[]) => {
    setTimers(t);
    localStorage.setItem('golden_gate_v27_timers', JSON.stringify(t));
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      setTimers(prev => {
        let changed = false;
        const next = prev.map(t => {
          if (!t.isRunning || t.completed) return t;
          const newRemaining = t.remaining - 1;
          if (newRemaining <= 0) {
            changed = true;
            const rt2 = RINGTONES.find(r => r.name === t.ringtone) || RINGTONES[0];
            if (audioRef.current) audioRef.current.pause();
            audioRef.current = playRingtone(rt2.file);
            setCompleted(t.id);
            return { ...t, remaining: 0, completed: true, isRunning: false, isPaused: false };
          }
          changed = true;
          return { ...t, remaining: newRemaining };
        });
        if (changed) {
          localStorage.setItem('golden_gate_v27_timers', JSON.stringify(next));
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const dismissCompleted = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; audioRef.current = null; }
    setCompleted(null);
  };

  const addTimer = () => {
    const total = hours * 3600 + minutes * 60 + seconds;
    if (total <= 0) return;
    const t: TimerItem = {
      id: Date.now().toString(),
      label: label || `${hours}h ${minutes}m ${seconds}s`,
      hours, minutes, seconds,
      remaining: total,
      ringtone: rt,
      isRunning: false,
      isPaused: false,
      completed: false,
    };
    saveTimers([...timers, t]);
    setShowAdd(false);
    setHours(0); setMinutes(1); setSeconds(0); setLabel(''); setRt(RINGTONES[0].name);
  };

  const toggleTimer = (id: string) => {
    saveTimers(timers.map(t => {
      if (t.id !== id || t.completed) return t;
      if (t.isRunning) return { ...t, isRunning: false, isPaused: true };
      return { ...t, isRunning: true, isPaused: false };
    }));
  };

  const resetTimer = (id: string) => {
    saveTimers(timers.map(t => {
      if (t.id !== id) return t;
      return { ...t, remaining: t.hours * 3600 + t.minutes * 60 + t.seconds, isRunning: false, isPaused: false, completed: false };
    }));
  };

  const deleteTimer = (id: string) => {
    saveTimers(timers.filter(t => t.id !== id));
  };

  const changeRingtone = (id: string, ringtone: string) => {
    saveTimers(timers.map(t => t.id === id ? { ...t, ringtone } : t));
  };

  const fmt = (s: number) => {
    if (s <= 0) return '00:00:00';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const pct = (t: TimerItem) => {
    const total = t.hours * 3600 + t.minutes * 60 + t.seconds;
    if (total <= 0) return 0;
    return ((total - t.remaining) / total) * 100;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {completed && (
        <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-xl z-50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900/90 border border-white/10 rounded-2xl p-8 text-center max-w-xs"
          >
            <Bell size={48} className="mx-auto mb-4 text-blue-400" />
            <h2 className="text-xl font-bold mb-2">Timer Done</h2>
            <p className="text-white/60 mb-6">{timers.find(t => t.id === completed)?.label}</p>
            <button
              onClick={dismissCompleted}
              className="px-8 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors"
            >
              Dismiss
            </button>
          </motion.div>
        </div>
      )}

      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <h2 className="text-sm font-bold text-white/60">Timers</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500/30 transition-all"
        >
          <Plus size={16} />
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/5"
          >
            <div className="p-4 space-y-4">
              <input
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="Timer label (optional)"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40"
              />
              <div className="flex items-center justify-center gap-2">
                <TimeWheel value={hours} onChange={setHours} range={Array.from({ length: 24 }, (_, i) => i)} label="Hr" />
                <TimeWheel value={minutes} onChange={setMinutes} range={Array.from({ length: 60 }, (_, i) => i)} label="Min" />
                <TimeWheel value={seconds} onChange={setSeconds} range={Array.from({ length: 60 }, (_, i) => i)} label="Sec" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40 font-bold">Ringtone</span>
                <div className="w-40">
                  <RingtonePicker value={rt} onChange={setRt} />
                </div>
              </div>
              <button
                onClick={addTimer}
                className="w-full py-2.5 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors text-sm"
              >
                Add Timer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {timers.length === 0 && (
          <div className="text-center text-white/20 text-sm py-12">
            <Timer size={32} className="mx-auto mb-2 opacity-40" />
            <p>No timers</p>
            <p className="text-xs mt-1">Tap + to add a timer</p>
          </div>
        )}
        {timers.map(t => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden p-4 bg-white/5 rounded-xl"
          >
            <div
              className="absolute left-0 top-0 bottom-0 bg-blue-500/10 transition-all"
              style={{ width: `${pct(t)}%` }}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold">{t.label}</p>
                <div className="flex items-center gap-2">
                  <RingtonePicker value={t.ringtone} onChange={(v) => changeRingtone(t.id, v)} />
                  <button onClick={() => resetTimer(t.id)} className="text-white/20 hover:text-white/60 transition-colors">
                    <RotateCcw size={12} />
                  </button>
                  <button onClick={() => deleteTimer(t.id)} className="text-white/20 hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-2xl font-bold font-mono ${t.completed ? 'text-blue-400' : t.isRunning ? 'text-white' : 'text-white/60'}`}>
                  {t.completed ? 'Done!' : fmt(t.remaining)}
                </p>
                {!t.completed && (
                  <button
                    onClick={() => toggleTimer(t.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      t.isRunning ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    }`}
                  >
                    {t.isRunning ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export const Clock: React.FC = () => {
  const [tab, setTab] = useState<'alarm' | 'worldclock' | 'stopwatch' | 'timer'>('alarm');

  const tabs = [
    { id: 'alarm' as const, label: 'Alarm', icon: Bell },
    { id: 'worldclock' as const, label: 'World Clock', icon: Globe },
    { id: 'stopwatch' as const, label: 'Stopwatch', icon: ClockIcon },
    { id: 'timer' as const, label: 'Timer', icon: Timer },
  ];

  return (
    <div className="h-full w-full bg-zinc-900 text-white flex flex-col overflow-hidden relative">
      <div className="flex items-center gap-1 p-3 border-b border-white/10 overflow-x-auto scrollbar-hide">
        {tabs.map(t => (
          <TabButton
            key={t.id}
            active={tab === t.id}
            label={t.label}
            icon={t.icon}
            onClick={() => setTab(t.id)}
          />
        ))}
      </div>
      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex"
          >
            {tab === 'alarm' && <AlarmTab />}
            {tab === 'worldclock' && <WorldClockTab />}
            {tab === 'stopwatch' && <StopwatchTab />}
            {tab === 'timer' && <TimerTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
