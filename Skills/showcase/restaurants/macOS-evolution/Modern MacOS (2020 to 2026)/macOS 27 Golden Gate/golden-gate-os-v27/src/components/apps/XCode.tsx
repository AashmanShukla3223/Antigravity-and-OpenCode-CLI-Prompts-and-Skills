import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { useSystem } from '../../contexts/SystemContext';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { downloadBlob, saveToVFS, ImportFileButton, useFileDrop } from '../../utils/vfs-ops';
import { AIEngine, getActiveProvider } from '../../utils/AIEngine';

interface GitHubItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url: string | null;
  sha: string;
}

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  sha?: string;
  children?: FileNode[];
}

interface GitChange {
  file: string;
  status: 'M' | 'A' | 'D' | '??';
}

const statusColors = { M: 'text-orange-400', A: 'text-green-400', D: 'text-red-400', '??': 'text-blue-400' } as const;
const statusLabels = { M: 'Modify', A: 'Add', D: 'Delete', '??': 'Untrack' } as const;

export const XCode: React.FC = () => {
  const { systemState } = useSystem();
  const { nodes, createNode } = useFileSystem();
  const [sidebarTab, setSidebarTab] = useState<'navigator' | 'git'>('navigator');
  const [showTerminal, setShowTerminal] = useState(true);
  const [bottomTab, setBottomTab] = useState<'terminal' | 'ai'>('terminal');
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
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
  const aiRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<AIEngine | null>(null);
  const fileShaCache = useRef<Map<string, string>>(new Map());

  const dropHandlers = useFileDrop(
    createNode,
    'documents',
    '.txt,.js,.ts,.tsx,.jsx,.json,.md,.css,.html,.py,.swift,.rs,.go,.yml,.yaml,.toml,.xml,.sh,.env,.gitignore',
    (file, dataUrl) => {
      setFileContent(dataUrl);
      setSelectedFilePath(file.name);
      setFileLanguage(detectLanguage(file.name));
      const localNode = nodes.find((n) => n.name === file.name && n.parentId === 'documents');
      if (!localNode) {
        createNode({ name: file.name, type: 'file', parentId: 'documents', content: dataUrl, size: file.size });
      }
    },
  );

  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [fileLanguage, setFileLanguage] = useState('plaintext');
  const [loading, setLoading] = useState(true);
  const [loadingFile, setLoadingFile] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  const OWNER = 'AashmanShukla3223';
  const REPO = 'Antigravity-and-OpenCode-CLI-Prompts-and-Skills';
  const token = systemState.apiKey;

  const headersRef = useRef<Record<string, string>>({ Accept: 'application/vnd.github.v3+json' });
  headersRef.current = {
    Accept: 'application/vnd.github.v3+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const localFiles = useMemo(() => {
    return nodes.filter((n) => n.type === 'file' && n.parentId === 'documents' && n.content);
  }, [nodes]);

  const flattenTree = (node: FileNode): FileNode[] => {
    if (node.type === 'file') return [node];
    return [node, ...(node.children || []).flatMap(flattenTree)];
  };

  const gitChanges = useMemo((): GitChange[] => {
    const changes: GitChange[] = [];
    const ghPaths = new Set(
      fileTree.flatMap((n) => {
        const f = flattenTree(n);
        return f.map((x) => x.path);
      }),
    );
    const localNames = new Set(localFiles.map((n) => n.name));

    localFiles.forEach((n) => {
      if (!ghPaths.has(n.name)) {
        changes.push({ file: n.name, status: 'A' });
      }
    });
    fileTree.forEach((n) => {
      const items = flattenTree(n);
      items.forEach((item) => {
        if (item.type === 'file' && !localNames.has(item.name)) {
          changes.push({ file: item.path, status: 'D' });
        } else if (item.type === 'file' && localNames.has(item.name)) {
          changes.push({ file: item.path, status: 'M' });
        }
      });
    });
    return changes.slice(0, 20);
  }, [fileTree, localFiles]);

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
    if (data.sha) fileShaCache.current.set(path, data.sha);
    return atob(data.content);
  }, []);

  const expandDir = useCallback(
    async (node: FileNode) => {
      if (node.children) return;
      try {
        const items = await fetchDir(node.path);
        node.children = items.filter((i) => i.type === 'dir' || i.type === 'file') as FileNode[];
        items.forEach((i) => {
          if (i.sha) fileShaCache.current.set(i.path, i.sha);
        });
        setFileTree((prev) => [...prev]);
      } catch {
        node.children = [];
        setFileTree((prev) => [...prev]);
      }
    },
    [fetchDir],
  );

  const loadFile = useCallback(
    async (path: string) => {
      setLoadingFile(true);
      setSelectedFilePath(path);
      try {
        const local = localFiles.find((n) => n.name === path);
        if (local?.content) {
          setFileContent(local.content);
          setFileLanguage(detectLanguage(path));
        } else {
          const content = await fetchFile(path);
          setFileContent(content);
          setFileLanguage(detectLanguage(path));
        }
      } catch {
        setFileContent(`// ${path}\n// Could not load file. Import it locally to edit.`);
      }
      setLoadingFile(false);
    },
    [fetchFile, localFiles],
  );

  const loadTree = useCallback(async () => {
    setLoading(true);
    setFileTree([]);
    setSelectedFilePath(null);
    setFileContent('');
    setExpandedDirs(new Set());
    try {
      const root = await fetchDir('');
      const treeNodes: FileNode[] = [];
      let readmePath: string | null = null;
      for (const item of root) {
        if (item.type !== 'file' && item.type !== 'dir') continue;
        const node: FileNode = { name: item.name, path: item.path, type: item.type, sha: item.sha };
        treeNodes.push(node);
        if (item.sha) fileShaCache.current.set(item.path, item.sha);
        if (item.type === 'file' && item.name.toLowerCase() === 'readme.md') {
          readmePath = item.path;
        }
      }
      const localNodes: FileNode[] = localFiles.map((f) => ({
        name: f.name,
        path: f.name,
        type: 'file' as const,
      }));
      const merged = [...treeNodes, ...localNodes.filter((ln) => !treeNodes.find((tn) => tn.name === ln.name))];
      setFileTree(merged);
      if (readmePath) {
        const content = await fetchFile(readmePath);
        setFileContent(content);
        setFileLanguage('markdown');
        setSelectedFilePath(readmePath);
      } else if (localFiles.length > 0) {
        const first = localFiles[0];
        if (first.content) {
          setFileContent(first.content);
          setFileLanguage(detectLanguage(first.name));
          setSelectedFilePath(first.name);
        }
      }
    } catch {
      if (localFiles.length > 0) {
        const root: FileNode[] = localFiles.map((f) => ({
          name: f.name,
          path: f.name,
          type: 'file' as const,
        }));
        setFileTree(root);
        const first = localFiles[0];
        if (first.content) {
          setFileContent(first.content);
          setFileLanguage(detectLanguage(first.name));
          setSelectedFilePath(first.name);
        }
      } else {
        const welcomeContent = `// GoldenGate — macOS 27 AI-Powered App Suite\n//\n// Welcome to Xcode for Golden Gate OS.\n// Import or drop files to start editing.\n\nimport SwiftUI\n\n@main\nstruct GoldenGateApp: App {\n    var body: some Scene {\n        WindowGroup {\n            ContentView()\n        }\n    }\n}\n\nstruct ContentView: View {\n    var body: some View {\n        VStack {\n            Text("Hello, Golden Gate!")\n                .font(.largeTitle)\n                .padding()\n            Text("Drop files or use Import to begin.")\n                .foregroundColor(.secondary)\n        }\n    }\n}\n`;
        const root: FileNode[] = [
          {
            name: 'GoldenGate',
            path: 'GoldenGate',
            type: 'dir',
            children: [
              { name: 'GoldenGateApp.swift', path: 'GoldenGateApp.swift', type: 'file' },
              { name: 'ContentView.swift', path: 'ContentView.swift', type: 'file' },
            ],
          },
          {
            name: 'GoldenGate.xcodeproj',
            path: 'GoldenGate.xcodeproj',
            type: 'dir',
            children: [{ name: 'project.pbxproj', path: 'project.pbxproj', type: 'file' }],
          },
          { name: 'Package.swift', path: 'Package.swift', type: 'file' },
          { name: 'README.md', path: 'README.md', type: 'file' },
        ];
        setFileTree(root);
        setExpandedDirs(new Set(['GoldenGate', 'GoldenGate.xcodeproj']));
        setFileContent(welcomeContent);
        setFileLanguage('swift');
        setSelectedFilePath('GoldenGateApp.swift');
      }
    }
    setLoading(false);
  }, [fetchDir, fetchFile, localFiles]);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  const toggleDir = useCallback(
    (node: FileNode) => {
      setExpandedDirs((prev) => {
        const next = new Set(prev);
        if (next.has(node.path)) next.delete(node.path); else next.add(node.path);
        return next;
      });
      if (!node.children) expandDir(node);
    },
    [expandDir],
  );

  const commitToGitHub = useCallback(
    async (message: string) => {
      const changedFiles = gitChanges.filter((c) => c.status === 'A' || c.status === 'M');
      if (changedFiles.length === 0) return;

      setTerminalHistory((prev) => [...prev, '', `▸ git commit -m "${message}"`]);

      for (const change of changedFiles) {
        const localNode = localFiles.find((n) => n.name === change.file);
        if (!localNode?.content) continue;

        const path = change.file;
        const sha = fileShaCache.current.get(path) || undefined;

        try {
          const base64Content = localNode.content.startsWith('data:')
            ? await dataUrlToBase64(localNode.content)
            : btoa(unescape(encodeURIComponent(localNode.content)));

          const body: Record<string, unknown> = {
            message,
            content: base64Content,
            branch: 'main',
          };
          if (sha) body.sha = sha;

          const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
            method: 'PUT',
            headers: { ...headersRef.current, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.content?.sha) fileShaCache.current.set(path, data.content.sha);
            setTerminalHistory((prev) => [...prev, `  ✅ ${path}`]);
          } else {
            const err = await res.json();
            setTerminalHistory((prev) => [...prev, `  ⚠️ ${path}: ${err.message || res.status}`]);
          }
        } catch {
          setTerminalHistory((prev) => [...prev, `  ⚠️ ${path}: Network error`]);
        }
      }

      setCommits((prev) => [`${new Date().toLocaleDateString()} — ${message}`, ...prev]);
      setTerminalHistory((prev) => [...prev, `✅ Committed ${changedFiles.length} file(s)`]);
    },
    [gitChanges, localFiles],
  );

  const pullFromGitHub = useCallback(async () => {
    setTerminalHistory((prev) => [...prev, '', '▸ git pull origin main']);
    fileShaCache.current.clear();
    await loadTree();
    setTerminalHistory((prev) => [...prev, '  ✅ Up to date']);
  }, [loadTree]);

  const fetchCommitLog = useCallback(async () => {
    try {
      const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/commits?per_page=10`, {
        headers: headersRef.current,
      });
      if (!res.ok) return;
      const data = await res.json();
      const logLines = data.map(
        (c: { commit: { message: string; author: { name: string } } }) =>
          `  ${c.commit.message.split('\n')[0]} (${c.commit.author.name})`,
      );
      setTerminalHistory((prev) => [...prev, '', '▸ git log --oneline -10', ...logLines]);
    } catch {
      setTerminalHistory((prev) => [...prev, '  ⚠️ Failed to fetch commit log']);
    }
  }, []);

  const handleBuild = useCallback(() => {
    setIsBuilding(true);
    setTerminalHistory((prev) => [...prev, '', `▸ Build GoldenGate (${new Date().toLocaleTimeString()})`]);
    setTimeout(() => {
      setIsBuilding(false);
      setTerminalHistory((prev) => [
        ...prev,
        '  Compile Swift source files',
        '  Link GoldenGate',
        '  ✅ Build Succeeded (0.8s)',
      ]);
    }, 1200);
  }, []);

  const handleRun = useCallback(() => {
    setTerminalHistory((prev) => [...prev, '', `▸ Run GoldenGate on ${device}`, '  Process launched [PID: 48291]']);
  }, [device]);

  const handleCommit = useCallback(() => {
    if (!gitCommitMsg.trim()) return;
    commitToGitHub(gitCommitMsg);
    setGitCommitMsg('');
  }, [gitCommitMsg, commitToGitHub]);

  const handlePush = useCallback(() => {
    setTerminalHistory((prev) => [
      ...prev,
      '',
      '▸ git push origin main',
      '  ✅ Already up-to-date (commits are pushed directly via API)',
    ]);
  }, []);

  const sendToAI = useCallback(
    async (message: string) => {
      if (!message.trim() || aiLoading) return;
      setAiMessages((prev) => [...prev, { role: 'user', content: message }]);
      setAiInput('');
      setAiLoading(true);
      try {
        if (!engineRef.current) {
          engineRef.current = new AIEngine({
            launchApp: () => {},
            updateSystemState: () => {},
            setPowerMode: () => {},
          });
        }
        const provider = getActiveProvider();
        const apiKey = localStorage.getItem(`golden_gate_siri_${provider}_key`) || '';
        if (apiKey) {
          const msgs = aiMessages.concat({ role: 'user', content: message });
          const res = await engineRef.current.sendMessage(
            msgs.map((m) => ({
              role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
              content: m.content,
            })),
            provider,
            apiKey,
          );
          setAiMessages((prev) => [...prev, { role: 'assistant', content: res.text }]);
        } else {
          const res = await engineRef.current.executeCommand(message);
          setAiMessages((prev) => [...prev, { role: 'assistant', content: res }]);
        }
      } catch (e: any) {
        setAiMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${e.message}` }]);
      }
      setAiLoading(false);
    },
    [aiMessages, aiLoading],
  );

  const includeCodeContext = useCallback(() => {
    if (!selectedFilePath || !fileContent) return;
    const context = `File: ${selectedFilePath}\n\`\`\`\n${fileContent.slice(0, 3000)}\n\`\`\`\n\n`;
    setAiInput((prev) => prev + context);
  }, [selectedFilePath, fileContent]);

  useEffect(() => {
    if (aiRef.current) aiRef.current.scrollTop = aiRef.current.scrollHeight;
  }, [aiMessages]);

  const handleTerminalCommand = useCallback(
    (cmd: string) => {
      setTerminalHistory((prev) => [...prev, `$ ${cmd}`]);
      const lower = cmd.trim().toLowerCase();
      if (lower === 'clear') {
        setTerminalHistory([]);
        return;
      }
      if (lower === 'help') {
        setTerminalHistory((prev) => [
          ...prev,
          '  Commands: clear, ls, pwd, cd, git status, git commit, git push, git pull, git log, swift --version, make, echo',
        ]);
        return;
      }
      if (lower === 'ls') {
        setTerminalHistory((prev) => [
          ...prev,
          '  GoldenGate/  GoldenGate.xcodeproj/  GoldenGateTests/',
          '  Package.swift  README.md  .gitignore',
        ]);
        return;
      }
      if (lower === 'pwd') {
        setTerminalHistory((prev) => [...prev, '  /Users/aashman/Developer/GoldenGate']);
        return;
      }
      if (lower === 'git status') {
        setTerminalHistory((prev) => [...prev, '  On branch main']);
        if (gitChanges.length === 0) {
          setTerminalHistory((prev) => [...prev, '  nothing to commit, working tree clean']);
        } else {
          const adds = gitChanges.filter((c) => c.status === 'A');
          const mods = gitChanges.filter((c) => c.status === 'M');
          const dels = gitChanges.filter((c) => c.status === 'D');
          if (mods.length > 0)
            setTerminalHistory((prev) => [
              ...prev,
              '  Changes not staged for commit:',
              ...mods.map((c) => `    modified:   ${c.file}`),
            ]);
          if (adds.length > 0)
            setTerminalHistory((prev) => [
              ...prev,
              '  Untracked files (local VFS):',
              ...adds.map((c) => `    new file:   ${c.file}`),
            ]);
          if (dels.length > 0)
            setTerminalHistory((prev) => [
              ...prev,
              '  Deleted from tree:',
              ...dels.map((c) => `    deleted:    ${c.file}`),
            ]);
        }
        return;
      }
      if (lower === 'git log') {
        fetchCommitLog();
        return;
      }
      if (lower === 'git pull') {
        pullFromGitHub();
        return;
      }
      if (lower === 'git push') {
        handlePush();
        return;
      }
      if (cmd.trim().toLowerCase().startsWith('git commit -m ')) {
        const msg = cmd
          .trim()
          .slice('git commit -m '.length)
          .replace(/^["']|["']$/g, '');
        if (msg) commitToGitHub(msg);
        return;
      }
      if (lower === 'make' || lower === 'build') {
        handleBuild();
        return;
      }
      if (cmd.trim().startsWith('echo ')) {
        setTerminalHistory((prev) => [...prev, `  ${cmd.slice(5)}`]);
        return;
      }
      setTerminalHistory((prev) => [...prev, `  zsh: command not found: ${cmd.split(' ')[0]}`]);
    },
    [handleBuild, gitChanges, fetchCommitLog, pullFromGitHub, commitToGitHub, handlePush],
  );

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

    return sorted.map((node) => {
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
          <button
            onClick={handleBuild}
            disabled={isBuilding}
            className="px-3 py-1 rounded text-xs bg-[#3c3c3c] hover:bg-[#4a4a4a] disabled:opacity-40 transition"
          >
            Build
          </button>
          <button onClick={handleRun} className="px-3 py-1 rounded text-xs bg-blue-600 hover:bg-blue-500 transition">
            ▶ Run
          </button>
        </div>
        <div className="flex items-center gap-1">
          <ImportFileButton
            createNode={createNode}
            parentId="documents"
            accept=".txt,.js,.ts,.tsx,.jsx,.json,.md,.css,.html,.py,.swift,.rs"
          />
          <div className="w-px h-5 bg-[#3c3c3c]" />
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
            >
              📁 Files
            </button>
            <button
              onClick={() => setSidebarTab('git')}
              className={`flex-1 py-2 text-[10px] font-medium uppercase tracking-wider transition ${sidebarTab === 'git' ? 'text-white border-b-2 border-blue-500 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
            >
              🔀 Git
            </button>
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
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                  Changes ({gitChanges.length})
                </div>
                {gitChanges.length === 0 ? (
                  <div className="text-xs text-gray-500 py-2">Working tree clean</div>
                ) : (
                  gitChanges.map((change) => (
                    <div key={change.file} className="flex items-center gap-2 text-xs">
                      <span className={`${statusColors[change.status]} font-mono text-[10px] w-8`}>
                        {statusLabels[change.status]}
                      </span>
                      <span className="truncate text-gray-300">{change.file.split('/').pop()}</span>
                    </div>
                  ))
                )}
                {!token && (
                  <div className="text-[10px] text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded">
                    Set API key in System Settings for authenticated GitHub API access
                  </div>
                )}
                <div className="pt-2 border-t border-[#333]">
                  <textarea
                    value={gitCommitMsg}
                    onChange={(e) => setGitCommitMsg(e.target.value)}
                    placeholder="Commit message..."
                    className="w-full h-16 bg-[#1a1a1a] border border-[#333] rounded px-2 py-1.5 text-xs text-white placeholder-gray-500 resize-none outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleCommit}
                      disabled={!gitCommitMsg.trim() || gitChanges.length === 0}
                      className="flex-1 py-1.5 rounded text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-30 transition"
                    >
                      Commit & Push
                    </button>
                    <button
                      onClick={pullFromGitHub}
                      className="flex-1 py-1.5 rounded text-xs bg-[#3c3c3c] hover:bg-[#4a4a4a] transition"
                    >
                      Pull
                    </button>
                  </div>
                </div>
                {commits.length > 0 && (
                  <div className="pt-2 border-t border-[#333]">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Recent</div>
                    {commits.slice(0, 5).map((msg, i) => (
                      <div key={i} className="text-[10px] text-gray-400 py-1 border-b border-[#2a2a2a] last:border-0">
                        {msg}
                      </div>
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
          <div className="flex-1 min-h-0" {...dropHandlers}>
            {selectedFilePath ? (
              loadingFile ? (
                <div className="flex items-center justify-center h-full text-xs text-gray-500">Loading...</div>
              ) : (
                <Editor
                  height="100%"
                  language={fileLanguage}
                  value={fileContent}
                  theme="vs-dark"
                  onChange={(val: string | undefined) => setFileContent(val || '')}
                  options={{
                    readOnly: false,
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
              <div className="flex items-center justify-center h-full text-sm text-gray-500">
                Drop files here or use Import button
              </div>
            )}
          </div>
        </div>
      </div>

      {showTerminal && (
        <div className="h-44 bg-[#1a1a1a] border-t border-[#3c3c3c] flex flex-col shrink-0">
          <div className="h-8 bg-[#2d2d2d] border-b border-[#3c3c3c] flex items-center px-4 shrink-0 gap-3">
            <button
              onClick={() => setBottomTab('terminal')}
              className={`text-xs transition ${bottomTab === 'terminal' ? 'text-white border-b-2 border-blue-500 pb-0.5' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Terminal
            </button>
            <button
              onClick={() => setBottomTab('ai')}
              className={`text-xs transition ${bottomTab === 'ai' ? 'text-white border-b-2 border-blue-500 pb-0.5' : 'text-gray-500 hover:text-gray-300'}`}
            >
              AI
            </button>
            <div className="flex-1" />
            <button onClick={() => setShowTerminal(false)} className="text-[10px] text-gray-500 hover:text-gray-300">
              ✕
            </button>
          </div>
          {bottomTab === 'terminal' ? (
            <div
              ref={terminalRef}
              className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed"
              style={{ backgroundColor: '#1a1a1a' }}
            >
              {terminalHistory.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.startsWith('✅')
                      ? 'text-green-400'
                      : line.startsWith('⚠️')
                        ? 'text-yellow-400'
                        : line.startsWith('▸')
                          ? 'text-blue-400'
                          : line.startsWith('$')
                            ? 'text-green-300'
                            : line.startsWith('  ✅')
                              ? 'text-green-400'
                              : 'text-gray-300'
                  }
                >
                  {line}
                </div>
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
          ) : (
            <div ref={aiRef} className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {aiMessages.length === 0 && (
                  <div className="text-xs text-gray-500 text-center py-8">Ask the AI about your code...</div>
                )}
                {aiMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`text-xs leading-relaxed ${msg.role === 'user' ? 'text-blue-300' : 'text-gray-200'}`}
                  >
                    <span className="font-bold text-[10px] uppercase tracking-wider opacity-60">
                      {msg.role === 'user' ? 'You' : 'AI'}
                    </span>
                    <div className="mt-0.5 whitespace-pre-wrap">{msg.content}</div>
                  </div>
                ))}
                {aiLoading && <div className="text-xs text-gray-500 italic">Thinking...</div>}
              </div>
              <div className="border-t border-[#3c3c3c] p-2 flex gap-2 items-end">
                <button
                  onClick={includeCodeContext}
                  disabled={!selectedFilePath || !fileContent}
                  className="px-2 py-1.5 rounded text-[10px] bg-[#3c3c3c] hover:bg-[#4a4a4a] disabled:opacity-30 transition shrink-0"
                  title="Insert current file as context"
                >
                  + Code
                </button>
                <input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && aiInput.trim() && !aiLoading) {
                      e.preventDefault();
                      sendToAI(aiInput);
                    }
                  }}
                  className="flex-1 bg-[#252526] border border-[#3c3c3c] rounded px-2 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500"
                  placeholder="Ask AI about your code..."
                />
                <button
                  onClick={() => sendToAI(aiInput)}
                  disabled={!aiInput.trim() || aiLoading}
                  className="px-3 py-1.5 rounded text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-30 transition shrink-0"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

async function dataUrlToBase64(dataUrl: string): Promise<string> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function detectLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    md: 'markdown',
    html: 'html',
    css: 'css',
    scss: 'scss',
    py: 'python',
    rs: 'rust',
    go: 'go',
    java: 'java',
    kt: 'kotlin',
    swift: 'swift',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    yml: 'yaml',
    yaml: 'yaml',
    xml: 'xml',
    sh: 'shell',
    bash: 'shell',
    sql: 'sql',
    graphql: 'graphql',
    swiftinterface: 'swift',
    plist: 'xml',
    xcscheme: 'xml',
  };
  return map[ext || ''] || 'plaintext';
}

function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  const iconMap: Record<string, string> = {
    ts: '🟦',
    tsx: '⚛️',
    js: '🟨',
    jsx: '⚛️',
    json: '📋',
    md: '📝',
    html: '🌐',
    css: '🎨',
    py: '🐍',
    rs: '🦀',
    go: '🔷',
    java: '☕',
    swift: '🕊️',
    c: '⚙️',
    cpp: '⚙️',
    yml: '⚙️',
    sh: '💻',
    sql: '🗃️',
    xml: '📰',
    plist: '📋',
    swiftinterface: '🕊️',
  };
  const dirIcons: Record<string, string> = {
    node_modules: '📦',
    dist: '📦',
    build: '🔨',
    src: '📁',
    public: '🌍',
    assets: '🖼️',
    components: '🧩',
    hooks: '🪝',
    utils: '🔧',
    contexts: '🌐',
    GoldenGate: '📱',
    'GoldenGate.xcodeproj': '📁',
    GoldenGateTests: '🧪',
    GoldenGateUITests: '🧪',
  };
  if (dirIcons[name]) return dirIcons[name];
  return iconMap[ext || ''] || '📄';
}
