import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search01Icon,
  GithubIcon,
  GlobalIcon,
  File01Icon,
  BookOpen01Icon,
  Wallet01Icon,
  Store01Icon,
  Message01Icon,
  MagicWand01Icon,
  SparklesIcon,
} from 'hugeicons-react';
import { useSystem } from '../../contexts/SystemContext';
import { AIEngine } from '../../utils/AIEngine';

interface SearchResult {
  id: string;
  name: string;
  type: 'app' | 'file' | 'repo' | 'video' | 'image' | 'ai';
  icon: React.ElementType;
  url?: string;
  appId?: string;
}

const APP_RESULTS: SearchResult[] = [
  { id: '1', name: 'Safari', type: 'app', icon: GlobalIcon, appId: 'safari' },
  { id: '2', name: 'Terminal', type: 'app', icon: GlobalIcon, appId: 'terminal' },
  { id: '3', name: 'App Store', type: 'app', icon: Store01Icon, appId: 'appstore' },
  { id: '4', name: 'Books', type: 'app', icon: BookOpen01Icon, appId: 'books' },
  { id: '5', name: 'Wallet', type: 'app', icon: Wallet01Icon, appId: 'wallet' },
  { id: '6', name: 'Messages', type: 'app', icon: Message01Icon, appId: 'messages' },
  { id: '7', name: 'Siri', type: 'app', icon: SparklesIcon, appId: 'siriai' },
  { id: '8', name: 'Settings', type: 'app', icon: GlobalIcon, appId: 'settings' },
  { id: '9', name: 'Calculator', type: 'app', icon: GlobalIcon, appId: 'calculator' },
  { id: '10', name: 'Finder', type: 'app', icon: GlobalIcon, appId: 'finder' },
  { id: '11', name: 'Notes', type: 'app', icon: GlobalIcon, appId: 'notes' },
  { id: '12', name: 'Weather', type: 'app', icon: GlobalIcon, appId: 'weather' },
  {
    id: 'gh-main',
    name: 'Aashman Shukla (GitHub Profile)',
    type: 'repo',
    icon: GithubIcon,
    url: 'https://github.com/AashmanShukla3223/',
  },
  {
    id: 'gh-prompts',
    name: 'Gemini CLI Prompts',
    type: 'repo',
    icon: GithubIcon,
    url: 'https://github.com/AashmanShukla3223/Gemini-CLI-Prompts-and-Skills/',
  },
  {
    id: 'gh-fg',
    name: 'Financial Golf',
    type: 'repo',
    icon: GithubIcon,
    url: 'https://github.com/AashmanShukla3223/financial-golf',
  },
  {
    id: 'gh-folder-skills',
    name: 'GitHub: /Skills Folder',
    type: 'repo',
    icon: GithubIcon,
    url: 'https://github.com/AashmanShukla3223/Gemini-CLI-Prompts-and-Skills/tree/main/Skills',
  },
  {
    id: 'gh-folder-prompts',
    name: 'GitHub: /Prompts Folder',
    type: 'repo',
    icon: GithubIcon,
    url: 'https://github.com/AashmanShukla3223/Gemini-CLI-Prompts-and-Skills/tree/main/Prompts',
  },
  { id: '13', name: 'Project Notes', type: 'file', icon: File01Icon },
];

const QUESTION_WORDS = new Set([
  'what',
  'who',
  'where',
  'when',
  'why',
  'how',
  'is',
  'are',
  'can',
  'could',
  'would',
  'should',
  'do',
  'does',
  'did',
  'tell',
  'explain',
  'define',
  'meaning',
  'search',
  'find',
  'show',
  'list',
]);

function isQuestion(q: string): boolean {
  if (!q) return false;
  if (q.endsWith('?')) return true;
  const first = q.split(/\s+/)[0];
  return QUESTION_WORDS.has(first);
}

