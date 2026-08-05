import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search01Icon, MagicWand01Icon } from 'hugeicons-react';
import { useSystem } from '../../contexts/SystemContext';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { AIEngine } from '../../utils/AIEngine';
import { contacts } from '../../utils/contacts';
import { AppIcon } from '../common/AppIcon';

interface SearchSection {
  label: string;
  results: SearchResult[];
}

interface SearchResult {
  id: string;
  name: string;
  description?: string;
  type: 'app' | 'file' | 'contact' | 'action' | 'calc' | 'ai';
  appId?: string;
  action?: () => void;
}

const SYSTEM_ACTIONS = [
  { id: 'dark', name: 'Toggle Dark Mode', description: 'Switch between light and dark appearance' },
  { id: 'wifi', name: 'Toggle Wi-Fi', description: 'Turn Wi-Fi on or off' },
  { id: 'bluetooth', name: 'Toggle Bluetooth', description: 'Turn Bluetooth on or off' },
  { id: 'airdrop', name: 'Toggle AirDrop', description: 'Enable or disable AirDrop' },
  { id: 'lock', name: 'Lock Screen', description: 'Lock your screen' },
  { id: 'restart', name: 'Restart', description: 'Restart macOS Golden Gate' },
  { id: 'shutdown', name: 'Shut Down', description: 'Shut down macOS Golden Gate' },
  { id: 'emptytrash', name: 'Empty Trash', description: 'Permanently delete all items in Trash' },
];

const ALL_APPS_LIST = [
  'finder', 'safari', 'messages', 'mail', 'maps', 'photos', 'facetime', 'phone',
  'calendar', 'contacts', 'notes', 'music', 'tv', 'appstore', 'settings', 'terminal',
  'calculator', 'weather', 'clock', 'reminders', 'stickies', 'books', 'wallet',
  'code', 'itunes', 'keynote', 'numbers', 'pages', 'chess', 'activitymonitor',
  'diskutility', 'timemachine', 'photobooth', 'siriai', 'github', 'aboutme',
  'vmware', 'samsunglcdtv', 'iphonemirroring', 'crazyerrors', 'soundtest',
  'freeform', 'motion', 'xcode', 'pixelmatorpro', 'finalcutpro', 'logicpro',
  'geometrydash', 'screensharing', 'migrationassistant',
];

const APP_NAMES: Record<string, string> = {
  finder: 'Finder', safari: 'Safari', messages: 'Messages', mail: 'Mail',
  maps: 'Maps', photos: 'Photos', facetime: 'FaceTime', phone: 'Phone',
  calendar: 'Calendar', contacts: 'Contacts', notes: 'Notes', music: 'Music',
  tv: 'Apple TV+', appstore: 'App Store', settings: 'System Settings',
  terminal: 'Terminal', calculator: 'Calculator', weather: 'Weather',
  clock: 'Clock', reminders: 'Reminders', stickies: 'Stickies',
  books: 'Apple Books', wallet: 'Wallet', code: 'VS Code',
  itunes: 'iTunes Store', keynote: 'Keynote', numbers: 'Numbers',
  pages: 'Pages', chess: 'Chess', activitymonitor: 'Activity Monitor',
  diskutility: 'Disk Utility', timemachine: 'Time Machine',
  photobooth: 'Photo Booth', siriai: 'Siri AI', github: 'GitHub Navigator',
  aboutme: 'About Me', vmware: 'VMware Fusion Pro',
  samsunglcdtv: 'Samsung LCD TV', iphonemirroring: 'iPhone Mirroring',
  crazyerrors: 'Crazy Errors', soundtest: 'Sound Test', freeform: 'Freeform',
  motion: 'Motion', xcode: 'Xcode', pixelmatorpro: 'Pixelmator Pro',
  finalcutpro: 'Final Cut Pro', logicpro: 'Logic Pro',
  games: 'Games', geometrydash: 'Geometry Dash',
  screensharing: 'Screen Sharing', migrationassistant: 'Migration Assistant',
};

const QUESTION_WORDS = new Set([
  'what', 'who', 'where', 'when', 'why', 'how', 'is', 'are', 'can',
  'could', 'would', 'should', 'do', 'does', 'did', 'tell', 'explain',
  'define', 'meaning', 'search', 'find', 'show', 'list',
]);

