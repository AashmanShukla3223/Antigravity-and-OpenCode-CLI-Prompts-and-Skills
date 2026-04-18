import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';
import { AppIcon } from '../common/AppIcon';
import { Search01Icon } from 'hugeicons-react';

const apps = [
  { id: 'finder', name: 'Finder' },
  { id: 'safari', name: 'Safari' },
  { id: 'terminal', name: 'Terminal' },
  { id: 'mail', name: 'Mail' },
  { id: 'messages', name: 'Messages' },
  { id: 'photos', name: 'Photos' },
  { id: 'maps', name: 'Maps' },
  { id: 'phone', name: 'Phone' },
  { id: 'appstore', name: 'App Store' },
  { id: 'books', name: 'Books' },
  { id: 'wallet', name: 'Wallet' },
  { id: 'reminders', name: 'Reminders' },
  { id: 'stickies', name: 'Stickies' },
  { id: 'contacts', name: 'Contacts' },
  { id: 'activitymonitor', name: 'Activity Monitor' },
  { id: 'settings', name: 'Settings' },
];

export const Launchpad: React.FC = () => {
  const { launchApp, closeApp } = useSystem();
  const [search, setSearch] = useState('');

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleLaunch = (appId: string) => {
    launchApp(appId);
    closeApp('launchpad');
  };

  return (
    <div className="h-full w-full bg-black/20 backdrop-blur-[80px] saturate-[180%] flex flex-col items-center p-12 overflow-y-auto scrollbar-hide select-none">
      {/* Search Bar */}
      <div className="relative w-full max-w-lg mb-16">
        <Search01Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
        <input 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Applications"
          className="w-full h-12 bg-white/10 border border-white/10 rounded-2xl pl-12 pr-6 text-xl text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-2xl"
          autoFocus
        />
      </div>

      {/* App Grid */}
      <motion.div 
        layout
        className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-x-12 gap-y-16 max-w-6xl"
      >
        <AnimatePresence mode="popLayout">
          {filteredApps.map((app) => (
            <motion.div
              key={app.id}
              layout
              initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLaunch(app.id)}
              className="flex flex-col items-center gap-3 cursor-pointer group"
            >
              <div className="w-20 h-20 shadow-2xl relative transition-transform duration-300">
                <AppIcon id={app.id} size={80} />
              </div>
              <span className="text-[13px] font-bold text-white text-center drop-shadow-lg tracking-tight">
                {app.name}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredApps.length === 0 && (
        <div className="mt-20 text-white/40 font-bold uppercase tracking-widest text-sm">
          No Applications Found
        </div>
      )}
    </div>
  );
};
