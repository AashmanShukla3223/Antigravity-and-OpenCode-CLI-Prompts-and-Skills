import React from 'react';
import { useSystem } from '../../contexts/SystemContext';

export const CodeViewer: React.FC = () => {
  const { systemState } = useSystem();
  // We'll pass the content via a custom property in systemState if needed, 
  // but for simplicity we'll use a global event or just mock it for now.
  // Actually, let's use a simple state in SystemContext for "currentFileContent"
  
  const content = (systemState as any).currentFileContent || '// No file selected';
  const fileName = (systemState as any).currentFileName || 'Source Code';

  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm overflow-hidden">
      <div className="h-8 bg-[#2d2d2d] flex items-center px-4 border-b border-black/20">
        <span className="text-[11px] text-gray-400 uppercase tracking-widest">{fileName}</span>
      </div>
      <div className="flex-1 p-6 overflow-auto whitespace-pre font-mono leading-relaxed">
        {content}
      </div>
    </div>
  );
};
