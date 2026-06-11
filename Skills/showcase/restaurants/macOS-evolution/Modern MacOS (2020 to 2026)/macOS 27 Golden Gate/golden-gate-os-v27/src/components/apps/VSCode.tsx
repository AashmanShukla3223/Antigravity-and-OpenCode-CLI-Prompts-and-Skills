import React, { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useSystem } from '../../contexts/SystemContext';

const OWNER = 'AashmanShukla3223';
const REPO = 'Antigravity-and-OpenCode-CLI-Prompts-and-Skills';
const BRANCH = 'main';
const GITHUB_API = `https://api.github.com/repos/${OWNER}/${REPO}`;

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
  expanded?: boolean;
}

export const VSCode: React.FC = () => {
  const { systemState } = useSystem();
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileLanguage, setFileLanguage] = useState<string>('plaintext');
  const [loading, setLoading] = useState(true);
  const [loadingFile, setLoadingFile] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['']));

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (systemState.apiKey) {
    headers['Authorization'] = `Bearer ${systemState.apiKey}`;
  }

  const fetchDir = useCallback(async (path: string): Promise<GitHubItem[]> => {
    const url = `${GITHUB_API}/contents/${path}?ref=${BRANCH}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }, []);

  useEffect(() => {
    const loadTree = async () => {
      setLoading(true);
      try {
        const root = await fetchDir('');
        const tree = await buildFileTree(root, fetchDir);
        setFileTree(tree);
      } catch (err: any) {
        console.error('Failed to load repo:', err);
      }
      setLoading(false);
    };
    loadTree();
  }, [fetchDir]);

  const loadFile = async (path: string) => {
    setLoadingFile(true);
    setSelectedFile(path);
    try {
      const url = `${GITHUB_API}/contents/${path}?ref=${BRANCH}`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`Failed to load file: ${res.status}`);
      const data = await res.json();
      const content = atob(data.content);
      setFileContent(content);
      setFileLanguage(detectLanguage(path));
    } catch (err: any) {
      console.error('Failed to load file:', err);
      setFileContent(`// Error loading file: ${err.message}`);
    }
    setLoadingFile(false);
  };

  const toggleDir = (path: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
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
              onClick={() => {
                toggleDir(node.path);
                if (!node.children && !isExpanded) {
                  fetchDir(node.path).then(items => {
                    node.children = items.filter(i => i.type === 'dir' || i.type === 'file') as FileNode[];
                    setFileTree([...fileTree]);
                  });
                }
              }}
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
    <div className="flex h-full w-full bg-[#1e1e1e] text-white">
      <div className="w-56 bg-[#252526] border-r border-[#3c3c3c] flex flex-col shrink-0">
        <div className="h-9 flex items-center px-4 text-[11px] uppercase tracking-widest text-white/40 font-semibold border-b border-[#3c3c3c]">
          Explorer
        </div>
        <div className="flex-1 overflow-y-auto py-1 scrollbar-hide">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-white/40 text-xs">Loading...</div>
          ) : (
            renderTree(fileTree)
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedFile ? (
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
  );
};

async function buildFileTree(
  items: GitHubItem[],
  fetchDir: (path: string) => Promise<GitHubItem[]>
): Promise<FileNode[]> {
  const nodes: FileNode[] = [];
  for (const item of items) {
    if (item.type !== 'file' && item.type !== 'dir') continue;
    const node: FileNode = {
      name: item.name,
      path: item.path,
      type: item.type,
    };
    if (item.type === 'dir') {
      try {
        const children = await fetchDir(item.path);
        node.children = children.filter(c => c.type === 'file' || c.type === 'dir');
      } catch {
        node.children = [];
      }
    }
    nodes.push(node);
  }
  return nodes;
}

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
