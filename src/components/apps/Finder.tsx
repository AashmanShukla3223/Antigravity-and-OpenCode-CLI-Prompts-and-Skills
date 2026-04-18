import React, { useState } from 'react';
import { useFileSystem } from '../../contexts/FileSystemContext';
import type { TagColor } from '../../contexts/FileSystemContext';
import { useSystem } from '../../contexts/SystemContext';
import { 
  Folder01Icon, 
  File01Icon, 
  Grid02Icon, 
  ArrowLeft01Icon as ChevronLeft, 
  ArrowRight01Icon as ChevronRight,
  PlusSignIcon,
  Delete02Icon,
  ComputerIcon,
  Database01Icon
} from 'hugeicons-react';

export const FinderIcon = () => (
  <svg viewBox="0 0 100 100" className="w-8 h-8 rounded-xl shadow-[inset_0_0_2px_rgba(255,255,255,0.5)]">
    <defs>
      <linearGradient id="finderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#5AC8FA" />
        <stop offset="100%" stopColor="#007AFF" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="22" fill="url(#finderGrad)" />
    <path d="M50 0 L50 100" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    <ellipse cx="35" cy="40" rx="4" ry="8" fill="white" opacity="0.9" />
    <ellipse cx="65" cy="40" rx="4" ry="8" fill="white" opacity="0.9" />
    <path d="M25 60 Q50 85 75 60" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
  </svg>
);

