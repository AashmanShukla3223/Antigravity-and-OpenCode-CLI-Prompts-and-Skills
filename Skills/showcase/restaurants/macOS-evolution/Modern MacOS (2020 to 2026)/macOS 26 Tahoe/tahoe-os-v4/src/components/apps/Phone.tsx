import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SmartPhone01Icon, 
  Search01Icon, 
  StarIcon, 
  Call02Icon, 
  Message01Icon, 
  Video01Icon,
  Mail01Icon,
  InformationCircleIcon,
  Mic01Icon,
  MicOff01Icon,
  VolumeHighIcon
} from 'hugeicons-react';
import { useSystem } from '../../contexts/SystemContext';
import { contacts } from '../../utils/contacts';

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
};

const colors = [
  'bg-pink-500', 'bg-blue-500', 'bg-purple-600', 'bg-emerald-500', 
  'bg-orange-500', 'bg-red-500', 'bg-indigo-500', 'bg-teal-500'
];

const getContactColor = (id: number) => colors[id % colors.length];

export const Phone: React.FC = () => {
  const { launchApp } = useSystem();
  const [selectedId, setSelectedId] = useState(contacts[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialing, setIsDialing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const selected = contacts.find(c => c.id === selectedId) || contacts[0];

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favorites = contacts.slice(0, 5); // Default favorites for simulation

  const handleDial = () => {
    setIsDialing(true);
    // In the future, this would trigger the iPhone handoff
  };

  return (
    <div className="flex h-full w-full bg-white dark:bg-[#0A0A0A] text-black dark:text-white overflow-hidden font-sans relative">
      
      {/* Sidebar - Pane 1 */}
      <div className="w-80 bg-zinc-50 dark:bg-white/5 border-r border-zinc-200 dark:border-white/10 flex flex-col">
        <div className="p-6 pb-2 flex items-center justify-between">
           <h1 className="text-2xl font-bold tracking-tight">Phone</h1>
           <div className="p-1.5 bg-blue-500/10 rounded-full">
              <SmartPhone01Icon size={16} className="text-blue-500 animate-pulse" />
           </div>
        </div>
        
        <div className="px-4 mb-4 mt-2">
           <div className="relative">
              <Search01Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search contacts" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-200/50 dark:bg-white/5 border-none rounded-lg py-1.5 pl-9 pr-3 text-xs focus:ring-2 focus:ring-blue-500/50 outline-none"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {/* Favorites Section */}
          <div className="px-6 py-2">
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Favorites</span>
          </div>
          <div className="px-2 mb-4 space-y-1">
             {favorites.map(f => (
               <div 
                key={`fav-${f.id}`}
                onClick={() => setSelectedId(f.id)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer transition-all ${selectedId === f.id ? 'bg-blue-500 text-white' : 'hover:bg-zinc-200 dark:hover:bg-white/5'}`}
               >
                  <div className={`w-8 h-8 rounded-full ${getContactColor(f.id)} flex items-center justify-center text-[10px] font-bold border border-white/10`}>
                     {getInitials(f.name)}
                  </div>
                  <span className="text-sm font-medium truncate">{f.name}</span>
                  <StarIcon size={12} className={selectedId === f.id ? 'text-white/50 ml-auto' : 'text-zinc-300 dark:text-zinc-600 ml-auto'} />
               </div>
             ))}
          </div>

          {/* All Contacts Section */}
          <div className="px-6 py-2">
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">All Contacts</span>
          </div>
          <div className="px-2 space-y-1">
             {filteredContacts.map(c => (
               <div 
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`px-4 py-2 rounded-xl cursor-pointer transition-all ${selectedId === c.id ? 'bg-blue-500 text-white font-bold' : 'hover:bg-zinc-200 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300'}`}
               >
                 <div className="text-sm truncate">{c.name}</div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Detail View - Pane 2 */}
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white dark:bg-black/20 backdrop-blur-3xl relative">
         <div className="max-w-md w-full flex flex-col items-center">
            
            {/* Identity */}
            <motion.div 
              key={selected.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`w-36 h-36 rounded-full ${getContactColor(selected.id)} flex items-center justify-center text-white text-5xl font-black shadow-2xl mb-8 relative`}
            >
               {getInitials(selected.name)}
               <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center shadow-lg border border-zinc-100 dark:border-white/10">
                  <SmartPhone01Icon size={18} className="text-blue-500" />
               </div>
            </motion.div>

            <h2 className="text-4xl font-bold tracking-tight mb-1 text-center">{selected.name}</h2>
            <p className="text-blue-500 font-bold text-xs uppercase tracking-[0.2em] mb-2">{selected.title}</p>
            <p className="text-zinc-400 text-sm font-medium mb-12">{selected.department}</p>

            {/* Dial Button */}
            <button 
              onClick={handleDial}
              className="group relative flex flex-col items-center gap-4 mb-16"
            >
               <div className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all hover:scale-110 active:scale-95">
                  <Call02Icon size={32} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-green-500 transition-colors">Call via iPhone</span>
            </button>

            {/* Contact Info Cards */}
            <div className="w-full grid grid-cols-2 gap-4">
               <div onClick={() => launchApp('messages')} className="p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-200 dark:border-white/10 cursor-pointer hover:bg-zinc-100 dark:hover:bg-white/10 transition-all">
                  <Message01Icon size={16} className="text-blue-500 mb-2" />
                  <div className="text-[10px] font-bold text-zinc-400 uppercase">Message</div>
                  <div className="text-xs font-medium truncate">{selected.phone}</div>
               </div>
               <div onClick={() => launchApp('facetime')} className="p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-200 dark:border-white/10 cursor-pointer hover:bg-zinc-100 dark:hover:bg-white/10 transition-all">
                  <Video01Icon size={16} className="text-purple-500 mb-2" />
                  <div className="text-[10px] font-bold text-zinc-400 uppercase">FaceTime</div>
                  <div className="text-xs font-medium truncate">{selected.email}</div>
               </div>
            </div>
         </div>

         {/* Continuity Branding */}
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300 dark:text-zinc-700">
            <InformationCircleIcon size={12} />
            <span>Encrypted via Tahoe Continuity Bridge</span>
         </div>
      </div>

      {/* Calling Overlay (Simulation) */}
      <AnimatePresence>
        {isDialing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-zinc-950/90 backdrop-blur-3xl flex flex-col items-center justify-center text-white"
          >
             <div className="absolute top-12 flex flex-col items-center">
                <div className="p-4 bg-white/5 rounded-3xl border border-white/10 flex items-center gap-4 mb-6">
                   <SmartPhone01Icon size={24} className="text-blue-500" />
                   <div className="text-left">
                      <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Continuity Active</div>
                      <div className="text-xs font-bold">Calling on iPhone 17 Pro...</div>
                   </div>
                </div>
             </div>

             <motion.div 
               animate={{ scale: [1, 1.05, 1] }}
               transition={{ duration: 2, repeat: Infinity }}
               className={`w-32 h-32 rounded-full ${getContactColor(selected.id)} flex items-center justify-center text-white text-4xl font-black mb-8 shadow-[0_0_50px_rgba(59,130,246,0.5)]`}
             >
                {getInitials(selected.name)}
             </motion.div>

             <h3 className="text-3xl font-bold mb-2">{selected.name}</h3>
             <p className="text-zinc-400 font-medium mb-12">calling mobile...</p>

             <div className="flex gap-8 mb-16">
                <button className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur-xl border border-white/10">
                   <MicOff01Icon size={24} />
                </button>
                <button className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur-xl border border-white/10">
                   <VolumeHighIcon size={24} />
                </button>
             </div>

             <button 
               onClick={() => setIsDialing(false)}
               className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(239,44,44,0.3)] transition-all"
             >
                <Call02Icon size={32} className="rotate-[135deg]" />
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
