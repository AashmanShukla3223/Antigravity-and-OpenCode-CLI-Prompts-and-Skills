import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { saveToVFS, ImportFileButton, useFileDrop } from '../../utils/vfs-ops';
import { Delete02Icon } from 'hugeicons-react';

interface Track {
  id: string;
  name: string;
  color: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  armed: boolean;
  audioUrl?: string;
}

const TapTempoButton: React.FC<{ onBpmChange: (bpm: number) => void }> = ({ onBpmChange }) => {
  const tapTimesRef = useRef<number[]>([]);
  return (
    <button
      onClick={() => {
        const now = performance.now();
        const recent = [...tapTimesRef.current, now].filter(t => now - t < 3000);
        if (recent.length >= 2) {
          const intervals = recent.slice(1).map((t, i) => t - recent[i]);
          const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
          const calc = Math.round(60000 / avg);
          if (calc >= 60 && calc <= 200) onBpmChange(calc);
        }
        tapTimesRef.current = recent.slice(-8);
      }}
      className="px-2 py-0.5 rounded text-[10px] bg-[#3c3c3c] hover:bg-[#4a4a4a] transition"
    >Tap</button>
  );
};

interface ExportPreset {
  label: string;
  bitrate: string;
  format: string;
  sampleRate: number;
}

const EXPORT_PRESETS: ExportPreset[] = [
  { label: 'MP3 128kbps', bitrate: '128', format: 'mp3', sampleRate: 44100 },
  { label: 'MP3 256kbps', bitrate: '256', format: 'mp3', sampleRate: 48000 },
  { label: 'MP3 320kbps', bitrate: '320', format: 'mp3', sampleRate: 48000 },
  { label: 'WAV 24-bit', bitrate: 'lossless', format: 'wav', sampleRate: 96000 },
];

const TRACK_COLORS = ['#4dabf7', '#69db7c', '#ffd43b', '#ff6b6b', '#9775fa', '#ffa94d', '#f783ac', '#20c997'];
const TOTAL_BARS = 64;

let trackIdCounter = 0;
const nextTrackId = () => `track-${++trackIdCounter}`;

