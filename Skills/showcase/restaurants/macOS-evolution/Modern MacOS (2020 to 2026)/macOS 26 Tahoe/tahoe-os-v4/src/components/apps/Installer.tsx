import React from 'react';
import { useSystem } from '../../contexts/SystemContext';
import { FileSystemResolver } from '../../utils/FileSystemResolver';
import { Tick01Icon, Cancel01Icon } from 'hugeicons-react';

export const Installer: React.FC = () => {
  const { closeApp, updateSystemState, triggerSystemError } = useSystem();
  const base = (import.meta as any).env?.BASE_URL || '/';

  const sidebarItems = [
    { name: 'Introduction', status: 'completed' },
    { name: 'License', status: 'completed' },
    { name: 'Destination Select', status: 'completed' },
    { name: 'Installation Type', status: 'completed' },
    { name: 'Installation', status: 'error' },
    { name: 'Summary', status: 'pending' }
  ];

  const handleClose = () => {
    localStorage.setItem('tahoe_infected', 'true');
    updateSystemState({ isSystemInfected: true });
    // Trigger initial storm
    triggerSystemError();
    closeApp('installer');
  };

  return (
    <div className="flex h-full w-full bg-white select-none overflow-hidden rounded-b-xl font-sans text-black">
      {/* Sidebar */}
      <div className="w-56 bg-[#F6F6F6] border-r border-black/10 flex flex-col pt-8">
        {sidebarItems.map((item) => (
          <div 
            key={item.name}
            className={`px-4 py-1.5 flex items-center gap-2 text-[13px] transition-colors cursor-default ${item.name === 'Installation' ? 'bg-black/5 font-medium' : 'text-black/60'}`}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              {item.status === 'completed' && <Tick01Icon size={14} className="text-green-600 font-bold" />}
              {item.status === 'error' && <Cancel01Icon size={14} className="text-red-600 font-bold" />}
            </div>
            {item.name}
          </div>
        ))}
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col p-12 bg-white relative">
        <div className="flex flex-col items-center text-center mt-6">
          <div className="w-24 h-24 mb-8">
            <img 
              src={`${base}${FileSystemResolver.getStatusIcon('dialog-warning')}`} 
              className="w-full h-full object-contain" 
              alt="Warning" 
            />
          </div>
          
          <h1 className="text-[26px] font-bold text-black mb-3 tracking-tight">Installation Failed</h1>
          <p className="text-[13px] text-black/70 max-w-sm leading-[1.4] font-medium">
            The installer encountered an error that caused the installation to fail. Contact the software manufacturer for assistance.
          </p>
        </div>

        {/* Footer Buttons */}
        <div className="absolute bottom-8 right-10 flex gap-3">
          <button 
            className="px-6 py-1.5 bg-white border border-black/10 rounded-lg text-[13px] text-black shadow-sm opacity-40 cursor-not-allowed font-medium"
          >
            Go Back
          </button>
          <button 
            onClick={handleClose}
            className="px-10 py-1.5 bg-[#007AFF] hover:bg-[#0062CC] active:bg-[#0051A8] text-white rounded-lg text-[13px] font-semibold shadow-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
