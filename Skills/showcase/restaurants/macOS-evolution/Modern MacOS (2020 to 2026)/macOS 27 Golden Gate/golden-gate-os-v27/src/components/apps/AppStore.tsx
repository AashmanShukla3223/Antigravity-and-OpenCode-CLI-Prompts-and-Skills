import React, { useState } from 'react';
import {
  Search01Icon,
  ComputerTerminal01Icon,
  DashboardSquare01Icon,
  File01Icon,
  Database01Icon,
  StarIcon,
  PlayIcon,
  Activity01Icon,
  Tick01Icon,
  Wallet01Icon,
  ArrowLeft01Icon,
} from 'hugeicons-react';
import { useSystem } from '../../contexts/SystemContext';
import { AppIcon } from '../common/AppIcon';
import { ApplePayFramework } from './AppleWallet';

interface AppItem {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  color: string;
  price: string;
  rating: number;
}

const apps: AppItem[] = [
  {
    id: 'geometrydash',
    name: 'Geometry Dash',
    category: 'Games — Arcade',
    icon: <AppIcon id="geometrydash" size={40} />,
    color: 'bg-yellow-500',
    price: 'Get',
    rating: 4.6,
  },
  {
    id: 'xcode',
    name: 'Xcode',
    category: 'Developer Tools',
    icon: <ComputerTerminal01Icon size={40} />,
    color: 'bg-blue-600',
    price: 'Free',
    rating: 4.8,
  },
  {
    id: 'wallet',
    name: 'Apple Wallet',
    category: 'Finance',
    icon: <Wallet01Icon size={40} />,
    color: 'bg-zinc-900',
    price: 'Free',
    rating: 4.9,
  },
  {
    id: 'keynote',
    name: 'Keynote',
    category: 'Productivity',
    icon: <DashboardSquare01Icon size={40} />,
    color: 'bg-blue-500',
    price: 'Free',
    rating: 4.7,
  },
  {
    id: 'pages',
    name: 'Pages',
    category: 'Productivity',
    icon: <File01Icon size={40} />,
    color: 'bg-orange-500',
    price: 'Free',
    rating: 4.6,
  },
  {
    id: 'numbers',
    name: 'Numbers',
    category: 'Productivity',
    icon: <Database01Icon size={40} />,
    color: 'bg-green-500',
    price: 'Free',
    rating: 4.6,
  },
  {
    id: 'finalcut',
    name: 'Final Cut Pro',
    category: 'Video',
    icon: <PlayIcon size={40} />,
    color: 'bg-black',
    price: '$299.99',
    rating: 4.9,
  },
  {
    id: 'logic',
    name: 'Logic Pro',
    category: 'Music',
    icon: <Activity01Icon size={40} />,
    color: 'bg-gray-800',
    price: '$199.99',
    rating: 4.9,
  },
];

