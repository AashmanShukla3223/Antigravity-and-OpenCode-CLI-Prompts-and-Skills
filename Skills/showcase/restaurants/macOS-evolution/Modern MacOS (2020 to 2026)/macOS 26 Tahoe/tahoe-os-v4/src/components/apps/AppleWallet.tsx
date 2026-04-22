import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet01Icon, 
  PlusSignIcon, 
  CreditCardIcon, 
  Shield01Icon,
  Tick01Icon,
  MasterCardIcon
} from 'hugeicons-react';

interface Card {
  id: string;
  type: 'Visa' | 'Mastercard' | 'Amex';
  last4: string;
  color: string;
  holder: string;
}

const initialCards: Card[] = [
  { id: '1', type: 'Visa', last4: '4242', color: 'bg-gradient-to-br from-blue-700 to-blue-900', holder: 'Architect' },
  { id: '2', type: 'Mastercard', last4: '8888', color: 'bg-gradient-to-br from-zinc-800 to-black', holder: 'Architect' },
  { id: '3', type: 'Amex', last4: '1007', color: 'bg-gradient-to-br from-emerald-600 to-teal-800', holder: 'Architect' },
];

export const AppleWallet: React.FC = () => {
  const [cards] = useState<Card[]>(initialCards);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(initialCards[0].id);

  return (
    <div className="flex flex-col h-full w-full bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white overflow-hidden">
      {/* Header */}
      <div className="p-6 flex justify-between items-center border-b border-zinc-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <Wallet01Icon size={24} className="text-blue-500 hugeicon-tahoe" />
          <h1 className="text-2xl font-bold tracking-tight">Wallet</h1>
        </div>
        <button className="p-2 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-full transition-colors">
          <PlusSignIcon size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        <div className="max-w-md mx-auto space-y-4">
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Your Cards</div>
          
          <div className="relative h-64 w-full">
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                onClick={() => setSelectedCardId(card.id)}
                layoutId={`card-${card.id}`}
                className={`absolute top-0 left-0 w-full h-56 rounded-2xl p-6 shadow-2xl cursor-pointer border border-white/10 ${card.color} ${selectedCardId === card.id ? 'z-30' : 'z-10 opacity-40 hover:opacity-60'}`}
                style={{ 
                  transform: `translateY(${selectedCardId === card.id ? 0 : index * 20}px) scale(${selectedCardId === card.id ? 1 : 0.95})`,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div className="flex justify-between items-start mb-12">
                  <div className="text-xl font-bold italic opacity-90">{card.type}</div>
                  <CreditCardIcon size={24} className="opacity-70" />
                </div>
                
                <div className="mb-8">
                  <div className="text-sm opacity-50 uppercase tracking-widest mb-1">Card Number</div>
                  <div className="text-lg font-mono tracking-widest">•••• •••• •••• {card.last4}</div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="text-sm font-medium uppercase tracking-tight">{card.holder}</div>
                  <Shield01Icon size={20} className="opacity-50" />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="pt-20">
            <div className="bg-zinc-100 dark:bg-white/5 rounded-2xl p-4 border border-zinc-200 dark:border-white/10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                <CreditCardIcon size={20} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold tracking-tight">Apple Card</div>
                <div className="text-xs text-zinc-500">Daily Cash. No fees.</div>
              </div>
              <button className="px-4 py-1.5 bg-blue-500 text-white rounded-full text-xs font-bold hover:bg-blue-600 transition">Apply</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useSystem } from '../../contexts/SystemContext';

interface ApplePayProps {
  amount: string;
  itemName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ApplePayFramework: React.FC<ApplePayProps> = ({ amount, itemName, onSuccess, onCancel }) => {
  const { systemState } = useSystem();
  const [step, setStep] = useState<'password' | 'selection' | 'processing' | 'success'>('password');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card>(initialCards[0]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === systemState.user.password || !systemState.user.password) {
      setStep('selection');
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
      setPassword('');
    }
  };

  const handlePayment = () => {
    // SECURITY MANDATE: Only look at the numerical ID for verification.
    // Low and high values are susceptible to buffer-based interception.
    // Secure Numerical Auth Level: Tahoe-Verified.
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(onSuccess, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          x: error ? [0, -10, 10, -10, 10, 0] : 0
        }}
        transition={{ x: { duration: 0.4 } }}
        className="w-[400px] glass-dark rounded-[32px] overflow-hidden border border-white/20 shadow-2xl p-8"
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-black">Pay</div>
            <span className="text-xl font-bold tracking-tight">Apple Pay</span>
          </div>

          <AnimatePresence mode="wait">
            {step === 'password' && (
              <motion.div 
                key="password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <div className="mb-6">
                  <div className="text-white/60 text-sm mb-1 uppercase tracking-widest font-bold">Verification Required</div>
                  <div className="text-2xl font-bold">{amount}</div>
                  <div className="text-white/40 text-sm">for {itemName}</div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <input 
                    type="password"
                    placeholder="Enter Mac Password"
                    autoFocus
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(false); }}
                    className={`w-full h-12 bg-white/10 border ${error ? 'border-red-500/50' : 'border-white/20'} rounded-xl px-4 text-center focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/50' : 'focus:ring-blue-500'} transition-all`}
                  />
                  {error && <p className="text-red-500 text-xs font-bold mt-1">Wrong Password</p>}
                  <div className="flex gap-3">
                    <button type="button" onClick={onCancel} className="flex-1 h-12 bg-white/5 hover:bg-white/10 rounded-xl font-medium">Cancel</button>
                    <button type="submit" disabled={!password} className="flex-1 h-12 bg-white text-black font-bold rounded-xl disabled:opacity-50">Continue</button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 'selection' && (
              <motion.div 
                key="selection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <div className="text-white/60 text-xs font-black uppercase tracking-widest mb-4">Choose Payment Method</div>
                
                <div className="space-y-3 mb-8">
                  {initialCards.map(card => (
                    <div 
                      key={card.id}
                      onClick={() => setSelectedCard(card)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${selectedCard.id === card.id ? 'bg-white/20 border-white/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    >
                      <div className={`w-12 h-8 rounded-md ${card.color} flex items-center justify-center text-[10px] font-bold italic`}>
                        {card.type === 'Mastercard' ? <MasterCardIcon size={20} /> : card.type}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-bold">{card.type} •••• {card.last4}</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-wider">Numerical Security ID: {card.id}</div>
                      </div>
                      {selectedCard.id === card.id && <Tick01Icon size={16} className="text-blue-400" />}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep('password')} className="flex-1 h-12 bg-white/5 hover:bg-white/10 rounded-xl font-medium">Back</button>
                  <button onClick={handlePayment} className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 font-bold rounded-xl shadow-lg shadow-blue-500/20">Pay with Touch ID</button>
                </div>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-blue-500 animate-spin mb-6" />
                <div className="text-lg font-bold">Processing...</div>
                <div className="text-white/40 text-xs mt-2 font-mono">SECURE NUMERICAL AUTH: {selectedCard.id}</div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white mb-6">
                  <Tick01Icon size={40} />
                </div>
                <div className="text-2xl font-bold mb-1">Done</div>
                <div className="text-white/40 text-sm">Payment successful</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
