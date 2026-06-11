import React, { useState, useCallback, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useSystem } from '../../contexts/SystemContext';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { downloadBlob, saveToVFS } from '../../utils/vfs-ops';

interface GitHubItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url: string | null;
}

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  children?: FileNode[];
}

interface GitChange {
  file: string;
  status: 'M' | 'A' | 'D' | '??';
}

const GIT_CHANGES: GitChange[] = [
  { file: 'GoldenGate/ContentView.swift', status: 'M' },
  { file: 'GoldenGate/AppDelegate.swift', status: 'A' },
  { file: 'GoldenGate/Package.swift', status: 'M' },
  { file: 'GoldenGateTests/GoldenGateTests.swift', status: 'A' },
];

const statusColors = { M: 'text-orange-400', A: 'text-green-400', D: 'text-red-400', '??': 'text-blue-400' } as const;
const statusLabels = { M: 'Modify', A: 'Add', D: 'Delete', '??': 'Untrack' } as const;

export const XCode: React.FC = () => {
  const { systemState } = useSystem();
  const { createNode } = useFileSystem();
  const [sidebarTab, setSidebarTab] = useState<'navigator' | 'git'>('navigator');
  const [showTerminal, setShowTerminal] = useState(true);
  const [scheme] = useState('GoldenGate');
  const [device] = useState('My Mac');
  const [isBuilding, setIsBuilding] = useState(false);
  const [gitCommitMsg, setGitCommitMsg] = useState('');
  const [commits, setCommits] = useState<string[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'GoldenGate — Build Configuration: Debug',
    'Swift 6.0 — macOS 15.0 SDK',
    '',
  ]);
  const terminalRef = useRef<HTMLDivElement>(null);

  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [fileLanguage, setFileLanguage] = useState('plaintext');
  const [loading, setLoading] = useState(true);
  const [loadingFile, setLoadingFile] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [gitChanges] = useState<GitChange[]>(GIT_CHANGES);

  const OWNER = 'AashmanShukla3223';
  const REPO = 'Antigravity-and-OpenCode-CLI-Prompts-and-Skills';

  const headersRef = useRef<Record<string, string>>({ Accept: 'application/vnd.github.v3+json' });
  headersRef.current = {
    Accept: 'application/vnd.github.v3+json',
    ...(systemState.apiKey ? { Authorization: `Bearer ${systemState.apiKey}` } : {}),
  };

  const fetchDir = useCallback(async (path: string): Promise<GitHubItem[]> => {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}?ref=main`;
    const res = await fetch(url, { headers: headersRef.current });
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }, []);

  const fetchFile = useCallback(async (path: string): Promise<string> => {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}?ref=main`;
    const res = await fetch(url, { headers: headersRef.current });
    if (!res.ok) throw new Error(`Failed to load file: ${res.status}`);
    const data = await res.json();
    return atob(data.content);
  }, []);

  const expandDir = useCallback(async (node: FileNode) => {
    if (node.children) return;
    try {
      const items = await fetchDir(node.path);
      node.children = items.filter(i => i.type === 'dir' || i.type === 'file') as FileNode[];
      setFileTree(prev => [...prev]);
    } catch {
      node.children = [];
      setFileTree(prev => [...prev]);
    }
  }, [fetchDir]);

  const loadFile = useCallback(async (path: string) => {
    setLoadingFile(true);
    setSelectedFilePath(path);
    try {
      const content = await fetchFile(path);
      setFileContent(content);
      setFileLanguage(detectLanguage(path));
    } catch {
      setFileContent('// Error loading file from GitHub');
    }
    setLoadingFile(false);
  }, [fetchFile]);

  const loadTree = useCallback(async () => {
    setLoading(true);
    setFileTree([]);
    setSelectedFilePath(null);
    setFileContent('');
    setExpandedDirs(new Set());
    try {
      const root = await fetchDir('');
      const nodes: FileNode[] = [];
      let readmePath: string | null = null;
      for (const item of root) {
        if (item.type !== 'file' && item.type !== 'dir') continue;
        const node: FileNode = { name: item.name, path: item.path, type: item.type };
        nodes.push(node);
        if (item.type === 'file' && item.name.toLowerCase() === 'readme.md') {
          readmePath = item.path;
        }
      }
      setFileTree(nodes);
      if (readmePath) {
        const content = await fetchFile(readmePath);
        setFileContent(content);
        setFileLanguage('markdown');
        setSelectedFilePath(readmePath);
      }
    } catch {
      setTerminalHistory(prev => [...prev, '⚠️ Failed to load repository files']);
    }
    setLoading(false);
  }, [fetchDir, fetchFile]);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  const toggleDir = useCallback((node: FileNode) => {
    setExpandedDirs(prev => {
      const next = new Set(prev);
      next.has(node.path) ? next.delete(node.path) : next.add(node.path);
      return next;
    });
    if (!node.children) expandDir(node);
  }, [expandDir]);

  const handleBuild = useCallback(() => {
    setIsBuilding(true);
    setTerminalHistory(prev => [...prev, '', `▸ Build GoldenGate (${new Date().toLocaleTimeString()})`]);
    setTimeout(() => {
      setIsBuilding(false);
      setTerminalHistory(prev => [...prev, '  Compile Swift source files', '  Link GoldenGate', '  ✅ Build Succeeded (0.8s)']);
    }, 1200);
  }, []);

  const handleRun = useCallback(() => {
    setTerminalHistory(prev => [...prev, '', `▸ Run GoldenGate on ${device}`, '  Process launched [PID: 48291]']);
  }, [device]);

  const handleCommit = useCallback(() => {
    if (!gitCommitMsg.trim()) return;
    setCommits(prev => [`${new Date().toLocaleDateString()} — ${gitCommitMsg}`, ...prev]);
    setTerminalHistory(prev => [...prev, '', `✅ Committed: "${gitCommitMsg}"`]);
    setGitCommitMsg('');
  }, [gitCommitMsg]);

  const handlePush = useCallback(() => {
    if (commits.length === 0) return;
    setTerminalHistory(prev => [...prev, '', '▸ git push origin main', `  ✅ Pushed to origin/main (${new Date().toLocaleTimeString()})`]);
  }, [commits]);

  const handleTerminalCommand = useCallback((cmd: string) => {
    setTerminalHistory(prev => [...prev, `$ ${cmd}`]);
    const lower = cmd.trim().toLowerCase();
    if (lower === 'clear') { setTerminalHistory([]); return; }
    if (lower === 'help') {
      setTerminalHistory(prev => [...prev, '  Commands: clear, ls, pwd, cd, swift --version, git status, make, echo']);
      return;
    }
    if (lower === 'ls') {
      setTerminalHistory(prev => [...prev, '  GoldenGate/  GoldenGate.xcodeproj/  GoldenGateTests/', '  Package.swift  README.md  .gitignore']);
      return;
    }
    if (lower === 'pwd') {
      setTerminalHistory(prev => [...prev, '  /Users/aashman/Developer/GoldenGate']);
      return;
    }
    if (lower === 'git status') {
      setTerminalHistory(prev => [...prev, '  On branch main', '  Changes not staged for commit:', '    modified:   GoldenGate/ContentView.swift', '    modified:   GoldenGate/Package.swift', '  Untracked files:', '    GoldenGate/AppDelegate.swift']);
      return;
    }
    if (lower === 'make' || lower === 'build') { handleBuild(); return; }
    if (cmd.trim().startsWith('echo ')) {
      setTerminalHistory(prev => [...prev, `  ${cmd.slice(5)}`]);
      return;
    }
    setTerminalHistory(prev => [...prev, `  zsh: command not found: ${cmd.split(' ')[0]}`]);
  }, [handleBuild]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  const renderTree = (nodes: FileNode[], depth = 0): React.ReactNode => {
    const sorted = [...nodes].sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return sorted.map(node => {
      const isExpanded = expandedDirs.has(node.path);

      if (node.type === 'dir') {
        return (
          <div key={node.path}>
            <div
              className="flex items-center gap-1 px-2 py-0.5 hover:bg-white/10 cursor-pointer text-xs truncate"
              style={{ paddingLeft: `${8 + depth * 14}px` }}
              onClick={() => toggleDir(node)}
            >
              <span className="text-[8px] text-white/40">{isExpanded ? '▼' : '▶'}</span>
              <span className="text-white/60">📁</span>
              <span className="truncate text-white/80">{node.name}</span>
            </div>
            {isExpanded && node.children && renderTree(node.children, depth + 1)}
          </div>
        );
      }

      return (
        <div
          key={node.path}
          className={`flex items-center gap-1 px-2 py-0.5 hover:bg-white/10 cursor-pointer text-xs truncate ${selectedFilePath === node.path ? 'bg-blue-500/20 text-blue-400' : 'text-white/80'}`}
          style={{ paddingLeft: `${8 + depth * 14}px` }}
          onClick={() => loadFile(node.path)}
        >
          <span className="w-3" />
          <span className="text-white/40">{getFileIcon(node.name)}</span>
          <span className="truncate">{node.name}</span>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e] text-white">
      <div className="h-11 bg-[#2d2d2d] border-b border-[#3c3c3c] flex items-center px-4 gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{scheme}</span>
          <span className="text-xs text-gray-400">▸</span>
          <span className="text-xs text-gray-300">{device}</span>
        </div>
        <div className="w-px h-5 bg-[#3c3c3c]" />
        <div className="flex items-center gap-1">
          <button onClick={handleBuild} disabled={isBuilding} className="px-3 py-1 rounded text-xs bg-[#3c3c3c] hover:bg-[#4a4a4a] disabled:opacity-40 transition">Build</button>
          <button onClick={handleRun} className="px-3 py-1 rounded text-xs bg-blue-600 hover:bg-blue-500 transition">▶ Run</button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              if (!selectedFilePath || !fileContent) return;
              saveToVFS(createNode, fileContent, selectedFilePath.split('/').pop() || 'untitled', 'documents');
            }}
            disabled={!selectedFilePath}
            className="px-2 py-1 rounded text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 transition"
          >
            💾 Save to VFS
          </button>
          <button
            onClick={() => {
              if (!fileContent) return;
              const filename = selectedFilePath?.split('/').pop() || 'untitled';
              downloadBlob(fileContent, filename, 'text/plain');
            }}
            disabled={!fileContent}
            className="px-2 py-1 rounded text-xs bg-[#3c3c3c] hover:bg-[#4a4a4a] disabled:opacity-30 transition"
          >
            ⬇ Download
          </button>
        </div>
        <div className="flex-1" />
        <span className="text-[10px] text-gray-500">{isBuilding ? 'Building...' : 'Ready'}</span>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="w-52 bg-[#252526] border-r border-[#3c3c3c] flex flex-col shrink-0">
          <div className="flex border-b border-[#3c3c3c]">
            <button
              onClick={() => setSidebarTab('navigator')}
              className={`flex-1 py-2 text-[10px] font-medium uppercase tracking-wider transition ${sidebarTab === 'navigator' ? 'text-white border-b-2 border-blue-500 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
            >📁 Files</button>
            <button
              onClick={() => setSidebarTab('git')}
              className={`flex-1 py-2 text-[10px] font-medium uppercase tracking-wider transition ${sidebarTab === 'git' ? 'text-white border-b-2 border-blue-500 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
            >🔀 Git</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sidebarTab === 'navigator' ? (
              loading ? (
                <div className="p-4 text-xs text-gray-500">Loading files...</div>
              ) : (
                <div className="py-1">{renderTree(fileTree)}</div>
              )
            ) : (
              <div className="p-3 space-y-3">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Changes ({gitChanges.length})</div>
                {gitChanges.map(change => (
                  <div key={change.file} className="flex items-center gap-2 text-xs">
                    <span className={`${statusColors[change.status]} font-mono text-[10px] w-8`}>{statusLabels[change.status]}</span>
                    <span className="truncate text-gray-300">{change.file.split('/').pop()}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-[#333]">
                  <textarea
                    value={gitCommitMsg}
                    onChange={(e) => setGitCommitMsg(e.target.value)}
                    placeholder="Commit message..."
                    className="w-full h-16 bg-[#1a1a1a] border border-[#333] rounded px-2 py-1.5 text-xs text-white placeholder-gray-500 resize-none outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={handleCommit} disabled={!gitCommitMsg.trim()} className="flex-1 py-1.5 rounded text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-30 transition">Commit</button>
                    <button onClick={handlePush} disabled={commits.length === 0} className="flex-1 py-1.5 rounded text-xs bg-[#3c3c3c] hover:bg-[#4a4a4a] disabled:opacity-30 transition">Push</button>
                  </div>
                </div>
                {commits.length > 0 && (
                  <div className="pt-2 border-t border-[#333]">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Recent</div>
                    {commits.slice(0, 5).map((msg, i) => (
                      <div key={i} className="text-[10px] text-gray-400 py-1 border-b border-[#2a2a2a] last:border-0">{msg}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-9 bg-[#2d2d2d] border-b border-[#3c3c3c] flex items-center px-4 gap-2 shrink-0">
            <span className="text-xs text-blue-400 truncate">{selectedFilePath || 'No file selected'}</span>
            {selectedFilePath && <span className="text-[10px] text-gray-500 ml-auto">{fileLanguage}</span>}
          </div>
          <div className="flex-1 min-h-0">
            {selectedFilePath ? (
              loadingFile ? (
                <div className="flex items-center justify-center h-full text-xs text-gray-500">Loading...</div>
              ) : (
                <Editor height="100%" language={fileLanguage} value={fileContent} theme="vs-dark" onChange={(val) => setFileContent(val || '')}
                  options={{ readOnly: false, minimap: { enabled: true }, fontSize: 13, lineNumbers: 'on', scrollBeyondLastLine: false, automaticLayout: true, padding: { top: 12 } }}
                />
              )
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-500">Select a file from the navigator</div>
            )}
          </div>
        </div>
      </div>

      {showTerminal && (
        <div className="h-44 bg-[#1a1a1a] border-t border-[#3c3c3c] flex flex-col shrink-0">
          <div className="h-8 bg-[#2d2d2d] border-b border-[#3c3c3c] flex items-center px-4 shrink-0">
            <span className="text-xs text-gray-300">Terminal</span>
            <div className="flex-1" />
            <button onClick={() => setShowTerminal(false)} className="text-[10px] text-gray-500 hover:text-gray-300">✕</button>
          </div>
          <div ref={terminalRef} className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed" style={{ backgroundColor: '#1a1a1a' }}>
            {terminalHistory.map((line, i) => (
              <div key={i} className={line.startsWith('✅') ? 'text-green-400' : line.startsWith('⚠️') ? 'text-yellow-400' : line.startsWith('▸') ? 'text-blue-400' : line.startsWith('$') ? 'text-green-300' : line.startsWith('  ✅') ? 'text-green-400' : 'text-gray-300'}>{line}</div>
            ))}
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-green-300">$</span>
              <input
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && terminalInput.trim()) {
                    handleTerminalCommand(terminalInput);
                    setTerminalInput('');
                  }
                }}
                className="flex-1 bg-transparent text-green-300 outline-none text-xs"
                placeholder="Type a command..."
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function detectLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    json: 'json', md: 'markdown', html: 'html', css: 'css', scss: 'scss',
    py: 'python', rs: 'rust', go: 'go', java: 'java', kt: 'kotlin',
    swift: 'swift', c: 'c', cpp: 'cpp', h: 'c', yml: 'yaml', yaml: 'yaml',
    xml: 'xml', sh: 'shell', bash: 'shell', sql: 'sql', graphql: 'graphql',
    swiftinterface: 'swift', plist: 'xml', xcscheme: 'xml',
  };
  return map[ext || ''] || 'plaintext';
}

function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  const iconMap: Record<string, string> = {
    ts: '🟦', tsx: '⚛️', js: '🟨', jsx: '⚛️', json: '📋', md: '📝',
    html: '🌐', css: '🎨', py: '🐍', rs: '🦀', go: '🔷', java: '☕',
    swift: '🕊️', c: '⚙️', cpp: '⚙️', yml: '⚙️', sh: '💻', sql: '🗃️',
    xml: '📰', plist: '📋', swiftinterface: '🕊️',
  };
  const dirIcons: Record<string, string> = {
    node_modules: '📦', 'dist': '📦', build: '🔨', src: '📁', public: '🌍',
    assets: '🖼️', components: '🧩', hooks: '🪝', utils: '🔧', contexts: '🌐',
    GoldenGate: '📱', 'GoldenGate.xcodeproj': '📁', 'GoldenGateTests': '🧪',
    'GoldenGateUITests': '🧪',
  };
  if (dirIcons[name]) return dirIcons[name];
  return iconMap[ext || ''] || '📄';
}
