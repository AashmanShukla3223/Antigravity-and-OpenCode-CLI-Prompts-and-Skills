import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BulbIcon, Tick01Icon, ArrowRight01Icon, RefreshIcon } from 'hugeicons-react';
import { useSystem } from '../../contexts/SystemContext';

type Tip = {
  id: string;
  title: string;
  body: string;
  /** Apps to highlight for this tip; rendered as chips at the foot. */
  related: string[];
};

/**
 * Content is written for this simulator, not copied from Apple — every tip
 * describes a control or app that actually exists in Golden Gate OS 27.
 */
const TIPS: Tip[] = [
  {
    id: 'window-genie',
    title: 'Close a window with the Genie effect',
    body: 'Hover the red close button and the window is drawn down into the dock. Drag it instead of clicking to send it somewhere more useful — it shrinks into whatever icon it came from.',
    related: ['finder', 'safari'],
  },
  {
    id: 'stage-manager',
    title: 'Group windows with Stage Manager',
    body: 'Stage Manager keeps the windows you are not using off the desktop and reduces them to a strip along the left edge. Switch to another app and its window returns exactly where you left it.',
    related: ['settings'],
  },
  {
    id: 'battery-telemetry',
    title: 'Read your real battery in the menu bar',
    body: 'The battery percentage in the menu bar is not simulated. It comes from the Battery Status API, so on a laptop it reflects that machine. The same applies to the memory and storage figures in About This Mac.',
    related: ['activitymonitor', 'settings'],
  },
  {
    id: 'spotlight',
    title: 'Open anything from Spotlight',
    body: 'Press Command and Space, then type. Spotlight searches applications, files and can do arithmetic inline — type 12*7 and it opens a calculator showing 84.',
    related: ['calculator'],
  },
  {
    id: 'split-view',
    title: 'Put two apps side by side',
    body: 'Drag one window to the left edge of the screen and let go to tile it. Drag a second to the right edge and you have both halves of the screen working at once.',
    related: ['notes', 'safari'],
  },
  {
    id: 'dark-mode',
    title: 'Appearance follows the clock',
    body: 'Set Appearance to Auto in System Settings and the whole interface switches between light and dark at your local sunset. Every app has a dark variant that switches with it.',
    related: ['settings'],
  },
  {
    id: 'missions-control',
    title: 'See every open window at once',
    body: 'Spread your fingers on the trackpad or press F3 for a top-down view of all your windows. Click any one to bring it forward.',
    related: [],
  },
  {
    id: 'full-screen',
    title: 'Go full screen without losing the menu bar',
    body: 'A window with the green button maximises to fill the screen but keeps the menu bar. Option-click the same button for true full screen, which hides it — slide to the top edge to bring it back.',
    related: [],
  },
  {
    id: 'quick-look',
    title: 'Peek at a file without opening it',
    body: 'Select a file in Finder and press Space. Quick Look shows the contents in place. Press Space again to close it.',
    related: ['finder', 'photos'],
  },
  {
    id: 'persist-state',
    title: 'Your work survives a reload',
    body: 'Notes, Reminders, Stickies, open windows and system settings are all written to localStorage as you use them. Reload the browser and the desktop comes back the way you left it.',
    related: ['notes', 'reminders', 'stickies'],
  },
];

const STORAGE_KEY = 'golden_gate_v27_tips_read';

export const Tips: React.FC = () => {
  const { launchApp } = useSystem();
  const [selected, setSelected] = useState<string>(TIPS[0].id);
  const [read, setRead] = useState<string[]>([]);

  // Read state from disk once on mount, so a reload keeps your progress.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setRead(JSON.parse(raw));
    } catch {
      /* corrupted or unavailable storage is not worth failing the app over */
    }
  }, []);

  const persist = (next: string[]) => {
    setRead(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* private browsing — the session still works, it just won't persist */
    }
  };

  const tip = useMemo(
    () => TIPS.find((t) => t.id === selected) ?? TIPS[0],
    [selected]
  );

  const isRead = (id: string) => read.includes(id);
  const progress = Math.round((read.length / TIPS.length) * 100);

  const nextTip = () => {
    const i = TIPS.findIndex((t) => t.id === tip.id);
    const next = TIPS[(i + 1) % TIPS.length];
    setSelected(next.id);
    persist(read.includes(next.id) ? read : [...read, next.id]);
  };

  const reset = () => {
    persist([]);
    setSelected(TIPS[0].id);
  };

  return (
    <div className="flex h-full w-full bg-[#f5f5f7] dark:bg-[#1c1c1e] text-black dark:text-white font-sans overflow-hidden">
      {/* Sidebar: the list of tips, with unread marked by a dot */}
      <div className="w-64 shrink-0 bg-[#ececee] dark:bg-black/25 border-r border-black/10 dark:border-white/10 flex flex-col">
        <div className="px-5 pt-6 pb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg">
            <BulbIcon size={20} />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Tips</h2>
        </div>

        <div className="px-5 pb-4">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-white/40 mb-1.5">
            <span>Read</span>
            <span className="stat-figure">{read.length} of {TIPS.length}</span>
          </div>
          <div className="h-1 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-amber-500 rounded-full"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide pb-4">
          {TIPS.map((t, i) => {
            const active = t.id === tip.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className={`w-full text-left px-5 py-2.5 flex items-start gap-2.5 transition-colors ${
                  active
                    ? 'bg-amber-500/15 dark:bg-amber-400/15'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span
                  className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                    isRead(t.id) ? 'bg-transparent' : 'bg-amber-500'
                  }`}
                />
                <span className="flex-1 min-w-0">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-white/35">
                    Tip {i + 1}
                  </span>
                  <span
                    className={`block text-[13px] leading-snug ${
                      active ? 'font-semibold' : 'font-normal'
                    }`}
                  >
                    {t.title}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail pane */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={tip.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="flex-1 overflow-y-auto scrollbar-hide px-12 py-12 flex flex-col"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg mb-6">
              <BulbIcon size={26} />
            </div>

            <h1 className="text-4xl font-bold tracking-tight mb-5 max-w-2xl">
              {tip.title}
            </h1>
            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-300 max-w-2xl">
              {tip.body}
            </p>

            {tip.related.length > 0 && (
              <div className="mt-8">
                <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-white/35 mb-3">
                  Apps mentioned
                </p>
                <div className="flex flex-wrap gap-2">
                  {tip.related.map((id) => (
                    <button
                      key={id}
                      onClick={() => launchApp(id)}
                      className="px-3 py-1.5 rounded-lg text-[13px] font-medium bg-black/5 dark:bg-white/10 hover:bg-amber-500 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      {id}
                      <ArrowRight01Icon size={12} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer controls */}
        <div className="shrink-0 border-t border-black/10 dark:border-white/10 px-12 py-4 flex items-center justify-between">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 dark:text-white/40 hover:text-amber-500 transition-colors"
          >
            <RefreshIcon size={14} />
            Start over
          </button>

          <div className="flex items-center gap-3">
            {!isRead(tip.id) && (
              <button
                onClick={() => persist([...read, tip.id])}
                className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 dark:text-white/40 hover:text-amber-500 transition-colors"
              >
                <Tick01Icon size={14} />
                Mark as read
              </button>
            )}
            <button
              onClick={nextTip}
              className="px-4 py-2 rounded-lg bg-amber-500 text-white text-[13px] font-semibold hover:bg-amber-600 transition-colors flex items-center gap-1.5"
            >
              Next tip
              <ArrowRight01Icon size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
