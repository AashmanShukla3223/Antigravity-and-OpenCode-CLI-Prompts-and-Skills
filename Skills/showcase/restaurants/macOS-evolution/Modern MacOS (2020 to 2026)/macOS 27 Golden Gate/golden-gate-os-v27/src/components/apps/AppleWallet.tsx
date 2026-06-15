import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet01Icon,
  CreditCardIcon,
  Shield01Icon,
  Tick01Icon,
  MasterCardIcon,
  CoinsSwapIcon,
  AddMoneyCircleIcon,
} from 'hugeicons-react';

interface Card {
  id: string;
  type: 'Visa' | 'Mastercard' | 'Amex';
  last4: string;
  color: string;
  holder: string;
  creditLimit: number;
  overdraftThreshold: number;
  overdraftFee: number;
}

const initialCards: Card[] = [
  {
    id: '1',
    type: 'Visa',
    last4: '4242',
    color: 'bg-gradient-to-br from-blue-700 to-blue-900',
    holder: 'Architect',
    creditLimit: 1000,
    overdraftThreshold: 50,
    overdraftFee: 100,
  },
  {
    id: '2',
    type: 'Mastercard',
    last4: '8888',
    color: 'bg-gradient-to-br from-zinc-800 to-black',
    holder: 'Architect',
    creditLimit: 500,
    overdraftThreshold: 30,
    overdraftFee: 50,
  },
  {
    id: '3',
    type: 'Amex',
    last4: '1007',
    color: 'bg-gradient-to-br from-emerald-600 to-teal-800',
    holder: 'Architect',
    creditLimit: 300,
    overdraftThreshold: 10,
    overdraftFee: 30,
  },
];

type ModalType = 'pay' | 'transfer' | 'deposit' | null;