function isQuestion(q: string): boolean {
  if (!q) return false;
  if (q.endsWith('?')) return true;
  const first = q.split(/\s+/)[0];
  return QUESTION_WORDS.has(first);
}

function isCalc(q: string): boolean {
  return /^[\d\s+\-*/.()%^]+$/.test(q.trim()) && /[\d]/.test(q);
}

export const Spotlight: React.FC = () => {
  const { showSpotlight, setShowSpotlight, launchApp, updateSystemState, setPowerMode, showAlert, setBootState } = useSystem();
  const { nodes, emptyTrash } = useFileSystem();
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const [sectionIndex, setSectionIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const engineRef = useRef<AIEngine | null>(null);

  useEffect(() => {
    if (showSpotlight) {
      inputRef.current?.focus();
      setQuery('');
      setIndex(0);
      setSectionIndex(0);
    }
  }, [showSpotlight]);

  const sections: SearchSection[] = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const result: SearchSection[] = [];

    // Calculator
    if (isCalc(trimmed)) {
      try {
        const calcResult = Function(`"use strict"; return (${trimmed})`)();
        if (typeof calcResult === 'number' && isFinite(calcResult)) {
          result.push({
            label: 'Calculator',
            results: [{ id: 'calc', name: `${trimmed} = ${calcResult}`, type: 'calc', action: () => { navigator.clipboard?.writeText(String(calcResult)); } }],
          });
        }
      } catch { /* ignore */ }
    }

    // Match apps
    const matchedApps = ALL_APPS_LIST.filter((id) => {
      const name = APP_NAMES[id] || id;
      return name.toLowerCase().includes(trimmed.toLowerCase()) || id.includes(trimmed.toLowerCase());
    });
    if (matchedApps.length > 0) {
      result.push({
        label: 'Applications',
        results: matchedApps.map((id) => ({
          id: `app-${id}`, name: APP_NAMES[id] || id, type: 'app' as const, appId: id,
          action: () => { launchApp(id); setShowSpotlight(false); },
        })),
      });
    }

    // Match files and folders from VFS
    const matchedFiles = nodes.filter((n) => {
      if (n.parentId === 'trash') return false;
      return n.name.toLowerCase().includes(trimmed.toLowerCase());
    });
    if (matchedFiles.length > 0) {
      result.push({
        label: 'Files & Folders',
        results: matchedFiles.slice(0, 5).map((n) => ({
          id: `file-${n.id}`, name: n.name, description: n.type === 'folder' ? 'Folder' : 'File',
          type: 'file' as const, appId: 'finder',
          action: () => { launchApp('finder'); setShowSpotlight(false); },
        })),
      });
    }

    // Match contacts
    const matchedContacts = contacts.filter((c) =>
      c.name.toLowerCase().includes(trimmed.toLowerCase()) ||
      c.department.toLowerCase().includes(trimmed.toLowerCase())
    );
    if (matchedContacts.length > 0) {
      result.push({
        label: 'Contacts',
        results: matchedContacts.slice(0, 5).map((c) => ({
          id: `contact-${c.id}`, name: c.name, description: c.department,
          type: 'contact' as const, appId: 'contacts',
          action: () => { launchApp('contacts'); setShowSpotlight(false); },
        })),
      });
    }

    // Match system actions
    const matchedActions = SYSTEM_ACTIONS.filter((a) =>
      a.name.toLowerCase().includes(trimmed.toLowerCase()) || a.description.toLowerCase().includes(trimmed.toLowerCase())
    );
    if (matchedActions.length > 0) {
      result.push({
        label: 'Actions',
        results: matchedActions.map((a) => ({
          id: `action-${a.id}`, name: a.name, description: a.description,
          type: 'action' as const,
          action: () => {
            switch (a.id) {
              case 'dark': updateSystemState({ appearance: document.documentElement.classList.contains('dark') ? 'light' : 'dark' }); break;
              case 'wifi': updateSystemState({ airdrop: !navigator.onLine }); break;
              case 'airdrop': updateSystemState({ airdrop: !navigator.onLine }); break;
              case 'lock': setBootState('login'); break;
              case 'restart': window.location.reload(); break;
              case 'shutdown': window.location.href = 'about:blank'; break;
              case 'emptytrash': emptyTrash(); break;
            }
            setShowSpotlight(false);
          },
        })),
      });
    }

    // AI fallback
    if (result.length === 0) {
      const isQ = isQuestion(trimmed.toLowerCase());
      result.push({
        label: 'Apple Intelligence',
        results: [{
          id: 'ai', name: isQ ? `Ask: ${trimmed}` : `Search: ${trimmed}`,
          description: 'Ask Siri with Apple Intelligence', type: 'ai' as const,
          action: async () => {
            if (!engineRef.current) engineRef.current = new AIEngine({ launchApp, updateSystemState, setPowerMode });
            const res = await engineRef.current.executeCommand(trimmed);
            await showAlert(res, 'Apple Intelligence');
            setShowSpotlight(false);
          },
        }],
      });
    }

    return result;
  }, [query, nodes, launchApp, setShowSpotlight, updateSystemState, showAlert, setPowerMode, emptyTrash, setBootState]);

  const totalResults = sections.reduce((acc, s) => acc + s.results.length, 0);

  // Map flat index to section+result index
  const getFlatIndex = (si: number, ri: number) => {
    let flat = 0;
    for (let i = 0; i < sections.length; i++) {
      if (i < si) { flat += sections[i].results.length; continue; }
      if (i === si) return flat + ri;
    }
    return flat;
  };

  // Find section and result from flat index
  const fromFlatIndex = (flatIdx: number) => {
    let remaining = flatIdx;
    for (let i = 0; i < sections.length; i++) {
      if (remaining < sections[i].results.length) return { si: i, ri: remaining };
      remaining -= sections[i].results.length;
    }
    return { si: 0, ri: 0 };
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (totalResults > 0) {
        const newFlat = (getFlatIndex(sectionIndex, index) + 1) % totalResults;
        const { si, ri } = fromFlatIndex(newFlat);
        setSectionIndex(si);
        setIndex(ri);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (totalResults > 0) {
        const newFlat = (getFlatIndex(sectionIndex, index) - 1 + totalResults) % totalResults;
        const { si, ri } = fromFlatIndex(newFlat);
        setSectionIndex(si);
        setIndex(ri);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const section = sections[sectionIndex];
      if (section && section.results[index]) {
        section.results[index].action?.();
      }
    } else if (e.key === 'Escape') setShowSpotlight(false);
  };

  return (
    <AnimatePresence>
      {showSpotlight && (
        <motion.div
          key="spotlight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.08, ease: 'easeOut' }}
          className="fixed inset-0 z-[200]"
        >
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowSpotlight(false)} />
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-black/40 backdrop-blur-[var(--glass-blur)] saturate-[190%] border border-white/20 rounded-[28px] shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="flex items-center px-6 py-5 gap-4">
              <Search01Icon size={24} className="text-white/40 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setIndex(0); setSectionIndex(0); }}
                onKeyDown={onKey}
                placeholder="Search apps, files, contacts, actions..."
                className="flex-1 bg-transparent border-none text-2xl font-light text-white placeholder-white/20 outline-none"
              />
            </div>

            {sections.length > 0 && (
              <div className="border-t border-white/10 p-2 max-h-[400px] overflow-y-auto scrollbar-hide">
                {sections.map((section, si) => (
                  <div key={section.label}>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/20 px-4 py-2">
                      {section.label}
                    </div>
                    {section.results.map((result, ri) => {
                      const isSelected = si === sectionIndex && ri === index;
                      return (
                        <div
                          key={result.id}
                          onClick={() => result.action?.()}
                          onMouseEnter={() => { setSectionIndex(si); setIndex(ri); }}
                          className={`flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all ${isSelected ? 'bg-blue-500 shadow-lg' : 'hover:bg-white/5'}`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-white/5'}`}>
                            {result.type === 'app' || result.type === 'file' ? (
                              <AppIcon id={result.appId || 'finder'} size={20} />
                            ) : result.type === 'contact' ? (
                              <span className="text-lg">👤</span>
                            ) : result.type === 'calc' ? (
                              <span className="text-lg">#</span>
                            ) : (
                              <MagicWand01Icon size={20} className="text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-white tracking-tight truncate">{result.name}</div>
                            {result.description && (
                              <div className={`text-[10px] uppercase font-black tracking-widest truncate ${isSelected ? 'text-white/70' : 'text-white/30'}`}>
                                {result.description}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <span className="text-xs text-white/50 font-medium whitespace-nowrap">⏎ Open</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
