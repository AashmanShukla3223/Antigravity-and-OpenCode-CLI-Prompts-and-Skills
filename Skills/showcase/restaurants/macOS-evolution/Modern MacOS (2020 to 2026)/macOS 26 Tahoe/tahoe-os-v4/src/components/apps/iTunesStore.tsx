import React, { useState } from 'react';
import { 
  ShoppingBag, 
  CheckCircle2,
  Music,
  ShoppingBasket
} from 'lucide-react';
import { ApplePayFramework } from './AppleWallet';

interface StoreItem {
  id: string;
  title: string;
  description: string;
  price: string;
}

const items: StoreItem[] = [
  { id: 'music_pass', title: 'Music Access Pass', description: 'Unlock all 51 tracks in Apple Music', price: '$0.99' },
  { id: 'silicon_pack', title: 'Silicon Surge Pack', description: 'Extra system sounds and effects', price: '$1.99' },
];

export const iTunesStore: React.FC = () => {
  const [showApplePay, setShowApplePay] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);

  const handleBuyClick = (item: StoreItem) => {
    if (purchasedIds.includes(item.id)) return;
    setSelectedItem(item);
    setShowApplePay(true);
  };

  const handlePaymentSuccess = () => {
    if (selectedItem) {
      setPurchasedIds([...purchasedIds, selectedItem.id]);
      if (selectedItem.id === 'music_pass') {
        localStorage.setItem('tahoe_music_unlocked', 'true');
        window.dispatchEvent(new Event('storage'));
      }
    }
    setShowApplePay(false);
    setSelectedItem(null);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-[#1e1e1e] text-zinc-900 dark:text-white p-8 overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-2xl text-white">
          <ShoppingBag size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">iTunes Store</h1>
          <p className="opacity-40 text-sm font-bold uppercase tracking-widest">Tahoe Edition</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {items.map(item => (
          <div key={item.id} className="bg-zinc-200/50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:bg-zinc-200 dark:hover:bg-white/10 transition-all group">
            <div>
              <div className="flex justify-between items-start mb-4">
                 <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    {item.id === 'music_pass' ? <Music size={20} /> : <ShoppingBasket size={20} />}
                 </div>
                 {purchasedIds.includes(item.id) && <CheckCircle2 size={20} className="text-green-500" />}
              </div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-sm opacity-50 mb-8 leading-relaxed">{item.description}</p>
            </div>
            <button 
              onClick={() => handleBuyClick(item)}
              disabled={purchasedIds.includes(item.id)}
              className={`w-full h-12 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${purchasedIds.includes(item.id) ? 'bg-zinc-300 dark:bg-white/10 text-zinc-500 dark:text-white/20' : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20'}`}
            >
              {purchasedIds.includes(item.id) ? 'Purchased' : item.price}
            </button>
          </div>
        ))}
      </div>

      <div className="pt-12 border-t border-zinc-200 dark:border-white/5">
         <h2 className="text-sm font-black uppercase tracking-widest opacity-20 mb-8 text-center">Featured Collections</h2>
         <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="min-w-[160px] aspect-square bg-zinc-200/50 dark:bg-white/5 rounded-3xl border border-zinc-300 dark:border-white/5 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:scale-105 transition-transform">
                 <div className="w-12 h-12 rounded-2xl bg-zinc-300 dark:bg-white/10 flex items-center justify-center">
                    <Music size={24} className="opacity-20 group-hover:opacity-40 transition-opacity" />
                 </div>
                 <div className="w-16 h-2 bg-zinc-300 dark:bg-white/10 rounded-full" />
              </div>
            ))}
         </div>
      </div>

      {showApplePay && selectedItem && (
        <ApplePayFramework 
          amount={selectedItem.price}
          itemName={selectedItem.title}
          onSuccess={handlePaymentSuccess}
          onCancel={() => {
            setShowApplePay(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
};
