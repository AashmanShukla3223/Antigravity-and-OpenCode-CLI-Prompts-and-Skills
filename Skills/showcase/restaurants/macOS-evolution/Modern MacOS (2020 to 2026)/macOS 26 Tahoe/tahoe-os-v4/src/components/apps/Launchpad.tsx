import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';
import { AppIcon } from '../common/AppIcon';
import { Search01Icon } from 'hugeicons-react';

type AppItem = {
  id: string;
  name: string;
  isFolder?: boolean;
  folderApps?: string[];
};

const apps: AppItem[] = [
  { id: 'finder', name: 'Finder' },
  { id: 'safari', name: 'Safari' },
  { id: 'photos', name: 'Photos' },
  { id: 'maps', name: 'Maps' },
  { id: 'phone', name: 'Phone' },
  { id: 'appstore', name: 'App Store' },
  { id: 'books', name: 'Books' },
  { id: 'wallet', name: 'Wallet' },
  { id: 'music', name: 'Music' },
  { id: 'calendar', name: 'Calendar' },
  
  // Smart Folders
  { id: 'category-org.gnome.Software.Socialize', name: 'Social', isFolder: true, folderApps: ['messages', 'mail', 'facetime', 'contacts'] },
  { id: 'category-applications-development', name: 'Developer', isFolder: true, folderApps: ['terminal', 'github'] },
  { id: 'category-applications-utilities', name: 'Utility', isFolder: true, folderApps: ['settings', 'activitymonitor', 'weather', 'notes', 'reminders', 'stickies', 'iphonemirroring'] }
];

const subApps: Record<string, AppItem[]> = {
  'category-org.gnome.Software.Socialize': [
    { id: 'messages', name: 'Messages' },
    { id: 'mail', name: 'Mail' },
    { id: 'facetime', name: 'FaceTime' },
    { id: 'contacts', name: 'Contacts' }
  ],
  'category-applications-development': [
    { id: 'terminal', name: 'Terminal' },
    { id: 'github', name: 'GitHub' }
  ],
  'category-applications-utilities': [
    { id: 'settings', name: 'Settings' },
    { id: 'activitymonitor', name: 'Activity Monitor' },
    { id: 'weather', name: 'Weather' },
    { id: 'notes', name: 'Notes' },
    { id: 'reminders', name: 'Reminders' },
    { id: 'stickies', name: 'Stickies' },
    { id: 'iphonemirroring', name: 'iPhone Mirroring' }
  ]
};

export const Launchpad: React.FC = () => {
  const { launchApp, closeApp, setContextMenu } = useSystem();
  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState<string | null>(null);

  const displayApps = activeFolder ? subApps[activeFolder] : apps;
  const filteredApps = displayApps.filter(app => 
    app.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleLaunch = (app: any) => {
    if (app.isFolder) {
      setActiveFolder(app.id);
    } else {
      launchApp(app.id);
      closeApp('launchpad');
    }
  };

  return (
    <div 
      className="h-full w-full bg-black/20 backdrop-blur-[80px] saturate-[180%] flex flex-col items-center p-12 overflow-y-auto scrollbar-hide select-none relative"
      onClick={() => activeFolder && setActiveFolder(null)}
    >
      {activeFolder && (
        <div className="absolute top-12 left-12 text-white/50 hover:text-white cursor-pointer font-bold transition-colors">
          &larr; Back
        </div>
      )}
      
      {/* Search Bar */}
      <div className="relative w-full max-w-lg mb-16" onClick={(e) => e.stopPropagation()}>
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
        onClick={(e) => e.stopPropagation()}
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
              onClick={() => handleLaunch(app)}
              onContextMenu={(e) => {
                if (app.isFolder) return;
                e.preventDefault();
                e.stopPropagation();
                setContextMenu({ x: e.pageX, y: e.pageY, type: 'dock', targetId: app.id });
              }}
              className="flex flex-col items-center gap-3 cursor-pointer group"
            >
              <div className="w-20 h-20 relative transition-transform duration-300">
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
