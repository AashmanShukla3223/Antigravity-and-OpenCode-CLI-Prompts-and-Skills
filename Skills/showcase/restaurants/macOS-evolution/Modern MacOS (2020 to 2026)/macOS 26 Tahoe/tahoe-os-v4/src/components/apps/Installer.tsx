import React, { useState } from 'react';
import { useSystem } from '../../contexts/SystemContext';
import { FileSystemResolver } from '../../utils/FileSystemResolver';

export const Installer: React.FC = () => {
  const { closeApp, updateSystemState, triggerSystemError } = useSystem();
  const [selectedSidebar, setSelectedSidebar] = useState('Installation');
  const base = (import.meta as any).env?.BASE_URL || '/';

  const sidebarItems = [
    'Introduction',
    'License',
    'Destination Select',
    'Installation Type',
    'Installation',
    'Summary'
  ];

  const handleClose = () => {
    localStorage.setItem('tahoe_infected', 'true');
    updateSystemState({ isSystemInfected: true });
    // Trigger initial storm
    triggerSystemError();
    closeApp('installer');
  };

  return (
    <div className="flex h-full w-full bg-white select-none overflow-hidden rounded-b-xl font-sans">
      {/* Sidebar */}
      <div className="w-48 bg-gradient-to-b from-[#f6f6f6] to-[#e8e8e8] border-r border-black/10 flex flex-col pt-8">
        {sidebarItems.map((item) => (
          <div 
            key={item}
            onClick={() => setSelectedSidebar(item)}
            className={`px-6 py-1.5 text-[13px] transition-colors cursor-default ${selectedSidebar === item ? 'font-bold text-black bg-white/50' : 'text-black/60 hover:text-black'}`}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col p-10 bg-white relative">
        <div className="flex flex-col items-center text-center mt-4">
          <div className="w-20 h-20 mb-6">
            <img 
              src={`${base}${FileSystemResolver.getStatusIcon('dialog-warning')}`} 
              className="w-full h-full object-contain" 
              alt="Warning" 
            />
          </div>
          
          <h1 className="text-2xl font-bold text-black mb-2 tracking-tight">Installation Failed</h1>
          <p className="text-[13px] text-black/60 max-w-sm leading-relaxed">
            The installer encountered an error that caused the installation to fail. Contact the software manufacturer for assistance.
          </p>
        </div>

        {/* Footer Buttons */}
        <div className="absolute bottom-6 right-8 flex gap-3">
          <button 
            className="px-6 py-1 bg-white border border-black/10 rounded-md text-[13px] text-black shadow-sm opacity-50 cursor-not-allowed"
          >
            Go Back
          </button>
          <button 
            onClick={handleClose}
            className="px-8 py-1 bg-[#007AFF] hover:bg-[#0062CC] active:bg-[#0051A8] text-white rounded-md text-[13px] font-medium shadow-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
