import React, { useState, useRef, useEffect } from 'react';
import { useSystem } from '../../contexts/SystemContext';
import { useFileSystem } from '../../contexts/FileSystemContext'; // createNode, deleteNode available

export const TerminalApp: React.FC = () => {
  const { bootState, launchApp, setBootState, hardware, uptime, activeUser, systemState } = useSystem();
  const { getDirectoryContents, nodes, createNode, deleteNode } = useFileSystem();

  const isRecovery = bootState === 'recovery';
  const username = isRecovery ? 'root' : activeUser.accountName || activeUser.fullName || 'Architect';
  const [currentDirId, setCurrentDirId] = useState<string | null>(isRecovery ? 'root' : 'user-home');
  const [history, setHistory] = useState<{ command: string; output: string }[]>([
    {
      command: '',
      output: isRecovery
        ? `macOS Recovery Terminal (zsh)\n# Secure enclave active. Neural architecture identified.`
        : `Last login: ${new Date().toString().split(' ').slice(0, 4).join(' ')} on ttys000\nmacOS Golden Gate (Version 27.0.0) simulated.`,
    },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const getCurrentDirPath = () => {
    if (currentDirId === 'root') return '/';
    const node = nodes.find((n) => n.id === currentDirId);
    return node ? (isRecovery ? `/${node.name}` : `~/${node.name}`) : isRecovery ? '/' : '~';
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
  pwd       - Print working directory
  mkdir [n] - Create a directory
  touch [n] - Create a file
  cat [file]- Display file contents
  rm [item] - Remove file or directory
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
      case 'ls': {
        const contents = getDirectoryContents(currentDirId);
        output =
          contents.length > 0
            ? contents.map((n) => `${n.type === 'folder' ? 'd' : '-'} ${n.name}`).join('\n')
            : 'total 0';
        break;
      }
      case 'cd': {
        const targetDir = args[0];
        if (!targetDir || targetDir === '~' || (isRecovery && targetDir === '/')) {
          setCurrentDirId(isRecovery ? 'root' : 'user-home');
        } else if (targetDir === '..') {
          const current = nodes.find((n) => n.id === currentDirId);
          if (current && current.parentId) setCurrentDirId(current.parentId);
          else if (isRecovery) setCurrentDirId('root');
        } else {
          const found = getDirectoryContents(currentDirId).find(
            (n) => n.name.toLowerCase() === targetDir.toLowerCase() && n.type === 'folder',
          );
          if (found) {
            setCurrentDirId(found.id);
          } else {
            output = `cd: no such directory: ${targetDir}`;
          }
        }
        break;
      }
      case 'pwd':
        output = getCurrentDirPath();
        break;
      case 'mkdir': {
        const dirName = args[0];
        if (dirName) {
          createNode({ name: dirName, type: 'folder', parentId: currentDirId, isLocked: false, tags: [] });
          output = '';
        } else {
          output = 'usage: mkdir [directory name]';
        }
        break;
      }
      case 'touch': {
        const fileName = args[0];
        if (fileName) {
          createNode({ name: fileName, type: 'file', parentId: currentDirId, content: '', isLocked: false, tags: [] });
          output = '';
        } else {
          output = 'usage: touch [file name]';
        }
        break;
      }
      case 'cat': {
        const catName = args[0];
        if (catName) {
          const found = getDirectoryContents(currentDirId).find(
            (n) => n.name.toLowerCase() === catName.toLowerCase() && n.type === 'file',
          );
          if (found && found.content) {
            output = found.content;
          } else if (found) {
            output = `cat: ${catName}: file is empty`;
          } else {
            output = `cat: ${catName}: No such file`;
          }
        } else {
          output = 'usage: cat [file name]';
        }
        break;
      }
      case 'rm': {
        const rmName = args[0];
        if (rmName) {
          const found = getDirectoryContents(currentDirId).find(
            (n) => n.name.toLowerCase() === rmName.toLowerCase(),
          );
          if (found) {
            deleteNode(found.id);
            output = '';
          } else {
            output = `rm: ${rmName}: No such file or directory`;
          }
        } else {
          output = 'usage: rm [file or directory name]';
        }
        break;
      }
      case 'open': {
        const appName = args[0]?.toLowerCase();
        if (appName) {
          const appMap: Record<string, string> = {
            safari: 'safari',
            finder: 'finder',
            settings: 'settings',
            messages: 'messages',
            photos: 'photos',
            maps: 'maps',
            mail: 'mail',
            appstore: 'appstore',
            books: 'books',
            wallet: 'wallet',
            terminal: 'terminal',
            activity: 'activitymonitor',
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
      }
      case 'neofetch':
        output = `        .       ${username.toLowerCase()}@Golden-Gate-Mac
        .:.      ---------------------------
       .:::.     OS: macOS Golden Gate 27.0.0
      .:::::.    Kernel: Darwin 27.0.0 (ARM64)
      :::::::    Uptime: ${Math.floor(uptime / 60)} mins, ${uptime % 60} secs
      ':::::'    Architect: Aashman Shukla
       ':::'     GitHub: @AashmanShukla3223
        ':'      Shell: zsh 5.9
         '       CPU: Apple Silicon M5 Max (${hardware.cores} cores)
                 Memory: ${hardware.memory || 16}GB Unified Silicon
                 Apps Registered: 48 Installed Apps`;
        break;
      case 'uptime':
        output = `up ${Math.floor(uptime / 60)} minutes, ${uptime % 60} seconds`;
        break;
      case 'sudo': {
        const fullArgs = args.join(' ');
        if (fullArgs === 'rm -rf /localStorage' || fullArgs === 'system_reset') {
          localStorage.removeItem('golden_gate_infected');
          localStorage.removeItem('golden_gate_v27_state');
          output = 'System reset initiated. Clearing neural infection... Recovery complete. Restarting...';
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          output = `[sudo] password for ${username.toLowerCase()}:\nPassword accepted. Superuser privileges granted for Golden Gate Session.`;
        }
        break;
      }
      case 'reboot':
        setBootState('booting');
        return;
      case 'date':
        output = new Date().toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
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
    <div className="h-full w-full flex flex-col">
      <div className="h-9 flex-shrink-0 flex items-center px-4 gap-2" style={{ backgroundColor: systemState.terminalRibbonColor }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29]" />
        </div>
        <span className="text-[11px] font-medium text-white/60 ml-2">Terminal — zsh</span>
      </div>
      <div
        className="flex-1 font-mono text-sm p-4 overflow-y-auto cursor-text scrollbar-hide"
        style={{
          backgroundColor: systemState.terminalBgColor,
          opacity: systemState.terminalOpacity,
          color: '#a5a5a5',
        }}
      >
        {history.map((entry, i) => (
          <div key={i} className="mb-2">
            {entry.command && (
              <div className="flex gap-2">
                <span className="text-[#32d74b] font-bold">
                  {username.toLowerCase()}@{isRecovery ? 'Recovery' : 'MacBook-Pro'}
                </span>
                <span className="text-[#0a84ff] font-bold">{getCurrentDirPath()} %</span>
                <span className="text-white">{entry.command}</span>
              </div>
            )}
            {entry.output && <div className="whitespace-pre-wrap mt-1 text-gray-300">{entry.output}</div>}
          </div>
        ))}

        <form onSubmit={handleCommand} className="flex gap-2 mt-2">
          <span className="text-[#32d74b] font-bold">
            {username.toLowerCase()}@{isRecovery ? 'Recovery' : 'MacBook-Pro'}
          </span>
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
    </div>
  );
};
