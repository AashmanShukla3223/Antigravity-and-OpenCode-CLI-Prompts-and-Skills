import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';

interface FallingAsset {
  id: string;
  src: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vr: number;
  size: number;
}

const ASSET_POOL = [
  '/icons/finder.png', '/icons/safari.png', '/icons/messages.png', '/icons/music.png',
  '/icons/photos.png', '/icons/appstore.png', '/icons/notes.png', '/icons/settings.png',
  '/icons/terminal.png', '/icons/calculator.png', '/icons/calendar.png', '/icons/camera.png',
  '/assets/mimes/application-pdf.png', '/assets/mimes/application-x-executable.png',
  '/assets/mimes/image-png.png', '/assets/mimes/text-x-javascript.png',
  '/folder icons/blue/folder.png', '/folder icons/green/folder.png', '/folder icons/nord/folder.png'
];

export const CrazyErrors: React.FC = () => {
  const { closeApp } = useSystem();
  const [stage, setStage] = useState<'stage1' | 'stage2' | 'chaos'>('stage1');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [assets, setAssets] = useState<FallingAsset[]>([]);
  const requestRef = useRef<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const playSound = (name: string) => {
    const audio = new Audio(`/sounds/${name}.mp3`);
    audio.play().catch(e => console.warn('Audio play failed', e));
  };

  useEffect(() => {
    playSound('Blow');
  }, []);

  const handleStage1Confirm = () => {
    setStage('stage2');
    playSound('Glass');
  };

  const handleStage2Confirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'tahoe2026') {
      setStage('chaos');
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  const startChaos = () => {
    const spawnAsset = () => {
      const id = Math.random().toString(36).substr(2, 9);
      const src = ASSET_POOL[Math.floor(Math.random() * ASSET_POOL.length)];
      const x = Math.random() * window.innerWidth;
      const size = 40 + Math.random() * 60;
      
      return {
        id, src, x, y: -100,
        vx: (Math.random() - 0.5) * 10,
        vy: 2 + Math.random() * 5,
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 20,
        size
      };
    };

    const update = () => {
      setAssets(prev => {
        const next = prev.map(a => ({
          ...a,
          x: a.x + a.vx,
          y: a.y + a.vy,
          vy: a.vy + 0.2, // gravity
          rotation: a.rotation + a.vr
        })).filter(a => a.y < window.innerHeight + 100);

        if (next.length < 50 && Math.random() > 0.7) {
          next.push(spawnAsset());
        }
        return next;
      });
      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    if (stage === 'chaos') {
      startChaos();
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [stage]);

  return (
    <div className="h-full w-full relative flex items-center justify-center overflow-hidden pointer-events-none" ref={containerRef}>
      <AnimatePresence>
        {stage === 'stage1' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[320px] bg-white/10 backdrop-blur-[40px] border border-white/20 rounded-[2rem] p-6 shadow-2xl flex flex-col items-center text-center gap-6 pointer-events-auto z-[300]"
          >
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center">
              <img src="/assets/mimes/application-x-executable.png" className="w-10 h-10 object-contain" alt="Warning" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">System Instability</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                This application will simulate system instability. Do you wish to proceed?
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => closeApp('crazyerrors')}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/10"
              >
                Cancel
              </button>
              <button 
                onClick={handleStage1Confirm}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-500/20"
              >
                Yes
              </button>
            </div>
          </motion.div>
        )}

        {stage === 'stage2' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[320px] bg-white/10 backdrop-blur-[40px] border border-white/20 rounded-[2rem] p-8 shadow-2xl flex flex-col items-center text-center gap-6 pointer-events-auto z-[300]"
          >
            <div className="w-20 h-20 rounded-full border-2 border-white/20 p-1">
               <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center text-3xl">👤</div>
            </div>
            <div className="space-y-1">
              <h3 className="text-md font-bold text-white">Administrator</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Secure Gate</p>
            </div>
            <form onSubmit={handleStage2Confirm} className="w-full space-y-4">
              <motion.input 
                animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full h-10 bg-black/20 border border-white/10 rounded-xl px-4 text-white text-center focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <div className="flex gap-3">
                 <button 
                   type="button"
                   onClick={() => closeApp('crazyerrors')}
                   className="flex-1 h-10 text-white/40 text-xs font-bold hover:text-white transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit"
                   className="flex-1 h-10 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10"
                 >
                   Authenticate
                 </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {stage === 'chaos' && (
        <div className="absolute inset-0 z-[500] pointer-events-none">
          {assets.map(asset => (
            <img 
              key={asset.id}
              src={asset.src}
              style={{
                position: 'absolute',
                left: asset.x,
                top: asset.y,
                width: asset.size,
                height: asset.size,
                transform: `rotate(${asset.rotation}deg)`,
                objectFit: 'contain'
              }}
              alt="falling error"
            />
          ))}
        </div>
      )}
    </div>
  );
};
