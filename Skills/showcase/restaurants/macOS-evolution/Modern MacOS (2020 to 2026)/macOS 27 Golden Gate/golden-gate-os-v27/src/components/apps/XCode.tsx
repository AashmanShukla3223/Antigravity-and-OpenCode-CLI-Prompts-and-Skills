import React, { useState, useRef, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';

interface XcodeFile {
  name: string;
  path: string;
  content: string;
  language: string;
  icon: string;
}

interface GitChange {
  file: string;
  status: 'M' | 'A' | 'D' | '??';
}

const SAMPLE_FILES: XcodeFile[] = [
  { name: 'ContentView.swift', path: 'GoldenGate/ContentView.swift', language: 'swift', icon: '🕊️',
    content: `import SwiftUI

struct ContentView: View {
    @State private var counter = 0
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Welcome to macOS 27")
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundStyle(.linearGradient(
                    colors: [.blue, .purple],
                    startPoint: .leading,
                    endPoint: .trailing
                ))
            
            Text("Golden Gate Edition")
                .font(.title2)
                .foregroundColor(.secondary)
            
            HStack(spacing: 40) {
                Button("−") { counter -= 1 }
                    .buttonStyle(.bordered)
                Text("\(counter)")
                    .font(.system(.title, design: .monospaced))
                    .frame(minWidth: 60)
                Button("+") { counter += 1 }
                    .buttonStyle(.borderedProminent)
            }
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

#Preview {
    ContentView()
}
` },
  { name: 'AppDelegate.swift', path: 'GoldenGate/AppDelegate.swift', language: 'swift', icon: '🕊️',
    content: `import Cocoa

@main
class AppDelegate: NSObject, NSApplicationDelegate {
    private var window: NSWindow!
    
    func applicationDidFinishLaunching(_ notification: Notification) {
        window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 1200, height: 800),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        window.title = "macOS 27 Golden Gate"
        window.center()
        window.makeKeyAndOrderFront(nil)
        window.contentView = NSHostingView(rootView: ContentView())
    }
    
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }
}
` },
  { name: 'Package.swift', path: 'GoldenGate/Package.swift', language: 'swift', icon: '📦',
    content: `// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "GoldenGate",
    platforms: [
        .macOS(.v15)
    ],
    dependencies: [
        .package(url: "https://github.com/apple/swift-argument-parser", from: "1.3.0"),
    ],
    targets: [
        .executableTarget(
            name: "GoldenGate",
            dependencies: [
                .product(name: "ArgumentParser", package: "swift-argument-parser"),
            ],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
            ]
        ),
        .testTarget(
            name: "GoldenGateTests",
            dependencies: ["GoldenGate"]
        )
    ]
)
` },
  { name: 'Info.plist', path: 'GoldenGate/Info.plist', language: 'xml', icon: '📋',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en_IN</string>
    <key>CFBundleExecutable</key>
    <string>GoldenGate</string>
    <key>CFBundleIdentifier</key>
    <string>com.aashman.GoldenGate</string>
    <key>CFBundleName</key>
    <string>Golden Gate</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>27.0</string>
    <key>CFBundleVersion</key>
    <string>27A405</string>
    <key>LSMinimumSystemVersion</key>
    <string>15.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
` },
  { name: 'Assets.xcassets/Contents.json', path: 'GoldenGate/Assets.xcassets/Contents.json', language: 'json', icon: '🖼️',
    content: `{
  "info" : {
    "author" : "xcode",
    "version" : 1
  },
  "properties" : {
    "provides-namespace" : true
  }
}
` },
  { name: 'Preview Content/PreviewAssets.xcassets/Contents.json', path: 'GoldenGate/Preview Content/PreviewAssets.xcassets/Contents.json', language: 'json', icon: '🎨',
    content: `{
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
` },
  { name: 'GoldenGateTests/GoldenGateTests.swift', path: 'GoldenGateTests/GoldenGateTests.swift', language: 'swift', icon: '🕊️',
    content: `import Testing
@testable import GoldenGate

struct GoldenGateTests {
    @Test("Counter increments correctly")
    func testCounterIncrement() {
        let view = ContentView()
        #expect(view.counter == 0)
    }
}
` },
  { name: 'GoldenGateUITests/GoldenGateUITests.swift', path: 'GoldenGateUITests/GoldenGateUITests.swift', language: 'swift', icon: '🕊️',
    content: `import XCTest

final class GoldenGateUITests: XCTestCase {
    var app: XCUIApplication!
    
    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }
    
    func testLaunchPerformance() throws {
        measure(metrics: [XCTApplicationLaunchMetric()]) {
            XCUIApplication().launch()
        }
    }
}
` },
];

const GIT_CHANGES: GitChange[] = [
  { file: 'GoldenGate/ContentView.swift', status: 'M' },
  { file: 'GoldenGate/AppDelegate.swift', status: 'M' },
  { file: 'GoldenGate/Package.swift', status: 'A' },
  { file: 'GoldenGateTests/GoldenGateTests.swift', status: 'A' },
];

type SidebarTab = 'navigator' | 'sourcecontrol';

let terminalLines: string[] = [
  'GoldenGate — Build Configuration: Debug',
  'Swift 6.0 — macOS 15.0 SDK',
  '',
];

export const XCode: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<XcodeFile>(SAMPLE_FILES[0]);
  const [editedContent, setEditedContent] = useState<string>(SAMPLE_FILES[0].content);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('navigator');
  const [showTerminal, setShowTerminal] = useState(true);
  const [scheme] = useState('GoldenGate');
  const [device] = useState('My Mac');
  const [isBuilding, setIsBuilding] = useState(false);
  const [gitCommitMsg, setGitCommitMsg] = useState('');
  const [gitChanges] = useState<GitChange[]>(GIT_CHANGES);
  const [terminalHistory, setTerminalHistory] = useState<string[]>(terminalLines);
  const [terminalInput, setTerminalInput] = useState('');
  const [commits, setCommits] = useState<string[]>([]);
  const [showSourceControlFiles, setShowSourceControlFiles] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  const fileTree = buildFileTree(SAMPLE_FILES);

  const handleFileSelect = useCallback((file: XcodeFile) => {
    setSelectedFile(file);
    setEditedContent(file.content);
  }, []);

  const handleBuild = useCallback(() => {
    setIsBuilding(true);
    setTerminalHistory(prev => [...prev, '', `▸ Build GoldenGate (${new Date().toLocaleTimeString()})`, '  Resolving packages...', '  Compiling Swift source files...']);
    setTimeout(() => {
      setIsBuilding(false);
      setTerminalHistory(prev => [...prev, '  ✅ Build Succeeded (0.8s)', '  GoldenGate.app built successfully']);
    }, 1500);
  }, []);

  const handleRun = useCallback(() => {
    setTerminalHistory(prev => [...prev, '', `▸ Run GoldenGate on ${device}`, '  Launching...', '  Process: GoldenGate [PID: 48291]', '  Runtime: macOS 15.0, ARM64']);
  }, [device]);

  const handleCommit = useCallback(() => {
    if (!gitCommitMsg.trim()) return;
    setCommits(prev => [`${new Date().toLocaleDateString()} — ${gitCommitMsg}`, ...prev]);
    setTerminalHistory(prev => [...prev, '', `✅ Committed: "${gitCommitMsg}"`, '  3 files changed, 45 insertions(+)', '  To push, use Push button']);
    setGitCommitMsg('');
    setShowSourceControlFiles(true);
  }, [gitCommitMsg]);

  const handlePush = useCallback(() => {
    setTerminalHistory(prev => [...prev, '', '▸ git push origin main', '  remote: Resolving deltas...', '  remote: Processing references...', `  ✅ Pushed 1 commit to origin/main (${new Date().toLocaleTimeString()})`]);
  }, []);

  const handleTerminalCommand = useCallback((cmd: string) => {
    setTerminalHistory(prev => [...prev, `$ ${cmd}`]);
    const lower = cmd.trim().toLowerCase();
    if (lower === 'clear') {
      setTerminalHistory([]);
    } else if (lower === 'help') {
      setTerminalHistory(prev => [...prev, '  Available commands: help, clear, ls, pwd, swift --version, echo', '  Use git commit and push from Source Control tab']);
    } else if (lower === 'ls') {
      setTerminalHistory(prev => [...prev, '  GoldenGate/', '  GoldenGate.xcodeproj/', '  GoldenGateTests/', '  GoldenGateUITests/', '  Package.swift', '  README.md', '  .gitignore']);
    } else if (lower === 'pwd') {
      setTerminalHistory(prev => [...prev, '  /Users/aashman/Projects/GoldenGate']);
    } else if (lower === 'swift --version') {
      setTerminalHistory(prev => [...prev, '  Swift version 6.0 (swift-6.0.0.1.123)', '  Target: arm64-apple-macosx15.0']);
    } else if (cmd.trim().startsWith('echo ')) {
      setTerminalHistory(prev => [...prev, `  ${cmd.slice(5)}`]);
    } else {
      setTerminalHistory(prev => [...prev, `  zsh: command not found: ${cmd.trim().split(' ')[0]}`]);
    }
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  const statusColors: Record<string, string> = { M: 'text-orange-400', A: 'text-green-400', D: 'text-red-400', '??': 'text-blue-400' };
  const statusLabels: Record<string, string> = { M: 'Modify', A: 'Add', D: 'Delete', '??': 'Untrack' };

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
          <button onClick={handleBuild} disabled={isBuilding} className="px-3 py-1 rounded text-xs bg-[#3c3c3c] hover:bg-[#4a4a4a] disabled:opacity-40 transition flex items-center gap-1.5">
            <span>🔨</span> Build
          </button>
          <button onClick={handleRun} className="px-3 py-1 rounded text-xs bg-blue-600 hover:bg-blue-500 transition flex items-center gap-1.5">
            <span>▶</span> Run
          </button>
        </div>
        <div className="flex-1" />
        <div className="text-[10px] text-gray-500">
          {isBuilding ? 'Building...' : 'Ready'}
        </div>
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
              onClick={() => setSidebarTab('sourcecontrol')}
              className={`flex-1 py-2 text-[10px] font-medium uppercase tracking-wider transition ${sidebarTab === 'sourcecontrol' ? 'text-white border-b-2 border-blue-500 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
            >
              🔀 Git
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {sidebarTab === 'navigator' ? (
              <div className="py-1">
                {fileTree.map(item => renderTreeItem(item, selectedFile, handleFileSelect, 0))}
              </div>
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
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleCommit}
                      disabled={!gitCommitMsg.trim()}
                      className="flex-1 py-1.5 rounded text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      Commit
                    </button>
                    <button
                      onClick={handlePush}
                      disabled={commits.length === 0}
                      className="flex-1 py-1.5 rounded text-xs bg-[#3c3c3c] hover:bg-[#4a4a4a] disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      Push
                    </button>
                  </div>
                </div>
                {commits.length > 0 && (
                  <div className="pt-2 border-t border-[#333]">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Recent Commits</div>
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
            <span className="text-xs text-blue-400 truncate">{selectedFile.icon} {selectedFile.path}</span>
            <span className="text-[10px] text-gray-500 ml-auto">{selectedFile.language}</span>
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={selectedFile.language}
              value={editedContent}
              theme="vs-dark"
              onChange={(val) => setEditedContent(val || '')}
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
          </div>
        </div>
      </div>

      {showTerminal && (
        <div className="h-44 bg-[#1a1a1a] border-t border-[#3c3c3c] flex flex-col shrink-0">
          <div className="h-8 bg-[#2d2d2d] border-b border-[#3c3c3c] flex items-center px-4 gap-3 shrink-0">
            <span className="text-xs font-medium text-gray-300">Terminal</span>
            <div className="flex-1" />
            <button
              onClick={() => setShowTerminal(false)}
              className="text-[10px] text-gray-500 hover:text-gray-300"
            >✕</button>
          </div>
          <div
            ref={terminalRef}
            className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed"
            style={{ backgroundColor: '#1a1a1a', color: '#d4d4d4' }}
            onClick={() => {
              const input = document.getElementById('xcode-terminal-input');
              if (input) input.focus();
            }}
          >
            {terminalHistory.map((line, i) => (
              <div key={i} className={line.startsWith('  ✅') ? 'text-green-400' : line.startsWith('  ❌') ? 'text-red-400' : line.startsWith('▸') ? 'text-blue-400' : line.startsWith('$') ? 'text-green-300' : ''}>
                {line}
              </div>
            ))}
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-green-300">$</span>
              <input
                id="xcode-terminal-input"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && terminalInput.trim()) {
                    handleTerminalCommand(terminalInput);
                    setTerminalInput('');
                  }
                }}
                className="flex-1 bg-transparent text-green-300 outline-none border-none text-xs"
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

function buildFileTree(files: XcodeFile[]): FileTreeItem[] {
  const root: FileTreeItem[] = [];
  const map = new Map<string, FileTreeItem>();

  files.forEach(file => {
    const parts = file.path.split('/');
    let current = root;

    parts.forEach((part, i) => {
      const parentPath = parts.slice(0, i + 1).join('/');
      const isLast = i === parts.length - 1;

      if (isLast) {
        current.push({ name: part, path: file.path, isFile: true, file });
      } else {
        let existing = map.get(parentPath);
        if (!existing) {
          existing = { name: part, path: parentPath, isFile: false, children: [] };
          map.set(parentPath, existing);
          current.push(existing);
        }
        current = existing.children!;
      }
    });
  });

  return root;
}

interface FileTreeItem {
  name: string;
  path: string;
  isFile: boolean;
  file?: XcodeFile;
  children?: FileTreeItem[];
}

function renderTreeItem(
  item: FileTreeItem,
  selectedFile: XcodeFile,
  onSelect: (file: XcodeFile) => void,
  depth: number,
): React.ReactNode {
  const isSelected = selectedFile.path === item.path;
  const [expanded, setExpanded] = React.useState(depth < 2);

  if (item.isFile && item.file) {
    return (
      <div
        key={item.path}
        onClick={() => onSelect(item.file!)}
        className={`flex items-center gap-2 px-3 py-1 cursor-pointer text-xs transition ${isSelected ? 'bg-blue-600/30 text-white' : 'text-gray-300 hover:bg-white/5'}`}
        style={{ paddingLeft: `${12 + depth * 14}px` }}
      >
        <span>{item.file!.icon}</span>
        <span className="truncate">{item.name}</span>
      </div>
    );
  }

  return (
    <div key={item.path}>
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 px-3 py-1 cursor-pointer text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5 transition"
        style={{ paddingLeft: `${12 + depth * 14}px` }}
      >
        <span className="text-[8px]">{expanded ? '▼' : '▶'}</span>
        <span>📁</span>
        <span>{item.name}</span>
      </div>
      {expanded && item.children?.map(child => renderTreeItem(child, selectedFile, onSelect, depth + 1))}
    </div>
  );
}
