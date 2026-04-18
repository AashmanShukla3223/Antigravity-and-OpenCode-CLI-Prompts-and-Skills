import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search01Icon, Image01Icon, Eraser01Icon, Menu01Icon, PinIcon, StarIcon } from 'hugeicons-react';

export const Photos: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cleanUpMode, setCleanUpMode] = useState(false);
  
  // Lazy Loading RAM Hack: Instead of thousands of DOM nodes, only render visible or a constrained subset.
  // "On 0.5GB RAM, implement Lazy-Loading Thumbnails so the system doesn't crash during a 1,000-photo scroll."
  const [loadedThumbnails, setLoadedThumbnails] = useState(24);
  
  // Cleanup RAM on unmount
  useEffect(() => {
    return () => {
      setLoadedThumbnails(0);
      setSearchQuery('');
    };
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      if (loadedThumbnails < 1000) {
        setLoadedThumbnails(prev => Math.min(prev + 24, 1000));
      }
    }
  };

  return (
    <div className="flex h-full w-full bg-white/5 dark:bg-black/10 text-gray-800 dark:text-gray-200">
      {/* iPad-style Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 bg-white/20 dark:bg-black/30 backdrop-blur-[50px] border-r border-white/10 h-full overflow-y-auto"
          >
            <div className="p-4 pt-6 flex flex-col gap-6">
              <div className="relative">
                <Search01Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hugeicon-tahoe" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find 'blue glass building'" 
                  className="w-full bg-black/10 dark:bg-white/10 border-none rounded-lg py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Library</div>
                <div className="flex flex-col gap-1">
                  <div className="px-3 py-1.5 rounded-md bg-blue-500 text-white text-sm font-medium cursor-pointer shadow-sm">All Photos</div>
                  <div className="px-3 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium cursor-pointer">Days</div>
                  <div className="px-3 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium cursor-pointer">Favorites</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2 flex items-center gap-1">
                  <PinIcon size={10} className="hugeicon-tahoe" /> Pinned Collections
                </div>
                <div className="flex flex-col gap-1">
                  <div className="px-3 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium cursor-pointer flex items-center gap-2">
                    <StarIcon size={14} className="text-yellow-500 hugeicon-tahoe" /> Summer 2025
                  </div>
                  <div className="px-3 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium cursor-pointer flex items-center gap-2">
                    <Image01Icon size={14} className="text-blue-400 hugeicon-tahoe" /> Design Inspo
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-white/10 backdrop-blur-md z-10">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-white/20 transition-colors"
          >
            <Menu01Icon size={18} className="hugeicon-tahoe" />
          </button>
          
          <button 
            onClick={() => setCleanUpMode(!cleanUpMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              cleanUpMode 
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg scale-105' 
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <Eraser01Icon size={16} className="hugeicon-tahoe" />
            {cleanUpMode ? 'Liquid Brush Active' : 'Clean Up 2.0'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4" onScroll={handleScroll}>
          {cleanUpMode && (
            <div className="mb-4 p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl backdrop-blur-md flex items-center justify-center text-sm text-purple-200">
              Select an object to instantly remove it via Apple Intelligence.
            </div>
          )}
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: loadedThumbnails }).map((_, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key={i} 
                className={`aspect-square rounded-xl bg-gradient-to-br from-black/5 to-black/10 dark:from-white/5 dark:to-white/10 border border-white/10 relative overflow-hidden group cursor-pointer ${cleanUpMode ? 'cursor-crosshair' : ''}`}
              >
                {/* Simulated photo content */}
                <div className={`absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-pink-500/20 opacity-50`} />
                {cleanUpMode && (
                  <div className="absolute inset-0 bg-purple-500/0 hover:bg-purple-500/20 transition-colors flex items-center justify-center">
                    <Eraser01Icon size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md hugeicon-tahoe" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          {loadedThumbnails < 1000 && (
            <div className="py-8 flex justify-center text-xs text-gray-500 font-medium">
              Loading more thumbnails (RAM optimized)...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
