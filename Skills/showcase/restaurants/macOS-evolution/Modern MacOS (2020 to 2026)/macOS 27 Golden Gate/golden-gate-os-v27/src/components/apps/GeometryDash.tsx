import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const GeometryDash: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [attempts, setAttempts] = useState(1);
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'dead' | 'won'>('playing');

  const levelRef = useRef(level);
  levelRef.current = level;
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // Level obstacle maps per level
  const levelsData = [
    // Level 1: Stereo Madness Style
    {
      length: 2800,
      obstacles: [
        { x: 400, type: 'spike' },
        { x: 650, type: 'spike' },
        { x: 700, type: 'spike' },
        { x: 950, type: 'block', height: 40 },
        { x: 1200, type: 'spike' },
        { x: 1450, type: 'double_spike' },
        { x: 1750, type: 'block', height: 60 },
        { x: 2100, type: 'spike' },
        { x: 2400, type: 'double_spike' },
      ],
    },
    // Level 2: Back On Track Style (faster pace, more blocks)
    {
      length: 3200,
      obstacles: [
        { x: 350, type: 'spike' },
        { x: 550, type: 'block', height: 40 },
        { x: 800, type: 'double_spike' },
        { x: 1100, type: 'block', height: 50 },
        { x: 1400, type: 'spike' },
        { x: 1650, type: 'block', height: 60 },
        { x: 1950, type: 'double_spike' },
        { x: 2300, type: 'block', height: 40 },
        { x: 2700, type: 'spike' },
        { x: 2950, type: 'double_spike' },
      ],
    },
    // Level 3: Polargeist Style (high challenge)
    {
      length: 3600,
      obstacles: [
        { x: 300, type: 'double_spike' },
        { x: 600, type: 'block', height: 50 },
        { x: 850, type: 'spike' },
        { x: 1100, type: 'double_spike' },
        { x: 1450, type: 'block', height: 65 },
        { x: 1800, type: 'spike' },
        { x: 2150, type: 'double_spike' },
        { x: 2500, type: 'block', height: 50 },
        { x: 2900, type: 'double_spike' },
        { x: 3300, type: 'spike' },
      ],
    },
  ];

  const restartCurrentLevel = () => {
    setGameState('playing');
  };

  const nextLevel = () => {
    setLevel((prev) => (prev >= levelsData.length ? 1 : prev + 1));
    setGameState('playing');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let frameCount = 0;

    const player = {
      x: 80,
      y: 200,
      width: 32,
      height: 32,
      vy: 0,
      rotation: 0,
      grounded: false,
    };

    const gravity = 0.65;
    const jumpStrength = -11.5;
    const currentLevelIdx = (levelRef.current - 1) % levelsData.length;
    const currentLevelData = levelsData[currentLevelIdx];
    const speed = 6 + currentLevelIdx * 1;
    let cameraX = 0;

    const groundY = canvas.height - 70;

    const handleJump = () => {
      if (player.grounded && gameStateRef.current === 'playing') {
        player.vy = jumpStrength;
        player.grounded = false;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      }
    };

    const handleMouseDown = () => {
      handleJump();
    };

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('mousedown', handleMouseDown);

    const loop = () => {
      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background Pulsing Gradient
      const hue = (frameCount * 0.5 + currentLevelIdx * 120) % 360;
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, `hsl(${hue}, 75%, 15%)`);
      bgGrad.addColorStop(1, `hsl(${hue}, 85%, 5%)`);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (gameStateRef.current === 'playing') {
        // Scroll camera
        cameraX += speed;
        const currentProgress = Math.min(100, Math.floor((cameraX / currentLevelData.length) * 100));
        setProgress(currentProgress);

        if (currentProgress >= 100) {
          setGameState('won');
        }

        // Physics
        player.vy += gravity;
        player.y += player.vy;

        if (player.y + player.height >= groundY) {
          player.y = groundY - player.height;
          player.vy = 0;
          player.grounded = true;
          player.rotation = Math.round(player.rotation / (Math.PI / 2)) * (Math.PI / 2);
        } else {
          player.rotation += 0.15;
        }
      }

      // Draw Ground Grid
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
      ctx.strokeStyle = `hsl(${hue}, 90%, 50%)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(canvas.width, groundY);
      ctx.stroke();

      // Draw Ground Grid Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      const gridOffset = cameraX % 40;
      for (let x = -gridOffset; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw Player Cube
      ctx.save();
      ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
      ctx.rotate(player.rotation);

      ctx.fillStyle = '#facc15';
      ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);

      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-player.width / 4, -player.height / 4, player.width / 2, player.height / 2);

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-player.width / 2, -player.height / 2, player.width, player.height);
      ctx.restore();

      // Render & Check Collision for Obstacles
      if (gameStateRef.current === 'playing') {
        for (const obs of currentLevelData.obstacles) {
          const screenX = obs.x - cameraX + player.x;

          if (obs.type === 'spike' || obs.type === 'double_spike') {
            const spikeWidth = obs.type === 'double_spike' ? 60 : 30;
            ctx.fillStyle = '#ef4444';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(screenX, groundY);
            ctx.lineTo(screenX + spikeWidth / 2, groundY - 36);
            ctx.lineTo(screenX + spikeWidth, groundY);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Collision check
            if (
              player.x + player.width > screenX + 6 &&
              player.x < screenX + spikeWidth - 6 &&
              player.y + player.height > groundY - 30
            ) {
              setGameState('dead');
              setAttempts((prev) => prev + 1);
              break;
            }
          } else if (obs.type === 'block') {
            const bHeight = obs.height || 40;
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(screenX, groundY - bHeight, 40, bHeight);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenX, groundY - bHeight, 40, bHeight);

            // Landing on block
            if (
              player.x + player.width > screenX &&
              player.x < screenX + 40 &&
              player.y + player.height >= groundY - bHeight &&
              player.y + player.height <= groundY - bHeight + 12 &&
              player.vy >= 0
            ) {
              player.y = groundY - bHeight - player.height;
              player.vy = 0;
              player.grounded = true;
            } else if (
              player.x + player.width > screenX + 4 &&
              player.x < screenX + 36 &&
              player.y + player.height > groundY - bHeight + 10
            ) {
              setGameState('dead');
              setAttempts((prev) => prev + 1);
              break;
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('mousedown', handleMouseDown);
    };
  }, [gameState, level]);

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden select-none font-sans">
      {/* HUD Header */}
      <div className="absolute top-4 left-6 right-6 flex justify-between items-center z-10 text-white font-bold drop-shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-white/60">Level</span>
            <span className="text-lg font-black text-cyan-400">{level}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-white/60">Attempt</span>
            <span className="text-lg font-black text-yellow-400">{attempts}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-white/60">Progress</span>
          <span className="text-lg font-black text-green-400">{progress}%</span>
        </div>
      </div>

      {/* Main Game Canvas */}
      <canvas ref={canvasRef} width={750} height={380} className="rounded-xl shadow-2xl border border-white/10" />

      {/* Win / Lose Modal Overlays */}
      <AnimatePresence>
        {gameState === 'won' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-30"
          >
            <div className="bg-slate-900/90 border border-green-500/40 p-8 rounded-3xl text-center shadow-2xl flex flex-col items-center gap-5 max-w-sm">
              <div className="text-5xl">🏆</div>
              <h2 className="text-3xl font-black text-green-400 tracking-tight">YOU WIN!</h2>
              <p className="text-xs text-slate-300">Level {level} Complete (100%)!</p>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={restartCurrentLevel}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors border border-white/10"
                >
                  Play Again
                </button>
                <button
                  onClick={nextLevel}
                  className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-slate-950 text-xs font-black transition-transform active:scale-95 shadow-lg shadow-green-500/30"
                >
                  Next Level
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'dead' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-30"
          >
            <div className="bg-slate-900/90 border border-red-500/40 p-8 rounded-3xl text-center shadow-2xl flex flex-col items-center gap-5 max-w-sm">
              <div className="text-5xl">💥</div>
              <h2 className="text-3xl font-black text-red-500 tracking-tight">YOU LOSE</h2>
              <p className="text-xs text-slate-300">You crashed at {progress}%!</p>
              <button
                onClick={restartCurrentLevel}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black transition-transform active:scale-95 shadow-lg shadow-red-600/30 uppercase tracking-wider"
              >
                Play Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Instructions */}
      <div className="absolute bottom-3 text-center text-xs text-white/50 font-medium">
        Press <kbd className="px-2 py-0.5 bg-white/10 rounded border border-white/20 text-white font-mono">SPACE</kbd> or <kbd className="px-2 py-0.5 bg-white/10 rounded border border-white/20 text-white font-mono">CLICK</kbd> to Jump
      </div>
    </div>
  );
};
