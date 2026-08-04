import React, { useState, useEffect } from 'react';
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
  { id: 'itunes', name: 'iTunes Store' },
  { id: 'books', name: 'Books' },
  { id: 'wallet', name: 'Wallet' },
  { id: 'music', name: 'Music' },
  { id: 'tv', name: 'Apple TV+' },
  { id: 'calendar', name: 'Calendar' },
  { id: 'crazyerrors', name: 'Crazy Errors' },
  { id: 'soundtest', name: 'Sound Test' },
  { id: 'samsunglcdtv', name: 'Samsung LCD TV Simulator' },
  { id: 'calculator', name: 'Calculator' },
  { id: 'siriai', name: 'Siri' },
  { id: 'aboutme', name: 'About Me' },
  { id: 'code', name: 'VS Code' },
  { id: 'vmware', name: 'VMware Fusion Pro' },
  { id: 'clock', name: 'Clock' },
  { id: 'keynote', name: 'Keynote' },
  { id: 'numbers', name: 'Numbers' },
  { id: 'pages', name: 'Pages' },
  { id: 'games', name: 'Games' },
  { id: 'installer', name: 'Installer' },
  { id: 'freeform', name: 'Freeform' },
  { id: 'motion', name: 'Motion' },
  { id: 'xcode', name: 'Xcode' },
  { id: 'pixelmatorpro', name: 'Pixelmator Pro' },
  { id: 'finalcutpro', name: 'Final Cut Pro' },
  { id: 'logicpro', name: 'Logic Pro' },
  { id: 'chess', name: 'Chess' },
  { id: 'geometrydash', name: 'Geometry Dash' },
  { id: 'screensharing', name: 'Screen Sharing' },
  { id: 'migrationassistant', name: 'Migration Assistant' },

  { id: 'socialize', name: 'Social', isFolder: true, folderApps: ['messages', 'mail', 'facetime', 'contacts', 'photobooth'] },
  { id: 'developer', name: 'Developer', isFolder: true, folderApps: ['terminal', 'github', 'code', 'vmware'] },
  { id: 'utility', name: 'Utility', isFolder: true, folderApps: ['settings', 'activitymonitor', 'weather', 'notes', 'reminders', 'stickies', 'iphonemirroring', 'timemachine', 'diskutility', 'screensharing', 'migrationassistant', 'chess'] },
];

const subApps: Record<string, AppItem[]> = {
  socialize: [
    { id: 'messages', name: 'Messages' },
    { id: 'mail', name: 'Mail' },
    { id: 'facetime', name: 'FaceTime' },
    { id: 'contacts', name: 'Contacts' },
    { id: 'aboutme', name: 'About Me' },
    { id: 'photobooth', name: 'Photo Booth' },
  ],
  developer: [
    { id: 'terminal', name: 'Terminal' },
    { id: 'github', name: 'GitHub' },
    { id: 'code', name: 'VS Code' },
    { id: 'vmware', name: 'VMware Fusion Pro' },
  ],
  utility: [
    { id: 'settings', name: 'Settings' },
    { id: 'activitymonitor', name: 'Activity Monitor' },
    { id: 'weather', name: 'Weather' },
    { id: 'notes', name: 'Notes' },
    { id: 'reminders', name: 'Reminders' },
    { id: 'stickies', name: 'Stickies' },
    { id: 'timemachine', name: 'Time Machine' },
    { id: 'diskutility', name: 'Disk Utility' },
    { id: 'iphonemirroring', name: 'iPhone Mirroring' },
    { id: 'chess', name: 'Chess' },
    { id: 'minecraft', name: 'Minecraft' },
  ],
};

export const Apps: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { launchApp, setShowSpotlight, setContextMenu } = useSystem();
  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const displayApps = activeFolder ? subApps[activeFolder] : apps;
  const filteredApps = displayApps.filter((app) => app.name.toLowerCase().includes(search.toLowerCase()));

  const handleLaunch = (app: AppItem) => {
    if (app.isFolder) {
      setActiveFolder(app.id);
    } else if (app.id === 'github') {
      window.open('https://github.com/AashmanShukla3223', '_blank');
      onClose();
    } else {
      launchApp(app.id);
      onClose();
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center overflow-y-auto scrollbar-hide select-none"
      onClick={() => {
        if (activeFolder) setActiveFolder(null);
      }}
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between px-8 py-5 border-b border-white/20 shrink-0">
        {activeFolder ? (
          <button
            onClick={(e) => { e.stopPropagation(); setActiveFolder(null); }}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="text-xl leading-none">&larr;</span>
            <span className="text-sm font-semibold">All Applications</span>
          </button>
        ) : (
          <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-lg">Applications</h1>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowSpotlight(true); onClose(); }}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md flex items-center justify-center transition-colors"
            title="Spotlight"
          >
            <Search01Icon size={18} className="text-white/80" />
          </button>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md flex items-center justify-center transition-colors text-white/70 hover:text-white text-lg font-light leading-none"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-lg mt-8 mb-12 shrink-0" onClick={(e) => e.stopPropagation()}>
        <Search01Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Applications"
          className="w-full h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl pl-12 pr-6 text-lg text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          autoFocus
        />
      </div>

      {/* App Grid */}
      <motion.div
        layout
        className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-x-12 gap-y-14 max-w-6xl pb-16"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="popLayout">
          {filteredApps.map((app) => (
            <motion.div
              key={app.id}
              layout
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
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
              <div className="w-20 h-20 relative">
                <AppIcon id={app.id} size={80} />
              </div>
              <span className="text-[13px] font-semibold text-white text-center tracking-tight drop-shadow">
                {app.name}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredApps.length === 0 && (
        <div className="mt-16 text-white/50 font-bold uppercase tracking-widest text-sm">No Applications Found</div>
      )}
    </div>
  );
};
