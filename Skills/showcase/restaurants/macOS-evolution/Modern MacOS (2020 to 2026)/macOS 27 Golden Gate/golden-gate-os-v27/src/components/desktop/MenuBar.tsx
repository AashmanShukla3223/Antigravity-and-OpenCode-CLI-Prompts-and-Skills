import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSystem } from '../../contexts/SystemContext';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { Video01Icon, ArrowRight01Icon, SparklesIcon } from 'hugeicons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppIcon } from '../common/AppIcon';
import { FileSystemResolver } from '../../utils/FileSystemResolver';
import { contacts } from '../../utils/contacts';
import { AIEngine } from '../../utils/AIEngine';
import { App_Version } from '../../hooks/useSoftwareUpdate';

interface MenuBarProps {
  toggleControlCenter: (e: React.MouseEvent) => void;
  airdropPeers?: number;
  handoffPeers?: number;
  airdropSendFile?: (nodeId: string, name: string, fileType: 'file' | 'folder', size?: number) => number;
  airdropIncomingFiles?: { nodeId: string; name: string; type: 'file' | 'folder'; size?: number; from: string }[];
  airdropClearIncoming?: (nodeId: string) => void;
  nodes?: { id: string; name: string; type: 'file' | 'folder' }[];
  onMissionControl?: () => void;
}