export const AppleWallet: React.FC = () => {
  const [cards] = useState<Card[]>(initialCards);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(initialCards[0].id);
  const [balances, setBalances] = useState<Record<string, number>>({
    '1': 0,
    '2': 0,
    '3': 0,
  });
  const [modal, setModal] = useState<ModalType>(null);
  const [modalAmount, setModalAmount] = useState('');
  const [modalTarget, setModalTarget] = useState('2');
  const [notification, setNotification] = useState<string | null>(null);
  const [spendMode, setSpendMode] = useState(false);

  const selectedCard = cards.find((c) => c.id === selectedCardId);
  const selectedBalance = selectedCardId ? balances[selectedCardId] : 0;
  const selectedAvailable = selectedCard ? selectedCard.creditLimit - selectedBalance : 0;

  const showNotif = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const spend = useCallback(
    (cardId: string, amount: number) => {
      if (amount <= 0) return false;
      const card = cards.find((c) => c.id === cardId);
      if (!card) return false;
      const currentBalance = balances[cardId];
      const available = card.creditLimit - currentBalance;
      if (amount > available) {
        showNotif(`❌ Insufficient credit on ${card.type} (available: $${available.toFixed(2)})`);
        return false;
      }
      const newBalance = currentBalance + amount;
      const remainingCredit = card.creditLimit - newBalance;
      const updates: Record<string, number> = { [cardId]: newBalance };
      let feeApplied = false;
      if (remainingCredit < card.overdraftThreshold) {
        updates[cardId] = newBalance + card.overdraftFee;
        feeApplied = true;
      }
      setBalances((prev) => ({ ...prev, ...updates }));
      if (feeApplied) {
        showNotif(`⚠️ Overdraft fee of $${card.overdraftFee} applied to ${card.type}`);
      } else {
        showNotif(`✅ $${amount.toFixed(2)} charged to ${card.type}`);
      }
      return true;
    },
    [cards, balances, showNotif],
  );

  const deposit = useCallback(
    (cardId: string, amount: number) => {
      if (amount <= 0) return;
      const card = cards.find((c) => c.id === cardId);
      if (!card) return;
      const currentBalance = balances[cardId];
      const newBalance = Math.max(0, currentBalance - amount);
      setBalances((prev) => ({ ...prev, [cardId]: newBalance }));
      showNotif(`💰 $${amount.toFixed(2)} added to ${card.type} available credit`);
    },
    [cards, balances, showNotif],
  );

  const transfer = useCallback(
    (fromId: string, toId: string, amount: number) => {
      if (amount <= 0 || fromId === toId) return;
      const fromCard = cards.find((c) => c.id === fromId);
      const toCard = cards.find((c) => c.id === toId);
      if (!fromCard || !toCard) return;
      const fromBalance = balances[fromId];
      const toBalance = balances[toId];
      const fromAvailable = fromCard.creditLimit - fromBalance;
      if (amount > fromAvailable) {
        showNotif(`❌ Insufficient available credit on ${fromCard.type} (available: $${fromAvailable.toFixed(2)})`);
        return;
      }
      const spaceOnTo = toCard.creditLimit - toBalance;
      if (amount > spaceOnTo) {
        showNotif(`❌ ${toCard.type} can only receive $${spaceOnTo.toFixed(2)} more`);
        return;
      }
      setBalances((prev) => ({
        ...prev,
        [fromId]: fromBalance + amount,
        [toId]: toBalance - amount,
      }));
      showNotif(`🔄 $${amount.toFixed(2)} moved from ${fromCard.type} to ${toCard.type}`);
    },
    [cards, balances, showNotif],
  );

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardId || !modalAmount) return;
    const amt = parseFloat(modalAmount);
    if (isNaN(amt) || amt <= 0) return;
    spend(selectedCardId, amt);
    setModal(null);
    setModalAmount('');
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardId || !modalAmount) return;
    const amt = parseFloat(modalAmount);
    if (isNaN(amt) || amt <= 0) return;
    deposit(selectedCardId, amt);
    setModal(null);
    setModalAmount('');
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardId || !modalAmount) return;
    const amt = parseFloat(modalAmount);
    if (isNaN(amt) || amt <= 0) return;
    transfer(selectedCardId, modalTarget, amt);
    setModal(null);
    setModalAmount('');
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white overflow-hidden relative">
      {notification && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold shadow-2xl animate-pulse">
          {notification}
        </div>
      )}

      <div className="p-6 flex justify-between items-center border-b border-zinc-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <Wallet01Icon size={24} className="text-blue-500 hugeicon-golden-gate" />
          <h1 className="text-2xl font-bold tracking-tight">Wallet</h1>
        </div>
        <button
          onClick={() => setSpendMode(!spendMode)}
          className={`px-3 py-1 rounded-full text-xs font-bold transition ${spendMode ? 'bg-red-500 text-white' : 'bg-zinc-200 dark:bg-white/10 text-zinc-500'}`}
        >
          {spendMode ? 'Spending...' : 'Ready'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Your Cards</span>
            <span className="text-[10px] text-zinc-500">
              Total Available: $
              {cards.reduce((s, c) => s + Math.max(0, c.creditLimit - (balances[c.id] || 0)), 0).toFixed(0)}
            </span>
          </div>

          <div className="relative h-72 w-full">
            {cards.map((card, index) => {
              const bal = balances[card.id] || 0;
              const avail = card.creditLimit - bal;
              const isSelected = selectedCardId === card.id;
              const usagePct = card.creditLimit > 0 ? (bal / card.creditLimit) * 100 : 0;
              const nearLimit = avail < card.overdraftThreshold;

              return (
                <motion.div
                  key={card.id}
                  onClick={() => {
                    if (spendMode) {
                      const amt = prompt(`Spend on ${card.type}? Amount:`, '10');
                      if (amt) spend(card.id, parseFloat(amt) || 0);
                    } else {
                      setSelectedCardId(card.id);
                    }
                  }}
                  layoutId={`card-${card.id}`}
                  className={`absolute top-0 left-0 w-full rounded-2xl p-6 shadow-2xl cursor-pointer border border-white/10 transition-all ${card.color} ${isSelected ? 'z-30' : 'z-10 opacity-40 hover:opacity-60'}`}
                  style={{
                    transform: `translateY(${isSelected ? 0 : index * 24}px) scale(${isSelected ? 1 : 0.95})`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-xl font-bold italic opacity-90">{card.type}</div>
                    <CreditCardIcon size={24} className="opacity-70" />
                  </div>

                  <div className="mb-2">
                    <div className="text-sm opacity-50 uppercase tracking-widest mb-1">Card Number</div>
                    <div className="text-lg font-mono tracking-widest">•••• •••• •••• {card.last4}</div>
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2 mt-2"
                    >
                      <div className="flex justify-between text-xs">
                        <span className="opacity-70">Balance</span>
                        <span className="font-bold">${bal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="opacity-70">Available</span>
                        <span className={`font-bold ${nearLimit ? 'text-red-300' : 'text-green-300'}`}>
                          ${avail.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="opacity-70">Limit</span>
                        <span className="font-bold">${card.creditLimit.toFixed(0)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full transition-all ${usagePct > 90 ? 'bg-red-400' : usagePct > 70 ? 'bg-yellow-400' : 'bg-green-400'}`}
                          style={{ width: `${Math.min(100, usagePct)}%` }}
                        />
                      </div>
                      {nearLimit && (
                        <div className="text-[10px] text-red-300 font-bold mt-1">
                          ⚠️ Below ${card.overdraftThreshold} — ${card.overdraftFee} overdraft fee applies
                        </div>
                      )}
                    </motion.div>
                  )}

                  <div className="flex justify-between items-end mt-3">
                    <div className="text-sm font-medium uppercase tracking-tight">{card.holder}</div>
                    <Shield01Icon size={20} className="opacity-50" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {selectedCard && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
              <button
                onClick={() => {
                  setModal('pay');
                  setModalAmount('');
                }}
                className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <CreditCardIcon size={14} /> Pay
              </button>
              <button
                onClick={() => {
                  setModal('deposit');
                  setModalAmount('');
                }}
                className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <AddMoneyCircleIcon size={14} /> Add Funds
              </button>
              <button
                onClick={() => {
                  setModal('transfer');
                  setModalAmount('');
                }}
                className="flex-1 py-2.5 bg-zinc-800 dark:bg-white/10 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <CoinsSwapIcon size={14} /> Transfer
              </button>
            </motion.div>
          )}

          {selectedCard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-zinc-100 dark:bg-white/5 rounded-2xl p-4 border border-zinc-200 dark:border-white/10 space-y-2"
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Quick Spend</div>
              <div className="flex gap-2">
                {[10, 25, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => spend(selectedCard.id, amt)}
                    disabled={selectedAvailable < amt}
                    className="flex-1 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg text-xs font-bold disabled:opacity-30 transition"
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <div className="pt-4">
            <div className="bg-zinc-100 dark:bg-white/5 rounded-2xl p-4 border border-zinc-200 dark:border-white/10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                <CreditCardIcon size={20} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold tracking-tight">Apple Card</div>
                <div className="text-xs text-zinc-500">Daily Cash. No fees.</div>
              </div>
              <button className="px-4 py-1.5 bg-blue-500 text-white rounded-full text-xs font-bold hover:bg-blue-600 transition">
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pay Modal */}
      <AnimatePresence>
        {modal === 'pay' && selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/60 flex items-center justify-center backdrop-blur-sm"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-80 bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold mb-1">Pay with {selectedCard.type}</h2>
              <p className="text-xs text-zinc-500 mb-4">Available: ${selectedAvailable.toFixed(2)}</p>
              <form onSubmit={handlePaySubmit} className="space-y-3">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedAvailable}
                  placeholder="Amount"
                  autoFocus
                  value={modalAmount}
                  onChange={(e) => setModalAmount(e.target.value)}
                  className="w-full h-12 bg-zinc-100 dark:bg-white/10 rounded-xl px-4 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  {[20, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setModalAmount(String(amt))}
                      className="flex-1 py-1.5 bg-zinc-100 dark:bg-white/10 rounded-lg text-xs font-bold hover:bg-zinc-200 dark:hover:bg-white/20 transition"
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="flex-1 h-11 bg-zinc-100 dark:bg-white/10 rounded-xl text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!modalAmount || parseFloat(modalAmount) > selectedAvailable}
                    className="flex-1 h-11 bg-blue-500 text-white rounded-xl text-sm font-bold disabled:opacity-50"
                  >
                    Pay
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {modal === 'deposit' && selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/60 flex items-center justify-center backdrop-blur-sm"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-80 bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold mb-1">Add Funds</h2>
              <p className="text-xs text-zinc-500 mb-4">Deposit to {selectedCard.type} — reduces your balance</p>
              <form onSubmit={handleDepositSubmit} className="space-y-3">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Amount"
                  autoFocus
                  value={modalAmount}
                  onChange={(e) => setModalAmount(e.target.value)}
                  className="w-full h-12 bg-zinc-100 dark:bg-white/10 rounded-xl px-4 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="flex gap-2">
                  {[50, 100, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setModalAmount(String(amt))}
                      className="flex-1 py-1.5 bg-zinc-100 dark:bg-white/10 rounded-lg text-xs font-bold hover:bg-zinc-200 dark:hover:bg-white/20 transition"
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="flex-1 h-11 bg-zinc-100 dark:bg-white/10 rounded-xl text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!modalAmount}
                    className="flex-1 h-11 bg-green-500 text-white rounded-xl text-sm font-bold disabled:opacity-50"
                  >
                    Deposit
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {modal === 'transfer' && selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/60 flex items-center justify-center backdrop-blur-sm"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-80 bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold mb-1">Transfer Credit</h2>
              <p className="text-xs text-zinc-500 mb-4">
                From <strong>{selectedCard.type}</strong> (available: ${selectedAvailable.toFixed(2)})
              </p>
              <form onSubmit={handleTransferSubmit} className="space-y-3">
                <div className="flex gap-2">
                  {cards
                    .filter((c) => c.id !== selectedCardId)
                    .map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setModalTarget(c.id)}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold border transition ${modalTarget === c.id ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 bg-white/5'}`}
                      >
                        {c.type}
                      </button>
                    ))}
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedAvailable}
                  placeholder="Amount"
                  autoFocus
                  value={modalAmount}
                  onChange={(e) => setModalAmount(e.target.value)}
                  className="w-full h-12 bg-zinc-100 dark:bg-white/10 rounded-xl px-4 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="flex-1 h-11 bg-zinc-100 dark:bg-white/10 rounded-xl text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!modalAmount || parseFloat(modalAmount) > selectedAvailable}
                    className="flex-1 h-11 bg-blue-500 text-white rounded-xl text-sm font-bold disabled:opacity-50"
                  >
                    Transfer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface ApplePayProps {
  amount: string;
  itemName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ApplePayFramework: React.FC<ApplePayProps> = ({ amount, itemName, onSuccess, onCancel }) => {
  const [step, setStep] = useState<'password' | 'selection' | 'processing' | 'success'>('password');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card>(initialCards[0]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '' || password === 'debug') {
      setStep('selection');
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
      setPassword('');
    }
  };

  const handlePayment = () => {
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
          x: error ? [0, -10, 10, -10, 10, 0] : 0,
        }}
        transition={{ x: { duration: 0.4 } }}
        className="w-[400px] glass-dark rounded-[32px] overflow-hidden border border-white/20 shadow-2xl p-8"
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-black">
              Pay
            </div>
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
                  <div className="text-white/60 text-sm mb-1 uppercase tracking-widest font-bold">
                    Verification Required
                  </div>
                  <div className="text-2xl font-bold">{amount}</div>
                  <div className="text-white/40 text-sm">for {itemName}</div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <input
                    type="password"
                    placeholder="Enter Mac Password"
                    autoFocus
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(false);
                    }}
                    className={`w-full h-12 bg-white/10 border ${error ? 'border-red-500/50' : 'border-white/20'} rounded-xl px-4 text-center focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/50' : 'focus:ring-blue-500'} transition-all`}
                  />
                  {error && <p className="text-red-500 text-xs font-bold mt-1">Wrong Password</p>}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onCancel}
                      className="flex-1 h-12 bg-white/5 hover:bg-white/10 rounded-xl font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!password}
                      className="flex-1 h-12 bg-white text-black font-bold rounded-xl disabled:opacity-50"
                    >
                      Continue
                    </button>
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
                <div className="text-white/60 text-xs font-black uppercase tracking-widest mb-4">
                  Choose Payment Method
                </div>

                <div className="space-y-3 mb-8">
                  {initialCards.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCard(card)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${selectedCard.id === card.id ? 'bg-white/20 border-white/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    >
                      <div
                        className={`w-12 h-8 rounded-md ${card.color} flex items-center justify-center text-[10px] font-bold italic`}
                      >
                        {card.type === 'Mastercard' ? <MasterCardIcon size={20} /> : card.type}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-bold">
                          {card.type} •••• {card.last4}
                        </div>
                        <div className="text-[10px] text-white/40 uppercase tracking-wider">
                          Numerical Security ID: {card.id}
                        </div>
                      </div>
                      {selectedCard.id === card.id && <Tick01Icon size={16} className="text-blue-400" />}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('password')}
                    className="flex-1 h-12 bg-white/5 hover:bg-white/10 rounded-xl font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePayment}
                    className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 font-bold rounded-xl shadow-lg shadow-blue-500/20"
                  >
                    Pay with Touch ID
                  </button>
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
