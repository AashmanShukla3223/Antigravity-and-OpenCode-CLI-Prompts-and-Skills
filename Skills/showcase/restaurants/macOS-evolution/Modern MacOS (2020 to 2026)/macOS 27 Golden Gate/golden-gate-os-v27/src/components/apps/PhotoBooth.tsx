import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { saveToVFS } from '../../utils/vfs-ops';

type ResolutionKey = '480p' | '720p' | '1080p' | '2K' | '4K';

const RESOLUTIONS: Record<ResolutionKey, { width: number; height: number }> = {
  '480p': { width: 640, height: 480 },
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '2K': { width: 2560, height: 1440 },
  '4K': { width: 3840, height: 2160 },
};

const FILTERS: { name: string; style: string }[] = [
  { name: 'Normal', style: 'none' },
  { name: 'Grayscale', style: 'grayscale(100%)' },
  { name: 'Sepia', style: 'sepia(80%)' },
  { name: 'Warm', style: 'saturate(150%) hue-rotate(-15deg) brightness(110%)' },
  { name: 'Cool', style: 'saturate(120%) hue-rotate(30deg) brightness(105%)' },
  { name: 'Vintage', style: 'sepia(50%) contrast(80%) brightness(90%)' },
  { name: 'Dramatic', style: 'contrast(150%) brightness(80%) saturate(110%)' },
  { name: 'Vivid', style: 'saturate(200%) contrast(110%)' },
];

function beep(freq: number, duration: number, vol: number) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
    setTimeout(() => ctx.close(), duration * 1000 + 100);
  } catch {}
}

function shutterSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
    setTimeout(() => ctx.close(), 400);
  } catch {}
}

