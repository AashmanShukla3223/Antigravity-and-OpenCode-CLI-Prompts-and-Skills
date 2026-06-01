import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GH = 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0/';
const GH2 = 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0.1/';
const GH3 = 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0.2/';
const GH4 = 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0.3/';
const GH5 = 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0.4/';
// @ts-expect-error TS6133
const GH6 = 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0.5/';
// @ts-expect-error TS6133
const GH7 = 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0.6/';
const GH8 = 'https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.0.7/';
const LIVE = 'https://feeds.intoday.in/aajtak/api/aajtakhd/master.m3u8';
const NDTV = 'https://ndtvindiaelemarchana.akamaized.net/hls/live/2003679/ndtvindia/master.m3u8';

const dishChannels = [
  { name: "Channel 121: AajTak", src: GH + "dishtv_source.mp4" },
  { name: "Channel 122: AajTak Saas Bahu aur Betiyaan", src: GH + "dishtv_source2.mp4" },
  { name: "Channel 123: AajTak: Special Report 8:30PM Edition", src: GH + "dishtv_source3.mp4" },
  { name: "Channel 124: AajTak: Aaj Subah 10AM Edition", src: GH + "dishtv_source4.mp4" },
  { name: "Channel 125: AajTak: 2020 e-Agenda Edition", src: GH + "dishtv_source5.mp4" },
  { name: "Channel 126: AajTak: Halla Bol 6:30PM Edition", src: GH + "dishtv_source6.mp4" },
  { name: "Channel 127: AajTak: Das Tak 10PM Edition", src: GH2 + "dishtv_source7.mp4" },
  { name: "Channel 128: AajTak: Halla Bol 6PM Edition", src: GH3 + "dishtv_source8.mp4" },
  { name: "Channel 129: AajTak: Delhi Exit Poll 2020", src: GH3 + "dishtv_source9.mp4" },
  { name: "Channel 130: AajTak: 2019 Special Report Edition", src: GH4 + "dishtv_source10.mp4" },
  { name: "Channel 131: AajTak: 2017 Ek aur Ek Gyarah Edition", src: GH4 + "dishtv_source11.mp4" },
  { name: "Channel 132: AajTak: 2019 Halla Bol Edition", src: GH5 + "dishtv_source12.mp4" },
  { name: "Channel 133: AajTak: Khabardar Edition", src: GH8 + "dishtv_source13.mp4" },
  { name: "Channel 134: AajTak Live", src: LIVE },
  { name: "Channel 135: NDTV India Live", src: NDTV }
];

const MP4_STREAMS = dishChannels.filter(c => c.src.endsWith('.mp4'));
const SOUNDTESTS_COUNT = 4;
const LIVESTREAMS_COUNT = dishChannels.filter(c => c.src.endsWith('.m3u8')).length;

interface OSDMessage {
  text: string;
  id: number;
}

type PowerState = 'off' | 'booting' | 'active';
type InputSource = 0 | 1 | 2 | 3 | 4;
// @ts-expect-error TS6196
type PlaybackMode = 'standby' | 'playing' | 'paused';

const SOURCE_NAMES: Record<InputSource, string> = {
  0: 'TV / RF',
  1: 'AV (Nintendo Wii)',
  2: 'HDMI 1 (Apple TV)',
  3: 'HDMI 2 (PlayStation 3)',
  4: 'HDMI 3 (DishTV)'
};

const SOURCE_ICONS: Record<InputSource, string> = {
  0: '📺',
  1: '🎮',
  2: '🍎',
  3: '🎯',
  4: '📡'
};

