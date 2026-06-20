import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';

const APP_ICONS: Record<string, string> = {
  finder: '/icons/finder.png',
  safari: '/icons/safari.png',
  messages: '/icons/messages.png',
  mail: '/icons/mail.png',
  maps: '/icons/maps.png',
  photos: '/icons/photos.png',
  facetime: '/icons/facetime.png',
  phone: '/icons/phone.png',
  calendar: '/icons/calendar.png',
  contacts: '/icons/contacts.png',
  notes: '/icons/notes.png',
  music: '/icons/music.png',
  tv: '/icons/tv.png',
  settings: '/icons/settings.png',
  terminal: '/icons/terminal.png',
  appstore: '/icons/appstore.png',
  reminders: '/icons/reminders.png',
  weather: '/icons/weather.png',
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
  tv: 'Apple TV+',
  settings: 'System Settings',
  terminal: 'Terminal',
  appstore: 'App Store',
  reminders: 'Reminders',
  weather: 'Weather',
};

interface MissionControlProps {
  isOpen: boolean;
  onClose: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.03, staggerDirection: -1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.85 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 200, damping: 20 },
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    transition: { duration: 0.15 },
  },
};

export const MissionControl: React.FC<MissionControlProps> = ({ isOpen, onClose }) => {
  const { openWindows, setActiveWindow, quitApp, openApps, activeWindowId } = useSystem();

  const visibleWindows = openWindows.filter((w) => openApps.includes(w.appId));

  const handleCardClick = (windowId: string) => {
    setActiveWindow(windowId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mission-control"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[5000] bg-black/60 backdrop-blur-2xl flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            className="w-full h-full p-16 overflow-y-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-white/80 tracking-tight">Mission Control</h2>
              <p className="text-sm text-white/40 mt-1">{visibleWindows.length} window{visibleWindows.length !== 1 ? 's' : ''}</p>
            </div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-w-7xl mx-auto"
              variants={containerVariants}
            >
              {visibleWindows.map((w) => {
                const appIcon = APP_ICONS[w.appId] || `/icons/${w.appId}.png`;
                const appName = APP_NAMES[w.appId] || w.appId;
                const isActive = w.id === activeWindowId;

                return (
                  <motion.div
                    key={w.id}
                    variants={cardVariants}
                    layoutId={`mission-card-${w.id}`}
                    className={`relative group cursor-pointer rounded-3xl overflow-hidden border transition-all ${
                      isActive
                        ? 'border-blue-500/60 shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                    onClick={() => handleCardClick(w.id)}
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center p-8">
                      <div className="w-full h-full rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-inner">
                        {appIcon ? (
                          <img
                            src={appIcon}
                            alt={appName}
                            className="w-16 h-16 object-contain drop-shadow-2xl opacity-70 group-hover:opacity-100 transition-opacity"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold text-white/50">
                            {appName[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-black/40 backdrop-blur-xl flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
                          <img
                            src={appIcon}
                            alt={appName}
                            className="w-5 h-5 object-contain"
                          />
                        </div>
                        <span className="text-sm font-semibold text-white truncate">{appName}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          quitApp(w.appId);
                        }}
                        className="w-7 h-7 rounded-full bg-white/10 hover:bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-white" />
                        </svg>
                      </button>
                    </div>

                    {isActive && (
                      <div className="absolute top-3 left-3 px-2 py-0.5 bg-blue-500/80 backdrop-blur-md rounded-md text-[10px] font-bold text-white uppercase tracking-wider">
                        Active
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>

            {visibleWindows.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center mt-32">
                <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <p className="text-lg text-white/40 font-medium">No open windows</p>
                <p className="text-sm text-white/20 mt-1">Open an app from the Dock to get started</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
