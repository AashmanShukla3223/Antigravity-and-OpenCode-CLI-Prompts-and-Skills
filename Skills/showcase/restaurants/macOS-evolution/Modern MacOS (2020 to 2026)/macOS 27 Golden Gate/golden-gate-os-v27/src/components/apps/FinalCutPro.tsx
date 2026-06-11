import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { saveToVFS, ImportFileButton, useFileDrop } from '../../utils/vfs-ops';

interface Clip {
  id: string;
  name: string;
  start: number;
  duration: number;
  track: number;
  color: string;
  type: 'video' | 'audio' | 'title';
}

interface ExportPreset {
  label: string;
  resolution: string;
  width: number;
  height: number;
}

const EXPORT_PRESETS: ExportPreset[] = [
  { label: '720p', resolution: '1280×720', width: 1280, height: 720 },
  { label: '1080p', resolution: '1920×1080', width: 1920, height: 1080 },
  { label: '4K', resolution: '3840×2160', width: 3840, height: 2160 },
];

const TRACK_COLORS = ['#4dabf7', '#69db7c', '#ffd43b', '#ff6b6b', '#9775fa'];
const TIMELINE_DURATION = 300;

let clipIdCounter = 0;
const nextClipId = () => `clip-${++clipIdCounter}`;

interface MediaItem {
  name: string;
  type: 'video' | 'audio' | 'image';
}

