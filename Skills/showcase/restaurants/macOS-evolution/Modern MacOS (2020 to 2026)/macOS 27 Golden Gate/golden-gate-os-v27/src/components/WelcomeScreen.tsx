import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useSystem } from '../contexts/SystemContext';
import { WallpaperEngine } from './desktop/WallpaperEngine';

const WELCOME_KEY = 'golden_gate_v27_welcome_seen';

/**
 * Single-page welcome, shown once after Setup Assistant finishes.
 *
 * There is no paging and no button: the whole surface is a drag target. Slide
 * it far enough and it releases into the desktop, the way an iOS onboarding
 * card dismisses. Keyboard and a click affordance are provided so the gesture
 * is never the only way through.
 */

const HIGHLIGHTS = [
  {
    title: 'Twenty-five apps in the dock',
    body: 'Every icon opens something real. The calculator computes, the terminal runs, chess is playable.',
  },
  {
    title: 'Hardware telemetry, honestly',
    body: 'The battery, memory and storage readouts come from the browser device APIs. They are not mocked.',
  },
  {
    title: 'Windows that behave',
    body: 'Drag one to a screen edge to tile it. Drop a second on the other edge for a genuine split.',
  },
];

export const WelcomeScreen: React.FC = () => {
  const { setBootState, systemState, updateSystemState } = useSystem();
  const x = useMotionValue(0);
  const [dismissed, setDismissed] = useState(false);

  const opacity = useTransform(x, [-420, -180, 0], [0.05, 0.5, 1]);
  const scale = useTransform(x, [-420, 0], [0.94, 1]);
  const hintOpacity = useTransform(x, [-60, 0], [0, 1]);

  const firstName =
    systemState.users[0]?.fullName?.split(' ')[0] || 'there';

  const finish = React.useCallback(() => {
    if (dismissed) return;
    setDismissed(true);
    try {
      localStorage.setItem(WELCOME_KEY, 'true');
    } catch {
      /* private browsing: the flag simply will not survive a reload */
    }
    updateSystemState({ setup_complete: true });
    setBootState('desktop');
  }, [dismissed, setBootState, updateSystemState]);

  // Slide home, then hand over to the desktop.
  const release = () => {
    animate(x, -520, { type: 'spring', stiffness: 220, damping: 30 });
    setTimeout(finish, 180);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        release();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [release]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black select-none">
      <WallpaperEngine
        url={systemState.wallpaperUrl}
        type={systemState.wallpaperType}
        fallbackImage="/wallpapers/golden-gate-dark.webp"
      />

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        style={{ x, opacity, scale }}
        onDragEnd={(_, info) => {
          // Either a decisive flick or a long slow drag releases it.
          if (info.offset.x < -170 || info.velocity.x < -620) release();
          else animate(x, 0, { type: 'spring', stiffness: 320, damping: 32 });
        }}
        className="relative z-10 h-full w-full flex flex-col cursor-grab active:cursor-grabbing"
      >
        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="text-[11px] uppercase tracking-[0.34em] text-white/55"
          >
            Welcome
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="mt-4 text-[clamp(2.6rem,7vw,5rem)] font-black tracking-tight leading-[0.95] text-white drop-shadow-2xl"
          >
            Hello, {firstName}.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.7 }}
            className="mt-4 max-w-xl text-base sm:text-lg text-white/70"
          >
            Golden Gate OS 27 is finished and ready. Three things worth knowing
            before you start.
          </motion.p>

          <div className="mt-10 grid gap-3 sm:grid-cols-3 w-full max-w-4xl">
            {HIGHLIGHTS.map((h, i) => (
              <motion.article
                key={h.title}
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.12, duration: 0.6 }}
                className="rounded-2xl p-5 text-left bg-white/10 backdrop-blur-2xl backdrop-saturate-200 border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_16px_50px_-16px_rgba(0,0,0,0.7)]"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h2 className="mt-1.5 text-sm font-bold leading-snug text-white">
                  {h.title}
                </h2>
                <p className="mt-1.5 text-[12px] leading-relaxed text-white/60">
                  {h.body}
                </p>
              </motion.article>
            ))}
          </div>
        </div>

        {/* Slide affordance */}
        <div className="flex flex-col items-center pb-12 gap-3">
          <motion.p
            style={{ opacity: hintOpacity }}
            className="text-[11px] uppercase tracking-[0.24em] text-white/40"
          >
            Slide to continue
          </motion.p>
          <motion.div
            animate={{ x: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 1.9, ease: 'easeInOut' }}
            className="flex items-center gap-1.5 text-white/50"
          >
            <svg width="26" height="12" viewBox="0 0 26 12" fill="none" aria-hidden>
              <path
                d="M20 2 12 6l8 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>

          {/* Keyboard / click fallback, deliberately understated */}
          <button
            onClick={finish}
            className="mt-1 text-[11px] text-white/25 hover:text-white/60 transition-colors"
          >
            or press Return
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/** True once the visitor has slid past this screen. */
export const hasSeenWelcome = (): boolean => {
  try {
    return localStorage.getItem(WELCOME_KEY) === 'true';
  } catch {
    return false;
  }
};
