import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem, type WindowInstance } from '../../contexts/SystemContext';
import { AppIcon } from '../common/AppIcon';

export const StageManager: React.FC = () => {
  const { systemState, openWindows, activeWindowId, setActiveWindow, minimizedWindows } = useSystem();

  if (!systemState.stageManagerEnabled) return null;

  const groups = groupWindowsByApp(openWindows.filter((w) => !minimizedWindows.includes(w.id)));
  const activeApp = activeWindowId ? openWindows.find((w) => w.id === activeWindowId)?.appId : null;

  return (
    <div className="absolute left-0 top-0 bottom-0 w-20 z-30 flex flex-col gap-2 p-2 pt-14">
      <AnimatePresence>
        {groups.map((group) => {
          const isActive = group.appId === activeApp;
          return (
            <motion.button
              key={group.appId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={() => {
                const target = group.windows.find((w) => !minimizedWindows.includes(w.id));
                if (target) setActiveWindow(target.id);
              }}
              className={`relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
                isActive
                  ? 'bg-white/15 border border-white/20 shadow-lg'
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className={`relative ${isActive ? 'scale-110' : 'opacity-60'}`}>
                <AppIcon id={group.appId} size={32} />
              </div>
              <span className={`text-[9px] font-medium truncate max-w-full ${isActive ? 'text-white' : 'text-white/50'}`}>
                {group.appName}
              </span>
              {group.count > 1 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                  {group.count}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="stage-active"
                  className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

const APP_NAMES: Record<string, string> = {
  finder: 'Finder',
  safari: 'Safari',
  messages: 'Messages',
  mail: 'Mail',
  maps: 'Maps',
  photos: 'Photos',
  facetime: 'FaceTime',
  phone: 'Phone',
  calendar: 'Calendar',
  contacts: 'Contacts',
  notes: 'Notes',
  music: 'Music',
  tv: 'TV',
  appstore: 'App Store',
  settings: 'Settings',
  terminal: 'Terminal',
  calculator: 'Calculator',
  weather: 'Weather',
  clock: 'Clock',
  reminders: 'Reminders',
  stickies: 'Stickies',
  books: 'Books',
  wallet: 'Wallet',
  code: 'VS Code',
  itunes: 'iTunes',
  keymote: 'Keynote',
  numbers: 'Numbers',
  pages: 'Pages',
  chess: 'Chess',
  activitymonitor: 'Activity Monitor',
  diskutility: 'Disk Utility',
  timemachine: 'Time Machine',
  photobooth: 'Photo Booth',
  siriai: 'Siri',
  github: 'GitHub',
  aboutme: 'About Me',
  vmware: 'VMware',
  samsunglcdtv: 'Samsung LCD',
  iphonemirroring: 'iPhone',
  crazyerrors: 'Errors',
  soundtest: 'Sound',
  freeform: 'Freeform',
  motion: 'Motion',
  xcode: 'Xcode',
  pixelmatorpro: 'Pixelmator',
  finalcutpro: 'Final Cut',
  logicpro: 'Logic Pro',
};

function groupWindowsByApp(windows: WindowInstance[]): { appId: string; appName: string; windows: WindowInstance[]; count: number }[] {
  const map = new Map<string, WindowInstance[]>();
  for (const w of windows) {
    const existing = map.get(w.appId) || [];
    existing.push(w);
    map.set(w.appId, existing);
  }
  return Array.from(map.entries()).map(([appId, wins]) => ({
    appId,
    appName: APP_NAMES[appId] || appId.charAt(0).toUpperCase() + appId.slice(1),
    windows: wins,
    count: wins.length,
  }));
}
