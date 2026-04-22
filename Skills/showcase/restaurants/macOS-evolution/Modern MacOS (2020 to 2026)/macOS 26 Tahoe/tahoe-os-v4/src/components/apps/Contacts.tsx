import React, { useState } from 'react';
import { 
  PlusSignIcon, 
  Search01Icon,
  Video01Icon,
  Message01Icon,
  Call02Icon,
  Mail01Icon,
  Location01Icon
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

export const Contacts: React.FC = () => {
  const { launchApp } = useSystem();
  const [selectedId, setSelectedId] = useState(contacts[0].id);
  const selected = contacts.find(c => c.id === selectedId) || contacts[0];
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full w-full bg-white dark:bg-zinc-950 text-black dark:text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-80 bg-zinc-50 dark:bg-black/20 border-r border-zinc-200 dark:border-white/10 flex flex-col">
        <div className="p-6 pb-2 flex items-center justify-between">
           <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
           <button className="p-2 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-full transition-colors text-blue-500">
              <PlusSignIcon size={20} />
           </button>
        </div>
        
        <div className="px-4 mb-4 mt-2">
           <div className="relative">
              <Search01Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-200/50 dark:bg-white/5 border-none rounded-lg py-1.5 pl-9 pr-3 text-xs focus:ring-2 focus:ring-blue-500/50 outline-none"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-px">
          {filteredContacts.map(c => (
            <div 
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`px-6 py-3 cursor-pointer transition-all ${selectedId === c.id ? 'bg-blue-500 text-white font-bold' : 'hover:bg-zinc-200 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300'}`}
            >
              <div className="text-sm">{c.name}</div>
              <div className={`text-[10px] truncate ${selectedId === c.id ? 'text-white/80' : 'text-zinc-400'}`}>{c.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Detail */}
      <div className="flex-1 overflow-y-auto p-12 scrollbar-hide">
         <div className="max-w-xl mx-auto flex flex-col items-center">
            <div className={`w-32 h-32 rounded-full ${getContactColor(selected.id)} flex items-center justify-center text-white text-4xl font-black shadow-2xl mb-6`}>
               {getInitials(selected.name)}
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-1 text-center">{selected.name}</h2>
            <p className="text-zinc-500 font-medium mb-1 text-center">{selected.title}</p>
            <p className="text-zinc-400 text-sm font-semibold mb-8 uppercase tracking-widest">{selected.department}</p>

            {/* Quick Actions */}
            <div className="flex gap-4 mb-12">
               {[
                 { id: 'msg', icon: Message01Icon, label: 'message', action: () => launchApp('messages') },
                 { id: 'call', icon: Call02Icon, label: 'call', action: () => launchApp('phone') },
                 { id: 'video', icon: Video01Icon, label: 'video', action: () => launchApp('facetime') },
                 { id: 'mail', icon: Mail01Icon, label: 'mail', action: () => launchApp('mail') }
               ].map(btn => (
                 <div key={btn.id} className="flex flex-col items-center gap-2">
                    <button 
                      onClick={btn.action}
                      className="w-16 h-12 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-blue-500 hover:bg-zinc-50 dark:hover:bg-white/10 shadow-sm transition-all"
                    >
                       <btn.icon size={20} />
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{btn.label}</span>
                 </div>
               ))}
            </div>

            {/* Info Cards */}
            <div className="w-full space-y-4">
               <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-200 dark:border-white/10">
                  <div className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">Phone</div>
                  <div className="text-sm font-medium">{selected.phone}</div>
               </div>
               <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-200 dark:border-white/10">
                  <div className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">Email</div>
                  <div className="text-sm font-medium">{selected.email}</div>
               </div>
               <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-200 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">Work</div>
                    <div className="text-sm font-medium">{selected.work}</div>
                  </div>
                  <Location01Icon size={20} className="text-zinc-300" />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
