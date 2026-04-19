import React, { useState } from 'react';
import { 
  PlusSignIcon, 
  SparklesIcon, 
  SentIcon,
  Video01Icon,
  Call02Icon,
  Search01Icon
} from 'hugeicons-react';
import { useSystem } from '../../contexts/SystemContext';

interface Contact {
  id: string;
  name: string;
  avatar: string;
  color: string;
  lastMessage: string;
  initials: string;
}

const contacts: Contact[] = [
  { id: '1', name: 'Mishthi Sharma', avatar: '🌸', color: 'bg-pink-500', lastMessage: 'The Tahoe design is incredible!', initials: 'MS' },
  { id: '2', name: 'Poorvika Gupta', avatar: '🌟', color: 'bg-blue-500', lastMessage: 'Did you see the new A19 chips?', initials: 'PG' },
  { id: '3', name: 'Ms. Sonia Bajpai', avatar: '🎓', color: 'bg-purple-600', lastMessage: 'Reviewing the genealogy now.', initials: 'SB' },
  { id: '4', name: 'Shreya Verma', avatar: '🦋', color: 'bg-emerald-500', lastMessage: 'Let’s FaceTime later!', initials: 'SV' },
];

export const Messages: React.FC = () => {
  const { launchApp } = useSystem();
  const [selectedContact, setSelectedContact] = useState<Contact>(contacts[0]);
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState<Record<string, any[]>>({
    '1': [{ id: 1, text: 'The Tahoe design is incredible!', isSender: false }],
    '2': [{ id: 1, text: 'Did you see the new A19 chips?', isSender: false }],
    '3': [{ id: 1, text: 'Reviewing the genealogy now.', isSender: false }],
    '4': [{ id: 1, text: 'Let’s FaceTime later!', isSender: false }],
  });

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [genmojiPrompt, setGenmojiPrompt] = useState('');
  const [genmojiResult, setGenmojiResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMessage = { id: Date.now(), text: inputText, isSender: true };
    setChatHistory(prev => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newMessage]
    }));
    setInputText('');
  };

  const handleGenerateGenmoji = () => {
    if (!genmojiPrompt) return;
    setIsGenerating(true);
    setTimeout(() => {
      setGenmojiResult(`https://api.dicebear.com/7.x/bottts/svg?seed=${genmojiPrompt}&backgroundColor=b6e3f4`);
      setIsGenerating(false);
    }, 1500);
  };

  const handleSendGenmoji = () => {
    if (!genmojiResult) return;
    const newMessage = { id: Date.now(), text: `[Genmoji: ${genmojiPrompt}]`, image: genmojiResult, isSender: true };
    setChatHistory(prev => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newMessage]
    }));
    setShowEmojiPicker(false);
    setGenmojiPrompt('');
    setGenmojiResult(null);
  };

  return (
    <div className="flex h-full w-full bg-white dark:bg-zinc-950 text-black dark:text-white overflow-hidden relative">
      {/* Sidebar */}
      <div className="w-80 bg-zinc-50 dark:bg-black/20 border-r border-zinc-200 dark:border-white/10 flex flex-col">
        <div className="p-6 pb-2 flex items-center justify-between">
           <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
           <button className="p-2 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-full transition-colors">
              <PlusSignIcon size={20} />
           </button>
        </div>
        
        <div className="px-4 mb-4">
           <div className="relative">
              <Search01Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search" 
                className="w-full bg-zinc-200/50 dark:bg-white/5 border-none rounded-lg py-1.5 pl-9 pr-3 text-xs focus:ring-2 focus:ring-blue-500/50 outline-none"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {contacts.map(contact => (
            <div 
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-all ${selectedContact.id === contact.id ? 'bg-blue-500' : 'hover:bg-zinc-200 dark:hover:bg-white/5'}`}
            >
               <div className={`w-12 h-12 rounded-full ${contact.color} flex items-center justify-center text-white font-bold text-lg shadow-inner border border-white/10 relative`}>
                  {contact.initials}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full" />
               </div>
               <div className="flex-1 min-w-0">
                  <div className={`flex justify-between items-baseline mb-0.5`}>
                     <span className={`text-sm font-bold truncate ${selectedContact.id === contact.id ? 'text-white' : 'text-black dark:text-white'}`}>{contact.name}</span>
                     <span className={`text-[10px] ${selectedContact.id === contact.id ? 'text-white/70' : 'text-zinc-400'}`}>10:42 AM</span>
                  </div>
                  <p className={`text-xs truncate ${selectedContact.id === contact.id ? 'text-white/80' : 'text-zinc-500'}`}>{contact.lastMessage}</p>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative bg-white dark:bg-zinc-950">
        {/* Chat Header */}
        <div className="h-16 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between px-6 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
           <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full ${selectedContact.color} flex items-center justify-center text-white text-xs font-black`}>{selectedContact.initials}</div>
              <span className="font-bold tracking-tight">{selectedContact.name}</span>
           </div>
           <div className="flex items-center gap-4">
              <button onClick={() => launchApp('facetime')} className="text-blue-500 hover:text-blue-600 transition-colors">
                 <Video01Icon size={20} />
              </button>
              <button onClick={() => launchApp('facetime')} className="text-blue-500 hover:text-blue-600 transition-colors">
                 <Call02Icon size={20} />
              </button>
           </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
           {chatHistory[selectedContact.id]?.map(msg => (
             <div key={msg.id} className={`flex ${msg.isSender ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm flex flex-col gap-2 ${msg.isSender ? 'bg-blue-500 text-white rounded-br-none' : 'bg-zinc-200 dark:bg-white/10 text-black dark:text-white rounded-bl-none shadow-sm border border-white/5'}`}>
                   {msg.image && (
                     <div className="bg-white/20 rounded-xl p-2 w-24 h-24 flex items-center justify-center backdrop-blur-md shadow-inner">
                        <img src={msg.image} alt="Genmoji" className="w-full h-full drop-shadow-md" />
                     </div>
                   )}
                   {msg.text}
                </div>
             </div>
           ))}
        </div>

        {/* Genmoji Picker Overlay */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-6 w-72 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-3xl border border-zinc-200 dark:border-white/10 rounded-3xl shadow-2xl p-4 flex flex-col gap-4 z-50">
            <div className="flex justify-between items-center px-1">
              <span className="font-bold text-sm">Apple Intelligence</span>
              <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest bg-blue-500/10 px-2 py-1 rounded-full">Genmoji</span>
            </div>
            <div className="flex bg-zinc-100 dark:bg-black/20 rounded-xl p-1">
               <button className="flex-1 py-1.5 text-xs font-bold bg-white dark:bg-white/10 rounded-lg shadow-sm">Generate</button>
               <button className="flex-1 py-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-700 dark:hover:text-white transition-colors" onClick={() => setShowEmojiPicker(false)}>Cancel</button>
            </div>
            <div className="flex flex-col gap-2">
               <input 
                 type="text" 
                 value={genmojiPrompt} 
                 onChange={e => setGenmojiPrompt(e.target.value)} 
                 placeholder="Describe an emoji..." 
                 className="w-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                 autoFocus
                 onKeyDown={e => e.key === 'Enter' && handleGenerateGenmoji()}
               />
               {isGenerating ? (
                 <div className="h-24 flex flex-col items-center justify-center gap-2 bg-blue-500/5 rounded-xl border border-blue-500/10">
                   <SparklesIcon size={24} className="text-blue-500 animate-pulse" />
                   <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Synthesizing...</span>
                 </div>
               ) : genmojiResult ? (
                 <div className="flex flex-col gap-2">
                   <div className="h-24 flex items-center justify-center bg-white/50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/10">
                     <img src={genmojiResult} alt="Generated Genmoji" className="w-16 h-16 drop-shadow-xl" />
                   </div>
                   <button onClick={handleSendGenmoji} className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all">
                      Send Genmoji
                   </button>
                 </div>
               ) : (
                 <button onClick={handleGenerateGenmoji} disabled={!genmojiPrompt} className="w-full py-2 bg-zinc-800 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm disabled:opacity-50 transition-all hover:scale-[1.02]">
                    Create
                 </button>
               )}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-6">
           <div className="relative flex items-center gap-3">
              <div className="flex-1 relative">
                 <input 
                   type="text"
                   value={inputText}
                   onChange={e => setInputText(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                   placeholder="iMessage"
                   className="w-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-full py-2.5 px-5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all pr-12"
                 />
                 <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${showEmojiPicker ? 'text-blue-500' : 'text-zinc-400 hover:text-purple-500'}`}>
                    <SparklesIcon size={18} />
                 </button>
              </div>
              <button 
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-blue-500/20"
              >
                 <SentIcon size={20} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