const FaceTimeDropdown: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { setIncomingCall } = useSystem();
  const [calling, setCalling] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCall = (contact: any) => {
    setCalling(contact.id);
    // Simulation: 5 second delay before incoming call
    setTimeout(() => {
      setIncomingCall({ contact, type: 'facetime' });
      setCalling(null);
      onClose();
    }, 5000);
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="absolute top-10 right-0 w-80 bg-black/60 backdrop-blur-[var(--glass-blur)] saturate-[200%] border border-white/20 rounded-[28px] shadow-2xl p-4 z-50 text-white overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-sm font-bold text-white/50 uppercase tracking-widest">FACETIME GOLDEN GATE</span>
          <img
            src={`${(import.meta as any).env?.BASE_URL || '/'}icons/facetime.png`}
            alt="FaceTime"
            className="w-4 h-4 object-contain"
            loading="lazy"
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto pr-1 space-y-1 scrollbar-hide">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => !calling && handleCall(contact)}
              className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                calling === contact.id
                  ? 'bg-green-500/20 border border-green-500/30'
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-sm font-bold">{contact.name}</span>
                <span className="text-[10px] text-white/40">{contact.title}</span>
              </div>
              {calling === contact.id ? (
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-[10px] font-bold text-green-400 uppercase tracking-widest"
                >
                  Initiating...
                </motion.div>
              ) : (
                <Video01Icon size={18} className="text-white/20 hover:text-green-400 transition-colors" />
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
};

const IntelligencePopup: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { launchApp, showAlert, updateSystemState, setPowerMode } = useSystem();
  const engineRef = useRef<AIEngine | null>(null);

  const handleWeather = useCallback(async () => {
    if (!engineRef.current) engineRef.current = new AIEngine({ launchApp, updateSystemState, setPowerMode });
    const res = await engineRef.current.executeCommand("What's the weather today?");
    await showAlert(res, 'Apple Intelligence');
    onClose();
  }, [launchApp, updateSystemState, setPowerMode, showAlert, onClose]);

  const suggestions = [
    { label: 'Open Safari', action: () => { launchApp('safari'); onClose(); } },
    { label: "What's the weather?", action: handleWeather },
    { label: 'Launch Terminal', action: () => { launchApp('terminal'); onClose(); } },
    { label: 'Open Calculator', action: () => { launchApp('calculator'); onClose(); } },
    { label: 'Open Siri', action: () => { launchApp('siriai'); onClose(); } },
  ];

  if (!isOpen) return null;

  const phrase = 'How Can I Help You Today?';
  const wavys = phrase.split('');

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="absolute top-10 right-0 w-80 bg-black/60 backdrop-blur-[var(--glass-blur)] saturate-[200%] border border-white/20 rounded-[28px] shadow-[0_30px_60px_rgba(0,0,0,0.5)] p-6 z-50 text-white overflow-hidden"
      >
        {/* Siri Avatar Glow */}
        <div className="flex flex-col items-center mb-6">
          <motion.div
            className="w-16 h-16 rounded-full bg-gradient-to-br from-[#5E5CE6] to-[#007AFF] flex items-center justify-center shadow-[0_0_30px_rgba(94,92,230,0.4)]"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <SparklesIcon size={28} className="text-white" />
          </motion.div>
        </div>

        {/* Wavy Text */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-[2px] flex-wrap">
            {wavys.map((char, i) => (
              <motion.span
                key={i}
                className="text-lg font-bold tracking-tight inline-block"
                style={{ color: char === '?' ? '#5E5CE6' : 'white' }}
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.04,
                  ease: 'easeInOut',
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </div>
          <p className="text-[10px] text-white/40 font-medium mt-2">Apple Intelligence 2.0</p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-1.5">
          {/* eslint-disable-next-line react-hooks/refs */}
          {suggestions.map((s) => (
            <motion.button
              key={s.label}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={s.action}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm text-white/80 hover:text-white group"
            >
              <span>{s.label}</span>
              <ArrowRight01Icon size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
            </motion.button>
          ))}
        </div>

        {/* Ambient Glow */}
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-[#5E5CE6]/15 blur-[60px] pointer-events-none" />
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-[#007AFF]/10 blur-[60px] pointer-events-none" />
      </motion.div>
    </>
  );
};

const ForceQuit: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { openApps, closeApp } = useSystem();
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
        <motion.div
          drag
          dragMomentum={false}
          initial={{ opacity: 0, scale: 0.9, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 100 }}
          className="w-[350px] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto text-black dark:text-white"
        >
          <div className="p-4 flex flex-col items-center">
            <h2 className="text-lg font-bold mb-1">Force Quit Applications</h2>
            <p className="text-[11px] opacity-60 mb-4 text-center">
              If an application isn't responding, select it and click Force Quit.
            </p>

            <div className="w-full h-48 bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-lg overflow-y-auto mb-4">
              {openApps.length === 0 ? (
                <div className="h-full flex items-center justify-center opacity-30 text-xs">No apps running</div>
              ) : (
                openApps.map((appId) => (
                  <div
                    key={appId}
                    onClick={() => setSelectedApp(appId)}
                    className={`flex items-center gap-3 px-3 py-2 cursor-default transition-colors ${selectedApp === appId ? 'bg-blue-500 text-white' : 'hover:bg-blue-500/10'}`}
                  >
                    <div className="w-5 h-5">
                      <AppIcon id={appId} size={20} />
                    </div>
                    <span className="text-sm font-medium capitalize">{appId}</span>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end w-full gap-3">
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-md bg-black/5 dark:bg-white/10 text-sm font-medium hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!selectedApp}
                onClick={() => {
                  if (selectedApp) {
                    closeApp(selectedApp);
                    setSelectedApp(null);
                  }
                }}
                className="px-4 py-1.5 rounded-md bg-blue-500 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-colors"
              >
                Force Quit
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const MenuDropdown: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  items: { label?: string; action?: () => void; disabled?: boolean; shortcut?: string; separator?: boolean }[];
  style?: React.CSSProperties;
}> = ({ isOpen, onClose, items, style }) => {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -5 }}
        transition={{ duration: 0.1 }}
        style={style}
        className="absolute top-8 w-64 bg-black/60 saturate-[190%] border border-white/20 rounded-[20px] shadow-2xl py-2 z-50 overflow-hidden backdrop-blur-[var(--glass-blur)]"
      >
        {items.map((item, i) =>
          item.separator ? (
            <div key={i} className="border-b border-white/10 my-1 mx-2" />
          ) : (
            <div
              key={i}
              className={`px-3 py-1 text-[12px] flex justify-between items-center transition-colors ${item.disabled ? 'text-white/30 cursor-default' : 'text-white hover:bg-blue-500 cursor-pointer'}`}
              onClick={() => {
                if (!item.disabled && item.action) {
                  item.action();
                  onClose();
                }
              }}
            >
              <span>{item.label}</span>
              {item.shortcut && (
                <span className="text-[10px] opacity-40 font-medium tracking-widest">{item.shortcut}</span>
              )}
            </div>
          ),
        )}
      </motion.div>
    </>
  );
};

const BatteryDropdown: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  battery: { level: number; isCharging: boolean };
}> = ({ isOpen, battery, onClose }) => {
  const { powerMode, setPowerMode, launchApp } = useSystem();
  const [chargeLimit, setChargeLimit] = useState(false);

  if (!isOpen) return null;

  const modes: ('Low Power' | 'Normal' | 'High Performance')[] = ['Low Power', 'Normal', 'High Performance'];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -5 }}
        transition={{ duration: 0.1 }}
        className="absolute top-8 right-0 w-72 bg-black/60 backdrop-blur-[var(--glass-blur)] saturate-[190%] border border-white/20 rounded-[24px] shadow-2xl p-4 z-50 overflow-hidden text-white"
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-white/50 uppercase tracking-widest">Battery</span>
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">Healthy</span>
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="text-4xl font-black mb-1">{Math.round(battery.level * 100)}%</div>
          <div className="text-[10px] text-white/40 font-medium uppercase tracking-[0.2em]">
            {battery.isCharging ? 'Power Adapter' : 'On Battery'}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1 px-1">Power Mode</div>
          {modes.map((mode) => (
            <div
              key={mode}
              onClick={() => setPowerMode(mode)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${powerMode === mode ? 'bg-blue-500/20 border border-blue-500/30' : 'hover:bg-white/5 border border-transparent'}`}
            >
              <span className={`text-xs font-medium ${powerMode === mode ? 'text-blue-400' : 'text-white/70'}`}>
                {mode}
              </span>
              {powerMode === mode && (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex flex-col">
              <span className="text-xs font-bold">Maximum Capacity</span>
              <span className="text-[10px] text-white/40">Peak Performance Capability</span>
            </div>
            <span className="text-sm font-black">100%</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex flex-col">
              <span className="text-xs font-bold">Charge Limit: 80%</span>
              <span className="text-[10px] text-white/40">Optimized Battery Health</span>
            </div>
            <button
              onClick={() => setChargeLimit(!chargeLimit)}
              className={`w-10 h-5 rounded-full transition-colors relative ${chargeLimit ? 'bg-blue-500' : 'bg-white/10'}`}
            >
              <motion.div
                animate={{ x: chargeLimit ? 22 : 2 }}
                className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10">
          <div
            className="px-2 py-1.5 text-[11px] text-white/60 hover:text-white hover:bg-blue-500 rounded-lg cursor-pointer transition-colors font-medium"
            onClick={() => {
              onClose();
              launchApp('settings');
            }}
          >
            Battery Settings...
          </div>
        </div>
      </motion.div>
    </>
  );
};

export const MenuBar = React.memo<MenuBarProps>(({ toggleControlCenter, airdropPeers = 0, handoffPeers = 0, airdropSendFile, airdropIncomingFiles = [], airdropClearIncoming, nodes = [], onMissionControl }) => {
  const {
    activeApp,
    activeWindowId,
    setShowAboutWindow,
    launchApp,
    setBootState,
    battery,
    setShowSpotlight,
    showSpotlight,
    clearSystemErrors,
    setShowRestartDialog,
    setShowShutdownDialog,
    setShowNotificationCenter,
    showNotificationCenter,
    closeCurrentWindow,
    closeApp,
    minimizeWindow,
    toggleMaximizeWindow,
    openWindows,
    showAlert,
    showConfirm,
    clipboard,
    clearClipboard,
    wifi,
    setWifi,
  } = useSystem();
  const { createNode, emptyTrash, findNode, moveNode } = useFileSystem();
  const [time, setTime] = useState(new Date());
  const [appleMenuOpen, setAppleMenuOpen] = useState(false);
  const [batteryMenuOpen, setBatteryMenuOpen] = useState(false);
  const [facetimeMenuOpen, setFacetimeMenuOpen] = useState(false);
  const [wifiMenuOpen, setWifiMenuOpen] = useState(false);
  const [connectedNetwork, setConnectedNetwork] = useState<string | null>('Home_Network');
  const [wifiPasswordModal, setWifiPasswordModal] = useState<string | null>(null);
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiPasswordError, setWifiPasswordError] = useState(false);
  const [wifiConnecting, setWifiConnecting] = useState(false);
  const [intelligenceOpen, setIntelligenceOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showForceQuit, setShowForceQuit] = useState(false);
  const [airdropSheetOpen, setAirdropSheetOpen] = useState(false);
  const [airdropFileName, setAirdropFileName] = useState('');
  const [selectedFileId, setSelectedFileId] = useState('');
  const [incomingDropdownOpen, setIncomingDropdownOpen] = useState(false);
  const [handoffMenuOpen, setHandoffMenuOpen] = useState(false);

  const base = (import.meta as any).env?.BASE_URL || '/';

  const hasApiKeys = useMemo(() => {
    return !!(
      localStorage.getItem('golden_gate_siri_gemini_key') ||
      localStorage.getItem('golden_gate_siri_groq_key') ||
      localStorage.getItem('golden_gate_siri_openrouter_key')
    );
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getActiveAppName = () => {
    if (!activeApp) return 'Finder';
    if (activeApp === 'settings') return 'System Settings';
    if (activeApp === 'appstore') return 'App Store';
    return activeApp.charAt(0).toUpperCase() + activeApp.slice(1);
  };

  const handlePowerAction = (action: string) => {
    setAppleMenuOpen(false);
    if (action === 'restart') {
      setShowRestartDialog(true);
    } else if (action === 'shutdown') {
      setShowShutdownDialog(true);
    } else if (action === 'sleep' || action === 'lock' || action === 'logout') {
      setBootState('login');
    }
  };

  const handlePaste = () => {
    if (!clipboard || clipboard.nodeIds.length === 0) {
      showAlert('Nothing to paste', 'Paste');
      return;
    }
    const targetParentId = 'desktop';
    let count = 0;
    clipboard.nodeIds.forEach((nodeId) => {
      const node = findNode(nodeId);
      if (!node) return;
      if (clipboard.type === 'copy') {
        createNode({
          name: node.name,
          type: node.type,
          parentId: targetParentId,
          content: node.content,
          tags: node.tags,
          customIcon: node.customIcon,
          color: node.color,
        });
        count++;
      } else {
        moveNode(nodeId, targetParentId);
        count++;
      }
    });
    if (clipboard.type === 'cut') {
      clearClipboard();
    }
    showAlert(`Pasted ${count} item(s)`, 'Paste');
  };

  const getWindowMenu = () => {
    const items: any[] = [
      {
        label: 'Minimize',
        shortcut: '⌘M',
        disabled: !activeWindowId,
        action: () => { if (activeWindowId) minimizeWindow(activeWindowId); },
      },
      {
        label: 'Zoom',
        action: () => { if (activeWindowId) toggleMaximizeWindow(activeWindowId); },
        disabled: !activeWindowId,
      },
      { separator: true },
      {
        label: 'Close Window',
        shortcut: '⌘W',
        disabled: !activeWindowId,
        action: () => { if (activeWindowId) closeCurrentWindow(); },
      },
      {
        label: 'Close All',
        shortcut: '⌥⌘W',
        disabled: !activeWindowId,
        action: () => { closeApp(activeApp || ''); },
      },
      { separator: true },
      { label: 'Bring All to Front', action: () => showAlert('Windows re-ordered', activeApp || 'Finder'), disabled: !activeApp },
    ];

    if (openWindows.length > 0) {
      items.push({ separator: true });
      openWindows.forEach((win) => {
        const displayName = activeApp || win.appId;
        const isActive = win.id === activeWindowId;
        items.push({
          label: `${isActive ? '✓ ' : ''}${displayName.charAt(0).toUpperCase() + displayName.slice(1)}`,
          disabled: isActive,
          action: () => showAlert(`Switched to ${displayName}`, 'Window'),
        });
      });
    }

    return items;
  };

  const getHelpMenu = () => {
    return [
      {
        label: 'Search',
        shortcut: '⌥⌘Space',
        action: () => setShowSpotlight(true),
      },
      { separator: true },
      {
        label: 'macOS Help',
        action: () => showAlert('Welcome to macOS Golden Gate v27. This is a web-based OS simulation.', 'macOS Help'),
      },
      {
        label: `About ${getActiveAppName()}`,
        action: () => {
          showAlert(`${getActiveAppName()} — v${App_Version}
Golden Gate Edition
Apple Silicon
macOS Golden Gate v${App_Version}`, `About ${getActiveAppName()}`);
        },
      },
    ];
  };

  const getEditMenu = (app: string) => {
    const standard: any[] = [
      { label: 'Undo', shortcut: '⌘Z', action: () => showAlert('Undo not available', 'Edit') },
      { label: 'Redo', shortcut: '⇧⌘Z', action: () => showAlert('Redo not available', 'Edit') },
      { separator: true },
      { label: 'Cut', shortcut: '⌘X', action: () => {
        if (clipboard && clipboard.nodeIds.length > 0) {
          showAlert(`${clipboard.nodeIds.length} item(s) ready to paste`, 'Cut');
        } else {
          showAlert('Right-click a file and choose Cut, or use desktop context menu', 'Cut');
        }
      }},
      { label: 'Copy', shortcut: '⌘C', action: () => {
        if (clipboard && clipboard.nodeIds.length > 0) {
          showAlert(`${clipboard.nodeIds.length} item(s) in clipboard`, 'Copy');
        } else {
          showAlert('Right-click a file and choose Copy, or use desktop context menu', 'Copy');
        }
      }},
      { label: 'Paste', shortcut: '⌘V', action: handlePaste },
      { label: 'Select All', shortcut: '⌘A', action: () => showAlert('Select All', 'Edit') },
    ];
    if (app !== 'terminal') {
      standard.push(
        { separator: true },
        { label: 'Writing Tools', shortcut: '⇧⌘W', action: () => showAlert('Apple Intelligence Writing Tools', 'Edit') },
        { label: 'Emoji & Symbols', shortcut: '⌃⌘Space', action: () => showAlert('Character Viewer', 'Edit') },
      );
    }
    return standard;
  };

  const getViewMenu = (app: string) => {
    switch (app) {
      case 'safari':
        return [
          { label: 'Reload Page', shortcut: '⌘R', action: () => showAlert('Page reloaded', 'Safari') },
          { label: 'Show Sidebar', shortcut: '⇧⌘L', action: () => showAlert('Sidebar toggled', 'Safari') },
          { separator: true },
          { label: 'Show Tab Bar', shortcut: '⇧⌘T', action: () => showAlert('Tab bar toggled', 'Safari') },
          { separator: true },
          { label: 'Enter Full Screen', shortcut: '⌃⌘F', action: () => { if (activeWindowId) toggleMaximizeWindow(activeWindowId); } },
        ];
      case 'finder':
        return [
          { label: 'Show Toolbar', shortcut: '⌥⌘T', action: () => showAlert('Toolbar toggled', 'Finder') },
          { label: 'Show Sidebar', shortcut: '⌥⌘S', action: () => showAlert('Sidebar toggled', 'Finder') },
          { label: 'Show Preview', shortcut: '⇧⌘P', action: () => showAlert('Preview toggled', 'Finder') },
          { separator: true },
          { label: 'Show Path Bar', shortcut: '⌥⌘P', action: () => showAlert('Path bar toggled', 'Finder') },
          { separator: true },
          { label: 'Enter Full Screen', shortcut: '⌃⌘F', action: () => { if (activeWindowId) toggleMaximizeWindow(activeWindowId); } },
        ];
      case 'terminal':
        return [
          { label: 'Show Tab Bar', action: () => showAlert('Tab bar toggled', 'Terminal') },
          { separator: true },
          { label: 'Allow Mouse Reporting', action: () => showAlert('Mouse reporting toggled', 'Terminal') },
          { separator: true },
          { label: 'Enter Full Screen', shortcut: '⌃⌘F', action: () => { if (activeWindowId) toggleMaximizeWindow(activeWindowId); } },
        ];
      default:
        return [
          { label: 'Enter Full Screen', shortcut: '⌃⌘F', action: () => { if (activeWindowId) toggleMaximizeWindow(activeWindowId); } },
        ];
    }
  };

  const getAppSpecificMenus = () => {
    const app = activeApp || 'finder';

    const baseMenus: Record<string, Record<string, any>> = {
      finder: {
        file: [
          { label: 'New Finder Window', shortcut: '⌘N', action: () => launchApp('finder') },
          { label: 'New Folder', shortcut: '⇧⌘N', action: () => {
            createNode({ name: 'Untitled Folder', type: 'folder', parentId: 'desktop' });
            showAlert('New folder created on Desktop', 'Finder');
          } },
          { separator: true },
          { label: 'Open...', shortcut: '⌘O', action: () => setShowSpotlight(true) },
          { separator: true },
          { label: 'Close Window', shortcut: '⌘W', action: () => { closeCurrentWindow(); }, disabled: !activeWindowId },
          { separator: true },
          { label: 'Get Info', shortcut: '⌘I', action: () => {
            showAlert(`Name: ${getActiveAppName()}
Kind: Application
Version: v${App_Version}
Architecture: Apple Silicon
macOS Golden Gate v${App_Version}`, 'Get Info');
          } },
          { label: 'Empty Trash...', action: () => {
            showConfirm('Are you sure you want to permanently erase all items in the Trash?', 'Empty Trash').then((r) => {
              if (r) {
                emptyTrash();
                showAlert('Trash emptied', 'Finder');
              }
            });
          } },
        ],
        edit: getEditMenu('finder'),
        view: getViewMenu('finder'),
        go: [
          { label: 'Back', shortcut: '⌘[', action: () => showAlert('Navigated back', 'Finder') },
          { label: 'Forward', shortcut: '⌘]', action: () => showAlert('Navigated forward', 'Finder') },
          { separator: true },
          { label: 'Enclosing Folder', shortcut: '⌘↑', action: () => showAlert('Moved to enclosing folder', 'Finder') },
          { separator: true },
          { label: 'Applications', shortcut: '⇧⌘A', action: () => launchApp('apps') },
          { label: 'Documents', shortcut: '⇧⌘O', action: () => showAlert('Documents folder', 'Finder') },
          { label: 'Desktop', shortcut: '⇧⌘D', action: () => showAlert('Desktop folder', 'Finder') },
          { separator: true },
          { label: 'Recent Folders', disabled: true },
          { label: 'Go to Folder...', shortcut: '⇧⌘G', action: () => setShowSpotlight(true) },
        ],
      },
      safari: {
        file: [
          { label: 'New Tab', shortcut: '⌘T', action: () => showAlert('New tab opened', 'Safari') },
          { label: 'New Window', shortcut: '⌘N', action: () => launchApp('safari') },
          { label: 'New Private Window', shortcut: '⇧⌘N', action: () => showAlert('New private window', 'Safari') },
          { separator: true },
          { label: 'Open Location...', shortcut: '⌘L', action: () => setShowSpotlight(true) },
          { separator: true },
          { label: 'Close Tab', shortcut: '⌘W', action: () => { closeCurrentWindow(); }, disabled: !activeWindowId },
          { label: 'Close Window', shortcut: '⇧⌘W', action: () => { closeApp('safari'); } },
        ],
        edit: getEditMenu('safari'),
        view: getViewMenu('safari'),
        go: [
          { label: 'Back', shortcut: '⌘[', action: () => showAlert('Navigated back', 'Safari') },
          { label: 'Forward', shortcut: '⌘]', action: () => showAlert('Navigated forward', 'Safari') },
          { label: 'Home Page', shortcut: '⇧⌘H', action: () => showAlert('Home page', 'Safari') },
          { separator: true },
          { label: 'History', action: () => showAlert('History', 'Safari') },
        ],
      },
      terminal: {
        file: [
          { label: 'New Shell', shortcut: '⌘N', action: () => launchApp('terminal') },
          { label: 'New Tab', shortcut: '⌘T', action: () => showAlert('New terminal tab', 'Terminal') },
          { separator: true },
          { label: 'Close Window', shortcut: '⌘W', action: () => { closeCurrentWindow(); }, disabled: !activeWindowId },
          { label: 'Close Tab', shortcut: '⌥⌘W', action: () => showAlert('Tab closed', 'Terminal') },
        ],
        edit: getEditMenu('terminal'),
        view: getViewMenu('terminal'),
        go: [
          { label: 'Go to Folder...', shortcut: '⇧⌘G', action: () => setShowSpotlight(true) },
        ],
      },
    };

    const menus = (baseMenus as any)[app] || baseMenus.finder;
    menus.window = getWindowMenu();
    menus.help = getHelpMenu();
    return menus;
  };

  const appMenus = getAppSpecificMenus();
  const menuKeys = ['File', 'Edit', 'View', 'Go', 'Window', 'Help'];

  return (
    <header
      data-testid="menubar"
      role="banner"
      aria-label="Menu Bar"
      onClick={clearSystemErrors}
      className="absolute top-0 left-0 right-0 h-[30px] flex justify-between items-center px-4 text-sm text-white z-40 bg-gradient-to-b from-black/40 to-transparent pointer-events-none"
    >
      <div className="flex items-center gap-px pointer-events-auto h-full pr-10">
        <div className="relative h-full">
          <div
            className={`cursor-pointer px-3 h-full flex items-center rounded transition ${appleMenuOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
            onClick={() => setAppleMenuOpen(!appleMenuOpen)}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.057 10.774c-.024-2.615 2.135-3.87 2.233-3.93-1.215-1.777-3.105-2.019-3.778-2.046-1.61-.164-3.14.95-3.955.95-.815 0-2.09-.932-3.44-.905-1.777.027-3.413 1.034-4.326 2.62-1.84 3.195-.47 7.915 1.312 10.493.872 1.26 1.91 2.673 3.273 2.623 1.313-.05 1.81-.845 3.396-.845 1.586 0 2.033.845 3.421.82 1.412-.025 2.313-1.272 3.179-2.536 1-1.46 1.412-2.873 1.433-2.943-.03-.014-2.763-1.06-2.79-4.252zm-3.085-7.404c.725-.877 1.213-2.094 1.08-3.31-1.045.042-2.31.696-3.058 1.572-.673.782-1.262 2.023-1.102 3.213 1.166.09 2.355-.6 3.08-1.475z" />
            </svg>
          </div>

          <MenuDropdown
            isOpen={appleMenuOpen}
            onClose={() => setAppleMenuOpen(false)}
            items={[
              { label: 'About This Mac', action: () => setShowAboutWindow(true) },
              { separator: true },
              { label: 'System Settings...', action: () => launchApp('settings') },
              { label: 'App Store...', action: () => launchApp('appstore') },
              { separator: true },
              { label: 'Force Quit...', action: () => setShowForceQuit(true) },
              { separator: true },
              { label: 'Sleep', action: () => handlePowerAction('sleep') },
              { label: 'Restart...', action: () => handlePowerAction('restart') },
              { label: 'Shut Down...', action: () => handlePowerAction('shutdown') },
              { separator: true },
              { label: 'Lock Screen', action: () => handlePowerAction('lock') },
              { label: 'Log Out...', action: () => handlePowerAction('logout') },
            ]}
          />
        </div>

        <ForceQuit isOpen={showForceQuit} onClose={() => setShowForceQuit(false)} />

        <div className="font-medium cursor-pointer px-2 h-full flex items-center hover:bg-white/10 rounded transition">
          {getActiveAppName()}
        </div>

        {menuKeys.map((menu) => (
          <div key={menu} className="relative h-full hidden md:flex">
            <div
              className={`cursor-pointer px-3 h-full flex items-center rounded transition ${activeMenu === menu ? 'bg-white/20' : 'hover:bg-white/10'}`}
              onClick={() => setActiveMenu(activeMenu === menu ? null : menu)}
            >
              {menu}
            </div>
            <MenuDropdown
              isOpen={activeMenu === menu}
              onClose={() => setActiveMenu(null)}
              items={appMenus[menu.toLowerCase()]}
              style={{ left: 0 }}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-px pointer-events-auto h-full pl-10">
        {/* AirDrop Indicator + Share Sheet */}
        <div className="relative h-full">
          <div
            className={`cursor-pointer px-2 h-full flex items-center rounded transition ${airdropSheetOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
            onClick={() => setAirdropSheetOpen(!airdropSheetOpen)}
            title={`${airdropPeers} device${airdropPeers > 1 ? 's' : ''} nearby`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            {airdropPeers > 0 && (
              <span className="text-[10px] text-blue-400 font-bold ml-0.5">{airdropPeers}</span>
            )}
          </div>
          <AnimatePresence>
            {airdropSheetOpen && airdropPeers > 0 && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setAirdropSheetOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute top-10 right-0 w-72 bg-black/60 backdrop-blur-[var(--glass-blur)] saturate-[200%] border border-white/20 rounded-[24px] shadow-2xl p-4 z-50 text-white"
                >
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">AirDrop Share</div>
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Enter file name..."
                      value={airdropFileName}
                      onChange={(e) => setAirdropFileName(e.target.value)}
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-blue-400"
                    />
                  </div>
                  <select
                    value={selectedFileId}
                    onChange={(e) => setSelectedFileId(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white mb-3 outline-none focus:border-blue-400"
                  >
                    <option value="" className="bg-black/80">Select a file...</option>
                    {nodes.filter((n) => n.type === 'file').map((n) => (
                      <option key={n.id} value={n.id} className="bg-black/80">{n.name}</option>
                    ))}
                  </select>
                  <button
                    disabled={!airdropFileName || !selectedFileId}
                    onClick={() => {
                      if (airdropSendFile && selectedFileId && airdropFileName) {
                        airdropSendFile(selectedFileId, airdropFileName, 'file');
                        setAirdropSheetOpen(false);
                        setAirdropFileName('');
                        setSelectedFileId('');
                      }
                    }}
                    className="w-full py-2 bg-blue-500 disabled:bg-white/10 disabled:text-white/30 text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-colors disabled:cursor-not-allowed"
                  >
                    Send via AirDrop
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Handoff Indicator */}
        <div className="relative h-full">
          <div
            className={`cursor-pointer px-2 h-full flex items-center rounded transition gap-0.5 ${handoffMenuOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
            onClick={() => setHandoffMenuOpen(!handoffMenuOpen)}
            title="Handoff Devices & Continuity Apps"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <span className="text-[10px] text-purple-400 font-bold ml-0.5">{handoffPeers > 0 ? handoffPeers : 1}</span>
          </div>
          <AnimatePresence>
            {handoffMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setHandoffMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute top-10 right-0 w-72 bg-black/60 backdrop-blur-[var(--glass-blur)] saturate-[200%] border border-white/20 rounded-[24px] shadow-2xl p-4 z-50 text-white"
                >
                  <div className="text-[10px] font-black uppercase tracking-widest text-purple-300 mb-2">Handoff & Continuity</div>
                  <p className="text-xs text-white/60 mb-3">Resume activity seamlessly on another Apple device.</p>

                  <div className="space-y-2">
                    <div
                      onClick={() => {
                        launchApp('safari');
                        setHandoffMenuOpen(false);
                        showAlert('Resumed Safari session from iPad Pro via Handoff', 'Handoff');
                      }}
                      className="flex items-center justify-between p-2.5 bg-purple-500/15 border border-purple-500/30 rounded-xl cursor-pointer hover:bg-purple-500/25 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                        </div>
                        <div>
                          <div className="text-xs font-bold">Safari Tab</div>
                          <div className="text-[10px] text-white/40">From iPad Pro</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full">Open</span>
                    </div>

                    <div
                      onClick={() => {
                        launchApp('notes');
                        setHandoffMenuOpen(false);
                        showAlert('Resumed Notes from iPhone 16 Pro via Handoff', 'Handoff');
                      }}
                      className="flex items-center justify-between p-2.5 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/70">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                        </div>
                        <div>
                          <div className="text-xs font-bold">Quick Note Draft</div>
                          <div className="text-[10px] text-white/40">From iPhone 16 Pro</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-white/60 bg-white/10 px-2 py-0.5 rounded-full">Open</span>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Incoming Files Notification */}
        {airdropIncomingFiles.length > 0 && (
          <div className="relative h-full">
            <div
              className={`cursor-pointer px-2 h-full flex items-center rounded transition ${incomingDropdownOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
              onClick={() => setIncomingDropdownOpen(!incomingDropdownOpen)}
              title="Incoming AirDrop files"
            >
              <div className="relative">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
              </div>
              <span className="text-[10px] text-green-400 font-bold ml-0.5">{airdropIncomingFiles.length}</span>
            </div>
            <AnimatePresence>
              {incomingDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIncomingDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute top-10 right-0 w-72 bg-black/60 backdrop-blur-[var(--glass-blur)] saturate-[200%] border border-white/20 rounded-[24px] shadow-2xl p-4 z-50 text-white"
                  >
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Incoming Files</div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {airdropIncomingFiles.map((file) => (
                        <div key={file.nodeId} className="flex items-center justify-between p-2 bg-white/5 rounded-xl border border-white/10">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold">{file.name}</span>
                            <span className="text-[9px] text-white/40">from {file.from.slice(0, 8)}</span>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => {
                                if (airdropClearIncoming) airdropClearIncoming(file.nodeId);
                                showAlert(`Accepted: ${file.name}`, 'AirDrop');
                              }}
                              className="px-2 py-1 bg-green-500/20 text-green-400 text-[10px] font-bold rounded-lg hover:bg-green-500/30 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => {
                                if (airdropClearIncoming) airdropClearIncoming(file.nodeId);
                              }}
                              className="px-2 py-1 bg-red-500/20 text-red-400 text-[10px] font-bold rounded-lg hover:bg-red-500/30 transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
        <div className="relative h-full">
          <div
            className={`cursor-pointer px-2 h-full flex items-center rounded transition gap-1 ${batteryMenuOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
            onClick={() => setBatteryMenuOpen(!batteryMenuOpen)}
          >
            {battery.isCharging ? (
              <img
                src={`${base}${FileSystemResolver.getStatusIcon('battery-100-charging')}`}
                alt="Battery Charging"
                className="w-4 h-4"
                loading="lazy"
              />
            ) : battery.level > 0.8 ? (
              <img
                src={`${base}${FileSystemResolver.getStatusIcon('battery-100')}`}
                alt="Battery Full"
                className="w-4 h-4"
                loading="lazy"
              />
            ) : battery.level > 0.3 ? (
              <img
                src={`${base}${FileSystemResolver.getStatusIcon('battery-050')}`}
                alt="Battery Medium"
                className="w-4 h-4"
                loading="lazy"
              />
            ) : (
              <img
                src={`${base}${FileSystemResolver.getStatusIcon('battery-020')}`}
                alt="Battery Low"
                className="w-4 h-4"
                loading="lazy"
              />
            )}
            <span className="text-[11px] font-medium">{Math.round(battery.level * 100)}%</span>
          </div>
          <BatteryDropdown isOpen={batteryMenuOpen} battery={battery} onClose={() => setBatteryMenuOpen(false)} />
        </div>
        <div className="relative h-full">
          <div
            className={`cursor-pointer px-2 h-full flex items-center rounded transition ${facetimeMenuOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
            onClick={() => setFacetimeMenuOpen(!facetimeMenuOpen)}
          >
            <img
              src={`${base}icons/facetime.png`}
              alt="FaceTime"
              className={`w-4 h-4 object-contain ${facetimeMenuOpen ? 'opacity-100' : 'opacity-80'}`}
              loading="lazy"
            />
          </div>
          <FaceTimeDropdown isOpen={facetimeMenuOpen} onClose={() => setFacetimeMenuOpen(false)} />
        </div>
        <div className="relative">
          <div
            className="cursor-pointer px-2 h-full flex items-center hover:bg-white/10 rounded transition"
            onClick={() => setWifiMenuOpen(!wifiMenuOpen)}
          >
            <img src={`${base}icons/Wifi.png`} alt="Wi-Fi" className={`h-4 w-auto object-contain transition-all ${wifi ? '' : 'opacity-40 grayscale'}`} loading="lazy" />
          </div>
          {wifiMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setWifiMenuOpen(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute top-10 right-0 w-72 bg-black/60 backdrop-blur-[var(--glass-blur)] saturate-[200%] border border-white/20 rounded-[28px] shadow-2xl p-4 z-50 text-white overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="text-sm font-bold text-white/50 uppercase tracking-widest">Wi-Fi</span>
                  <button
                    onClick={() => {
                      setWifi(!wifi);
                      if (!wifi) setConnectedNetwork(null);
                      else setConnectedNetwork('Home_Network');
                    }}
                    className={`relative w-10 h-5 rounded-full transition-all ${wifi ? 'bg-blue-500' : 'bg-white/10'}`}
                  >
                    <span className={`block w-3.5 h-3.5 bg-white rounded-full shadow transition-all ${wifi ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 px-2">
                  {wifi ? 'Networks' : 'Wi-Fi is Off'}
                </div>

                {wifi && (
                  <div className="space-y-1">
                    {[
                      { name: 'Home_Network', secured: true },
                      { name: 'Hell', secured: true },
                      { name: 'Death', secured: true },
                    ].map((net) => {
                      const isConnected = connectedNetwork === net.name;
                      return (
                        <div
                          key={net.name}
                          onClick={() => {
                            if (isConnected) {
                              setConnectedNetwork(null);
                              showAlert(`Disconnected from ${net.name}`, 'Wi-Fi');
                            } else {
                              setWifiPasswordModal(net.name);
                              setWifiPassword('');
                              setWifiPasswordError(false);
                            }
                          }}
                          className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                            isConnected
                              ? 'bg-blue-500/20 border border-blue-500/30'
                              : 'hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isConnected ? 'text-blue-400' : 'text-white/50'}>
                              <path d="M5 12.55a11 11 0 0114.08 0" />
                              <path d="M1.42 9a16 16 0 0121.16 0" />
                              <path d="M8.53 16.11a6 6 0 016.95 0" />
                              <circle cx="12" cy="20" r="1" fill="currentColor" />
                            </svg>
                            <span className={`text-sm ${isConnected ? 'font-bold text-blue-400' : ''}`}>{net.name}</span>
                          </div>
                          {net.secured && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>

        {/* WiFi Password Modal */}
        {wifiPasswordModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-md" onClick={() => setWifiPasswordModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-[340px] bg-[#1d1d1f] border border-white/20 rounded-[28px] shadow-2xl p-6 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white mb-2">Enter Password</h3>
              <p className="text-sm text-white/50 mb-5">Enter the Wi-Fi password for "{wifiPasswordModal}".</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const expected = wifiPasswordModal === 'Hell' ? 'death' : wifiPasswordModal === 'Death' ? 'hell' : 'password';
                  if (wifiPassword === expected) {
                    setWifiConnecting(true);
                    setTimeout(() => {
                      setConnectedNetwork(wifiPasswordModal);
                      setWifiPasswordModal(null);
                      setWifiPassword('');
                      setWifiConnecting(false);
                      showAlert(`Connected to ${wifiPasswordModal}`, 'Wi-Fi');
                    }, 1500);
                  } else {
                    setWifiPasswordError(true);
                    setWifiPassword('');
                  }
                }}
              >
                <input
                  type="password"
                  placeholder="Password"
                  autoFocus
                  value={wifiPassword}
                  onChange={(e) => { setWifiPassword(e.target.value); setWifiPasswordError(false); }}
                  className={`w-full h-11 bg-white/10 border ${wifiPasswordError ? 'border-red-500/50' : 'border-white/20'} rounded-xl px-4 text-center text-sm focus:outline-none focus:ring-2 transition-all text-white`}
                />
                {wifiPasswordError && (
                  <p className="text-red-500 text-xs font-bold mt-2 text-center">Wrong password</p>
                )}
                {wifiConnecting && (
                  <p className="text-blue-400 text-xs font-bold mt-2 text-center animate-pulse">Connecting...</p>
                )}
                <div className="flex gap-3 mt-5">
                  <button
                    type="button"
                    onClick={() => setWifiPasswordModal(null)}
                    className="flex-1 h-11 bg-white/5 hover:bg-white/10 rounded-xl font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!wifiPassword || wifiConnecting}
                    className="flex-1 h-11 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-sm disabled:opacity-50"
                  >
                    Join
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        <div
          className="cursor-pointer px-2 h-full flex items-center hover:bg-white/10 rounded transition"
          onClick={() => setShowSpotlight(!showSpotlight)}
        >
          <img
            src={`${base}icons/Spotlight.png`}
            alt="Spotlight"
            className="h-4 w-auto object-contain"
            loading="lazy"
          />
        </div>
        <div
          className="cursor-pointer px-2 h-full flex items-center hover:bg-white/10 rounded transition"
          onClick={() => onMissionControl?.()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/70">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </div>
        <div
          className="cursor-pointer px-2 h-full flex items-center hover:bg-white/10 rounded transition"
          onClick={toggleControlCenter}
        >
          <img
            src={`${base}icons/Control Center.png`}
            alt="Control Center"
            className="h-4 w-auto object-contain"
            loading="lazy"
          />
        </div>

        {/* Apple Intelligence Icon */}
        <div className="relative h-full">
          <div
            className={`cursor-pointer px-2 h-full flex items-center rounded transition gap-1 relative ${intelligenceOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
            onClick={() => setIntelligenceOpen(!intelligenceOpen)}
          >
            <div className="relative">
              <img src={`${base}icons/Siri AI.png`} alt="Siri" className="w-4 h-4 object-contain" loading="lazy" />
              {hasApiKeys && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: [
                      '0 0 4px rgba(94,92,230,0.4)',
                      '0 0 12px rgba(94,92,230,0.8)',
                      '0 0 4px rgba(94,92,230,0.4)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </div>
            {hasApiKeys && (
              <motion.div
                className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-green-400"
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>
          <IntelligencePopup isOpen={intelligenceOpen} onClose={() => setIntelligenceOpen(false)} />
        </div>

        <div
          className="cursor-pointer px-2 h-full flex items-center hover:bg-white/10 rounded transition font-normal gap-1 text-[12px]"
          onClick={() => setShowNotificationCenter(!showNotificationCenter)}
        >
          <span>{time.toLocaleDateString('en-US', { weekday: 'short' })}</span>
          <span>{time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          <span>{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
        </div>
      </div>
    </header>
  );
});
