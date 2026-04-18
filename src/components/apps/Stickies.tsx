import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusSignIcon, 
  Cancel01Icon 
} from 'hugeicons-react';

export const Stickies: React.FC = () => {
  const [notes, setNotes] = useState([
    { id: 1, text: 'The Tahoe "Liquid Glass" architecture is now complete.', color: 'bg-yellow-200 dark:bg-yellow-900/40', x: 40, y: 40 },
    { id: 2, text: 'Remember to sync with Aashman Shukla on GitHub.', color: 'bg-green-200 dark:bg-green-900/40', x: 280, y: 100 },
  ]);

  const addNote = () => {
    const newNote = {
      id: Date.now(),
      text: '',
      color: 'bg-blue-200 dark:bg-blue-900/40',
      x: 100 + (notes.length * 20),
      y: 100 + (notes.length * 20),
    };
    setNotes([...notes, newNote]);
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <div className="h-full w-full bg-transparent relative p-4 overflow-hidden">
      <button 
        onClick={addNote}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl z-50 transition-transform hover:scale-110"
      >
        <PlusSignIcon size={20} />
      </button>

      <AnimatePresence>
        {notes.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            drag
            dragMomentum={false}
            className={`absolute w-64 h-64 p-4 rounded-xl shadow-2xl border border-black/5 flex flex-col group ${note.color} backdrop-blur-md`}
            style={{ left: note.x, top: note.y }}
          >
             <div className="flex justify-between items-center mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-3 h-3 rounded-full bg-black/10" />
                <button onClick={() => deleteNote(note.id)} className="text-black/30 hover:text-black/60 transition-colors">
                   <Cancel01Icon size={14} />
                </button>
             </div>
             <textarea 
               defaultValue={note.text}
               placeholder="Write something..."
               className="flex-1 bg-transparent border-none outline-none resize-none text-black dark:text-white font-medium placeholder-black/20"
             />
          </motion.div>
        ))}
      </AnimatePresence>
      
      {notes.length === 0 && (
         <div className="h-full flex items-center justify-center text-white/20 font-bold uppercase tracking-widest pointer-events-none">
            No active stickies
         </div>
      )}
    </div>
  );
};
