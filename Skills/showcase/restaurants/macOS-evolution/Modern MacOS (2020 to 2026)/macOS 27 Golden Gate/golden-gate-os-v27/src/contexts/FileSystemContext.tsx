import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type TagColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'gray';

const generateId = () => {
  try { return crypto.randomUUID(); } catch { return `n${Date.now()}-${Math.random().toString(36).slice(2, 9)}`; }
};

const FILE_STORE_PREFIX = 'golden_gate_v27_file_';

export const storeFileExternal = (content: string): string | null => {
  const id = generateId();
  try {
    localStorage.setItem(`${FILE_STORE_PREFIX}${id}`, content);
    return id;
  } catch (e) {
    console.warn('localStorage quota exceeded, storing inline', e);
    return null;
  }
};

export const getFileExternal = (id: string): string | null => {
  try { return localStorage.getItem(`${FILE_STORE_PREFIX}${id}`); } catch { return null; }
};

export const removeFileExternal = (id: string) => {
  try { localStorage.removeItem(`${FILE_STORE_PREFIX}${id}`); } catch {/* ignore */}
};

export type FileSystemNode = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  content?: string;
  size?: number;
  modifiedAt: number;
  isLocked?: boolean;
  tags?: TagColor[];
  customIcon?: string;
  color?: string;
};

