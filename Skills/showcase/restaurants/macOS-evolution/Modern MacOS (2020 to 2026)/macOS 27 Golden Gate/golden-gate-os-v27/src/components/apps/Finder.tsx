import React, { useState, useCallback } from 'react';
import { useFileSystem } from '../../contexts/FileSystemContext';
import type { TagColor, FileSystemNode } from '../../contexts/FileSystemContext';
import { useSystem } from '../../contexts/SystemContext';
import { AppIcon } from '../common/AppIcon';
import { readFilesAndStore } from '../../utils/vfs-ops';
import {
  File01Icon,
  ArrowLeft01Icon as ChevronLeft,
  ArrowRight01Icon as ChevronRight,
  PlusSignIcon,
  Delete02Icon,
  Upload04Icon,
} from 'hugeicons-react';

const FILE_ICONS: Record<string, { icon: string; color: string }> = {
  png: { icon: '🖼️', color: 'text-pink-500' },
  jpg: { icon: '🖼️', color: 'text-pink-500' },
  jpeg: { icon: '🖼️', color: 'text-pink-500' },
  webp: { icon: '🖼️', color: 'text-pink-500' },
  svg: { icon: '🖼️', color: 'text-pink-500' },
  gif: { icon: '🎬', color: 'text-purple-500' },
  mp4: { icon: '🎬', color: 'text-purple-500' },
  mov: { icon: '🎬', color: 'text-purple-500' },
  webm: { icon: '🎬', color: 'text-purple-500' },
  mp3: { icon: '🎵', color: 'text-blue-500' },
  wav: { icon: '🎵', color: 'text-blue-500' },
  aac: { icon: '🎵', color: 'text-blue-500' },
  ogg: { icon: '🎵', color: 'text-blue-500' },
  flac: { icon: '🎵', color: 'text-blue-500' },
  pdf: { icon: '📄', color: 'text-red-500' },
  doc: { icon: '📝', color: 'text-blue-500' },
  docx: { icon: '📝', color: 'text-blue-500' },
  xls: { icon: '📊', color: 'text-green-500' },
  xlsx: { icon: '📊', color: 'text-green-500' },
  ppt: { icon: '📽️', color: 'text-orange-500' },
  pptx: { icon: '📽️', color: 'text-orange-500' },
  txt: { icon: '📃', color: 'text-gray-500' },
  json: { icon: '📋', color: 'text-yellow-500' },
  js: { icon: '📜', color: 'text-yellow-500' },
  ts: { icon: '📜', color: 'text-blue-600' },
  tsx: { icon: '⚛️', color: 'text-blue-500' },
  jsx: { icon: '⚛️', color: 'text-blue-500' },
  html: { icon: '🌐', color: 'text-orange-500' },
  css: { icon: '🎨', color: 'text-blue-400' },
  py: { icon: '🐍', color: 'text-green-600' },
  swift: { icon: '🕊️', color: 'text-orange-500' },
  rs: { icon: '🦀', color: 'text-orange-600' },
  go: { icon: '🔷', color: 'text-blue-500' },
  zip: { icon: '📦', color: 'text-yellow-600' },
  dmg: { icon: '💿', color: 'text-gray-500' },
  app: { icon: '📱', color: 'text-blue-500' },
};

function getFileIcon(node: FileSystemNode) {
  const ext = node.name.split('.').pop()?.toLowerCase() || '';
  const info = FILE_ICONS[ext];
  return info || { icon: '📄', color: 'text-gray-400' };
}

