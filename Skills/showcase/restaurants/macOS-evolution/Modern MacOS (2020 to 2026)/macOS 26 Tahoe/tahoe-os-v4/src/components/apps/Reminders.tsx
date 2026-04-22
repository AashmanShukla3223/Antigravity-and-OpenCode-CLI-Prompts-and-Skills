import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusSignIcon, 
  Tick01Icon, 
  Calendar01Icon 
} from 'hugeicons-react';

export const Reminders: React.FC = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Finalize macOS Tahoe Core', completed: false },
    { id: 2, text: 'Review Liquid Glass Physics', completed: true },
    { id: 3, text: 'Sync Sovereign Identity', completed: false },
  ]);
  const [input, setInput] = useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: input, completed: false }]);
    setInput('');
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="flex h-full w-full bg-white dark:bg-[#1a1a1a] text-black dark:text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-50 dark:bg-black/20 border-r border-zinc-200 dark:border-white/10 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
           <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg">
              <Calendar01Icon size={20} />
           </div>
           <h2 className="text-xl font-bold tracking-tight">Reminders</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
           <div className="bg-zinc-200/50 dark:bg-white/5 p-3 rounded-xl border border-zinc-300 dark:border-white/10">
              <div className="text-blue-500 font-black text-2xl">2</div>
              <div className="text-[10px] uppercase font-bold text-zinc-500 mt-1">Today</div>
           </div>
           <div className="bg-zinc-200/50 dark:bg-white/5 p-3 rounded-xl border border-zinc-300 dark:border-white/10">
              <div className="text-orange-500 font-black text-2xl">5</div>
              <div className="text-[10px] uppercase font-bold text-zinc-500 mt-1">Scheduled</div>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-12">
        <h1 className="text-4xl font-bold text-blue-500 mb-8 tracking-tight">Today</h1>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-4 scrollbar-hide">
          <AnimatePresence>
            {tasks.map(task => (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-4 group"
              >
                <button 
                  onClick={() => toggleTask(task.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-blue-500 border-blue-500 scale-90' : 'border-zinc-300 dark:border-white/20 hover:border-blue-400'}`}
                >
                  {task.completed && <Tick01Icon size={12} className="text-white" />}
                </button>
                <span className={`text-lg transition-all ${task.completed ? 'text-zinc-400 line-through' : 'text-black dark:text-white font-medium'}`}>
                  {task.text}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <form onSubmit={addTask} className="mt-8 relative">
           <PlusSignIcon size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-blue-500" />
           <input 
             type="text"
             value={input}
             onChange={e => setInput(e.target.value)}
             placeholder="New Reminder"
             className="w-full bg-transparent border-none pl-8 text-lg focus:outline-none placeholder-zinc-300 dark:placeholder-white/10"
           />
        </form>
      </div>
    </div>
  );
};