const tagColors: TagColor[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray'];

export const Finder: React.FC = () => {
  const { nodes, getDirectoryContents, createNode, deleteNode, getPath, addTag, removeTag, emptyTrash } = useFileSystem();
  const { setContextMenu } = useSystem();
  
  const [currentFolderId, setCurrentFolderId] = useState<string | null>('user-home');
  const [history, setHistory] = useState<string[]>(['user-home']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const contents = getDirectoryContents(currentFolderId);
  const currentFolder = nodes.find(n => n.id === currentFolderId);
  const path = getPath(currentFolderId);

  const navigateTo = (folderId: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(folderId);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentFolderId(folderId);
    setSelectedNodeId(null);
  };

  React.useEffect(() => {
    const handleNavigate = (e: any) => {
      if (e.detail) navigateTo(e.detail);
    };
    window.addEventListener('finder-navigate', handleNavigate);
    return () => window.removeEventListener('finder-navigate', handleNavigate);
  }, [history, historyIndex]);

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentFolderId(history[historyIndex - 1]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentFolderId(history[historyIndex + 1]);
    }
  };

  const handleCreateFolder = () => {
    const name = prompt('Enter folder name:', 'New Folder');
    if (name) {
      createNode({
        name,
        type: 'folder',
        parentId: currentFolderId,
        isLocked: false,
        tags: []
      });
    }
  };

  const handleCreateFile = () => {
    const name = prompt('Enter file name:', 'untitled.txt');
    if (name) {
      createNode({
        name,
        type: 'file',
        parentId: currentFolderId,
        content: '',
        isLocked: false,
        tags: []
      });
    }
  };

  const handleContextMenu = (e: React.MouseEvent, type: 'desktop' | 'item', targetId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.pageX, y: e.pageY, type, targetId });
  };

  const favorites = [
    { id: 'desktop', name: 'Desktop', icon: <Grid02Icon size={16} /> },
    { id: 'documents', name: 'Documents', icon: <File01Icon size={16} /> },
    { id: 'downloads', name: 'Downloads', icon: <Folder01Icon size={16} /> },
    { id: 'user-home', name: 'Architect', icon: <ComputerIcon size={16} /> }
  ];

  const locations = [
    { id: 'root', name: 'Macintosh HD', icon: <Database01Icon size={16} /> }
  ];

  return (
    <div className="flex h-full w-full text-gray-800 rounded-b-xl overflow-hidden bg-white">
      {/* Sidebar */}
      <div className="w-48 bg-gray-50/50 border-r border-gray-200 p-2 flex flex-col gap-1 backdrop-blur-xl">
        <div className="text-[10px] font-bold text-gray-400 px-2 py-1 mb-1 mt-2 tracking-widest uppercase">Favorites</div>
        {favorites.map((fav) => (
          <div
            key={fav.id}
            onClick={() => navigateTo(fav.id)}
            className={`px-2 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer text-sm font-medium transition-all ${currentFolderId === fav.id ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-gray-600 hover:bg-gray-200/50'}`}
          >
            <span className={currentFolderId === fav.id ? 'text-white' : 'text-blue-500'}>{fav.icon}</span>
            {fav.name}
          </div>
        ))}

        <div className="text-[10px] font-bold text-gray-400 px-2 py-1 mb-1 mt-4 tracking-widest uppercase">Locations</div>
        {locations.map((loc) => (
          <div
            key={loc.id}
            onClick={() => navigateTo(loc.id)}
            className={`px-2 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer text-sm font-medium transition-all ${currentFolderId === loc.id ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-gray-600 hover:bg-gray-200/50'}`}
          >
            <span className={currentFolderId === loc.id ? 'text-white' : 'text-gray-400'}>{loc.icon}</span>
            {loc.name}
          </div>
        ))}

        <div className="text-[10px] font-bold text-gray-400 px-2 py-1 mb-1 mt-4 tracking-widest uppercase">Tags</div>
        {tagColors.map(color => (
          <div key={color} className="px-2 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-600 hover:bg-gray-200/50 capitalize">
            <div className={`w-2.5 h-2.5 rounded-full bg-${color}-500 shadow-sm`} />
            {color}
          </div>
        ))}
      </div>
      
      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              <ChevronLeft 
                size={20} 
                onClick={goBack} 
                className={`cursor-pointer transition-colors ${historyIndex > 0 ? 'text-gray-600 hover:text-black' : 'text-gray-200'}`} 
              />
              <ChevronRight 
                size={20} 
                onClick={goForward} 
                className={`cursor-pointer transition-colors ${historyIndex < history.length - 1 ? 'text-gray-600 hover:text-black' : 'text-gray-200'}`} 
              />
            </div>
            <div className="flex flex-col">
               <h2 className="text-sm font-bold text-gray-900 leading-none">{currentFolder?.name}</h2>
               <div className="flex items-center gap-1 mt-1">
                  {path.map((p, i) => (
                    <React.Fragment key={p.id}>
                      <span 
                        onClick={() => navigateTo(p.id)}
                        className="text-[10px] text-gray-400 hover:text-blue-500 cursor-pointer font-medium uppercase tracking-tighter"
                      >
                        {p.name}
                      </span>
                      {i < path.length - 1 && <span className="text-[8px] text-gray-300">›</span>}
                    </React.Fragment>
                  ))}
               </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentFolderId === 'trash' && contents.length > 0 && (
              <button 
                onClick={() => { if(confirm('Empty Trash permanently?')) emptyTrash(); }}
                className="px-3 py-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg text-xs font-bold transition-all border border-red-500/20 mr-2"
              >
                Empty
              </button>
            )}
            <button onClick={handleCreateFolder} title="New Folder" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-blue-500">
              <PlusSignIcon size={18} />
            </button>
            <button onClick={handleCreateFile} title="New File" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-blue-500">
              <File01Icon size={18} />
            </button>
            <div className="w-[1px] h-6 bg-gray-100 mx-2" />
            <button 
              disabled={!selectedNodeId || nodes.find(n => n.id === selectedNodeId)?.isLocked}
              onClick={() => { if(selectedNodeId) deleteNode(selectedNodeId); setSelectedNodeId(null); }}
              className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-gray-400 disabled:opacity-20"
            >
              <Delete02Icon size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div 
          className="flex-1 overflow-y-auto p-4 scrollbar-hide" 
          onClick={() => setSelectedNodeId(null)}
          onContextMenu={(e) => handleContextMenu(e, 'desktop')}
        >
          {contents.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2">
              <Folder01Icon size={48} strokeWidth={1} className="opacity-20" />
              <span className="text-xs font-bold uppercase tracking-widest">Empty Folder</span>
            </div>
          ) : (
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {contents.map((node) => (
                <div 
                  key={node.id} 
                  draggable={!node.isLocked}
                  onClick={(e) => { e.stopPropagation(); setSelectedNodeId(node.id); }}
                  onDoubleClick={() => node.type === 'folder' && navigateTo(node.id)}
                  onContextMenu={(e) => handleContextMenu(e, 'item', node.id)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all relative group
                    ${selectedNodeId === node.id ? 'bg-blue-500/10 border-blue-200' : 'border-transparent hover:bg-gray-100/50'} 
                    border-2
                  `}
                >
                  <div className="relative">
                    {node.type === 'folder' ? (
                      <Folder01Icon size={48} strokeWidth={1} className="text-blue-400 fill-blue-50 drop-shadow-sm" />
                    ) : (
                      <File01Icon size={48} strokeWidth={1} className="text-gray-400 fill-gray-50" />
                    )}
                    
                    {/* Tags */}
                    <div className="absolute -top-1 -right-1 flex flex-col gap-0.5">
                       {node.tags?.map(color => (
                         <div key={color} className={`w-2 h-2 rounded-full bg-${color}-500 border border-white shadow-sm`} />
                       ))}
                    </div>
                  </div>
                  
                  <span className={`text-[11px] font-medium text-center truncate w-full px-1 ${selectedNodeId === node.id ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                    {node.name}
                  </span>

                  {/* Quick Actions Overlay */}
                  {selectedNodeId === node.id && (
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-xl p-1 flex gap-1 z-20">
                       {tagColors.slice(0, 4).map(color => (
                         <button 
                           key={color}
                           onClick={() => node.tags?.includes(color) ? removeTag(node.id, color) : addTag(node.id, color)}
                           className={`w-4 h-4 rounded-full bg-${color}-500 border border-black/5 hover:scale-125 transition-transform`}
                         />
                       ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="h-6 border-t border-gray-100 bg-gray-50/50 px-4 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
           <span>{contents.length} items</span>
           <span>512 GB available</span>
        </div>
      </div>
    </div>
  );
};