export const LogicPro: React.FC = () => {
  const { createNode } = useFileSystem();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentBar, setCurrentBar] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [showExport, setShowExport] = useState(false);
  const [exportPreset, setExportPreset] = useState<ExportPreset>(EXPORT_PRESETS[2]);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string>('');
  const animRef = useRef<number | null>(null);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [notes] = useState<Record<string, number[]>>({});

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodesRef = useRef<AudioBufferSourceNode[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [levels, setLevels] = useState<number[]>(tracks.map(() => 0));
  const [bpm, setBpm] = useState(120);
  const waveformCache = useRef<Map<string, number[]>>(new Map());
  const playbackStartRef = useRef(0);
  const rafLevelRef = useRef<number | null>(null);
  const selectedTrackData = tracks.find(t => t.id === selectedTrack);

  const decodeWaveform = useCallback(async (audioUrl: string, bars: number): Promise<number[]> => {
    if (waveformCache.current.has(audioUrl)) return waveformCache.current.get(audioUrl)!;
    try {
      const res = await fetch(audioUrl);
      const buffer = await res.arrayBuffer();
      const ctx = new OfflineAudioContext(1, 44100, 44100);
      const decoded = await ctx.decodeAudioData(buffer);
      const channel = decoded.getChannelData(0);
      const samplesPerBar = Math.floor(channel.length / bars);
      const peaks: number[] = [];
      for (let i = 0; i < bars; i++) {
        let max = 0;
        const start = i * samplesPerBar;
        const end = Math.min(start + samplesPerBar, channel.length);
        for (let j = start; j < end; j++) {
          const abs = Math.abs(channel[j]);
          if (abs > max) max = abs;
        }
        peaks.push(max);
      }
      waveformCache.current.set(audioUrl, peaks);
      return peaks;
    } catch { return []; }
  }, []);

  const playTracks = useCallback(async () => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    const ctx = audioCtxRef.current;
    sourceNodesRef.current.forEach(s => { try { s.stop(); } catch {} });
    sourceNodesRef.current = [];

    const activeTracks = tracks.filter(t => {
      if (!t.audioUrl || t.muted) return false;
      const hasSolo = tracks.some(s => s.solo);
      return hasSolo ? t.solo : true;
    });

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;
    const levelBuffer = new Uint8Array(analyser.frequencyBinCount);

    for (const track of activeTracks) {
      try {
        const res = await fetch(track.audioUrl!);
        const buffer = await res.arrayBuffer();
        const decoded = await ctx.decodeAudioData(buffer);
        const source = ctx.createBufferSource();
        source.buffer = decoded;

        const gain = ctx.createGain();
        gain.gain.value = track.volume * masterVolume;

        const panner = ctx.createStereoPanner();
        panner.pan.value = track.pan;

        source.connect(gain);
        gain.connect(panner);
        panner.connect(analyser);
        source.start(0);
        sourceNodesRef.current.push(source);
      } catch {}
    }
    analyser.connect(ctx.destination);

    const updateLevels = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(levelBuffer);
      const avg = Array.from(levelBuffer).reduce((a, b) => a + b, 0) / levelBuffer.length;
      setLevels(tracks.map(t => (t.audioUrl && !t.muted ? avg / 255 : 0)));
      rafLevelRef.current = requestAnimationFrame(updateLevels);
    };
    rafLevelRef.current = requestAnimationFrame(updateLevels);

    playbackStartRef.current = ctx.currentTime;
  }, [tracks, masterVolume]);

  const stopTracks = useCallback(() => {
    sourceNodesRef.current.forEach(s => { try { s.stop(); } catch {} });
    sourceNodesRef.current = [];
    analyserRef.current = null;
    if (rafLevelRef.current) cancelAnimationFrame(rafLevelRef.current);
    setLevels(tracks.map(() => 0));
  }, [tracks.length]);

  useEffect(() => {
    if (isPlaying) {
      playTracks();
      const intervalMs = (60 / bpm) * 1000 / 4;
      let lastTime = performance.now();
      const animate = (time: number) => {
        const delta = time - lastTime;
        if (delta >= intervalMs) {
          lastTime = time;
          setCurrentBar(prev => {
            const next = prev + 1;
            if (next >= TOTAL_BARS) { setIsPlaying(false); return 0; }
            return next;
          });
        }
        animRef.current = requestAnimationFrame(animate);
      };
      animRef.current = requestAnimationFrame(animate);
      return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    } else {
      stopTracks();
    }
  }, [isPlaying, bpm, playTracks, stopTracks]);

  const updateTrack = useCallback((id: string, updates: Partial<Track>) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const addTrack = useCallback(() => {
    const newTrack: Track = {
      id: nextTrackId(),
      name: `Track ${tracks.length + 1}`,
      color: TRACK_COLORS[tracks.length % TRACK_COLORS.length],
      volume: 0.7, pan: 0, muted: false, solo: false, armed: true,
    };
    setTracks(prev => [...prev, newTrack]);
    setSelectedTrack(newTrack.id);
  }, [tracks.length]);


  const addTrackFromFile = useCallback((name: string, dataUrl?: string) => {
    const newTrack: Track = {
      id: nextTrackId(),
      name: name.replace(/\.[^.]+$/, '').slice(0, 20),
      color: TRACK_COLORS[tracks.length % TRACK_COLORS.length],
      volume: 0.7, pan: 0, muted: false, solo: false, armed: true,
      audioUrl: dataUrl,
    };
    setTracks(prev => [...prev, newTrack]);
    setSelectedTrack(newTrack.id);
  }, [tracks.length]);

  const dropHandlers = useFileDrop(createNode, 'music', '.mp3,.wav', (file, dataUrl) => {
    addTrackFromFile(file.name, dataUrl);
  });

  const handleExport = useCallback(() => {
    setIsExporting(true);
    setExportProgress(0);
    setExportDone(false);
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          setExportDone(true);
          return 100;
        }
        return prev + 3;
      });
    }, 60);
  }, []);

  const handleDownload = useCallback(() => {
    const length = 5;
    const sampleRate = exportPreset.sampleRate;
    const numSamples = length * sampleRate;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);
    const writeStr = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };
    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, numSamples * 2, true);
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const freq = 220 + Math.sin(currentBar * 0.1) * 80;
      const sample = Math.sin(2 * Math.PI * freq * t) * 0.3 * masterVolume
        + Math.sin(2 * Math.PI * freq * 1.5 * t) * 0.15 * masterVolume
        + Math.sin(2 * Math.PI * freq * 0.5 * t) * 0.2 * masterVolume;
      const val = Math.max(-1, Math.min(1, sample));
      view.setInt16(44 + i * 2, val * 32767, true);
    }
    const blob = new Blob([buffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logicpro-export-${exportPreset.label.toLowerCase().replace(/\s+/g, '-')}.${exportPreset.format}`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExport(false);
    setExportDone(false);
  }, [exportPreset, masterVolume, currentBar]);

  const barToTime = (bar: number) => {
    const beats = bar * 4;
    const secs = (beats / bpm) * 60;
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${m}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#1a1a1a] text-white select-none">
      <div className="h-10 bg-[#2d2d2d] border-b border-[#3c3c3c] flex items-center px-4 gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => { setCurrentBar(0); setIsPlaying(false); }} className="px-2 py-1 rounded text-xs bg-[#3c3c3c] hover:bg-[#4a4a4a] transition">|◁</button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1 rounded text-xs font-bold transition ${isPlaying ? 'bg-red-500 text-white' : 'bg-[#3c3c3c] hover:bg-[#4a4a4a]'}`}
          >{isPlaying ? '■' : '▶'}</button>
        </div>
        <div className="w-px h-5 bg-[#3c3c3c]" />
        <span className="text-xs text-gray-400">{bpm} BPM</span>
        <TapTempoButton onBpmChange={setBpm} />
        <ImportFileButton createNode={createNode} parentId="music" accept=".mp3,.wav" onImport={(file, dataUrl) => addTrackFromFile(file.name, dataUrl)} />
        <button
          onClick={() => {
            const project = { tracks, bpm, masterVolume, notes };
            saveToVFS(createNode, JSON.stringify(project, null, 2), `logicpro-${Date.now()}.logicproj`, 'music');
          }}
          className="px-3 py-1 rounded text-xs bg-emerald-600 hover:bg-emerald-500 transition"
        >
          💾 Save
        </button>
        <div className="flex-1" />
        <span className="text-xs text-gray-400">Bar {currentBar + 1}/{TOTAL_BARS} • {barToTime(currentBar)}</span>
        <div className="w-px h-5 bg-[#3c3c3c]" />
        <button
          onClick={() => { setShowExport(true); setExportDone(false); setExportProgress(0); }}
          className="px-3 py-1 rounded text-xs bg-orange-600 hover:bg-orange-500 transition font-medium"
        >Export</button>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="flex flex-col w-64 bg-[#252525] border-r border-[#333] shrink-0">
          <div className="h-8 bg-[#2d2d2d] border-b border-[#333] flex items-center px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Mixer
          </div>
          <div className="flex-1 overflow-y-auto">
            {tracks.map((track, tIdx) => {
              const hasSolo = tracks.some(t => t.solo);
              const isAudible = hasSolo ? track.solo : !track.muted;
              const level = levels[tIdx] || 0;
              return (
                <div
                  key={track.id}
                  onClick={() => setSelectedTrack(track.id)}
                  className={`p-3 border-b border-[#2a2a2a] transition ${selectedTrack === track.id ? 'bg-blue-600/20 border-l-2 border-l-blue-500' : 'hover:bg-[#2a2a2a]'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: track.color }} />
                      <span className="text-xs font-medium truncate max-w-[80px]">{track.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); updateTrack(track.id, { muted: !track.muted }); }}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition ${track.muted ? 'bg-red-500/30 text-red-300' : 'bg-[#3c3c3c] text-gray-400 hover:text-white'}`}
                      >M</button>
                      <button
                        onClick={(e) => { e.stopPropagation(); updateTrack(track.id, { solo: !track.solo }); }}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition ${track.solo ? 'bg-yellow-500/30 text-yellow-300' : 'bg-[#3c3c3c] text-gray-400 hover:text-white'}`}
                      >S</button>
                      <button
                        onClick={(e) => { e.stopPropagation(); updateTrack(track.id, { armed: !track.armed }); }}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition ${track.armed ? 'bg-red-500/30 text-red-300' : 'bg-[#3c3c3c] text-gray-400 hover:text-white'}`}
                      >R</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500 w-6 text-right">{Math.round(track.volume * 100)}%</span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={track.volume}
                      onChange={(e) => updateTrack(track.id, { volume: parseFloat(e.target.value) })}
                      className="flex-1 h-1 accent-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs mt-1">
                    <span className="text-gray-500 w-6 text-right">Pan</span>
                    <input
                      type="range"
                      min={-1}
                      max={1}
                      step={0.01}
                      value={track.pan}
                      onChange={(e) => updateTrack(track.id, { pan: parseFloat(e.target.value) })}
                      className="flex-1 h-1 accent-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-gray-500 w-8">{track.pan > 0 ? 'R' : track.pan < 0 ? 'L' : 'C'}</span>
                  </div>
                  <div className="mt-1.5 h-6 bg-[#1a1a1a] rounded flex items-center px-1 gap-0.5">
                    {level > 0 ? (
                      Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="flex-1 rounded-t" style={{ height: `${Math.min(100, (level * (i + 1) / 12) * 100)}%`, backgroundColor: i > 8 ? '#ef4444' : i > 5 ? '#f59e0b' : track.color }} />
                      ))
                    ) : (
                      Array.from({ length: 12 }).map((_, i) => {
                        const h = 4 + Math.sin(i * 0.8 + track.volume * 3) * 3;
                        return <div key={i} className="flex-1 rounded-t" style={{ height: h, backgroundColor: isAudible ? track.color + '44' : track.color + '22' }} />;
                      })
                    )}
                  </div>
                  <div className="flex justify-end mt-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setTracks(prev => prev.filter(t => t.id !== track.id)); }}
                      className="text-red-400 hover:text-red-300 opacity-0 hover:opacity-100 transition-opacity"
                      title="Delete track"
                    >
                      <Delete02Icon size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-3 border-t border-[#333]">
            <button onClick={addTrack} className="w-full py-1.5 rounded text-xs bg-[#3c3c3c] hover:bg-[#4a4a4a] transition">+ Add Track</button>
          </div>
          <div className="h-12 bg-[#2d2d2d] border-t border-[#333] flex items-center px-3 gap-3 shrink-0">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Master</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={masterVolume}
              onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
              className="flex-1 h-1 accent-orange-500"
            />
            <span className="text-xs text-gray-400 w-8 text-right">{Math.round(masterVolume * 100)}%</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0" {...dropHandlers}>
          <div className="h-8 bg-[#2d2d2d] border-b border-[#333] flex items-center px-3 text-[10px] text-gray-500 gap-2 shrink-0">
            {Array.from({ length: TOTAL_BARS }).map((_, i) => (
              <span key={i} className={`w-12 shrink-0 ${i % 4 === 0 ? 'text-gray-300 font-medium' : ''}`}>{i + 1}</span>
            ))}
          </div>
          <div className="flex-1 overflow-auto">
            <div className="relative" style={{ width: TOTAL_BARS * 48, minHeight: '100%' }}>
              {tracks.map(track => {
                const waveform = track.audioUrl ? waveformCache.current.get(track.audioUrl) : undefined;
                return (
                <div key={track.id} className="h-12 border-b border-[#2a2a2a] flex relative" style={{ backgroundColor: selectedTrack === track.id ? '#ffffff08' : 'transparent' }}>
                  {Array.from({ length: TOTAL_BARS }).map((_, bar) => {
                    const peak = waveform ? waveform[bar] || 0 : 0;
                    const h = Math.max(2, peak * 40);
                    return (
                      <div key={bar} className={`w-12 h-full shrink-0 border-r border-[#222] flex items-end justify-center pb-1 ${bar % 4 === 0 ? 'border-[#333]' : ''}`}>
                        {peak > 0.01 && (
                          <div
                            className="w-2 rounded-t transition-all duration-100"
                            style={{ height: h, backgroundColor: track.color }}
                          />
                        )}
                      </div>
                    );
                  })}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 shadow-[0_0_6px_rgba(255,50,50,0.8)] z-10 pointer-events-none"
                    style={{ left: currentBar * 48 }}
                  />
                  {track.audioUrl && !waveform && (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-500">
                      <button
                        onClick={() => decodeWaveform(track.audioUrl!, TOTAL_BARS).then(() => setTracks(prev => [...prev]))}
                        className="px-2 py-0.5 rounded bg-[#3c3c3c] hover:bg-[#4a4a4a]"
                      >Render Waveform</button>
                    </div>
                  )}
                </div>
              )})}
            </div>
          </div>
          <div className="h-6 bg-[#252525] border-t border-[#333] flex items-center shrink-0">
            <div
              className="flex-1 mx-2 h-1.5 bg-[#333] rounded relative cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                setCurrentBar(Math.floor(pct * TOTAL_BARS));
              }}
            >
              <div className="h-full bg-blue-500 rounded" style={{ width: `${(currentBar / TOTAL_BARS) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="h-8 bg-[#2d2d2d] border-t border-[#3c3c3c] flex items-center px-4 text-xs text-gray-400 shrink-0">
        {selectedTrackData && (
          <span>Track: {selectedTrackData.name} • Vol: {Math.round(selectedTrackData.volume * 100)}% • Pan: {selectedTrackData.pan.toFixed(1)}</span>
        )}
        <span className="ml-auto">{tracks.length} tracks • {bpm} BPM</span>
      </div>

      {showExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => !isExporting && setShowExport(false)}>
          <div className="bg-[#252525] rounded-2xl border border-[#444] shadow-2xl p-6 w-96" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Export Audio</h2>

            <div className="space-y-2 mb-6">
              {EXPORT_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => setExportPreset(preset)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition ${exportPreset.label === preset.label ? 'bg-blue-600/30 border border-blue-500' : 'bg-[#1e1e1e] border border-[#333] hover:border-[#555]'}`}
                >
                  <span className="font-medium">{preset.label}</span>
                  <span className="text-gray-400">{preset.sampleRate / 1000}kHz</span>
                </button>
              ))}
            </div>

            {isExporting && (
              <div className="mb-4">
                <div className="h-2 bg-[#333] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-200" style={{ width: `${exportProgress}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-center">{exportProgress}%</p>
              </div>
            )}

            {exportDone && (
              <div className="text-center mb-4">
                <p className="text-green-400 text-sm font-medium mb-2">✅ Export Complete</p>
                <p className="text-xs text-gray-400 mb-3">{exportPreset.label} • {exportPreset.sampleRate / 1000}kHz</p>
              </div>
            )}

            <div className="flex gap-2">
              {!isExporting && !exportDone && (
                <>
                  <button onClick={handleExport} className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-sm font-medium transition">Export</button>
                  <button onClick={() => setShowExport(false)} className="flex-1 py-2.5 rounded-xl bg-[#3c3c3c] hover:bg-[#4a4a4a] text-sm transition">Cancel</button>
                </>
              )}
              {isExporting && (
                <button disabled className="flex-1 py-2.5 rounded-xl bg-orange-600/50 text-sm cursor-not-allowed">Exporting...</button>
              )}
              {exportDone && (
                <>
                  <button onClick={handleDownload} className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-medium transition">Download</button>
                  <button onClick={() => setShowExport(false)} className="flex-1 py-2.5 rounded-xl bg-[#3c3c3c] hover:bg-[#4a4a4a] text-sm transition">Close</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
