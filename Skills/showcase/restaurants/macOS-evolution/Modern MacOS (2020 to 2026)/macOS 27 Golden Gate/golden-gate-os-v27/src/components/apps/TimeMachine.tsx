import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock01Icon } from 'hugeicons-react';

interface Snapshot {
  id: string;
  title: string;
  date: string;
  version: string;
  wallpaper: string;
  dockAppsCount: number;
}

const snapshots: Snapshot[] = [
  {
    id: 's1',
    title: 'macOS Golden Gate (Current)',
    date: 'Today, 10:45 AM',
    version: 'Version 27.0.0',
    wallpaper: '/wallpapers/golden-gate-light.webp',
    dockAppsCount: 22,
  },
  {
    id: 's2',
    title: 'macOS 26 Tahoe Build',
    date: 'Yesterday, 04:30 PM',
    version: 'Version 26.2.1',
    wallpaper: '/wallpapers/golden-gate-dark.webp',
    dockAppsCount: 18,
  },
  {
    id: 's3',
    title: 'macOS 15 Sequoia Architecture',
    date: 'Jul 24, 2026',
    version: 'Version 15.4.0',
    wallpaper: '/wallpapers/golden-gate-light.webp',
    dockAppsCount: 15,
  },
];

export const TimeMachine: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    let count = 0;

    // Starfield particles
    const stars = Array.from({ length: 120 }).map(() => ({
      x: (Math.random() - 0.5) * canvas.width * 2,
      y: (Math.random() - 0.5) * canvas.height * 2,
      z: Math.random() * canvas.width,
    }));

    const render = () => {
      count++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Starfield animation
      for (const s of stars) {
        s.z -= 2;
        if (s.z <= 0) s.z = canvas.width;

        const k = 200 / s.z;
        const px = s.x * k + cx;
        const py = s.y * k + cy;

        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          const size = Math.max(0.5, (1 - s.z / canvas.width) * 2.5);
          const alpha = (1 - s.z / canvas.width) * 0.8;
          ctx.fillStyle = `rgba(147, 197, 253, ${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      frameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(frameId);
  }, []);

  const currentSnap = snapshots[selectedIdx];

  return (
    <div className="h-full w-full bg-slate-950 text-white flex flex-col relative overflow-hidden select-none font-sans">
      {/* Background Starfield Canvas */}
      <canvas ref={canvasRef} width={800} height={500} className="absolute inset-0 w-full h-full" />

      {/* Header Bar */}
      <div className="relative z-20 h-14 border-b border-white/10 px-6 flex items-center justify-between bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Clock01Icon size={24} className="text-purple-400" />
          <span className="font-bold text-sm tracking-tight">Time Machine Depth-of-Field Viewer</span>
        </div>
        <span className="text-xs text-white/50 font-mono">3 Snapshots Found</span>
      </div>

      {/* Main Preview Area */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSnap.id}
            initial={{ opacity: 0, scale: 0.85, zIndex: 0 }}
            animate={{ opacity: 1, scale: 1, zIndex: 10 }}
            exit={{ opacity: 0, scale: 0.85, zIndex: 0 }}
            transition={{ duration: 0.3 }}
            className="w-[540px] h-[310px] rounded-2xl border border-white/20 shadow-2xl overflow-hidden relative bg-slate-900 flex flex-col justify-between p-6"
            style={{
              backgroundImage: `url(${currentSnap.wallpaper})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

            <div className="relative z-10 flex justify-between items-start">
              <div>
                <span className="px-3 py-1 bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                  {currentSnap.version}
                </span>
                <h3 className="text-xl font-black mt-2 text-white drop-shadow-md">{currentSnap.title}</h3>
                <p className="text-xs text-white/70 font-medium">{currentSnap.date}</p>
              </div>
            </div>

            {/* Simulated Desktop Preview HUD */}
            <div className="relative z-10 bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10 flex justify-between items-center text-xs">
              <span className="text-white/80 font-medium">Snapshot Status: Valid & Verified</span>
              <span className="text-purple-400 font-bold">{currentSnap.dockAppsCount} Dock Items</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Timeline Stack Navigation */}
        <div className="absolute right-6 top-12 bottom-12 flex flex-col justify-center gap-3 z-20">
          {snapshots.map((snap, idx) => (
            <button
              key={snap.id}
              onClick={() => setSelectedIdx(idx)}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all text-right ${selectedIdx === idx ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/40 scale-105' : 'bg-black/60 text-white/60 border-white/10 hover:bg-black/80'}`}
            >
              <div>{snap.date}</div>
              <div className="text-[10px] font-normal text-white/40">{snap.version}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
