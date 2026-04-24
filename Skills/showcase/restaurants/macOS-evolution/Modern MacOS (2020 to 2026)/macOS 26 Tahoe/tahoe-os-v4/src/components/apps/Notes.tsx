import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search01Icon, 
  Note01Icon, 
  PlusSignIcon, 
  MagicWand01Icon, 
  Delete02Icon,
  SidebarLeftIcon
} from 'hugeicons-react';
import { useSystem, type Note } from '../../contexts/SystemContext';

export const Notes: React.FC = () => {
  const { systemState, updateSystemState } = useSystem();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(systemState.notes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const selectedNote = systemState.notes.find(n => n.id === selectedNoteId);

  const filteredNotes = systemState.notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNote = () => {
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Note',
      content: '',
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lastModified: Date.now()
    };
    updateSystemState({
      notes: [newNote, ...systemState.notes]
    });
    setSelectedNoteId(newNote.id);
  };

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    updateSystemState({
      notes: systemState.notes.map(n => n.id === id ? { ...n, ...updates, lastModified: Date.now() } : n)
    });
  };

  const handleDeleteNote = (id: string) => {
    const newNotes = systemState.notes.filter(n => n.id !== id);
    updateSystemState({ notes: newNotes });
    if (selectedNoteId === id) {
      setSelectedNoteId(newNotes[0]?.id || null);
    }
  };

  const handleAiAction = async (action: 'summarize' | 'rewrite' | 'professional') => {
    if (!selectedNote || !selectedNote.content) return;
    
    setIsAiProcessing(true);
    // Simulate AI Latency (Tahoe Zero-Delay Protocol simulation)
    await new Promise(r => setTimeout(r, 1500));

    let newContent = selectedNote.content;
    if (action === 'summarize') {
      newContent = `[AI SUMMARY]: ${selectedNote.content.substring(0, 50)}... (Summarized by Apple Intelligence)`;
    } else if (action === 'professional') {
      newContent = selectedNote.content.toUpperCase(); // Mock transformation
    }

    handleUpdateNote(selectedNote.id, { content: newContent });
    setIsAiProcessing(false);
  };

  return (
    <div className="flex h-full w-full bg-white dark:bg-[#1C1C1E] text-gray-800 dark:text-gray-200 overflow-hidden font-sans">
      
      {/* Sidebar - Folder View */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 200, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 border-r border-black/5 dark:border-white/10 flex flex-col bg-[#F6F6F6] dark:bg-[#252525] z-20"
          >
            <div className="h-12 flex items-center px-4 pt-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">On My Mac</span>
            </div>
            <div className="flex flex-col gap-0.5 px-2">
              <div className="px-3 py-2 rounded-lg flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-sm">
                <Note01Icon size={18} /> All Notes
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note List - Middle Pane */}
      <div className="w-64 flex-shrink-0 border-r border-black/5 dark:border-white/10 flex flex-col bg-white dark:bg-[#1C1C1E]">
        <div className="p-3 space-y-3 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors">
                <SidebarLeftIcon size={18} className="text-gray-500" />
             </button>
             <button onClick={handleAddNote} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors text-amber-600">
                <PlusSignIcon size={18} />
             </button>
          </div>
          <div className="relative">
             <Search01Icon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
               type="text" 
               placeholder="Search" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-black/5 dark:bg-white/5 border-none rounded-lg py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/50"
             />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {filteredNotes.map(note => (
            <div 
              key={note.id} 
              onClick={() => setSelectedNoteId(note.id)}
              className={`p-4 border-b border-black/5 dark:border-white/5 cursor-pointer flex flex-col gap-1 transition-all ${selectedNoteId === note.id ? 'bg-amber-500/20 shadow-inner' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              <span className="font-bold text-sm truncate">{note.title || 'Untitled'}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 shrink-0">{note.date}</span>
                <span className="text-[10px] text-gray-500 truncate">{note.content || 'No additional text'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note Editor - Right Pane */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#1C1C1E] min-w-0 relative">
         {/* AI Toolbar */}
         <div className="h-12 border-b border-black/5 dark:border-white/10 flex items-center justify-between px-6 bg-white/50 dark:bg-[#1C1C1E]/50 backdrop-blur-md z-10">
           <div className="flex gap-4">
              <button 
                onClick={() => handleAiAction('summarize')}
                className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-600 transition-colors disabled:opacity-30"
                disabled={!selectedNote || isAiProcessing}
              >
                <MagicWand01Icon size={14} className="animate-pulse" />
                Summarize
              </button>
              <button 
                onClick={() => handleAiAction('professional')}
                className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-purple-500 hover:text-purple-600 transition-colors disabled:opacity-30"
                disabled={!selectedNote || isAiProcessing}
              >
                <MagicWand01Icon size={14} />
                Professional Tone
              </button>
           </div>
           
           <div className="flex gap-2">
              <button 
                onClick={() => selectedNote && handleDeleteNote(selectedNote.id)}
                className="p-1.5 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                disabled={!selectedNote}
              >
                 <Delete02Icon size={18} />
              </button>
           </div>
         </div>

         {/* Editor */}
         <div className="flex-1 overflow-y-auto p-12 scrollbar-hide">
            {selectedNote ? (
              <div className="max-w-3xl mx-auto space-y-6">
                <input 
                  type="text"
                  value={selectedNote.title}
                  onChange={(e) => handleUpdateNote(selectedNote.id, { title: e.target.value })}
                  className="w-full bg-transparent border-none text-4xl font-black tracking-tight focus:outline-none placeholder-gray-300 dark:placeholder-gray-700"
                  placeholder="Note Title"
                />
                <div className="h-px bg-black/5 dark:bg-white/10 w-full" />
                <textarea 
                  value={selectedNote.content}
                  onChange={(e) => handleUpdateNote(selectedNote.id, { content: e.target.value })}
                  className="w-full h-[500px] bg-transparent border-none text-lg leading-relaxed focus:outline-none resize-none placeholder-gray-200 dark:placeholder-gray-800"
                  placeholder="Start typing your thoughts..."
                />
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-gray-400 gap-4 opacity-20">
                <Note01Icon size={80} />
                <span className="font-black uppercase tracking-[0.3em] text-sm">Select or Create a Note</span>
              </div>
            )}
         </div>

         {/* AI Processing Overlay */}
         <AnimatePresence>
            {isAiProcessing && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-md flex items-center justify-center z-30"
              >
                 <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Apple Intelligence Processing...</span>
                 </div>
              </motion.div>
            )}
         </AnimatePresence>
      </div>

    </div>
  );
};
