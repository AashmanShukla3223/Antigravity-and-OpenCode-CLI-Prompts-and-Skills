import React, { useState } from 'react';
import { ComputerIcon, Link01Icon } from 'hugeicons-react';

export const ScreenSharing: React.FC = () => {
  const [address, setAddress] = useState('localhost:5173');
  const [isConnected, setIsConnected] = useState(true);

  return (
    <div className="h-full w-full bg-zinc-950 text-white flex flex-col font-sans select-none">
      {/* Control Bar */}
      <div className="h-12 bg-zinc-900 border-b border-white/10 px-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <ComputerIcon size={18} className="text-blue-400" />
          <span className="font-bold">Screen Sharing — Remote Session</span>
        </div>

        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-3 py-1">
          <Link01Icon size={12} className="text-green-400" />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="bg-transparent border-none text-white/90 text-xs focus:outline-none w-36 font-mono"
          />
        </div>

        <button
          onClick={() => setIsConnected(!isConnected)}
          className={`px-3 py-1 rounded-md font-bold text-[11px] transition-colors ${isConnected ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </button>
      </div>

      {/* Embed Canvas / Iframe */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {isConnected ? (
          <iframe
            src="/"
            title="Nested macOS Golden Gate"
            className="w-full h-full border-none shadow-2xl"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-center p-8 text-white/40">
            <ComputerIcon size={48} className="text-white/20" />
            <p className="text-sm font-semibold">Screen Sharing Disconnected</p>
            <p className="text-xs">Click Connect above to re-establish remote session to {address}.</p>
          </div>
        )}
      </div>
    </div>
  );
};