export const AppStore: React.FC = () => {
  const { systemState, updateSystemState, launchApp } = useSystem();
  const [activeTab, setActiveTab] = useState('Discover');
  const [showApplePay, setShowApplePay] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [purchasedApps, setPurchasedApps] = useState<string[]>([]);
  const [installingGd, setInstallingGd] = useState(false);
  const [installProgressGd, setInstallProgressGd] = useState(0);

  const isGdInstalled = systemState.geometryDashBuildType === 'apple-silicon';
  const showGdDetail = systemState.appStoreDeepLink === 'geometrydash';

  const handleInstallGeometryDash = () => {
    if (isGdInstalled) {
      launchApp('geometrydash');
      return;
    }

    setInstallingGd(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => {
          setInstallingGd(false);
          updateSystemState({ geometryDashBuildType: 'apple-silicon' });
        }, 400);
      }
      setInstallProgressGd(p);
    }, 400);
  };

  const handleBuyClick = (app: AppItem) => {
    if (app.id === 'geometrydash') {
      handleInstallGeometryDash();
      return;
    }
    if (purchasedApps.includes(app.id)) return;
    setSelectedApp(app);
    setShowApplePay(true);
  };

  const handlePaymentSuccess = () => {
    if (selectedApp) {
      setPurchasedApps([...purchasedApps, selectedApp.id]);
    }
    setShowApplePay(false);
    setSelectedApp(null);
  };

  return (
    <div className="flex h-full w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl text-zinc-900 dark:text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-56 bg-zinc-100/50 dark:bg-black/20 border-r border-zinc-200 dark:border-white/10 p-4 flex flex-col gap-2">
        <div className="mb-6 px-2">
          <div className="relative">
            <Search01Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-zinc-200/50 dark:bg-white/10 border border-zinc-300 dark:border-white/10 rounded-md py-1 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {['Discover', 'Arcade', 'Create', 'Work', 'Play', 'Develop', 'Categories', 'Updates'].map((tab) => (
          <div
            key={tab}
            onClick={() => {
              updateSystemState({ appStoreDeepLink: null });
              setActiveTab(tab);
            }}
            className={`px-3 py-2 rounded-lg flex items-center gap-3 cursor-pointer transition-all ${activeTab === tab && !showGdDetail ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400'}`}
          >
            <span className="text-sm font-medium">{tab}</span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
        {showGdDetail ? (
          /* Geometry Dash Apple Silicon Detail Listing */
          <div className="flex flex-col gap-6 max-w-3xl">
            <button
              onClick={() => updateSystemState({ appStoreDeepLink: null })}
              className="flex items-center gap-2 text-xs font-semibold text-blue-500 hover:underline w-fit mb-2"
            >
              <ArrowLeft01Icon size={14} /> Back to App Store
            </button>

            <div className="flex items-start gap-6 border-b border-zinc-200 dark:border-white/10 pb-8">
              <div className="w-32 h-32 rounded-3xl bg-black/40 p-2 shadow-2xl border border-white/20 flex items-center justify-center">
                <AppIcon id="geometrydash" size={112} />
              </div>
              <div className="flex-1 flex flex-col justify-between h-32">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight">Geometry Dash</h1>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">RobTop Games • Games — Arcade</p>
                  <p className="text-xs text-blue-500 font-semibold mt-1">Version 2.2 (Apple Silicon Build)</p>
                </div>

                <div className="flex items-center gap-4">
                  {installingGd ? (
                    <div className="flex items-center gap-3 bg-zinc-200 dark:bg-white/10 px-5 py-1.5 rounded-full border border-white/10">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold text-blue-500">{installProgressGd}%</span>
                    </div>
                  ) : isGdInstalled ? (
                    <button
                      onClick={() => launchApp('geometrydash')}
                      className="px-8 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-sm shadow-lg shadow-blue-600/30 transition-transform active:scale-95 uppercase tracking-wider"
                    >
                      Open
                    </button>
                  ) : (
                    <button
                      onClick={handleInstallGeometryDash}
                      className="px-8 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-sm shadow-lg shadow-blue-600/30 transition-transform active:scale-95 uppercase tracking-wider"
                    >
                      Get
                    </button>
                  )}
                  <span className="text-xs text-zinc-400 font-medium">94.3 MB • Age 9+</span>
                </div>
              </div>
            </div>

            {/* What's New */}
            <div className="bg-zinc-100/50 dark:bg-white/5 p-6 rounded-2xl border border-zinc-200 dark:border-white/10 flex flex-col gap-2">
              <h3 className="text-base font-bold text-blue-500">What&apos;s New in Version 2.2</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                This update is built natively for Apple silicon, replacing the previous Intel-based release. Rosetta is no longer required to run this app.
              </p>
              <ul className="text-xs text-zinc-500 dark:text-zinc-400 list-disc list-inside space-y-1 mt-1">
                <li>Native Apple silicon performance</li>
                <li>Improved battery efficiency</li>
                <li>Faster launch times</li>
                <li>Bug fixes and stability improvements</li>
              </ul>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-bold">Description</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Jump and fly your way through danger in this rhythm-based action platformer! Prepare for a near impossible challenge in the world of Geometry Dash. Push your skills to the limit as you jump, fly, and flip your way through dark caverns and spiky obstacles.
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mt-2">
                Simple one-touch mechanics with a fully interactive and dynamic environment. Distinct level design and unique interactions everywhere.
              </p>
              <ul className="text-xs text-zinc-500 dark:text-zinc-400 list-disc list-inside space-y-1 mt-2">
                <li>Rhythm-based Action Platforming!</li>
                <li>Lots of levels with unique soundtracks!</li>
                <li>Build and share your own levels using the level editor!</li>
                <li>Fly rockets, flip gravity and much more!</li>
                <li>Unlock new icons and colors to customize your character!</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-4xl font-bold mb-8 tracking-tight">{activeTab}</h1>

            {activeTab === 'Discover' && (
              <div className="space-y-12">
                {/* Featured App */}
                <div className="relative w-full h-80 rounded-3xl overflow-hidden shadow-2xl group">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-600 to-amber-900" />
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1000')] bg-cover opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <div className="text-xs font-bold uppercase tracking-widest text-white/70 mb-2">Native Apple Silicon Update</div>
                    <h2 className="text-5xl font-black text-white mb-4">Geometry Dash 2.2</h2>
                    <p className="text-white/80 text-lg max-w-md mb-6 leading-tight font-medium">
                      Built natively for ARM64 Apple silicon. Zero Rosetta translation required.
                    </p>
                    <button
                      onClick={() => updateSystemState({ appStoreDeepLink: 'geometrydash' })}
                      className="w-36 h-10 bg-white text-yellow-600 rounded-full font-bold text-sm hover:scale-105 transition shadow-xl flex items-center justify-center uppercase tracking-wider"
                    >
                      View App
                    </button>
                  </div>
                </div>

                {/* App Grid */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold tracking-tight">Essential Apps</h3>
                    <span className="text-blue-500 text-sm font-medium cursor-pointer hover:underline">See All</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    {apps.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center gap-4 group cursor-pointer"
                        onClick={() => {
                          if (app.id === 'geometrydash') updateSystemState({ appStoreDeepLink: 'geometrydash' });
                        }}
                      >
                        <div
                          className={`w-16 h-16 rounded-2xl ${app.color} flex items-center justify-center text-white shadow-lg border border-white/20 group-hover:scale-105 transition-transform`}
                        >
                          {app.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-base tracking-tight">{app.name}</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{app.category}</div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                size={8}
                                className={i < Math.floor(app.rating) ? 'text-blue-500 fill-blue-500' : 'text-zinc-300'}
                              />
                            ))}
                            <span className="text-[10px] font-bold text-zinc-400 ml-1">45K</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBuyClick(app);
                            }}
                            className="px-4 py-1 bg-zinc-200 dark:bg-white/10 rounded-full text-blue-500 dark:text-blue-400 font-bold text-xs hover:bg-zinc-300 dark:hover:bg-white/20 transition-colors uppercase tracking-wider min-w-[80px] flex justify-center"
                          >
                            {app.id === 'geometrydash' && isGdInstalled ? (
                              <Tick01Icon size={14} />
                            ) : purchasedApps.includes(app.id) ? (
                              <Tick01Icon size={14} />
                            ) : (
                              app.price
                            )}
                          </button>
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
                            In-App Purchases
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showApplePay && selectedApp && (
        <ApplePayFramework
          amount={selectedApp.price}
          itemName={selectedApp.name}
          onSuccess={handlePaymentSuccess}
          onCancel={() => {
            setShowApplePay(false);
            setSelectedApp(null);
          }}
        />
      )}
    </div>
  );
};
