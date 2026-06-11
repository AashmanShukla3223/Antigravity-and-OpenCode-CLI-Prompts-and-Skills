import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { saveToVFS, ImportFileButton, useFileDrop } from '../../utils/vfs-ops';

interface Track {
  id: string;
  name: string;
  color: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  armed: boolean;
}

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
  const [bpm] = useState(120);
  const [showExport, setShowExport] = useState(false);
  const [exportPreset, setExportPreset] = useState<ExportPreset>(EXPORT_PRESETS[2]);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string>('');
  const animRef = useRef<number | null>(null);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [notes, setNotes] = useState<Record<string, number[]>>({});

  const selectedTrackData = tracks.find(t => t.id === selectedTrack);

  useEffect(() => {
    if (isPlaying) {
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
    }
  }, [isPlaying, bpm]);

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

  const deleteTrack = useCallback((id: string) => {
    setTracks(prev => { const next = prev.filter(t => t.id !== id); return next; });
    if (selectedTrack === id) setSelectedTrack(tracks[0]?.id || '');
  }, [tracks, selectedTrack]);

  const addTrackFromFile = useCallback((name: string) => {
    const newTrack: Track = {
      id: nextTrackId(),
      name: name.replace(/\.[^.]+$/, '').slice(0, 20),
      color: TRACK_COLORS[tracks.length % TRACK_COLORS.length],
      volume: 0.7, pan: 0, muted: false, solo: false, armed: true,
    };
    setTracks(prev => [...prev, newTrack]);
    setSelectedTrack(newTrack.id);
  }, [tracks.length]);

  const dropHandlers = useFileDrop(createNode, 'music', '.mp3,.wav', (file) => {
    addTrackFromFile(file.name);
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
        <ImportFileButton createNode={createNode} parentId="music" accept=".mp3,.wav" />
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
            {tracks.map(track => {
              const hasSolo = tracks.some(t => t.solo);
              const isAudible = hasSolo ? track.solo : !track.muted;
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
                  <div className="mt-1.5 h-8 bg-[#1a1a1a] rounded flex items-end px-1 gap-px">
                    {Array.from({ length: 16 }).map((_, i) => {
                      const h = 4 + Math.sin(i * 0.8 + track.volume * 3) * 4 + Math.random() * 2;
                      return <div key={i} className="flex-1 rounded-t" style={{ height: h, backgroundColor: isAudible ? track.color : track.color + '44' }} />;
                    })}
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
              {tracks.map(track => (
                <div key={track.id} className="h-12 border-b border-[#2a2a2a] flex relative" style={{ backgroundColor: selectedTrack === track.id ? '#ffffff08' : 'transparent' }}>
                  {Array.from({ length: TOTAL_BARS }).map((_, bar) => {
                    const hasNote = notes[track.id]?.includes(bar);
                    return (
                      <div key={bar} className={`w-12 h-full shrink-0 border-r border-[#222] flex items-center justify-center relative ${bar % 4 === 0 ? 'border-[#333]' : ''}`}>
                        {hasNote && (
                          <div
                            className="w-8 h-3 rounded-sm cursor-pointer transition hover:opacity-80"
                            style={{ backgroundColor: track.color }}
                            title={`${track.name} - Bar ${bar + 1}`}
                          />
                        )}
                      </div>
                    );
                  })}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 shadow-[0_0_6px_rgba(255,50,50,0.8)] z-10 pointer-events-none"
                    style={{ left: currentBar * 48 }}
                  />
                </div>
              ))}
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
