import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search01Icon, 
  GithubIcon, 
  ComputerTerminal01Icon, 
  GlobalIcon, 
  File01Icon, 
  Video01Icon, 
  Image01Icon,
  BookOpen01Icon,
  Wallet01Icon,
  Store01Icon,
  Message01Icon,
  MagicWand01Icon
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
  aiResponse?: string;
}

const mockResults: SearchResult[] = [
  { id: '1', name: 'Safari', type: 'app', icon: GlobalIcon, appId: 'safari' },
  { id: '2', name: 'Terminal', type: 'app', icon: ComputerTerminal01Icon, appId: 'terminal' },
  { id: '3', name: 'App Store', type: 'app', icon: Store01Icon, appId: 'appstore' },
  { id: '4', name: 'Books', type: 'app', icon: BookOpen01Icon, appId: 'books' },
  { id: '5', name: 'Wallet', type: 'app', icon: Wallet01Icon, appId: 'wallet' },
  { id: '6', name: 'Messages', type: 'app', icon: Message01Icon, appId: 'messages' },
  { id: 'gh-main', name: 'Aashman Shukla (GitHub Profile)', type: 'repo', icon: GithubIcon, url: 'https://github.com/AashmanShukla3223/' },
  { id: 'gh-prompts', name: 'Gemini CLI Prompts', type: 'repo', icon: GithubIcon, url: 'https://github.com/AashmanShukla3223/Gemini-CLI-Prompts-and-Skills/' },
  { id: 'gh-fg', name: 'Financial Golf', type: 'repo', icon: GithubIcon, url: 'https://github.com/AashmanShukla3223/financial-golf' },
  { id: 'gh-folder-skills', name: 'GitHub: /Skills Folder', type: 'repo', icon: GithubIcon, url: 'https://github.com/AashmanShukla3223/Gemini-CLI-Prompts-and-Skills/tree/main/Skills' },
  { id: 'gh-folder-prompts', name: 'GitHub: /Prompts Folder', type: 'repo', icon: GithubIcon, url: 'https://github.com/AashmanShukla3223/Gemini-CLI-Prompts-and-Skills/tree/main/Prompts' },
  { id: '7', name: 'Tahoe Wallpaper', type: 'image', icon: Image01Icon },
  { id: '8', name: 'Sonoma Drone Shot', type: 'video', icon: Video01Icon },
  { id: '9', name: 'Project Notes', type: 'file', icon: File01Icon },
];

