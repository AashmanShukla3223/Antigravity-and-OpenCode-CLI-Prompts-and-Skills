import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, FlashIcon, GlobeIcon, LockIcon, Settings01Icon, Cancel01Icon, ArrowRight01Icon } from 'hugeicons-react';
import { useSystem } from '../../contexts/SystemContext';
import { AIEngine, PROVIDERS, getStoredApiKey, storeApiKey, getActiveProvider, setActiveProvider, hasAnyApiKey } from '../../utils/AIEngine';
import type { AIProvider, ChatMessage } from '../../utils/AIEngine';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  provider?: AIProvider;
  isSystemAction?: boolean;
  timestamp: number;
}

const suggestions = [
  'What can you do?',
  'Open Safari',
  'Set power mode to Low Power',
  'Explain Liquid Glass design',
  'Help me draft an email',
];

export const SiriAI: React.FC = () => {
  const { launchApp, updateSystemState, setPowerMode } = useSystem();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m Siri, powered by Apple Intelligence 2.0 with multi-provider AI. Configure your API keys in settings to get started.',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);

  const [activeProvider, setActiveProviderState] = useState<AIProvider>(getActiveProvider);
  const [apiKeys, setApiKeys] = useState<Record<AIProvider, string>>(() => ({
    gemini: getStoredApiKey('gemini'),
    groq: getStoredApiKey('groq'),
    openrouter: getStoredApiKey('openrouter'),
  }));
  const [editingKeys, setEditingKeys] = useState<Record<AIProvider, string>>({ ...apiKeys });

  const chatEndRef = useRef<HTMLDivElement>(null);

  const engine = useMemo(() => new AIEngine({ launchApp, updateSystemState, setPowerMode }), [launchApp, updateSystemState, setPowerMode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isProcessing) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    const chatMessages: ChatMessage[] = messages
      .filter(m => m.id !== 'welcome')
      .map(m => ({ role: m.role, content: m.content }));
    chatMessages.push({ role: 'user', content: userMsg.content });

    const apiKey = apiKeys[activeProvider];
    if (!apiKey) {
      const res = await engine.executeCommand(input.trim());
      setMessages(prev => [...prev, {
        id: `local-${Date.now()}`,
        role: 'assistant',
        content: res,
        timestamp: Date.now(),
      }]);
      setIsProcessing(false);
      return;
    }

    const result = await engine.sendMessage(chatMessages, activeProvider, apiKey);

    const aiMsg: Message = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: result.text,
      provider: result.provider,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsProcessing(false);
  }, [input, isProcessing, messages, apiKeys, activeProvider, engine]);

  const saveApiKey = useCallback((provider: AIProvider) => {
    const key = editingKeys[provider] || '';
    storeApiKey(provider, key);
    setApiKeys(prev => ({ ...prev, [provider]: key }));
  }, [editingKeys]);

  const switchProvider = useCallback((provider: AIProvider) => {
    setActiveProvider(provider);
    setActiveProviderState(provider);
  }, []);

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const providerBadge = (provider?: AIProvider) => {
    if (!provider) return null;
    const config = PROVIDERS.find(p => p.key === provider);
    if (!config) return null;
    const colors: Record<AIProvider, string> = {
      gemini: 'text-blue-400 bg-blue-500/20',
      groq: 'text-orange-400 bg-orange-500/20',
      openrouter: 'text-purple-400 bg-purple-500/20',
    };
    return (
      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${colors[provider]}`}>
        {config.name}
      </span>
    );
  };

  const configuredProviders = PROVIDERS.filter(p => !!apiKeys[p.key]);
  const hasKeys = hasAnyApiKey() || Object.values(apiKeys).some(k => !!k);

  return (
    <div className="h-full w-full flex bg-black/30 saturate-[150%]">
      {showSettings ? (
        <div className="flex-1 flex flex-col overflow-y-auto p-8">
          <div className="max-w-lg mx-auto w-full space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-white">Siri Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <Cancel01Icon size={18} />
              </button>
            </div>
            <p className="text-xs text-white/40">Configure AI providers to enable real intelligence. Your API keys are stored locally and never sent anywhere except the respective API.</p>

            <div className="space-y-4">
              {PROVIDERS.map((provider) => (
                <motion.div
                  key={provider.key}
                  layout
                  className={`rounded-2xl border p-4 transition-all ${
                    activeProvider === provider.key
                      ? 'bg-white/10 border-[#5E5CE6]/50 shadow-[0_0_15px_rgba(94,92,230,0.1)]'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${apiKeys[provider.key] ? 'bg-green-400' : 'bg-white/20'}`} />
                      <span className="text-sm font-bold text-white">{provider.name}</span>
                      <span className="text-[10px] text-white/40 font-mono">{provider.model}</span>
                    </div>
                    <button
                      onClick={() => switchProvider(provider.key)}
                      className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                        activeProvider === provider.key
                          ? 'bg-[#5E5CE6] text-white'
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {activeProvider === provider.key ? 'Active' : 'Switch'}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={editingKeys[provider.key] || ''}
                      onChange={(e) => setEditingKeys(prev => ({ ...prev, [provider.key]: e.target.value }))}
                      placeholder={provider.keyLabel}
                      className="flex-1 h-9 bg-white/10 border border-white/10 rounded-xl px-3 text-xs text-white placeholder-white/20 outline-none focus:border-[#5E5CE6]/50 transition-colors"
                    />
                    <button
                      onClick={() => saveApiKey(provider.key)}
                      disabled={!editingKeys[provider.key]}
                      className="px-4 h-9 bg-[#5E5CE6] text-white text-xs font-bold rounded-xl hover:bg-[#5E5CE6]/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Save
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setMessages([{
                    id: 'welcome',
                    role: 'assistant',
                    content: 'Hello! I\'m Siri, powered by Apple Intelligence 2.0 with multi-provider AI. Configure your API keys in settings to get started.',
                    timestamp: Date.now(),
                  }]);
                  setShowSettings(false);
                }}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-2xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : (
      <>
        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r border-white/10 flex flex-col bg-white/5 backdrop-blur-[40px] overflow-hidden shrink-0"
            >
              <div className="p-4 border-b border-white/10">
                <h2 className="text-sm font-bold text-white/80">Conversations</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {['Today'].map((group) => (
                  <div key={group}>
                    <p className="text-[10px] font-bold uppercase text-white/30 px-2 mb-1">{group}</p>
                    <button className="w-full text-left px-3 py-2 rounded-xl text-xs text-[#5E5CE6] bg-[#5E5CE6]/10 font-medium">
                      Current Chat
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-white/10">
                <button
                  onClick={() => {
                    setMessages([{
                      id: 'welcome',
                      role: 'assistant',
      content: 'Hello! I\'m Siri, powered by Apple Intelligence 2.0 with multi-provider AI. Configure your API keys in settings to get started.',
                      timestamp: Date.now(),
                    }]);
                  }}
                  className="w-full py-2 text-xs font-bold text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  New Conversation
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Chat */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="h-14 flex items-center justify-between px-5 border-b border-white/10 bg-white/5 backdrop-blur-[40px]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSidebar(prev => !prev)}
                className="text-white/40 hover:text-white/80 transition-colors"
              >
                <div className="w-4 h-3 flex flex-col justify-between">
                  <div className="h-[2px] bg-current rounded" />
                  <div className="h-[2px] bg-current rounded w-3/4" />
                  <div className="h-[2px] bg-current rounded w-1/2" />
                </div>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#5E5CE6] to-[#007AFF] flex items-center justify-center shadow-[0_0_15px_rgba(94,92,230,0.5)]">
                  <SparklesIcon size={14} className="text-white" />
                </div>
                <span className="text-sm font-bold text-white">Siri</span>
                {hasKeys && (
                  <span className="text-[10px] font-bold text-[#5E5CE6] bg-[#5E5CE6]/20 px-2 py-0.5 rounded-full">
                    {PROVIDERS.find(p => p.key === activeProvider)?.name}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                <GlobeIcon size={12} className="text-white/60" />
                <span className="text-[10px] font-bold text-white/60">Web</span>
                <button
                  onClick={() => setWebSearchEnabled(prev => !prev)}
                  className={`w-7 h-3.5 rounded-full transition-colors relative ${webSearchEnabled ? 'bg-[#34C759]' : 'bg-white/20'}`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full bg-white absolute top-0.5 transition-transform ${webSearchEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white/80"
              >
                <Settings01Icon size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-[#007AFF] text-white rounded-br-md'
                        : 'bg-white/10 backdrop-blur-md border border-white/10 text-white/90 rounded-bl-md'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#5E5CE6] to-[#007AFF] flex items-center justify-center">
                          <SparklesIcon size={8} className="text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-[#5E5CE6]">Siri</span>
                        <span className="text-[8px] text-white/30">·</span>
                        <LockIcon size={10} className="text-green-400" />
                        <span className="text-[8px] text-green-400/60">PCC</span>
                        {msg.provider && (
                          <>
                            <span className="text-[8px] text-white/30">·</span>
                            {providerBadge(msg.provider)}
                          </>
                        )}
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                      className="w-2 h-2 rounded-full bg-[#5E5CE6]"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }}
                      className="w-2 h-2 rounded-full bg-[#5E5CE6]"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }}
                      className="w-2 h-2 rounded-full bg-[#5E5CE6]"
                    />
                  </div>
                  <span className="text-xs text-white/50 font-medium">
                    {PROVIDERS.find(p => p.key === activeProvider)?.name}...
                  </span>
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Tools & Suggestions (shown on fresh chat) */}
          {messages.length <= 1 && !hasKeys && (
            <div className="px-6 pb-3">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs font-bold text-amber-400 mb-1">API Key Required</p>
                <p className="text-[10px] text-amber-400/60 mb-3">Configure at least one AI provider to enable real responses.</p>
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-4 py-2 bg-[#5E5CE6] text-white text-xs font-bold rounded-xl hover:bg-[#5E5CE6]/80 transition-colors flex items-center gap-1.5"
                >
                  <Settings01Icon size={14} />
                  Open Settings
                </button>
              </div>
            </div>
          )}

          {messages.length <= 1 && hasKeys && (
            <>
              <div className="px-6 pb-3">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Try asking</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSuggestion(s)}
                      className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/60 hover:text-white transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {configuredProviders.length > 1 && (
                <div className="px-6 pb-3">
                  <div className="flex gap-1.5">
                    {configuredProviders.map((p) => (
                      <button
                        key={p.key}
                        onClick={() => switchProvider(p.key)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-full transition-colors ${
                          activeProvider === p.key
                            ? 'bg-[#5E5CE6]/20 text-[#5E5CE6]'
                            : 'bg-white/5 text-white/40 hover:text-white/60'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Input Bar */}
          <div className="px-4 pb-4 pt-2">
            <div className="flex items-end gap-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2 focus-within:border-[#5E5CE6]/50 focus-within:shadow-[0_0_20px_rgba(94,92,230,0.15)] transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={hasKeys ? 'Ask Siri...' : 'Configure API keys in settings...'}
                rows={1}
                className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none resize-none max-h-32 py-1.5"
                style={{ minHeight: '24px' }}
              />
              <button
                onClick={() => {}}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white/80 transition-all shrink-0"
              >
                <FlashIcon size={18} />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                className={`p-2 rounded-full transition-all shrink-0 ${
                  input.trim() && !isProcessing
                    ? 'bg-[#5E5CE6] text-white hover:bg-[#5E5CE6]/80 shadow-[0_0_15px_rgba(94,92,230,0.3)]'
                    : 'bg-white/10 text-white/30'
                }`}
              >
                <ArrowRight01Icon size={16} />
              </button>
            </div>
            <p className="text-[10px] text-white/20 text-center mt-2">
              Siri uses Apple Intelligence 2.0 with {PROVIDERS.find(p => p.key === activeProvider)?.name}.
            </p>
          </div>
        </div>
      </>
      )}
    </div>
  );
};