export const SamsungLCDApp: React.FC = () => {
  const [powerState, setPowerState] = useState<PowerState>('off');
  const [activeInput, setActiveInput] = useState<InputSource>(4);
  const [dishChannel, setDishChannel] = useState(4);
  const [dishPower, setDishPower] = useState(true);
  const [volume, setVolume] = useState(15);
  // @ts-expect-error TS6133
  const [dishVolume, setDishVolume] = useState(50);
  const [muted, setMuted] = useState(false);
  // @ts-expect-error TS6133
  const [menuOpen, setMenuOpen] = useState(false);
  const [sourceMenuOpen, setSourceMenuOpen] = useState(false);
  const [osdMessages, setOsdMessages] = useState<OSDMessage[]>([]);
  const [bezelLEDColor, setBezelLEDColor] = useState('red');
  const [bootVisible, setBootVisible] = useState(false);
  const osdCounterRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const osdTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const bootTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showOSD = useCallback((text: string) => {
    const id = ++osdCounterRef.current;
    setOsdMessages(prev => [...prev, { text, id }]);
    const timer = setTimeout(() => {
      setOsdMessages(prev => prev.filter(m => m.id !== id));
      osdTimersRef.current.delete(id);
    }, 2500);
    osdTimersRef.current.set(id, timer);
  }, []);

  useEffect(() => {
    return () => {
      osdTimersRef.current.forEach(t => clearTimeout(t));
      osdTimersRef.current.clear();
      if (bootTimerRef.current) clearTimeout(bootTimerRef.current);
    };
  }, []);

  const togglePower = useCallback(async () => {
    if (powerState === 'off') {
      setPowerState('booting');
      setBezelLEDColor('cyan');
      for (let i = 0; i < 5; i++) {
        await new Promise(r => setTimeout(r, 150));
        setBezelLEDColor(i % 2 === 0 ? 'off' : 'cyan');
      }
      setBootVisible(true);
      await new Promise(r => setTimeout(r, 4200));
      setBootVisible(false);
      setPowerState('active');
      setBezelLEDColor('off');
      showOSD('SYSTEM INITIALIZED — Samsung LCD TV v1.0.20');
    } else {
      setPowerState('off');
      setMenuOpen(false);
      setSourceMenuOpen(false);
      setBootVisible(false);
      setBezelLEDColor('red');
      showOSD('SYSTEM SHUTDOWN');
    }
  }, [powerState, showOSD]);

  const toggleSourceMenu = useCallback(() => {
    if (powerState !== 'active') return;
    setSourceMenuOpen(prev => !prev);
    setMenuOpen(false);
  }, [powerState]);

  const selectSource = useCallback((src: InputSource) => {
    setActiveInput(src);
    setSourceMenuOpen(false);
    showOSD(`INPUT: ${SOURCE_NAMES[src]} ${SOURCE_ICONS[src]}`);
  }, [showOSD]);

  const changeDishChannel = useCallback((dir: 'up' | 'down') => {
    if (!dishPower || activeInput !== 4) return;
    setDishChannel(prev => {
      const max = dishChannels.length;
      const next = dir === 'up' ? (prev + 1) % max : (prev - 1 + max) % max;
      if (videoRef.current) {
        const src = dishChannels[next].src;
        if (src.endsWith('.m3u8')) {
          videoRef.current.src = '';
        } else {
          videoRef.current.src = src;
          videoRef.current.play().catch(() => {});
        }
      }
      showOSD(`CH: ${dishChannels[next].name}`);
      return next;
    });
  }, [dishPower, activeInput, showOSD]);

  const adjustVolume = useCallback((delta: number) => {
    if (muted) setMuted(false);
    setVolume(prev => {
      const next = Math.max(0, Math.min(100, prev + delta));
      showOSD(`VOLUME: ${next}%`);
      return next;
    });
  }, [muted, showOSD]);

  const adjustDishVolume = useCallback((delta: number) => {
    setDishVolume(prev => {
      const next = Math.max(0, Math.min(100, prev + delta));
      showOSD(`DISH VOLUME: ${next}%`);
      return next;
    });
  }, [showOSD]);

  const toggleMute = useCallback(() => {
    setMuted(prev => !prev);
    showOSD(muted ? 'AUDIO: UNMUTED' : 'AUDIO: MUTED');
  }, [muted, showOSD]);

  const currentDishSrc = dishChannels[dishChannel].src;
  const isHLS = currentDishSrc.endsWith('.m3u8');

  const inputStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
      padding: '16px',
      background: 'radial-gradient(circle at center, #111a2e, #030712)',
      overflow: 'hidden',
      fontFamily: '"SF Pro Display", "Inter", system-ui, sans-serif',
      position: 'relative',
    }}>
      {/* Left: TV Cabinet */}
      <div style={{
        flex: 1,
        maxWidth: '720px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Crystal Rose Bezel Cabinet */}
        <div style={{
          width: '100%',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #2a0510, #4a0a1a 40%, #5c0f20 75%, #2a0510)',
          border: '4px solid #030712',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.95), inset 0 0 25px rgba(239,68,68,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Glossy shine */}
          <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 30,
            opacity: 0.4,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 50%, transparent 50.1%, rgba(0,0,0,0.08) 100%)',
          }} />

          {/* Screen Area */}
          <div style={{
            margin: '20px 24px',
            background: powerState === 'off' ? '#090909' : '#000',
            aspectRatio: '16/9',
            borderRadius: '4px',
            border: '1px solid #1a0a0a',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)',
          }}>
            {/* Scanlines */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.15) 50%)',
              backgroundSize: '100% 3px',
              pointerEvents: 'none',
              zIndex: 40,
              opacity: 0.2,
            }} />
            {/* Glass reflection */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom right, transparent, rgba(255,255,255,0.05), transparent)',
              pointerEvents: 'none',
              zIndex: 40,
            }} />

            {/* POWER OFF */}
            {powerState === 'off' && (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#090909', zIndex: 30,
              }} />
            )}

            {/* BOOTING SCREEN */}
            {bootVisible && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 30,
                background: '#000',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ fontSize: '10px', fontWeight: 300, letterSpacing: '6px', color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase' }}>SAMSUNG</div>
                <div style={{
                  marginTop: '16px', width: '60px', height: '2px', background: 'rgba(255,255,255,0.06)',
                  borderRadius: '1px', overflow: 'hidden',
                }}>
                  <div style={{
                    width: '30%', height: '100%', background: 'rgba(255,255,255,0.15)',
                    borderRadius: '1px', animation: 'none',
                  }} />
                </div>
              </div>
            )}

            {/* ACTIVE STATE - Input Sources */}
            {powerState === 'active' && (
              <>
                {/* TV / RF Input - No Signal */}
                {activeInput === 0 && (
                  <div style={{
                    ...inputStyle, zIndex: 10,
                    background: 'linear-gradient(to bottom, #0b1b36, #040914)',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      padding: '16px 24px',
                      background: 'rgba(17,29,51,0.9)',
                      border: '1px solid rgba(56,189,248,0.4)',
                      borderRadius: '12px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    }}>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: '#38bdf8', letterSpacing: '2px', textTransform: 'uppercase' }}>TV/RF</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>No Signal</div>
                      <div style={{ fontSize: '9px', color: '#94a3b8' }}>Check Signal Cable Connection</div>
                    </div>
                    <div style={{ position: 'absolute', bottom: '12px', left: '12px', fontSize: '9px', color: 'rgba(56,189,248,0.3)', fontFamily: 'monospace' }}>
                      HDMI 1 | 1920x1080 @ 60Hz
                    </div>
                  </div>
                )}

                {/* AV / Wii Input */}
                {activeInput === 1 && (
                  <div style={{
                    ...inputStyle, zIndex: 10,
                    background: '#e0e0e0',
                    backgroundImage: 'radial-gradient(#d4d4d4 15%, transparent 16%)',
                    backgroundSize: '16px 16px',
                    padding: '8px',
                  }}>
                    <div style={{
                      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', flex: 1, alignContent: 'start',
                    }}>
                      {['Disc Channel', 'Mii Channel', 'Wii Shop', 'Photo', 'Forecast', 'News', 'Message Board', 'Wii Settings'].map((name, i) => (
                        <div key={i} style={{
                          aspectRatio: '1', borderRadius: '8px',
                          background: 'linear-gradient(to bottom, #fff, #f0f0f0)',
                          border: '2px solid #b5b5b5',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          gap: '4px', fontSize: '9px', fontWeight: 700, color: '#444',
                          boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.1)',
                          cursor: 'pointer',
                        }}>
                          <div style={{ fontSize: '18px' }}>{['💿', '👤', '🛒', '📷', '🌤', '📰', '✉️', '⚙️'][i]}</div>
                          <span>{name}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '6px', fontSize: '9px',
                    }}>
                      <span style={{ fontWeight: 700, color: '#555' }}>Wii Menu</span>
                      <span style={{ color: '#888', fontFamily: 'monospace' }}>12:00 PM</span>
                    </div>
                  </div>
                )}

                {/* HDMI 1 / Apple TV Input */}
                {activeInput === 2 && (
                  <div style={{
                    ...inputStyle, zIndex: 10,
                    background: 'linear-gradient(135deg, #0d0d0d, #1a1a2e)',
                    padding: '12px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: '#555', letterSpacing: '1px' }}>tvOS 26</div>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff2d55', boxShadow: '0 0 10px #ff2d55' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', flex: 1, alignContent: 'start' }}>
                      {['Apple TV+', 'Music', 'Photos', 'App Store', 'Settings', 'Arcade'].map((app, i) => (
                        <div key={i} style={{
                          padding: '8px', borderRadius: '12px',
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                          fontSize: '9px', color: '#ccc', cursor: 'pointer',
                        }}>
                          <div style={{ fontSize: '16px' }}>{['📺', '🎵', '📷', '📦', '⚙️', '🎮'][i]}</div>
                          <span style={{ fontWeight: 500 }}>{app}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* HDMI 2 / PlayStation 3 Input */}
                {activeInput === 3 && (
                  <div style={{
                    ...inputStyle, zIndex: 10,
                    background: 'linear-gradient(220deg, #111e38, #050b18)',
                    padding: '12px',
                  }}>
                    <div style={{
                      display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '8px',
                      borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px',
                    }}>
                      {['Settings', 'Photo', 'Music', 'Game', 'Network'].map((cat, i) => (
                        <div key={i} style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                          opacity: i === 3 ? 1 : 0.4, fontSize: '8px', fontWeight: 700, color: '#e2e8f0',
                          letterSpacing: '0.5px', textTransform: 'uppercase',
                        }}>
                          <span style={{ fontSize: '12px' }}>{['⚙️', '📷', '🎵', '🎮', '🌐'][i]}</span>
                          <span>{cat}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>Game</div>
                    {['Metal Gear Solid 4', 'LittleBigPlanet', 'MotorStorm Demo'].map((game, i) => (
                      <div key={i} style={{
                        padding: '4px 8px', borderRadius: '4px',
                        background: i === 0 ? 'rgba(56,189,248,0.08)' : 'transparent',
                        borderLeft: i === 0 ? '2px solid #38bdf8' : '2px solid transparent',
                        fontSize: '9px', color: i === 0 ? '#e2e8f0' : '#64748b', marginBottom: '2px',
                      }}>
                        {game}
                      </div>
                    ))}
                  </div>
                )}

                {/* HDMI 3 / DishTV Input */}
                {activeInput === 4 && (
                  <div style={{
                    ...inputStyle, zIndex: 10, background: '#000',
                    position: 'relative',
                  }}>
                    {dishPower ? (
                      isHLS ? (
                        <div style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'linear-gradient(135deg, #111, #000)',
                          color: 'rgba(255,255,255,0.3)', fontSize: '11px',
                          flexDirection: 'column', gap: '8px',
                        }}>
                          <div style={{ fontSize: '24px' }}>📡</div>
                          <div>{dishChannels[dishChannel].name}</div>
                          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.15)' }}>Live Stream (HLS)</div>
                        </div>
                      ) : (
                        <video
                          ref={videoRef}
                          src={currentDishSrc}
                          autoPlay
                          loop
                          playsInline
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )
                    ) : (
                      <div style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', color: 'rgba(56,189,248,0.3)', fontFamily: 'monospace',
                      }}>
                        No Signal — DishTV Power Off
                      </div>
                    )}

                    {/* Dish channel info */}
                    {dishPower && activeInput === 4 && (
                      <div style={{
                        position: 'absolute', bottom: '8px', left: '8px',
                        background: 'rgba(0,0,0,0.5)', borderRadius: '4px', padding: '4px 8px',
                        fontSize: '10px', color: 'rgba(255,255,255,0.7)',
                      }}>
                        <div style={{ fontWeight: 700, fontSize: '11px' }}>DishTV DTH</div>
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>{dishChannels[dishChannel].name}</div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* OSD Messages */}
            <div style={{
              position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              pointerEvents: 'none', zIndex: 50,
            }}>
              <AnimatePresence>
                {osdMessages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: -10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      padding: '4px 12px',
                      background: 'rgba(3,9,23,0.9)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: '4px',
                      border: '1px solid rgba(56,189,248,0.2)',
                      fontSize: '10px', fontWeight: 500, color: 'rgba(255,255,255,0.85)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {msg.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Volume OSD */}
            {(volume > 0 || muted) && powerState === 'active' && (
              <div style={{
                position: 'absolute', bottom: '8px', right: '8px',
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(0,0,0,0.5)', borderRadius: '4px', padding: '3px 8px',
                zIndex: 45,
              }}>
                <span style={{ fontSize: '9px', color: muted ? '#ef4444' : '#94a3b8' }}>
                  {muted ? '🔇' : '🔊'}
                </span>
                <div style={{
                  width: '40px', height: '3px', background: 'rgba(255,255,255,0.1)',
                  borderRadius: '2px', overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${muted ? 0 : volume}%`, height: '100%',
                    background: muted ? '#ef4444' : 'rgba(255,255,255,0.4)',
                    borderRadius: '2px', transition: 'width 0.1s',
                  }} />
                </div>
              </div>
            )}
          </div>

          {/* SAMSUNG logo on bezel + power LED */}
          <div style={{
            position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', zIndex: 50,
          }}>
            <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '3px', color: 'rgba(255,255,255,0.7)' }}>
              SAMSUNG
            </div>
            <div style={{
              width: '4px', height: '4px', borderRadius: '50%',
              background: bezelLEDColor === 'red' ? '#dc2626' : bezelLEDColor === 'cyan' ? '#22d3ee' : '#090909',
              boxShadow: bezelLEDColor === 'red' ? '0 0 8px rgba(220,38,38,0.85)' : bezelLEDColor === 'cyan' ? '0 0 12px rgba(34,211,238,0.9)' : 'none',
              transition: 'all 0.3s',
            }} />
          </div>

          {/* USB Port */}
          <div style={{
            position: 'absolute', bottom: '6px', right: '10px', zIndex: 50,
            display: 'flex', gap: '4px',
          }}>
            <div style={{
              fontSize: '8px', padding: '2px 6px', borderRadius: '4px',
              background: powerState === 'active' ? 'rgba(5,150,105,0.3)' : 'rgba(39,39,42,0.5)',
              color: powerState === 'active' ? '#34d399' : '#a1a1aa',
              fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
              border: powerState === 'active' ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(113,113,122,0.2)',
            }}>
              💾 USB: {powerState === 'active' ? 'CONNECTED' : 'NONE'}
            </div>
          </div>
        </div>

        {/* Glass Stand */}
        <div style={{
          width: '48px', height: '20px',
          background: 'linear-gradient(to right, rgba(255,255,255,0.05), rgba(255,255,255,0.2) 30%, rgba(0,0,0,0.4) 70%, rgba(255,255,255,0.05))',
          border: '1px solid rgba(255,255,255,0.1)',
          marginTop: '-2px',
        }} />
        <div style={{
          width: '180px', height: '10px',
          borderRadius: '999px',
          background: 'linear-gradient(135deg, rgba(30,41,59,0.7), rgba(15,23,42,0.95))',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5), inset 0 2px 2px rgba(255,255,255,0.2)',
          marginTop: '-2px',
        }} />
      </div>

      {/* Right: Remote Controls */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '8px',
        width: '220px', flexShrink: 0,
      }}>
        {/* Samsung BN59 Remote */}
        <div style={{
          background: 'rgba(15,23,42,0.45)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '10px',
          display: 'flex', flexDirection: 'column', gap: '6px',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.1)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: '0 0 50% 0',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.12), rgba(255,255,255,0.02) 50%, transparent 50.1%, rgba(0,0,0,0.08))',
            pointerEvents: 'none', opacity: 0.2,
          }} />
          <div style={{
            fontSize: '8px', fontWeight: 700, color: 'rgba(161,161,170,0.6)',
            letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'center',
            paddingBottom: '4px', borderBottom: '1px solid rgba(113,113,122,0.15)',
          }}>
            Samsung TV BN59
          </div>

          {/* Power & Source */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
            <RemoteButton onClick={togglePower} style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: powerState === 'off' ? 'linear-gradient(to bottom, #dc2626, #b91c1c)' : 'linear-gradient(to bottom, #16a34a, #15803d)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff', fontSize: '12px',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15), 0 2px 4px rgba(0,0,0,0.4)',
            }}>
              ⏻
            </RemoteButton>
            <RemoteButton onClick={toggleSourceMenu} style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(to bottom, rgba(63,63,70,0.8), rgba(39,39,42,0.8))',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#38bdf8', fontSize: '10px',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15), 0 2px 4px rgba(0,0,0,0.4)',
            }}>
              ◈
            </RemoteButton>
          </div>

          {/* Volume & Channel rockers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <div style={{
              background: 'rgba(24,24,27,0.8)', borderRadius: '8px',
              padding: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              border: '1px solid rgba(113,113,122,0.15)',
            }}>
              <RemoteButton onClick={() => adjustVolume(5)} style={{
                width: '100%', padding: '4px', borderRadius: '4px',
                background: 'rgba(63,63,70,0.5)', color: '#e4e4e7',
                fontSize: '10px', fontWeight: 700,
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.3)',
              }}>+</RemoteButton>
              <span style={{ fontSize: '7px', color: 'rgba(113,113,122,0.6)', fontWeight: 700, fontFamily: 'monospace' }}>VOL</span>
              <RemoteButton onClick={() => adjustVolume(-5)} style={{
                width: '100%', padding: '4px', borderRadius: '4px',
                background: 'rgba(63,63,70,0.5)', color: '#e4e4e7',
                fontSize: '10px', fontWeight: 700,
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.3)',
              }}>−</RemoteButton>
            </div>
            <div style={{
              background: 'rgba(24,24,27,0.8)', borderRadius: '8px',
              padding: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              border: '1px solid rgba(113,113,122,0.15)',
            }}>
              <RemoteButton disabled={activeInput !== 4} onClick={() => changeDishChannel('up')} style={{
                width: '100%', padding: '4px', borderRadius: '4px',
                background: activeInput === 4 ? 'rgba(63,63,70,0.5)' : 'rgba(63,63,70,0.2)',
                color: activeInput === 4 ? '#e4e4e7' : '#52525b',
                fontSize: '10px', fontWeight: 700, cursor: activeInput === 4 ? 'pointer' : 'not-allowed',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.3)',
              }}>+</RemoteButton>
              <span style={{ fontSize: '7px', color: 'rgba(113,113,122,0.6)', fontWeight: 700, fontFamily: 'monospace' }}>CH</span>
              <RemoteButton disabled={activeInput !== 4} onClick={() => changeDishChannel('down')} style={{
                width: '100%', padding: '4px', borderRadius: '4px',
                background: activeInput === 4 ? 'rgba(63,63,70,0.5)' : 'rgba(63,63,70,0.2)',
                color: activeInput === 4 ? '#e4e4e7' : '#52525b',
                fontSize: '10px', fontWeight: 700, cursor: activeInput === 4 ? 'pointer' : 'not-allowed',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.3)',
              }}>−</RemoteButton>
            </div>
          </div>

          {/* D-Pad */}
          <div style={{
            position: 'relative', width: '96px', height: '96px', margin: '0 auto',
            borderRadius: '50%', background: 'rgba(24,24,27,0.9)',
            border: '1px solid rgba(113,113,122,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
          }}>
            <RemoteButton onClick={() => {}} style={{
              position: 'absolute', top: '4px', width: '28px', height: '20px',
              borderRadius: '4px', background: 'rgba(63,63,70,0.6)', color: '#e4e4e7',
              fontSize: '9px',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.4)',
            }}>▲</RemoteButton>
            <RemoteButton onClick={() => {}} style={{
              position: 'absolute', left: '4px', width: '20px', height: '28px',
              borderRadius: '4px', background: 'rgba(63,63,70,0.6)', color: '#e4e4e7',
              fontSize: '9px',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.4)',
            }}>◀</RemoteButton>
            <RemoteButton onClick={() => {}} style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'rgba(63,63,70,0.8)', color: '#f4f4f5',
              fontSize: '7px', fontWeight: 700,
              border: '1px solid rgba(113,113,122,0.2)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)',
            }}>OK</RemoteButton>
            <RemoteButton onClick={() => {}} style={{
              position: 'absolute', right: '4px', width: '20px', height: '28px',
              borderRadius: '4px', background: 'rgba(63,63,70,0.6)', color: '#e4e4e7',
              fontSize: '9px',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.4)',
            }}>▶</RemoteButton>
            <RemoteButton onClick={() => {}} style={{
              position: 'absolute', bottom: '4px', width: '28px', height: '20px',
              borderRadius: '4px', background: 'rgba(63,63,70,0.6)', color: '#e4e4e7',
              fontSize: '9px',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.4)',
            }}>▼</RemoteButton>
          </div>

          {/* Menu & Return */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <RemoteButton onClick={() => {}} style={{
              padding: '4px 12px', borderRadius: '6px',
              background: 'rgba(63,63,70,0.5)', color: '#e4e4e7',
              fontSize: '8px', fontWeight: 600, letterSpacing: '0.5px',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.3)',
            }}>Menu</RemoteButton>
            <RemoteButton onClick={() => {}} style={{
              padding: '4px 12px', borderRadius: '6px',
              background: 'rgba(63,63,70,0.5)', color: '#e4e4e7',
              fontSize: '8px', fontWeight: 600, letterSpacing: '0.5px',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.3)',
            }}>↩ Back</RemoteButton>
          </div>

          {/* Number pad */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px',
          }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''].map((n, i) => (
              n ? (
                <RemoteButton key={i} onClick={() => {}} style={{
                  padding: '4px', borderRadius: '4px',
                  background: 'rgba(63,63,70,0.4)', color: '#e4e4e7',
                  fontSize: '9px', fontWeight: 700,
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.3)',
                }}>{n}</RemoteButton>
              ) : <div key={i} />
            ))}
          </div>

          {/* Mute button */}
          <RemoteButton onClick={toggleMute} style={{
            width: '100%', padding: '3px', borderRadius: '6px',
            background: muted ? 'rgba(239,68,68,0.2)' : 'rgba(63,63,70,0.3)',
            color: muted ? '#ef4444' : '#a1a1aa',
            fontSize: '8px', fontWeight: 700, letterSpacing: '1px',
            border: muted ? '1px solid rgba(239,68,68,0.2)' : '1px solid transparent',
          }}>
            {muted ? '🔇 MUTED' : '🔊 MUTE'}
          </RemoteButton>
        </div>

        {/* DishTV Remote Section */}
        {activeInput === 4 && powerState === 'active' && (
          <div style={{
            background: 'rgba(15,23,42,0.45)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px', padding: '10px',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.1)',
          }}>
            <div style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(161,161,170,0.6)', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'center', marginBottom: '6px' }}>
              DishTV Remote
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
              <RemoteButton onClick={() => setDishPower(p => !p)} style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: dishPower ? 'linear-gradient(to bottom, #16a34a, #15803d)' : 'linear-gradient(to bottom, #dc2626, #b91c1c)',
                color: '#fff', fontSize: '8px', fontWeight: 700,
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15), 0 2px 4px rgba(0,0,0,0.4)',
              }}>
                {dishPower ? 'ON' : 'OFF'}
              </RemoteButton>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', marginBottom: '4px',
            }}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''].map((n, i) => (
                n ? (
                  <RemoteButton key={i} onClick={() => {
                    if (!dishPower) return;
                    const num = parseInt(n);
                    const max = dishChannels.length;
                    const idx = Math.min(num, max - 1);
                    setDishChannel(idx);
                    if (videoRef.current && !dishChannels[idx].src.endsWith('.m3u8')) {
                      videoRef.current.src = dishChannels[idx].src;
                      videoRef.current.play().catch(() => {});
                    }
                    showOSD(`CH: ${dishChannels[idx].name}`);
                  }} style={{
                    padding: '4px', borderRadius: '4px',
                    background: 'rgba(63,63,70,0.4)', color: '#e4e4e7',
                    fontSize: '9px', fontWeight: 700,
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.3)',
                  }}>{n}</RemoteButton>
                ) : <div key={i} />
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
              <RemoteButton onClick={() => changeDishChannel('up')} style={{
                padding: '3px', borderRadius: '4px', background: 'rgba(63,63,70,0.4)',
                color: '#38bdf8', fontSize: '8px', fontWeight: 700,
              }}>CH+</RemoteButton>
              <RemoteButton onClick={toggleMute} style={{
                padding: '3px', borderRadius: '4px', background: 'rgba(63,63,70,0.4)',
                color: '#f59e0b', fontSize: '8px', fontWeight: 700,
              }}>MUTE</RemoteButton>
              <RemoteButton onClick={() => changeDishChannel('down')} style={{
                padding: '3px', borderRadius: '4px', background: 'rgba(63,63,70,0.4)',
                color: '#38bdf8', fontSize: '8px', fontWeight: 700,
              }}>CH−</RemoteButton>
              <RemoteButton onClick={() => adjustDishVolume(5)} style={{
                padding: '3px', borderRadius: '4px', background: 'rgba(63,63,70,0.4)',
                color: '#e4e4e7', fontSize: '8px', fontWeight: 700,
              }}>VOL+</RemoteButton>
              <RemoteButton onClick={() => adjustDishVolume(-5)} style={{
                padding: '3px', borderRadius: '4px', background: 'rgba(63,63,70,0.4)',
                color: '#e4e4e7', fontSize: '8px', fontWeight: 700,
              }}>VOL−</RemoteButton>
              <RemoteButton onClick={() => {}} style={{
                padding: '3px', borderRadius: '4px', background: 'rgba(63,63,70,0.4)',
                color: '#a1a1aa', fontSize: '8px', fontWeight: 700,
              }}>CLR</RemoteButton>
            </div>
          </div>
        )}

        {/* Source Input Indicator */}
        <div style={{
          padding: '6px 10px',
          background: 'rgba(15,23,42,0.45)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(161,161,170,0.6)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            INPUT
          </span>
          <span style={{
            fontSize: '9px', fontWeight: 600, color: powerState === 'active' ? '#38bdf8' : 'rgba(161,161,170,0.4)',
          }}>
            {powerState === 'active' ? `${SOURCE_NAMES[activeInput]} ${SOURCE_ICONS[activeInput]}` : '— OFF —'}
          </span>
        </div>

        {/* CDN Asset Status */}
        <div style={{
          padding: '6px 10px',
          background: 'rgba(15,23,42,0.45)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
        }}>
          <div style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(161,161,170,0.6)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
            CDN Assets
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <StatusBadge count={MP4_STREAMS.length} label="MP4" color="#4ade80" />
            <StatusBadge count={SOUNDTESTS_COUNT} label="Audio" color="#60a5fa" />
            <StatusBadge count={LIVESTREAMS_COUNT} label="Live" color="#f87171" />
          </div>
        </div>
      </div>

      {/* Source Selection Overlay */}
      <AnimatePresence>
        {sourceMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 100,
            }}
            onClick={() => setSourceMenuOpen(false)}
          >
            <div style={{
              background: 'linear-gradient(145deg, rgba(11,27,58,0.98), rgba(5,12,31,0.99))',
              border: '2px solid rgba(56,189,248,0.3)',
              borderRadius: '16px', padding: '20px', minWidth: '300px',
              boxShadow: '0 15px 40px rgba(0,0,0,0.8), inset 0 1px 3px rgba(255,255,255,0.2)',
            }} onClick={e => e.stopPropagation()}>
              <div style={{
                fontSize: '12px', fontWeight: 800, color: '#38bdf8',
                letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px',
              }}>
                ◈ Input Source
              </div>
              {([0, 1, 2, 3, 4] as InputSource[]).map(src => (
                <div
                  key={src}
                  onClick={() => selectSource(src)}
                  style={{
                    padding: '8px 12px', borderRadius: '8px', marginBottom: '4px',
                    cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: activeInput === src ? 'linear-gradient(to right, #f59e0b, #d97706)' : 'rgba(56,189,248,0.05)',
                    color: activeInput === src ? '#fff' : '#cbd5e1',
                    border: activeInput === src ? 'none' : '1px solid rgba(56,189,248,0.08)',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 600 }}>
                    {SOURCE_ICONS[src]} {SOURCE_NAMES[src]}
                  </span>
                  {activeInput === src && (
                    <span style={{ fontSize: '9px' }}>●</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RemoteButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  disabled?: boolean;
}> = ({ onClick, children, style, disabled }) => (
  <button
    onClick={disabled ? undefined : onClick}
    style={{
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.1s ease',
      fontFamily: 'inherit',
      opacity: disabled ? 0.5 : 1,
      ...style,
    } as React.CSSProperties}
    onMouseDown={e => {
      if (!disabled) {
        (e.currentTarget as HTMLElement).style.transform = 'scale(0.92)';
      }
    }}
    onMouseUp={e => {
      (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
    }}
  >
    {children}
  </button>
);

const StatusBadge: React.FC<{ count: number; label: string; color: string }> = ({ count, label, color }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '3px',
    padding: '2px 6px', borderRadius: '4px',
    background: `${color}08`,
    border: `1px solid ${color}15`,
  }}>
    <div style={{
      width: '4px', height: '4px', borderRadius: '50%',
      background: color,
      boxShadow: `0 0 6px ${color}40`,
    }} />
    <span style={{ fontSize: '8px', fontWeight: 600, color }}>
      {count} {label}
    </span>
  </div>
);
