import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search01Icon, Mail01Icon, SentIcon, FileEditIcon, StarIcon, ArchiveIcon, Edit01Icon } from 'hugeicons-react';
import { useSystem } from '../../contexts/SystemContext';

import { contacts } from '../../utils/contacts';

const emailsData = [
  { 
    id: 1, 
    sender: contacts.find(c => c.name.includes('Sonia Bajpai'))?.name || 'Sonia Bajpai', 
    subject: 'Tahoe OS Project Zero: Unit 7 Era', 
    date: '10:42 AM', 
    unread: true, 
    body: 'Team, we are officially moving into the "Unit 7" era of Apple computing. Tahoe OS 26 must bridge the gap between legacy desktop metaphors and our futuristic "Frozen Prompt" architectures. I expect full commitment to the Silicon-Native Liquid Glass aesthetic.' 
  },
  { 
    id: 2, 
    sender: contacts.find(c => c.name.includes('Devyani Trivedi'))?.name || 'Devyani Trivedi', 
    subject: 'Operations Update: Apple Park Logistics', 
    date: 'Yesterday', 
    unread: false, 
    body: 'We have finalized the logistics for the upcoming Tahoe Digital HQ expansion. All SVPs should review the workspace allocation by Friday.' 
  },
  { 
    id: 3, 
    sender: contacts.find(c => c.name.includes('Nishi Garg'))?.name || 'Nishi Garg', 
    subject: 'Liquid Glass Spec Finalization', 
    date: 'Monday', 
    unread: false, 
    body: 'The 50px blur and 190% saturation standards are now locked. Lead devs should ensure all Framer Motion physics are tuned to 120fps.' 
  },
  { 
    id: 4, 
    sender: contacts.find(c => c.name.includes('Aaditya Kumar'))?.name || 'Aaditya Kumar', 
    subject: 'M5 Chip Performance Heap', 
    date: 'Sunday', 
    unread: true, 
    body: 'Early benchmarks for the M5 silicon show significant headroom. We are expanding the Performance Memory API to support larger heaps for the SystemContext.' 
  },
  { 
    id: 5, 
    sender: contacts.find(c => c.name.includes('Vanya Chaudhary'))?.name || 'Vanya Chaudhary', 
    subject: 'UI: True-Magnification Dock', 
    date: 'Last Week', 
    unread: false, 
    body: 'The magnification curves for the Dock are now mathematically perfect. Please pull the latest SVG path updates for the brand icons.' 
  },
  { 
    id: 6, 
    sender: contacts.find(c => c.name.includes('Kritharth Tiwari'))?.name || 'Kritharth Tiwari', 
    subject: 'Core Architecture Update: Tahoe v26.1', 
    date: '11:15 AM', 
    unread: true, 
    body: 'Team, as we approach the final stages of Tahoe OS 26.0, I want us to start looking at the v26.1 roadmap. We need to prioritize deep integration of the Performance Memory API across all system components.' 
  }
];

export const Mail: React.FC = () => {
  const { systemState } = useSystem();
  const [emails] = useState(emailsData);
  const [selectedEmail, setSelectedEmail] = useState(emails[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState('Inbox');

  const filteredEmails = emails.filter(email => 
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
    email.sender.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full w-full bg-white dark:bg-[#1C1C1E] text-gray-800 dark:text-gray-200">
      
      {/* Sidebar - Pane 1 */}
      <div className={`w-48 flex-shrink-0 border-r border-black/5 dark:border-white/10 flex flex-col z-10 transition-colors ${systemState.sidebarMaterial === 'clear' ? 'bg-white/10 dark:bg-black/10 backdrop-blur-[60px] saturate-[180%]' : 'bg-white/40 dark:bg-black/30 backdrop-blur-3xl'}`}>
        <div className="h-12 flex items-center px-4 pt-2">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Favorites</span>
        </div>
        <div className="flex flex-col gap-1 px-2">
          <div onClick={() => setActiveFolder('Inbox')} className={`px-2 py-1.5 rounded-md flex items-center gap-2 cursor-pointer text-sm font-medium ${activeFolder === 'Inbox' ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'}`}>
            <Mail01Icon size={16} className="hugeicon-tahoe" /> Inbox
          </div>
          <div onClick={() => setActiveFolder('Sent')} className={`px-2 py-1.5 rounded-md flex items-center gap-2 cursor-pointer text-sm font-medium ${activeFolder === 'Sent' ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'}`}>
            <SentIcon size={16} className="hugeicon-tahoe" /> Sent
          </div>
          <div onClick={() => setActiveFolder('Drafts')} className={`px-2 py-1.5 rounded-md flex items-center gap-2 cursor-pointer text-sm font-medium ${activeFolder === 'Drafts' ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'}`}>
            <FileEditIcon size={16} className="hugeicon-tahoe" /> Drafts
          </div>
          <div onClick={() => setActiveFolder('Restaurants')} className={`px-2 py-1.5 rounded-md flex items-center gap-2 cursor-pointer text-sm font-medium ${activeFolder === 'Restaurants' ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'}`}>
            <StarIcon size={16} className="hugeicon-tahoe" /> Restaurants
          </div>
        </div>
      </div>

      {/* Message List - Pane 2 */}
      <div className="w-72 flex-shrink-0 border-r border-black/5 dark:border-white/10 flex flex-col bg-gray-50 dark:bg-[#1e1e1e]">
        <div className="h-14 border-b border-black/5 dark:border-white/10 flex items-center px-3">
           <div className="relative w-full">
             <Search01Icon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hugeicon-tahoe" />
             <input 
               type="text" 
               placeholder="Search" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-black/5 dark:bg-white/10 border-none rounded-md py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
             />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredEmails.map(email => (
            <div 
              key={email.id} 
              onClick={() => setSelectedEmail(email)}
              className={`p-3 border-b border-black/5 dark:border-white/5 cursor-pointer flex flex-col gap-1 transition-colors ${selectedEmail?.id === email.id ? 'bg-blue-500 text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-sm truncate pr-2">{email.sender}</span>
                <span className={`text-xs ${selectedEmail?.id === email.id ? 'text-white/80' : 'text-gray-500'}`}>{email.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {email.unread && selectedEmail?.id !== email.id && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                <span className={`text-xs font-medium truncate ${selectedEmail?.id === email.id ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{email.subject}</span>
              </div>
              <p className={`text-xs line-clamp-2 ${selectedEmail?.id === email.id ? 'text-white/80' : 'text-gray-500'}`}>
                {email.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Reader - Pane 3 */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#1C1C1E] min-w-0">
         <div className="h-14 border-b border-black/5 dark:border-white/10 flex items-center justify-between px-6 bg-white/50 dark:bg-black/20 backdrop-blur-md">
           <div className="flex gap-2">
              <button className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors">
                 <ArchiveIcon size={16} className="hugeicon-tahoe" />
              </button>
              <button className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors">
                 <Edit01Icon size={16} className="hugeicon-tahoe" />
              </button>
           </div>
         </div>
         <div className="flex-1 overflow-y-auto p-8 font-sans">
            {selectedEmail ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <h1 className="text-2xl font-bold mb-4">{selectedEmail.subject}</h1>
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4 mb-6">
                  <div>
                    <div className="font-semibold">{selectedEmail.sender}</div>
                    <div className="text-xs text-gray-500">To: Me</div>
                  </div>
                  <div className="text-sm text-gray-500">{selectedEmail.date}</div>
                </div>
                <div className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                  {selectedEmail.body}
                </div>
              </motion.div>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                No Message Selected
              </div>
            )}
         </div>
      </div>

    </div>
  );
};
