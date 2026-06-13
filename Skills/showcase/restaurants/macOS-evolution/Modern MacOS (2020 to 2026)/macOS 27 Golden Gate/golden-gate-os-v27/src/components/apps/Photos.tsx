import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search01Icon, Cancel01Icon, Menu01Icon, Image01Icon } from 'hugeicons-react';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { ImportFileButton, useFileDrop } from '../../utils/vfs-ops';

const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];

export const Photos: React.FC = () => {
  const { nodes, createNode, getNodeContent } = useFileSystem();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [viewer, setViewer] = useState<{ content: string; title: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const imageFiles = useMemo(() => {
    return nodes.filter(n => {
      if (n.type !== 'file' || !n.content) return false;
      const ext = n.name.split('.').pop()?.toLowerCase() || '';
      return IMAGE_EXTS.includes(ext);
    });
  }, [nodes]);

  const albums = useMemo(() => {
    const names = new Set<string>();
    imageFiles.forEach(n => {
      const parent = nodes.find(p => p.id === n.parentId);
      names.add(parent?.name || 'Other');
    });
    return Array.from(names).sort();
  }, [imageFiles, nodes]);

  const filtered = useMemo(() => {
    let items = imageFiles;
    if (selectedAlbum) {
      const parentIds = nodes.filter(p => p.name === selectedAlbum).map(p => p.id);
      items = items.filter(n => parentIds.includes(n.parentId || ''));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(n => n.name.toLowerCase().includes(q));
    }
    return items;
  }, [imageFiles, selectedAlbum, searchQuery, nodes]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, [viewer]);

  const viewerIndex = viewer ? filtered.findIndex(m => m.content === viewer.content) : -1;

  const navigateViewer = (dir: number) => {
    const next = viewerIndex + dir;
    if (next >= 0 && next < filtered.length) {
      const item = filtered[next];
      setViewer({ content: item.content!, title: item.name });
    }
  };

  const dropHandlers = useFileDrop(createNode, 'pictures', '.png,.jpg,.jpeg,.gif,.webp,.svg');

  return (
    <div className="flex h-full w-full bg-black/20 saturate-[150%]">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 bg-black/30 backdrop-blur-[var(--glass-blur)] border-r border-white/10 h-full overflow-y-auto"
          >
            <div className="p-4 pt-6 flex flex-col gap-6">
              <div className="relative">
                <Search01Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search photos"
                  className="w-full bg-white/10 border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2 px-2">Library</div>
                <div className="flex flex-col gap-1">
                  <div
                    onClick={() => setSelectedAlbum(null)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-all ${
                      selectedAlbum === null ? 'bg-blue-500 text-white shadow-lg' : 'text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Image01Icon size={14} />
                      All Photos
                    </span>
                  </div>
                  {albums.map(album => (
                    <div
                      key={album}
                      onClick={() => setSelectedAlbum(album)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-all ${
                        selectedAlbum === album ? 'bg-blue-500 text-white shadow-lg' : 'text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Image01Icon size={14} />
                        {album}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-black/20 backdrop-blur-md z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-white/10 transition-colors"
          >
            <Menu01Icon size={18} className="text-white" />
          </button>
          <span className="text-sm font-bold text-white/60">{selectedAlbum || 'All Photos'}</span>
          <ImportFileButton createNode={createNode} parentId="pictures" accept=".png,.jpg,.jpeg,.gif,.webp,.svg" />
        </div>

        <div className="flex-1 overflow-y-auto p-6" {...dropHandlers}>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setViewer({ content: item.content!, title: item.name })}
                  className="aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/10 group cursor-pointer relative"
                >
                  <img src={getNodeContent(item.content)} alt={item.name} className="w-full h-full object-contain" loading="lazy" />
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-bold text-white drop-shadow-lg">{item.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white/30 font-bold text-sm gap-3">
              <Image01Icon size={48} className="opacity-20" />
              <span>Drop images here or click Import</span>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {viewer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setViewer(null)}
          >
            <button
              onClick={() => setViewer(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
            >
              <Cancel01Icon size={20} className="text-white" />
            </button>

            {viewerIndex > 0 && (
              <button onClick={(e) => { e.stopPropagation(); navigateViewer(-1); }} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
            )}

            <div className="max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center p-8" onClick={(e) => e.stopPropagation()}>
              <img src={getNodeContent(viewer.content)} alt={viewer.title} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" />
            </div>

            {viewerIndex < filtered.length - 1 && (
              <button onClick={(e) => { e.stopPropagation(); navigateViewer(1); }} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            )}

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-sm text-white/80 font-medium">
              {viewer.title} — {viewerIndex + 1} of {filtered.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