export const FinalCutPro: React.FC = () => {
  const { createNode } = useFileSystem();
  const [clips, setClips] = useState<Clip[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showExport, setShowExport] = useState(false);
  const [exportPreset, setExportPreset] = useState<ExportPreset>(EXPORT_PRESETS[1]);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const animRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [previewResolution] = useState({ w: 640, h: 360 });

  const fps = 30;

  const activeClipAtFrame = clips.find(c => c.track === 0 && currentFrame >= c.start && currentFrame < c.start + c.duration);

  const addClipFromFile = useCallback((name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    const isVideo = ['mp4', 'mov', 'webm'].includes(ext);
    const isAudio = ['mp3', 'wav'].includes(ext);
    const type: Clip['type'] = isVideo ? 'video' : isAudio ? 'audio' : 'title';
    const newClip: Clip = {
      id: nextClipId(),
      name: name.replace(/\.[^.]+$/, '').slice(0, 20),
      start: 0,
      duration: type === 'audio' ? TIMELINE_DURATION : 60,
      track: type === 'video' ? 0 : type === 'audio' ? 1 : 2,
      color: TRACK_COLORS[clips.length % TRACK_COLORS.length],
      type,
    };
    setClips(prev => [...prev, newClip]);
    setMediaItems(prev => [...prev, { name, type: ext === 'mp3' || ext === 'wav' ? 'audio' : 'image' }]);
  }, [clips.length]);

  const dropHandlers = useFileDrop(createNode, 'movies', '.mp4,.mov,.webm,.png,.jpeg,.jpg,.webp,.mp3,.wav', (file) => {
    addClipFromFile(file.name);
  });

  useEffect(() => {
    if (isPlaying) {
      let lastTime = performance.now();
      const frameInterval = 1000 / fps;
      const animate = (time: number) => {
        const delta = time - lastTime;
        if (delta >= frameInterval) {
          lastTime = time;
          setCurrentFrame(prev => {
            const next = prev + 1;
            if (next >= TIMELINE_DURATION) { setIsPlaying(false); return 0; }
            return next;
          });
        }
        animRef.current = requestAnimationFrame(animate);
      };
      animRef.current = requestAnimationFrame(animate);
      return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    }
  }, [isPlaying, fps]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, previewResolution.w, previewResolution.h);

    const progress = currentFrame / TIMELINE_DURATION;
    const hue = (progress * 360) % 360;

    const grad = ctx.createLinearGradient(0, 0, previewResolution.w, previewResolution.h);
    grad.addColorStop(0, `hsl(${hue}, 60%, 20%)`);
    grad.addColorStop(1, `hsl(${(hue + 60) % 360}, 50%, 15%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, previewResolution.w, previewResolution.h);

    for (let i = 0; i < 8; i++) {
      const x = (Math.sin(currentFrame * 0.02 + i * 1.2) * 0.4 + 0.5) * previewResolution.w;
      const y = (Math.cos(currentFrame * 0.015 + i * 0.8) * 0.4 + 0.5) * previewResolution.h;
      const r = 15 + Math.sin(currentFrame * 0.03 + i) * 10;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${(hue + i * 40) % 360}, 80%, 60%, 0.4)`;
      ctx.fill();
    }

    if (activeClipAtFrame) {
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(20, 20, 3, 30);
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText(activeClipAtFrame.name, 30, 40);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '12px monospace';
    ctx.fillText(`${Math.floor(currentFrame / fps)}:${String(Math.floor(currentFrame % fps)).padStart(2, '0')}`, 20, previewResolution.h - 20);

    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.strokeRect(0, 0, previewResolution.w, previewResolution.h);
  }, [currentFrame, activeClipAtFrame, previewResolution]);

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
        return prev + 2;
      });
    }, 80);
  }, []);

  const handleDownloadMock = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = exportPreset.width;
    canvas.height = exportPreset.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#1a1a2e');
    grad.addColorStop(1, '#16213e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.font = `bold ${canvas.width * 0.05}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('Final Cut Pro Export', canvas.width / 2, canvas.height / 2);
    ctx.font = `${canvas.width * 0.02}px system-ui`;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText(`${exportPreset.resolution} • ${exportPreset.label}`, canvas.width / 2, canvas.height / 2 + canvas.height * 0.08);

    const link = document.createElement('a');
    link.download = `golden-gate-export-${exportPreset.label.toLowerCase()}.mp4`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setShowExport(false);
    setExportDone(false);
  }, [exportPreset]);

  const timeStr = (frame: number) => {
    const s = Math.floor(frame / fps);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}.${String(Math.floor((frame % fps) / fps * 100)).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#1a1a1a] text-white select-none">
      <div className="h-10 bg-[#2d2d2d] border-b border-[#3c3c3c] flex items-center px-4 gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentFrame(0)} className="px-2 py-1 rounded text-xs bg-[#3c3c3c] hover:bg-[#4a4a4a] transition">|◁</button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1 rounded text-xs font-bold transition ${isPlaying ? 'bg-red-500 text-white' : 'bg-[#3c3c3c] hover:bg-[#4a4a4a]'}`}
          >{isPlaying ? '■' : '▶'}</button>
        </div>
        <div className="w-px h-5 bg-[#3c3c3c]" />
        <div className="flex items-center gap-1 text-xs">
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="px-1.5 py-0.5 rounded bg-[#3c3c3c] hover:bg-[#4a4a4a]">−</button>
          <span className="text-gray-400 w-8 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} className="px-1.5 py-0.5 rounded bg-[#3c3c3c] hover:bg-[#4a4a4a]">+</button>
        </div>
        <ImportFileButton createNode={createNode} parentId="movies" accept=".mp4,.mov,.webm,.png,.jpeg,.jpg,.webp,.mp3,.wav" onImport={(file) => addClipFromFile(file.name)} />
        <button
          onClick={() => {
            const project = { clips, currentFrame, TIMELINE_DURATION, fps };
            saveToVFS(createNode, JSON.stringify(project, null, 2), `finalcut-${Date.now()}.fcproject`, 'movies');
          }}
          className="px-3 py-1 rounded text-xs bg-emerald-600 hover:bg-emerald-500 transition"
        >
          💾 Save
        </button>
        <div className="flex-1" />
        <span className="text-xs text-gray-400">{timeStr(currentFrame)} / {timeStr(TIMELINE_DURATION)}</span>
        <div className="w-px h-5 bg-[#3c3c3c]" />
        <button
          onClick={() => { setShowExport(true); setExportDone(false); setExportProgress(0); }}
          className="px-3 py-1 rounded text-xs bg-orange-600 hover:bg-orange-500 transition font-medium"
        >Export</button>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="w-48 bg-[#252525] border-r border-[#333] flex flex-col shrink-0">
          <div className="h-8 bg-[#2d2d2d] border-b border-[#333] flex items-center px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Media
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2" {...dropHandlers}>
            {mediaItems.length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-8">Drop files here</div>
            ) : (
              mediaItems.map(item => (
                <div key={item.name} className="flex items-center gap-2 px-2 py-1.5 rounded bg-[#1e1e1e] hover:bg-[#2a2a2a] cursor-pointer text-xs">
                  <span>{item.type === 'audio' ? '🎵' : item.type === 'image' ? '🖼️' : '🎬'}</span>
                  <span className="truncate">{item.name}</span>
                </div>
              ))
            )}
          </div>
          <div className="h-8 bg-[#2d2d2d] border-t border-[#333] flex items-center px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Effects
          </div>
          <div className="p-3 space-y-1">
            {mediaItems.length > 0 && ['Cross Dissolve', 'Fade', 'Blur', 'Chromatic'].map(effect => (
              <div key={effect} className="text-xs text-gray-400 hover:text-white cursor-pointer py-0.5 px-2 rounded hover:bg-[#2a2a2a]">{effect}</div>
            ))}
            {mediaItems.length === 0 && <div className="text-xs text-gray-500 text-center py-4">Import media first</div>}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 flex items-center justify-center bg-black p-4">
            <div className="relative rounded-lg overflow-hidden shadow-2xl border border-white/5" style={{ width: previewResolution.w, height: previewResolution.h }}>
              <canvas ref={canvasRef} width={previewResolution.w} height={previewResolution.h} className="absolute inset-0" />
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </div>
          </div>

          <div
            className={`flex flex-col shrink-0 bg-[#1e1e1e] border-t border-[#333]`}
            style={{ height: 120 * (1 + zoom * 0.2) }}
          >
            <div className="h-6 bg-[#2d2d2d] border-b border-[#333] flex items-center px-3 text-[10px] text-gray-500 gap-3 shrink-0">
              <span className="w-12">Video</span>
              <span className="w-12">Audio</span>
              <span className="w-12">Titles</span>
            </div>
            <div className="flex-1 relative overflow-x-auto">
              <div className="relative h-full" style={{ width: TIMELINE_DURATION * 5 * zoom }}>
                {[...Array(3)].map((_, trackIdx) => (
                  <div key={trackIdx} className="h-8 border-b border-[#2a2a2a] relative" style={{ backgroundColor: trackIdx % 2 === 0 ? '#1e1e1e' : '#222' }}>
                    {clips.filter(c => c.track === trackIdx).map(clip => (
                      <div
                        key={clip.id}
                        onClick={() => setSelectedClip(clip.id)}
                        className={`absolute top-0.5 bottom-0.5 rounded flex items-center px-2 cursor-pointer text-[10px] font-medium truncate border-l-2 transition ${selectedClip === clip.id ? 'ring-1 ring-white' : ''}`}
                        style={{
                          left: clip.start * 5 * zoom,
                          width: clip.duration * 5 * zoom,
                          backgroundColor: clip.color + '44',
                          borderLeftColor: clip.color,
                        }}
                      >
                        {clip.name}
                      </div>
                    ))}
                  </div>
                ))}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 shadow-[0_0_6px_rgba(255,50,50,0.8)] z-10 pointer-events-none"
                  style={{ left: currentFrame * 5 * zoom }}
                />
              </div>
            </div>
            <div className="h-5 bg-[#252525] border-t border-[#333] flex items-center relative shrink-0">
              <input
                type="range"
                min={0}
                max={TIMELINE_DURATION - 1}
                value={currentFrame}
                onChange={(e) => { setCurrentFrame(parseInt(e.target.value)); setIsPlaying(false); }}
                className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex-1 mx-2 h-1 bg-[#333] rounded relative">
                <div className="h-full bg-blue-500 rounded" style={{ width: `${(currentFrame / TIMELINE_DURATION) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => !isExporting && setShowExport(false)}>
          <div className="bg-[#252525] rounded-2xl border border-[#444] shadow-2xl p-6 w-96" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Export</h2>

            <div className="space-y-3 mb-6">
              {EXPORT_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => setExportPreset(preset)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition ${exportPreset.label === preset.label ? 'bg-blue-600/30 border border-blue-500' : 'bg-[#1e1e1e] border border-[#333] hover:border-[#555]'}`}
                >
                  <span className="font-medium">{preset.label}</span>
                  <span className="text-gray-400">{preset.resolution}</span>
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
                <p className="text-xs text-gray-400 mb-3">{exportPreset.resolution} at 30fps</p>
              </div>
            )}

            <div className="flex gap-2">
              {!isExporting && !exportDone && (
                <>
                  <button onClick={handleExport} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-medium transition">Export</button>
                  <button onClick={() => setShowExport(false)} className="flex-1 py-2.5 rounded-xl bg-[#3c3c3c] hover:bg-[#4a4a4a] text-sm transition">Cancel</button>
                </>
              )}
              {isExporting && (
                <button disabled className="flex-1 py-2.5 rounded-xl bg-blue-600/50 text-sm cursor-not-allowed">Exporting...</button>
              )}
              {exportDone && (
                <>
                  <button onClick={handleDownloadMock} className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-medium transition">Download</button>
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