interface FileSystemContextProps {
  nodes: FileSystemNode[];
  createNode: (node: Omit<FileSystemNode, 'id' | 'modifiedAt'>) => void;
  updateNode: (id: string, updates: Partial<FileSystemNode>) => void;
  deleteNode: (id: string) => void;
  emptyTrash: () => void;
  getDirectoryContents: (folderId: string | null) => FileSystemNode[];
  getPath: (nodeId: string | null) => FileSystemNode[];
  addTag: (id: string, tag: TagColor) => void;
  removeTag: (id: string, tag: TagColor) => void;
  restoreSystemNodes: () => void;
}
const initialNodes: FileSystemNode[] = [
  { id: 'root', name: 'Macintosh HD', type: 'folder', parentId: null, modifiedAt: Date.now() },
  { id: 'trash', name: 'Trash', type: 'folder', parentId: null, modifiedAt: Date.now(), isLocked: true },

  // Root Level Folders
  { id: 'apps', name: 'Applications', type: 'folder', parentId: 'root', modifiedAt: Date.now() },
  { id: 'library', name: 'Library', type: 'folder', parentId: 'root', modifiedAt: Date.now() },
  { id: 'system', name: 'System', type: 'folder', parentId: 'root', modifiedAt: Date.now(), isLocked: true },
  { id: 'users', name: 'Users', type: 'folder', parentId: 'root', modifiedAt: Date.now() },

  // Applications
  { id: 'app-finder', name: 'Finder.app', type: 'file', parentId: 'apps', modifiedAt: Date.now() },
  { id: 'app-safari', name: 'Safari.app', type: 'file', parentId: 'apps', modifiedAt: Date.now() },
  { id: 'app-settings', name: 'System Settings.app', type: 'file', parentId: 'apps', modifiedAt: Date.now() },
  { id: 'app-terminal', name: 'Terminal.app', type: 'file', parentId: 'apps', modifiedAt: Date.now() },
  { id: 'app-activity', name: 'Activity Monitor.app', type: 'file', parentId: 'apps', modifiedAt: Date.now() },
  { id: 'app-messages', name: 'Messages.app', type: 'file', parentId: 'apps', modifiedAt: Date.now() },
  { id: 'app-photos', name: 'Photos.app', type: 'file', parentId: 'apps', modifiedAt: Date.now() },
  { id: 'app-phone', name: 'Phone.app', type: 'file', parentId: 'apps', modifiedAt: Date.now() },
  { id: 'app-maps', name: 'Maps.app', type: 'file', parentId: 'apps', modifiedAt: Date.now() },
  { id: 'app-mail', name: 'Mail.app', type: 'file', parentId: 'apps', modifiedAt: Date.now() },
  { id: 'app-store', name: 'App Store.app', type: 'file', parentId: 'apps', modifiedAt: Date.now() },
  { id: 'app-books', name: 'Books.app', type: 'file', parentId: 'apps', modifiedAt: Date.now() },
  { id: 'app-wallet', name: 'Wallet.app', type: 'file', parentId: 'apps', modifiedAt: Date.now() },
  { id: 'app-reminders', name: 'Reminders.app', type: 'file', parentId: 'apps', modifiedAt: Date.now() },
  { id: 'app-stickies', name: 'Stickies.app', type: 'file', parentId: 'apps', modifiedAt: Date.now() },
  { id: 'app-contacts', name: 'Contacts.app', type: 'file', parentId: 'apps', modifiedAt: Date.now() },
  { id: 'app-github', name: 'GitHub.app', type: 'file', parentId: 'apps', modifiedAt: Date.now() },
  { id: 'app-facetime', name: 'FaceTime.app', type: 'file', parentId: 'apps', modifiedAt: Date.now() },
  { id: 'app-calendar', name: 'Calendar.app', type: 'file', parentId: 'apps', modifiedAt: Date.now() },
  { id: 'app-crazyerrors', name: 'Crazy Errors.app', type: 'file', parentId: 'apps', modifiedAt: Date.now() },

  // User Home (Architect)
  { id: 'user-home', name: 'Architect', type: 'folder', parentId: 'users', modifiedAt: Date.now() },
  { id: 'desktop', name: 'Desktop', type: 'folder', parentId: 'user-home', modifiedAt: Date.now() },
  { id: 'documents', name: 'Documents', type: 'folder', parentId: 'user-home', modifiedAt: Date.now() },
  { id: 'downloads', name: 'Downloads', type: 'folder', parentId: 'trash', modifiedAt: Date.now() },
  { id: 'pictures', name: 'Pictures', type: 'folder', parentId: 'user-home', modifiedAt: Date.now() },
  { id: 'movies', name: 'Movies', type: 'folder', parentId: 'user-home', modifiedAt: Date.now() },

  // Sample Data
  { id: 'readme', name: 'README.md', type: 'file', parentId: 'user-home', content: '# Welcome to Golden Gate OS V27\n\nThe Unit 7 operating system.', modifiedAt: Date.now(), tags: ['blue'] },
  { id: 'macintosh-hd', name: 'Macintosh HD', type: 'folder', parentId: 'desktop', customIcon: '/icons/disk.png', modifiedAt: Date.now() },
];
const FileSystemContext = createContext<FileSystemContextProps | undefined>(undefined);