export const PhotoBooth: React.FC = () => {
  const { createNode } = useFileSystem();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolution, setResolution] = useState<ResolutionKey>('720p');
  const [currentFilter, setCurrentFilter] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showResolutions, setShowResolutions] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let active = true;
    const res = RESOLUTIONS[resolution];

    const start = async () => {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }
        const s = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: res.width }, height: { ideal: res.height } },
          audio: true,
        });
        if (!active) {
          s.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = s;
        setStream(s);
        setError(null);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (e) {
        if (active) {
          setError('Camera access denied or not available');
          setStream(null);
        }
      }
    };

    start();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [resolution]);

  const doCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const MAX_W = 1920;
    const MAX_H = 1080;
    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;
    let dw = vw;
    let dh = vh;
    if (dw > MAX_W || dh > MAX_H) {
      const scale = Math.min(MAX_W / dw, MAX_H / dh);
      dw = Math.round(dw * scale);
      dh = Math.round(dh * scale);
    }
    canvas.width = dw;
    canvas.height = dh;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.filter = FILTERS[currentFilter].style;
    ctx.drawImage(video, 0, 0, dw, dh);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhotos(prev => [dataUrl, ...prev]);
    const ts = new Date();
    const filename = `Photo Booth ${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, '0')}-${String(ts.getDate()).padStart(2, '0')} ${String(ts.getHours()).padStart(2, '0')}-${String(ts.getMinutes()).padStart(2, '0')}-${String(ts.getSeconds()).padStart(2, '0')}.jpg`;
    saveToVFS(createNode, dataUrl, filename, 'pictures');
  }, [currentFilter, createNode]);

  const capturePhoto = useCallback(() => {
    if (countdownRef.current) return;
    setCountdown(3);
    beep(880, 0.15, 0.15);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null) return null;
        const next = prev - 1;
        if (next <= 0) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          shutterSound();
          setTimeout(() => doCapture(), 200);
          return null;
        }
        beep(880, 0.15, 0.15);
        return next;
      });
    }, 1000);
  }, [doCapture]);

  const doStartRecording = useCallback(() => {
    if (!stream) return;
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const ts = new Date();
        const filename = `Photo Booth Recording ${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, '0')}-${String(ts.getDate()).padStart(2, '0')} ${String(ts.getHours()).padStart(2, '0')}-${String(ts.getMinutes()).padStart(2, '0')}-${String(ts.getSeconds()).padStart(2, '0')}.webm`;
        saveToVFS(createNode, dataUrl, filename, 'pictures');
      };
      reader.readAsDataURL(blob);
      setRecordedChunks(prev => [...prev, ...chunks]);
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    };
    recorder.start(100);
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(t => t + 1);
    }, 1000);
  }, [stream, createNode]);

  const startRecording = useCallback(() => {
    if (countdownRef.current) return;
    setCountdown(3);
    beep(880, 0.15, 0.15);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null) return null;
        const next = prev - 1;
        if (next <= 0) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          doStartRecording();
          return null;
        }
        beep(880, 0.15, 0.15);
        return next;
      });
    }, 1000);
  }, [doStartRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const downloadVideo = useCallback(() => {
    if (recordedChunks.length === 0) return;
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `photo-booth-recording-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  }, [recordedChunks]);

  const downloadPhoto = useCallback((dataUrl: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `photo-booth-${Date.now()}.png`;
    a.click();
  }, []);

  const deletePhoto = useCallback((index: number) => {
    setCapturedPhotos(prev => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="h-full w-full bg-zinc-900 text-white overflow-y-auto">
      <div className="p-4 md:p-6">
        <h1 className="text-xl font-bold mb-4">Photo Booth</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="relative bg-black rounded-2xl overflow-hidden border border-white/10 aspect-video flex items-center justify-center">
              {!stream && error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/40 z-10">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span className="text-sm">{error}</span>
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
                style={{ filter: FILTERS[currentFilter].style }}
              />

              {isRecording && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600/80 px-3 py-1 rounded-full text-xs font-bold">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  REC {recordingTime}s
                </div>
              )}
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="text-8xl font-black text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.5)] animate-pulse">
                    {countdown}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              <button onClick={capturePhoto} className="px-5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Capture
              </button>

              {!isRecording ? (
                <button onClick={startRecording} className="px-5 py-2 bg-red-600/60 hover:bg-red-600/80 rounded-xl text-sm font-medium transition flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  Record
                </button>
              ) : (
                <button onClick={stopRecording} className="px-5 py-2 bg-red-600 rounded-xl text-sm font-medium transition flex items-center gap-2 animate-pulse">
                  <div className="w-2.5 h-2.5 bg-white rounded-sm" />
                  Stop
                </button>
              )}

              <div className="relative">
                <button onClick={() => setShowFilters(!showFilters)} className="px-5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition">
                  Filters • {FILTERS[currentFilter].name}
                </button>
                {showFilters && (
                  <div className="absolute top-full mt-2 left-0 bg-zinc-800 border border-white/10 rounded-xl p-3 flex gap-2 flex-wrap z-50 min-w-[200px] shadow-2xl">
                    {FILTERS.map((f, i) => (
                      <button
                        key={f.name}
                        onClick={() => { setCurrentFilter(i); setShowFilters(false); }}
                        className={`px-3 py-1.5 rounded-lg text-xs transition ${i === currentFilter ? 'bg-blue-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button onClick={() => setShowResolutions(!showResolutions)} className="px-5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition">
                  {resolution}
                </button>
                {showResolutions && (
                  <div className="absolute top-full mt-2 left-0 bg-zinc-800 border border-white/10 rounded-xl p-3 flex flex-col gap-1 z-50 shadow-2xl">
                    {(Object.keys(RESOLUTIONS) as ResolutionKey[]).map(r => (
                      <button
                        key={r}
                        onClick={() => { setResolution(r); setShowResolutions(false); }}
                        className={`px-4 py-1.5 rounded-lg text-xs text-left transition ${r === resolution ? 'bg-blue-600 text-white' : 'hover:bg-white/10'}`}
                      >
                        {r} ({RESOLUTIONS[r].width}×{RESOLUTIONS[r].height})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {recordedChunks.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">{recordedChunks.length} recording(s) available</span>
                <button onClick={downloadVideo} className="px-4 py-1.5 bg-green-600/60 hover:bg-green-600/80 rounded-xl text-xs transition">
                  Download Video
                </button>
                <button onClick={() => setRecordedChunks([])} className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs transition">
                  Clear
                </button>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-3">
              Captured Photos ({capturedPhotos.length})
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {capturedPhotos.length === 0 && (
                <div className="col-span-2 text-white/20 text-xs text-center py-8">
                  No photos yet
                </div>
              )}
              {capturedPhotos.map((photo, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-square bg-black">
                  <img src={photo} alt={`Capture ${i + 1}`} className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button onClick={() => downloadPhoto(photo)} className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg transition" title="Download">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>
                    <button onClick={() => deletePhoto(i)} className="p-1.5 bg-red-500/40 hover:bg-red-500/60 rounded-lg transition" title="Delete">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};
