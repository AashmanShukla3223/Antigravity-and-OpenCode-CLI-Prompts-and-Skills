import React, { useState, useEffect, useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useSystem } from '../../contexts/SystemContext';

const OWNER = 'AashmanShukla3223';

interface RepoOption {
  label: string;
  value: string;
  type: 'repo' | 'profile';
}

const REPO_OPTIONS: RepoOption[] = [
  { label: 'Antigravity-and-OpenCode-CLI-Prompts-and-Skills', value: `${OWNER}/Antigravity-and-OpenCode-CLI-Prompts-and-Skills`, type: 'repo' },
  { label: 'Samsung-LCD-TV-Simulator', value: `${OWNER}/Samsung-LCD-TV-Simulator`, type: 'repo' },
  { label: 'AashmanShukla3223 (Profile)', value: OWNER, type: 'profile' },
];

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

interface RepoInfo {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
}

export const VSCode: React.FC = () => {
  const { systemState } = useSystem();
  const [selectedRepo, setSelectedRepo] = useState<string>(REPO_OPTIONS[0].value);
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileLanguage, setFileLanguage] = useState<string>('plaintext');
  const [loading, setLoading] = useState(true);
  const [loadingFile, setLoadingFile] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [userRepos, setUserRepos] = useState<RepoInfo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  const isProfileMode = !selectedRepo.includes('/');

  const currentOption = REPO_OPTIONS.find(r => r.value === selectedRepo) || REPO_OPTIONS[0];

  const headersRef = useRef<Record<string, string>>({ Accept: 'application/vnd.github.v3+json' });
  headersRef.current = {
    Accept: 'application/vnd.github.v3+json',
    ...(systemState.apiKey ? { Authorization: `Bearer ${systemState.apiKey}` } : {}),
  };

  const fetchDir = useCallback(async (owner: string, repo: string, path: string): Promise<GitHubItem[]> => {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=main`;
    const res = await fetch(url, { headers: headersRef.current });
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }, []);

  const fetchFile = useCallback(async (owner: string, repo: string, path: string): Promise<string> => {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=main`;
    const res = await fetch(url, { headers: headersRef.current });
    if (!res.ok) throw new Error(`Failed to load file: ${res.status}`);
    const data = await res.json();
    return atob(data.content);
  }, []);

  const expandDir = useCallback(async (node: FileNode) => {
    if (node.children) return;
    const [owner, repo] = selectedRepo.split('/');
    try {
      const items = await fetchDir(owner, repo, node.path);
      node.children = items.filter(i => i.type === 'dir' || i.type === 'file');
      setFileTree(prev => [...prev]);
    } catch {
      node.children = [];
      setFileTree(prev => [...prev]);
    }
  }, [selectedRepo, fetchDir]);

  const loadFile = useCallback(async (path: string) => {
    const [owner, repo] = selectedRepo.split('/');
    setLoadingFile(true);
    setSelectedFile(path);
    try {
      const content = await fetchFile(owner, repo, path);
      setFileContent(content);
      setFileLanguage(detectLanguage(path));
    } catch (err: any) {
      setFileContent(`// Error loading file: ${err.message}`);
    }
    setLoadingFile(false);
  }, [selectedRepo, fetchFile]);

  const loadRepoTree = useCallback(async () => {
    const [owner, repo] = selectedRepo.split('/');
    setLoading(true);
    setFileTree([]);
    setSelectedFile(null);
    setFileContent('');
    setExpandedDirs(new Set());
    try {
      const root = await fetchDir(owner, repo, '');
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
        const content = await fetchFile(owner, repo, readmePath);
        setFileContent(content);
        setFileLanguage('markdown');
        setSelectedFile(readmePath);
      }
    } catch (err: any) {
      console.error('Failed to load repo:', err);
    }
    setLoading(false);
  }, [selectedRepo, fetchDir, fetchFile]);

  const loadUserRepos = useCallback(async () => {
    setLoadingRepos(true);
    setUserRepos([]);
    try {
      const res = await fetch(`https://api.github.com/users/${OWNER}/repos?sort=updated&per_page=30`, { headers: headersRef.current });
      if (!res.ok) throw new Error(`Failed to load repos: ${res.status}`);
      const data = await res.json();
      setUserRepos(data.map((r: any) => ({
        name: r.name,
        description: r.description || '',
        language: r.language || '',
        stars: r.stargazers_count,
        forks: r.forks_count,
      })));
    } catch (err: any) {
      console.error('Failed to load user repos:', err);
    }
    setLoadingRepos(false);
  }, []);

  useEffect(() => {
    if (isProfileMode) {
      loadUserRepos();
    } else {
      loadRepoTree();
    }
  }, [selectedRepo, isProfileMode, loadRepoTree, loadUserRepos]);

  const toggleDir = (node: FileNode) => {
    setExpandedDirs(prev => {
      const next = new Set(prev);
      if (next.has(node.path)) next.delete(node.path);
      else next.add(node.path);
      return next;
    });
    if (!node.children) {
      expandDir(node);
    }
  };

  const renderTree = (nodes: FileNode[], depth = 0) => {
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
              <span className="shrink-0 text-white/40">{isExpanded ? '▼' : '▶'}</span>
              <span className="text-white/60 shrink-0">📁</span>
              <span className="ml-1 truncate text-white/80">{node.name}</span>
            </div>
            {isExpanded && node.children && (
              renderTree(node.children, depth + 1)
            )}
          </div>
        );
      }

      return (
        <div
          key={node.path}
          className={`flex items-center gap-1 px-2 py-0.5 hover:bg-white/10 cursor-pointer text-xs truncate ${selectedFile === node.path ? 'bg-blue-500/20 text-blue-400' : 'text-white/80'}`}
          style={{ paddingLeft: `${8 + depth * 14}px` }}
          onClick={() => loadFile(node.path)}
        >
          <span className="w-4" />
          <span className="text-white/40 shrink-0">{getFileIcon(node.name)}</span>
          <span className="ml-1 truncate">{node.name}</span>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e] text-white">
      <div className="h-10 bg-[#2d2d2d] border-b border-[#3c3c3c] flex items-center px-4 gap-2 shrink-0">
        <div className="relative">
          <button
            onClick={() => setShowRepoDropdown(!showRepoDropdown)}
            className="flex items-center gap-2 px-3 py-1 bg-[#3c3c3c] hover:bg-[#4a4a4a] rounded text-xs font-medium transition"
          >
            <span className="w-3.5 h-3.5 rounded-full bg-blue-500 shrink-0" />
            <span className="truncate max-w-[200px]">{currentOption.label}</span>
            <span className="text-white/40 text-[10px]">{showRepoDropdown ? '▲' : '▼'}</span>
          </button>
          {showRepoDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowRepoDropdown(false)} />
              <div className="absolute top-full left-0 mt-1 w-72 bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-2xl z-20 py-1">
                {REPO_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSelectedRepo(option.value);
                      setShowRepoDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-[#3c3c3c] transition flex items-center gap-2 ${selectedRepo === option.value ? 'text-blue-400 bg-blue-500/10' : 'text-white/80'}`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${option.type === 'profile' ? 'bg-purple-500' : 'bg-blue-500'}`} />
                    <span className="truncate">{option.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-56 bg-[#252526] border-r border-[#3c3c3c] flex flex-col shrink-0">
          <div className="h-9 flex items-center px-4 text-[11px] uppercase tracking-widest text-white/40 font-semibold border-b border-[#3c3c3c]">
            {isProfileMode ? 'Repositories' : 'Explorer'}
          </div>
          <div className="flex-1 overflow-y-auto py-1 scrollbar-hide">
            {isProfileMode ? (
              loadingRepos ? (
                <div className="flex items-center justify-center py-8 text-white/40 text-xs">Loading...</div>
              ) : (
                userRepos.map(repo => (
                  <div
                    key={repo.name}
                    onClick={() => setSelectedRepo(`${OWNER}/${repo.name}`)}
                    className="flex flex-col px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-[#3c3c3c]/50 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-white/60">📦</span>
                      <span className="text-xs font-medium text-white/90 truncate">{repo.name}</span>
                    </div>
                    {repo.description && (
                      <p className="text-[10px] text-white/40 mt-0.5 line-clamp-2 pl-6">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 pl-6">
                      {repo.language && <span className="text-[9px] text-white/30">{repo.language}</span>}
                      <span className="text-[9px] text-white/30">★ {repo.stars}</span>
                      <span className="text-[9px] text-white/30">⑂ {repo.forks}</span>
                    </div>
                  </div>
                ))
              )
            ) : (
              loading ? (
                <div className="flex items-center justify-center py-8 text-white/40 text-xs">Loading...</div>
              ) : (
                renderTree(fileTree)
              )
            )}
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          {isProfileMode ? (
            <div className="flex items-center justify-center flex-1 text-white/30 text-sm">
              Select a repository from the sidebar
            </div>
          ) : selectedFile ? (
            loadingFile ? (
              <div className="flex items-center justify-center flex-1 text-white/40 text-xs">Loading...</div>
            ) : (
              <Editor
                height="100%"
                language={fileLanguage}
                value={fileContent}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: true },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 12 },
                }}
              />
            )
          ) : (
            <div className="flex items-center justify-center flex-1 text-white/30 text-sm">
              Select a file from the explorer
            </div>
          )}
        </div>
      </div>
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
    toml: 'plaintext', xml: 'xml', sh: 'shell', bash: 'shell', zsh: 'shell',
    sql: 'sql', graphql: 'graphql', txt: 'plaintext', cfg: 'plaintext',
    ini: 'plaintext', env: 'plaintext', gitignore: 'plaintext',
  };
  return map[ext || ''] || 'plaintext';
}

function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  const iconMap: Record<string, string> = {
    ts: '🟦', tsx: '⚛️', js: '🟨', jsx: '⚛️', json: '📋', md: '📝',
    html: '🌐', css: '🎨', py: '🐍', rs: '🦀', go: '🔷', java: '☕',
    swift: '🕊️', c: '⚙️', cpp: '⚙️', yml: '⚙️', toml: '⚙️', sh: '💻',
    sql: '🗃️', xml: '📰', gitignore: '🙈', lock: '🔒', env: '🔐',
  };
  const dirIcons: Record<string, string> = {
    'node_modules': '📦', '.git': '🔀', 'dist': '📦', 'build': '🔨',
    'src': '📁', 'public': '🌍', 'assets': '🖼️', 'components': '🧩',
    'hooks': '🪝', 'utils': '🔧', 'contexts': '🌐', 'types': '📐',
  };
  if (dirIcons[name]) return dirIcons[name];
  if (name === 'package.json') return '📦';
  return iconMap[ext || ''] || '📄';
}