export const Spotlight: React.FC = () => {
  const { showSpotlight, setShowSpotlight, launchApp, updateSystemState, setPowerMode, showAlert } = useSystem();
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const engineRef = useRef<AIEngine | null>(null);

  useEffect(() => {
    if (showSpotlight) {
      inputRef.current?.focus();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('');
      setIndex(0);
    }
  }, [showSpotlight]);

  const { results, isAsking } = useMemo(() => {
    const trimmed = query.trim();
    const upped = trimmed.toUpperCase();
    if (!trimmed) return { results: [] as SearchResult[], isAsking: false };

    if (upped === 'GH') {
      window.open('https://github.com/AashmanShukla3223/', '_blank');
      setShowSpotlight(false);
      return { results: [] as SearchResult[], isAsking: false };
    }
    if (upped === 'SM') {
      launchApp('messages');
      setShowSpotlight(false);
      return { results: [] as SearchResult[], isAsking: false };
    }
    if (upped === 'REMINDER') {
      launchApp('reminders');
      setShowSpotlight(false);
      return { results: [] as SearchResult[], isAsking: false };
    }
    if (upped === 'STICKY') {
      launchApp('stickies');
      setShowSpotlight(false);
      return { results: [] as SearchResult[], isAsking: false };
    }

    const matched = APP_RESULTS.filter((r) => r.name.toLowerCase().includes(trimmed.toLowerCase()));
    if (matched.length > 0) return { results: matched, isAsking: false };

    const isQuery = isQuestion(trimmed.toLowerCase());
    return {
      results: [
        {
          id: 'ai',
          name: isQuery ? 'Ask Siri' : 'Search or Ask',
          type: 'ai' as const,
          icon: MagicWand01Icon,
        },
      ],
      isAsking: true,
    };
  }, [query, launchApp, setShowSpotlight]);

  const placeholder = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return 'Search or Ask';
    return isQuestion(trimmed) ? 'Ask Siri' : 'Search or Ask';
  }, [query]);

  const handleAction = async (result?: SearchResult) => {
    if (!result) return;
    if (result.type === 'ai') {
      if (!engineRef.current) engineRef.current = new AIEngine({ launchApp, updateSystemState, setPowerMode });
      const res = await engineRef.current.executeCommand(query);
      await showAlert(res, 'Apple Intelligence');
      setShowSpotlight(false);
    } else if (result.type === 'app' && result.appId) {
      launchApp(result.appId);
      setShowSpotlight(false);
    } else if (result.url) {
      window.open(result.url, '_blank');
      setShowSpotlight(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length) setIndex((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length) setIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleAction(results[index]);
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
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIndex(0);
                }}
                onKeyDown={onKey}
                placeholder={placeholder}
                className="flex-1 bg-transparent border-none text-2xl font-light text-white placeholder-white/20 outline-none"
              />
            </div>

            {results.length > 0 && (
              <div className="border-t border-white/10 p-2 max-h-[400px] overflow-y-auto scrollbar-hide">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/20 px-4 py-2">
                  {results[0].type === 'ai' ? 'Apple Intelligence' : 'Top Hits'}
                </div>
                {results.map((result, i) => (
                  <div
                    key={result.id}
                    onClick={() => handleAction(result)}
                    onMouseEnter={() => setIndex(i)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all ${i === index ? 'bg-blue-500 shadow-lg' : 'hover:bg-white/5'}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${i === index ? 'bg-white/20' : 'bg-white/5'}`}
                    >
                      <result.icon size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white tracking-tight">{result.name}</div>
                      <div
                        className={`text-[10px] uppercase font-black tracking-widest ${i === index ? 'text-white/70' : 'text-white/30'}`}
                      >
                        {result.type === 'ai' && isAsking ? 'Ask Siri' : result.type}
                      </div>
                    </div>
                    {i === index && (
                      <span className="text-xs text-white/50 font-medium whitespace-nowrap">
                        ⏎ {result.type === 'ai' ? 'Ask' : 'Open'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
