import React, { useState, useRef, useEffect } from 'react';
import { useSystem } from '../../contexts/SystemContext';
import { useFileSystem } from '../../contexts/FileSystemContext';

export const TerminalApp: React.FC = () => {
  const { systemState, launchApp, setBootState, battery, hardware, uptime } = useSystem();
  const { getDirectoryContents, nodes } = useFileSystem();
  const username = systemState.user.accountName || systemState.user.fullName || 'Architect';
  const [currentDirId, setCurrentDirId] = useState<string | null>('user-home');
  const [history, setHistory] = useState<{ command: string; output: string }[]>([
    { command: '', output: `Last login: ${new Date().toString().split(' ').slice(0, 4).join(' ')} on ttys000\nmacOS Tahoe (Version 26.0) simulated.` }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const getCurrentDirPath = () => {
    if (currentDirId === 'root') return '/';
    const node = nodes.find(n => n.id === currentDirId);
    return node ? `~/${node.name}` : '~';
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    let output = '';
    const parts = cmd.split(' ');
    const mainCmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (mainCmd) {
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'help':
        output = `Available commands:
  ls        - List directory contents
  cd [dir]  - Change directory
  open [app]- Open an application (e.g., open Safari)
  neofetch  - Display system information
  date      - Display current date
  time      - Display current time
  whoami    - Display current user
  sudo [cmd]- Run command as superuser
  reboot    - Reboot the system
  clear     - Clear terminal screen
  echo      - Output text`;
        break;
      case 'ls':
        const contents = getDirectoryContents(currentDirId);
        output = contents.length > 0 
          ? contents.map(n => `${n.type === 'folder' ? 'd' : '-'} ${n.name}`).join('\n')
          : 'total 0';
        break;
      case 'cd':
        const targetDir = args[0];
        if (!targetDir || targetDir === '~') {
          setCurrentDirId('user-home');
        } else if (targetDir === '..') {
          const current = nodes.find(n => n.id === currentDirId);
          if (current && current.parentId) setCurrentDirId(current.parentId);
        } else {
          const found = getDirectoryContents(currentDirId).find(n => n.name.toLowerCase() === targetDir.toLowerCase() && n.type === 'folder');
          if (found) {
            setCurrentDirId(found.id);
          } else {
            output = `cd: no such directory: ${targetDir}`;
          }
        }
        break;
      case 'open':
        const appName = args[0]?.toLowerCase();
        if (appName) {
          const appMap: Record<string, string> = {
            'safari': 'safari',
            'finder': 'finder',
            'settings': 'settings',
            'messages': 'messages',
            'photos': 'photos',
            'maps': 'maps',
            'mail': 'mail',
            'appstore': 'appstore',
            'books': 'books',
            'wallet': 'wallet',
            'terminal': 'terminal',
            'activity': 'activitymonitor'
          };
          const appId = appMap[appName];
          if (appId) {
            launchApp(appId);
            output = `Opening ${appName}...`;
          } else {
            output = `open: application not found: ${appName}`;
          }
        } else {
          output = 'usage: open [application]';
        }
        break;
      case 'neofetch':
        output = `        .       ${username.toLowerCase()}@MacBook-Pro
       .:.      ---------------------------
      .:::.     OS: macOS Tahoe 26.0
     .:::::.    Kernel: Darwin 25.0.0
     :::::::    Uptime: ${Math.floor(uptime / 60)} mins, ${uptime % 60} secs
     ':::::'    Battery: ${Math.round(battery.level * 100)}% (${battery.isCharging ? 'Charging' : 'Discharging'})
      ':::'     Shell: zsh 5.9
       ':'      Resolution: 2560x1600
        '       CPU: Apple Silicon (${hardware.cores} cores)
                Memory: ${hardware.memory}GB Unified Silicon`;
        break;
      case 'uptime':
        output = `up ${Math.floor(uptime / 60)} minutes, ${uptime % 60} seconds`;
        break;
      case 'sudo':
        output = `[sudo] password for ${username.toLowerCase()}: \nPassword accepted. Superuser privileges granted for Tahoe Session.`;
        break;
      case 'reboot':
        setBootState('booting');
        return;
      case 'date':
        output = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        break;
      case 'time':
        output = new Date().toLocaleTimeString('en-US');
        break;
      case 'echo':
        output = args.join(' ');
        break;
      case 'whoami':
        output = username.toLowerCase().replace(/\s/g, '');
        break;
      default:
        output = `zsh: command not found: ${mainCmd}`;
    }

    setHistory((prev) => [...prev, { command: cmd, output }]);
    setInput('');
  };

  return (
    <div className="h-full w-full bg-black/90 text-[#a5a5a5] font-mono text-sm p-4 overflow-y-auto cursor-text scrollbar-hide">
      {history.map((entry, i) => (
        <div key={i} className="mb-2">
          {entry.command && (
            <div className="flex gap-2">
              <span className="text-[#32d74b] font-bold">{username.split(' ')[0]}@MacBook-Pro</span>
              <span className="text-[#0a84ff] font-bold">{getCurrentDirPath()} %</span>
              <span className="text-white">{entry.command}</span>
            </div>
          )}
          {entry.output && <div className="whitespace-pre-wrap mt-1 text-gray-300">{entry.output}</div>}
        </div>
      ))}
      
      <form onSubmit={handleCommand} className="flex gap-2 mt-2">
        <span className="text-[#32d74b] font-bold">{username.split(' ')[0]}@MacBook-Pro</span>
        <span className="text-[#0a84ff] font-bold">{getCurrentDirPath()} %</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent border-none focus:outline-none text-white font-mono"
          autoFocus
        />
      </form>
      <div ref={bottomRef} />
    </div>
  );
};