export const FileSystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [nodes, setNodes] = useState<FileSystemNode[]>(() => {
    try {
      const saved = localStorage.getItem('golden_gate_v27_fs');
      if (saved) {
        const parsed = JSON.parse(saved) as FileSystemNode[];
        // Migration: Ensure macintosh-hd exists if missing from saved state
        if (!parsed.find(n => n.id === 'macintosh-hd')) {
          const macHD = initialNodes.find(n => n.id === 'macintosh-hd');
          if (macHD) parsed.push(macHD);
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load golden_gate_v27_fs', e);
    }
    return initialNodes;
  });

  const restoreSystemNodes = () => {
    setNodes(prev => {
      const criticalIds = ['root', 'trash', 'apps', 'library', 'system', 'users', 'user-home', 'desktop'];
      const missingNodes = initialNodes.filter(node => 
        criticalIds.includes(node.id) && !prev.some(p => p.id === node.id)
      );

      if (missingNodes.length === 0) return prev;

      // Also ensure existing critical nodes are in the correct hierarchy (not in trash)
      const restored = prev.map(node => {
        if (criticalIds.includes(node.id) && node.parentId === 'trash') {
          const original = initialNodes.find(i => i.id === node.id);
          return original ? { ...node, parentId: original.parentId } : node;
        }
        return node;
      });

      return [...restored, ...missingNodes];
    });
  };

  useEffect(() => {
    const serialized = JSON.stringify(nodes);
    if (serialized.length > 4_000_000) {
      console.warn('VFS too large for localStorage, truncating');
      const trimmed = nodes.map(n => {
        if (n.content && n.content.length > 500) {
          const fileId = storeFileExternal(n.content);
          return { ...n, content: fileId ? `__vfs_ext_${fileId}` : n.content.slice(0, 500) };
        }
        return n;
      });
      try { localStorage.setItem('golden_gate_v27_fs', JSON.stringify(trimmed)); } catch {}
      return;
    }
    try { localStorage.setItem('golden_gate_v27_fs', serialized); } catch {}
  }, [nodes]);

  // Initial self-heal for critical nodes
  useEffect(() => {
    const timer = setTimeout(() => {
      restoreSystemNodes();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const createNode = (node: Omit<FileSystemNode, 'id' | 'modifiedAt'>) => {
    const id = generateId();
    let content = node.content;
    if (content && content.length > 50000) {
      const fileId = storeFileExternal(content);
      content = fileId ? `__vfs_ext_${fileId}` : content.slice(0, 50000);
    }
    setNodes(prev => [...prev, { 
      ...node, 
      id,
      content,
      modifiedAt: Date.now(),
      tags: node.tags || []
    }]);
  };

  const updateNode = (id: string, updates: Partial<FileSystemNode>) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...updates, modifiedAt: Date.now() } : n));
  };

  const cleanupFile = (content: string | undefined) => {
    if (content?.startsWith('__vfs_ext_')) {
      removeFileExternal(content.replace('__vfs_ext_', ''));
    }
  };

  const deleteNode = (id: string) => {
    const node = nodes.find(n => n.id === id);
    if (node) cleanupFile(node.content);
    setNodes(prev => prev.map(n => n.id === id ? { ...n, parentId: 'trash', modifiedAt: Date.now() } : n));
  };

  const emptyTrash = () => {
    const getChildrenIds = (parentId: string): string[] => {
      const children = nodes.filter(n => n.parentId === parentId);
      return [...children.map(c => c.id), ...children.flatMap(c => getChildrenIds(c.id))];
    };
    
    const idsToDelete = getChildrenIds('trash');
    idsToDelete.forEach(id => {
      const node = nodes.find(n => n.id === id);
      if (node) cleanupFile(node.content);
    });
    setNodes(prev => prev.filter(n => !idsToDelete.includes(n.id)));
  };

  const getDirectoryContents = (folderId: string | null) => {
    return nodes.filter(n => n.parentId === folderId);
  };

  const getPath = (nodeId: string | null): FileSystemNode[] => {
    const path: FileSystemNode[] = [];
    let current = nodes.find(n => n.id === nodeId);
    while (current) {
      path.unshift(current);
      current = nodes.find(n => n.id === current?.parentId);
    }
    return path;
  };

  const addTag = (id: string, tag: TagColor) => {
    setNodes(prev => prev.map(n => {
      if (n.id === id) {
        const tags = n.tags || [];
        if (!tags.includes(tag)) return { ...n, tags: [...tags, tag], modifiedAt: Date.now() };
      }
      return n;
    }));
  };

  const removeTag = (id: string, tag: TagColor) => {
    setNodes(prev => prev.map(n => {
      if (n.id === id) {
        return { ...n, tags: (n.tags || []).filter(t => t !== tag), modifiedAt: Date.now() };
      }
      return n;
    }));
  };

  return (
    <FileSystemContext.Provider value={{ 
      nodes, 
      createNode, 
      updateNode,
      deleteNode, 
      emptyTrash,
      getDirectoryContents,
      getPath,
      addTag,
      removeTag,
      restoreSystemNodes
    }}>
      {children}
    </FileSystemContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) throw new Error('useFileSystem must be used within FileSystemProvider');
  return context;
};
