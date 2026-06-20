import { useEffect, useRef, useState } from 'react';
import { useSystem } from '../contexts/SystemContext';

const CHANNEL = 'golden-gate-handoff';
const PING_INTERVAL = 3000;
const PEER_TIMEOUT = 8000;

interface HandoffPeer {
  id: string;
  appId: string;
  lastSeen: number;
}

export const useHandoff = () => {
  const { activeApp, activeUser } = useSystem();
  const channelRef = useRef<BroadcastChannel | null>(null);
  const [peers, setPeers] = useState<HandoffPeer[]>([]);
  const [handoffApps, setHandoffApps] = useState<{ peerId: string; appId: string }[]>([]);
  const peerIdRef = useRef(`handoff-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL);
    channelRef.current = channel;

    const handleMessage = (e: MessageEvent) => {
      const data = e.data;
      if (data && data.type === 'handoff-ping') {
        setPeers((prev) => {
          const existing = prev.find((p) => p.id === data.id);
          if (existing) {
            return prev.map((p) => p.id === data.id ? { ...p, appId: data.appId, lastSeen: Date.now() } : p);
          }
          return [...prev, { id: data.id, appId: data.appId, lastSeen: Date.now() }];
        });
        setHandoffApps((prev) => {
          const existing = prev.find((p) => p.peerId === data.id);
          if (existing) {
            return prev.map((p) => p.peerId === data.id ? { ...p, appId: data.appId } : p);
          }
          return [...prev, { peerId: data.id, appId: data.appId }];
        });
      }
    };

    channel.addEventListener('message', handleMessage);

    const ping = setInterval(() => {
      const currentApp = activeApp || 'finder';
      channel.postMessage({
        type: 'handoff-ping',
        id: peerIdRef.current,
        appId: currentApp,
        userName: activeUser?.fullName || 'User',
      });
    }, PING_INTERVAL);

    const cleanup = setInterval(() => {
      const now = Date.now();
      setPeers((prev) => prev.filter((p) => now - p.lastSeen < PEER_TIMEOUT));
    }, 2000);

    return () => {
      clearInterval(ping);
      clearInterval(cleanup);
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, [activeApp, activeUser]);

  const openHandoffApp = (appId: string) => {
    window.dispatchEvent(new CustomEvent('open-handoff-app', { detail: { appId } }));
  };

  return { peers, handoffApps, openHandoffApp };
};
