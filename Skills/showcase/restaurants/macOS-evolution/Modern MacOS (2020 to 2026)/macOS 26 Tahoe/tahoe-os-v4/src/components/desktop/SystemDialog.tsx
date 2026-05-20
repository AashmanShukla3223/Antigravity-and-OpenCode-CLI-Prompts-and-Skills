import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../contexts/SystemContext';
import { FileSystemResolver } from '../../utils/FileSystemResolver';

export const SystemDialog: React.FC = () => {
  const { systemDialog } = useSystem();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const base = (import.meta as any).env?.BASE_URL || '/';

  useEffect(() => {
    if (systemDialog && systemDialog.type === 'prompt') {
      const defaultValue = systemDialog.defaultValue || '';
      const timer = setTimeout(() => {
        setInputValue(defaultValue);
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [systemDialog]);

  if (!systemDialog) return null;

  const handleConfirm = () => {
    systemDialog.onConfirm(systemDialog.type === 'prompt' ? inputValue : undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') systemDialog.onCancel();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-center justify-center z-[1000] bg-black/20 backdrop-blur-sm pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-[380px] bg-white/10 dark:bg-black/60 backdrop-blur-[40px] border border-white/20 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden p-8 flex flex-col items-center text-center text-black dark:text-white"
        >
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
            <img 
              src={`${base}${FileSystemResolver.getStatusIcon('dialog-information')}`} 
              className="w-8 h-8 object-contain" 
              alt="Dialog Icon" 
            />
          </div>
          
          <h2 className="text-xl font-black mb-2 tracking-tight">{systemDialog.title}</h2>
          <p className="text-black/60 dark:text-white/50 text-xs leading-relaxed mb-6 px-4">
            {systemDialog.message}
          </p>

          {systemDialog.type === 'prompt' && (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-10 bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl px-4 text-sm mb-6 focus:outline-none focus:border-blue-500/50 transition-colors"
              placeholder="Enter value..."
            />
          )}

          <div className="flex gap-3 w-full">
            {systemDialog.type !== 'alert' && (
              <button 
                onClick={systemDialog.onCancel}
                className="flex-1 h-11 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all border border-black/5 dark:border-white/10"
              >
                Cancel
              </button>
            )}
            <button 
              onClick={handleConfirm}
              className="flex-1 h-11 bg-white text-black hover:bg-white/90 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-white/10"
            >
              {systemDialog.type === 'confirm' ? 'Confirm' : 'OK'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