function openFilePicker(multiple: boolean, accept: string, onFiles: (files: File[]) => void) {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = multiple;
  input.accept = accept;
  input.style.display = 'none';
  document.body.appendChild(input);
  input.onchange = () => {
    const files = Array.from(input.files || []);
    if (files.length > 0) onFiles(files);
    try {
      document.body.removeChild(input);
    } catch { /* ignore */ }
  };
  input.click();
}

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
  const {
    nodes,
    getDirectoryContents,
    createNode,
    deleteNode,
    getPath,
    addTag,
    removeTag,
    emptyTrash,
    getNodeContent,
  } = useFileSystem();
  const { setContextMenu, systemState, showPrompt, showConfirm } = useSystem();

  const [currentFolderId, setCurrentFolderId] = useState<string | null>('user-home');
  const [history, setHistory] = useState<string[]>(['user-home']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showAirDrop, setShowAirDrop] = useState(false);
  const [airDropCode, setAirDropCode] = useState('0000');
  const [previewNode, setPreviewNode] = useState<FileSystemNode | null>(null);
  const closePreview = useCallback(() => setPreviewNode(null), []);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const rawContents = getDirectoryContents(currentFolderId);
  const contents = searchQuery
    ? rawContents.filter((n) => n.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : rawContents;
  const currentFolder = nodes.find((n) => n.id === currentFolderId);
  const path = getPath(currentFolderId);

  const handleAirDrop = () => {
    setAirDropCode(Math.floor(1000 + Math.random() * 9000).toString());
    setShowAirDrop(true);
  };

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

  const handleCreateFolder = async () => {
    const name = await showPrompt('Enter folder name:', 'New Folder', 'New Folder');
    if (name) {
      createNode({
        name,
        type: 'folder',
        parentId: currentFolderId,
        isLocked: false,
        tags: [],
      });
    }
  };

  const handleCreateFile = async () => {
    const name = await showPrompt('Enter file name:', 'untitled.txt', 'New File');
    if (name) {
      createNode({
        name,
        type: 'file',
        parentId: currentFolderId,
        content: '',
        isLocked: false,
        tags: [],
      });
    }
  };

  const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
  const audioExts = ['mp3', 'wav', 'aac', 'ogg', 'flac'];
  const videoExts = ['mp4', 'mov', 'webm'];
  const isMedia = (node: FileSystemNode): 'image' | 'audio' | 'video' | null => {
    const ext = node.name.split('.').pop()?.toLowerCase() || '';
    if (imageExts.includes(ext) && node.content) return 'image';
    if (audioExts.includes(ext) && node.content) return 'audio';
    if (videoExts.includes(ext) && node.content) return 'video';
    return null;
  };
  const handlePreview = useCallback((node: FileSystemNode) => {
    const mt = isMedia(node);
    if (mt) setPreviewNode(node);
    else if (node.type === 'folder') navigateTo(node.id);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, type: 'desktop' | 'item', targetId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.pageX, y: e.pageY, type, targetId });
  };

  const getTargetFolder = useCallback(() => currentFolderId || 'desktop', [currentFolderId]);

  const handleImport = useCallback(() => {
    openFilePicker(true, '*/*', (files) => {
      readFilesAndStore(files, createNode, getTargetFolder());
    });
  }, [createNode, getTargetFolder]);

  const { onDragOver, onDrop } = useCallback(() => {
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    };
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        readFilesAndStore(files, createNode, getTargetFolder());
      }
    };
    return { onDragOver: handleDragOver, onDrop: handleDrop };
  }, [createNode, getTargetFolder])();

  const favorites = [
    { id: 'desktop', name: 'Desktop', icon: <AppIcon id="folder-desktop" size={16} /> },
    { id: 'documents', name: 'Documents', icon: <AppIcon id="folder-documents" size={16} /> },
    { id: 'downloads', name: 'Downloads', icon: <AppIcon id="folder-downloads" size={16} /> },
    { id: 'user-home', name: 'Architect', icon: <AppIcon id="folder-user-home" size={16} /> },
  ];

  const locations = [{ id: 'root', name: 'Macintosh HD', icon: <AppIcon id="disk" size={16} /> }];

  return (
    <div className="flex h-full w-full text-gray-800 rounded-b-xl overflow-hidden bg-white/90">
      {/* AirDrop Modal */}
      {showAirDrop && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="w-64 bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-1">AirDrop Security Layer</h3>
            <p className="text-xs text-center text-gray-500 mb-6">
              Confirm this code with the sender to receive the file securely.
            </p>
            <div className="text-3xl font-black tracking-[0.2em] mb-6 text-blue-600">{airDropCode}</div>
            <button
              onClick={() => setShowAirDrop(false)}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`w-48 border-r border-gray-200/50 p-2 flex flex-col gap-1 z-10 transition-colors ${systemState.sidebarMaterial === 'clear' ? 'bg-white/10 backdrop-blur-[60px] saturate-[180%]' : 'bg-gray-50/70 backdrop-blur-xl'}`}
      >
        <div className="text-[10px] font-bold text-gray-400 px-2 py-1 mb-1 mt-2 tracking-widest uppercase">
          Favorites
        </div>
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

        <div className="text-[10px] font-bold text-gray-400 px-2 py-1 mb-1 mt-4 tracking-widest uppercase">
          Locations
        </div>
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
        {tagColors.map((color) => (
          <div
            key={color}
            className="px-2 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-600 hover:bg-gray-200/50 capitalize"
          >
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

          <div className="flex items-center gap-2 flex-1 justify-end">
            {/* Search */}
            <div className="relative mr-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-36 lg:w-48 text-xs py-1.5 pl-7 pr-2 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition-all"
              />
              <svg
                className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            {/* View Toggle */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden mr-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                title="Icon View"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                title="List View"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </button>
            </div>
            {currentFolderId === 'trash' && contents.length > 0 && (
              <button
                onClick={async () => {
                  const audio = new Audio('/sounds/glass.aiff');
                  audio.play().catch((e) => console.log('Audio play failed', e));
                  const confirmed = await showConfirm(
                    'Are you sure you want to permanently erase the items in the Trash?',
                    'Empty Trash',
                  );
                  if (confirmed) {
                    emptyTrash();
                  }
                }}
                className="px-3 py-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg text-xs font-bold transition-all border border-red-500/20 mr-2"
              >
                Empty
              </button>
            )}
            <button
              onClick={handleAirDrop}
              title="AirDrop Secure Share"
              className="p-2 hover:bg-blue-50 hover:text-blue-500 rounded-lg transition-colors text-gray-500 flex items-center justify-center"
            >
              {' '}
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </button>
            <button
              onClick={handleCreateFolder}
              title="New Folder"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-blue-500"
            >
              <PlusSignIcon size={18} />
            </button>
            <button
              onClick={handleCreateFile}
              title="New File"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-blue-500"
            >
              <File01Icon size={18} />
            </button>
            <button
              onClick={handleImport}
              title="Import Files"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-green-500"
            >
              <Upload04Icon size={18} />
            </button>
            <div className="w-[1px] h-6 bg-gray-100 mx-2" />
            <button
              disabled={!selectedNodeId || nodes.find((n) => n.id === selectedNodeId)?.isLocked}
              onClick={() => {
                if (selectedNodeId) deleteNode(selectedNodeId);
                setSelectedNodeId(null);
              }}
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
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          {contents.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2">
              <AppIcon id="folder" size={48} className="opacity-20" />
              <span className="text-xs font-bold uppercase tracking-widest">Empty Folder</span>
            </div>
          ) : viewMode === 'list' ? (
            <div className="flex flex-col">
              {/* List Header */}
              <div className="flex items-center gap-4 px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                <span className="flex-1">Name</span>
                <span className="w-16 text-right">Size</span>
                <span className="w-24 text-right">Type</span>
              </div>
              {contents.map((node) => (
                <div
                  key={node.id}
                  draggable={!node.isLocked}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNodeId(node.id);
                  }}
                  onDoubleClick={() => handlePreview(node)}
                  onContextMenu={(e) => handleContextMenu(e, 'item', node.id)}
                  className={`flex items-center gap-4 px-3 py-2 text-sm border-b border-gray-50 cursor-pointer transition-all
                    ${selectedNodeId === node.id ? 'bg-blue-500/10 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}
                  `}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {node.type === 'folder' ? (
                      <AppIcon id={node.customIcon || `folder-${node.id}`} size={20} folderColor={node.color} />
                    ) : (
                      <span className="text-lg">{getFileIcon(node).icon}</span>
                    )}
                    <span className="truncate">{node.name}</span>
                  </div>
                  <span className="w-16 text-right text-xs text-gray-400">—</span>
                  <span className="w-24 text-right text-xs text-gray-400 capitalize">{node.type}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {contents.map((node) => (
                <div
                  key={node.id}
                  draggable={!node.isLocked}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNodeId(node.id);
                  }}
                  onDoubleClick={() => handlePreview(node)}
                  onContextMenu={(e) => handleContextMenu(e, 'item', node.id)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all relative group
                    ${selectedNodeId === node.id ? 'bg-blue-500/10 border-blue-200' : 'border-transparent hover:bg-gray-100/50'} 
                    border-2
                  `}
                >
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    {node.type === 'folder' ? (
                      <AppIcon id={node.customIcon || `folder-${node.id}`} size={48} folderColor={node.color} />
                    ) : (
                      <span className={`text-3xl ${getFileIcon(node).color}`}>{getFileIcon(node).icon}</span>
                    )}
                    <div className="absolute -top-1 -right-1 flex flex-col gap-0.5">
                      {node.tags?.map((color) => (
                        <div
                          key={color}
                          className={`w-2 h-2 rounded-full bg-${color}-500 border border-white shadow-sm`}
                        />
                      ))}
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-medium text-center truncate w-full px-1 ${selectedNodeId === node.id ? 'text-blue-600 font-bold' : 'text-gray-700'}`}
                  >
                    {node.name}
                  </span>
                  {selectedNodeId === node.id && (
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-xl p-1 flex gap-1 z-20">
                      {tagColors.slice(0, 4).map((color) => (
                        <button
                          key={color}
                          onClick={() =>
                            node.tags?.includes(color) ? removeTag(node.id, color) : addTag(node.id, color)
                          }
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

      {previewNode && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md"
          onClick={closePreview}
        >
          <div
            className="relative max-w-[90vw] max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl bg-black/80"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closePreview}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm z-10 transition-colors"
            >
              ✕
            </button>
            {(() => {
              const mt = isMedia(previewNode);
              if (mt === 'image')
                return (
                  <img
                    src={getNodeContent(previewNode.content)}
                    alt={previewNode.name}
                    className="max-w-[85vw] max-h-[85vh] object-contain"
                  />
                );
              if (mt === 'audio')
                return (
                  <div className="flex flex-col items-center justify-center p-12 min-w-[400px]">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl mb-6">
                      🎵
                    </div>
                    <p className="text-white font-bold text-lg mb-2">{previewNode.name}</p>
                    <audio src={getNodeContent(previewNode.content)} controls autoPlay className="w-full max-w-md" />
                  </div>
                );
              if (mt === 'video')
                return (
                  <div className="p-4">
                    <p className="text-white font-bold text-sm mb-2">{previewNode.name}</p>
                    <video
                      src={getNodeContent(previewNode.content)}
                      controls
                      autoPlay
                      className="max-w-[85vw] max-h-[80vh] rounded-xl"
                    />
                  </div>
                );
              return null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
