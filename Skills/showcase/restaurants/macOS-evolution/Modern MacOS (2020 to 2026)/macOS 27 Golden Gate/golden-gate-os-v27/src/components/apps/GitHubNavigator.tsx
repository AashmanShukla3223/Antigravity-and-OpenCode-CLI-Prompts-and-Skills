import React, { useState } from 'react';
import { useSystem } from '../../contexts/SystemContext';
import { AppIcon } from '../common/AppIcon';
import { 
  File01Icon, 
  Search01Icon,
  ArrowLeft01Icon as ChevronLeft
} from 'hugeicons-react';

interface GitHubItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  url: string;
  download_url: string | null;
}

export const GitHubNavigator: React.FC = () => {
  const { updateSystemState, triggerSystemError, launchApp, showAlert } = useSystem();
  const [repoPath, setRepoPath] = useState('');
  const [contents, setContents] = useState<GitHubItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [currentDir, setCurrentDir] = useState('');

  const base = (import.meta as any).env?.BASE_URL || '/';

  const fetchContents = async (path: string, dir: string = '') => {
    setLoading(true);
    try {
      // Check for dangerous repos
      if (path.toLowerCase().includes('virus') || path.toLowerCase().includes('chaos') || path.toLowerCase().includes('malware')) {
        triggerSystemError();
        showAlert("This repository contains unsigned kernel extensions. Opening may cause system instability.", "Security Warning");
      }

      const response = await fetch(`https://api.github.com/repos/${path}/contents/${dir}`);
      if (!response.ok) throw new Error('Repo not found or API limit reached');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setContents(data);
        setCurrentDir(dir);
      } else {
        throw new Error('Not a directory');
      }
    } catch (err: any) {
      showAlert(err.message, "GitHub Error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoPath) {
      fetchContents(repoPath);
      setHistory([]);
    }
  };

  const handleFileClick = async (file: GitHubItem) => {
    if (file.type === 'dir') {
      const nextDir = file.path;
      setHistory([...history, currentDir]);
      fetchContents(repoPath, nextDir);
    } else {
      if (file.download_url) {
        setLoading(true);
        try {
          const res = await fetch(file.download_url);
          const text = await res.text();
          updateSystemState({ 
            currentFileContent: text,
            currentFileName: file.name
          } as any);
          launchApp('codeviewer');
        } catch {
          showAlert("Could not fetch file content", "Error");
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const goBack = () => {
    if (history.length > 0) {
      const prevDir = history[history.length - 1];
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      fetchContents(repoPath, prevDir);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white/90 text-gray-800 font-sans">
      {/* Search Header */}
      <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4 bg-gray-50/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <ChevronLeft 
            size={20} 
            onClick={goBack}
            className={`cursor-pointer transition-colors ${history.length > 0 ? 'text-gray-600 hover:text-black' : 'text-gray-200 pointer-events-none'}`} 
          />
          <div className="flex flex-col">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">GitHub Navigator</h2>
            <div className="text-[10px] text-blue-500 font-medium mt-1 truncate max-w-[200px]">
              {repoPath ? `${repoPath}/${currentDir}` : 'Enter repository (user/repo)'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative w-64">
          <Search01Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search (e.g. facebook/react)"
            value={repoPath}
            onChange={(e) => setRepoPath(e.target.value)}
            className="w-full h-8 bg-white/50 border border-gray-200 rounded-lg pl-9 pr-4 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
          />
        </form>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 relative">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/20 backdrop-blur-[2px]">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!repoPath && contents.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-4">
             <img src={`${base}icons/github.png`} className="w-16 h-16 opacity-10 grayscale" alt="GitHub" />
             <span className="text-xs font-bold uppercase tracking-[0.2em]">Repository Explorer</span>
          </div>
        )}

        {contents.length > 0 && (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {contents.map((item) => (
              <div 
                key={item.path}
                onDoubleClick={() => handleFileClick(item)}
                className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition-all cursor-default group"
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  {item.type === 'dir' ? (
                    <AppIcon id="folder" size={48} />
                  ) : (
                    <File01Icon size={40} strokeWidth={1} className="text-gray-400 fill-gray-50 object-contain" style={{ objectFit: 'contain' }} />
                  )}
                </div>
                <span className="text-[11px] font-medium text-center truncate w-full px-1 text-gray-700">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="h-6 border-t border-gray-100 bg-gray-50/50 px-4 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
        <span>{loading ? 'Fetching...' : `${contents.length} items`}</span>
        <span>GitHub API v3</span>
      </div>
    </div>
  );
};