export const Spotlight: React.FC = () => {
  const system = useSystem();
  const { showSpotlight, setShowSpotlight, launchApp, updateSystemState, setPowerMode } = system;
  const [query, setInput] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [clipboardHistory, setClipboardHistory] = useState<string[]>([]);
  const [actionMessage, setActionMessage] = useState<{contact: string, text: string} | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize AI Engine
  const aiEngine = useRef(new AIEngine('mock-key', 'gemini', {
    launchApp,
    updateSystemState,
    setPowerMode
  }));

  useEffect(() => {
    if (showSpotlight) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSelectedIndex(0);
      // Simulate fetching clipboard history
      if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then(text => {
          if (text) setClipboardHistory([text, 'https://github.com/AashmanShukla3223', 'npm run dev']);
          else setClipboardHistory(['https://github.com/AashmanShukla3223', 'npm run dev', 'Hello Tahoe']);
        }).catch(() => setClipboardHistory(['https://github.com/AashmanShukla3223', 'npm run dev', 'Hello Tahoe']));
      } else {
        setClipboardHistory(['https://github.com/AashmanShukla3223', 'npm run dev', 'Hello Tahoe']);
      }
    } else {
      setInput('');
      setActionMessage(null);
    }
  }, [showSpotlight]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setActionMessage(null);
      return;
    }

    const cmd = query.toUpperCase().trim();
    
    // AI Command detection (e.g. starting with "AI " or "HEY APPLE ")
    if (cmd.startsWith('AI ') || cmd.startsWith('HEY APPLE ')) {
      const prompt = query.replace(/^(ai |hey apple )/i, '');
      setResults([{
        id: 'ai-prompt',
        name: `Ask Apple Intelligence: "${prompt}"`,
        type: 'ai',
        icon: MagicWand01Icon,
        aiResponse: 'Press Enter to execute.'
      }]);
      setSelectedIndex(0);
      return;
    }

    if (cmd.startsWith('MESSAGE ') || cmd.startsWith('MSG ')) {
       const parts = query.split(' ');
       if (parts.length > 2) {
         setActionMessage({ contact: parts[1], text: parts.slice(2).join(' ') });
         setResults([]);
         return;
       }
    } else {
       setActionMessage(null);
    }

    // Command Shortcuts Logic
    if (cmd === 'GH') {
       window.open('https://github.com/AashmanShukla3223/', '_blank');
       setShowSpotlight(false);
       return;
    }
    if (cmd === 'SM') {
       launchApp('messages');
       setShowSpotlight(false);
       return;
    }
    if (cmd === 'ADD' || cmd === 'REMINDER') {
       launchApp('reminders');
       setShowSpotlight(false);
       return;
    }
    if (cmd === 'STICKY') {
       launchApp('stickies');
       setShowSpotlight(false);
       return;
    }

    const filtered = mockResults.filter(r => 
      r.name.toLowerCase().includes(query.toLowerCase()) || 
      r.type.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
    setSelectedIndex(0);
  }, [query, launchApp, setShowSpotlight]);

  const handleAction = async (result?: SearchResult) => {
    if (actionMessage) {
      console.log(`Sent "${actionMessage.text}" to ${actionMessage.contact}`);
      setShowSpotlight(false);
      return;
    }
    if (result) {
      if (result.type === 'ai') {
        const prompt = query.replace(/^(ai |hey apple )/i, '');
        const res = await aiEngine.current.executeCommand(prompt);
        // Display result briefly before closing
        await system.showAlert(res, 'Apple Intelligence');
        setShowSpotlight(false);
      } else if (result.type === 'app' && result.appId) {
        launchApp(result.appId);
        setShowSpotlight(false);
      } else if (result.url) {
        window.open(result.url, '_blank');
        setShowSpotlight(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      if (results.length) setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      if (results.length) setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      handleAction(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSpotlight(false);
    }
  };

  return (
    <AnimatePresence>
      {showSpotlight && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSpotlight(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[200]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -40 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-black/40 backdrop-blur-[60px] saturate-[190%] border border-white/20 rounded-[28px] shadow-[0_40px_100px_rgba(0,0,0,0.6)] z-[210] overflow-hidden flex flex-col"
          >
            <div className="flex items-center px-6 py-5 gap-4">
              <Search01Icon size={24} className="text-white/40" />
              <input 
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Spotlight Search"
                className="flex-1 bg-transparent border-none text-2xl font-light text-white placeholder-white/20 outline-none"
              />
            </div>

            {actionMessage && (
               <div className="border-t border-white/10 p-4 flex items-center justify-between bg-blue-500/10">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white"><Message01Icon size={20}/></div>
                   <div>
                     <div className="text-sm font-bold text-white">Send to {actionMessage.contact}</div>
                     <div className="text-xs text-white/70">"{actionMessage.text}"</div>
                   </div>
                 </div>
                 <div className="text-xs font-bold text-blue-400 animate-pulse">Press Enter to Send</div>
               </div>
            )}

            {!actionMessage && results.length > 0 && (
              <div className="border-t border-white/10 p-2 max-h-[400px] overflow-y-auto scrollbar-hide">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/20 px-4 py-2">Top Hits</div>
                {results.map((result, index) => (
                  <div 
                    key={result.id}
                    onClick={() => handleAction(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all ${selectedIndex === index ? 'bg-blue-500 shadow-lg' : 'hover:bg-white/5'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedIndex === index ? 'bg-white/20' : 'bg-white/5'}`}>
                      <result.icon size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white tracking-tight">{result.name}</div>
                      <div className={`text-[10px] uppercase font-black tracking-widest ${selectedIndex === index ? 'text-white/70' : 'text-white/30'}`}>
                        {result.type}
                      </div>
                    </div>
                    {selectedIndex === index && (
                      <span className="text-xs text-white/50 font-medium">⏎ {result.type === 'ai' ? 'Execute' : 'Open'}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!query && clipboardHistory.length > 0 && (
               <div className="border-t border-white/10 p-2">
                 <div className="text-[10px] font-black uppercase tracking-widest text-white/20 px-4 py-2">Clipboard History</div>
                 {clipboardHistory.map((text, i) => (
                   <div key={i} className="px-4 py-2 text-sm text-white/70 hover:bg-white/5 rounded-xl cursor-pointer truncate">
                     {text}
                   </div>
                 ))}
               </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
