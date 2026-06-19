import { useEffect, useRef, useState, useCallback } from 'react';
import { useSystem } from '../contexts/SystemContext';

interface AirDropPeer {
  id: string;
  lastSeen: number;
}

interface AirDropFile {
  nodeId: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  from: string;
}

const CHANNEL = 'golden-gate-airdrop';
const PING_INTERVAL = 3000;
const PEER_TIMEOUT = 8000;

export function useAirDrop() {
  const { systemState, addNotification } = useSystem();
  const channelRef = useRef<BroadcastChannel | null>(null);
  const [peers, setPeers] = useState<AirDropPeer[]>([]);
  const [incomingFiles, setIncomingFiles] = useState<AirDropFile[]>([]);
  const instanceIdRef = useRef(crypto.randomUUID?.() || Math.random().toString(36).slice(2));
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const broadcast = useCallback((data: any) => {
    if (channelRef.current) {
      try {
        channelRef.current.postMessage({ ...data, from: instanceIdRef.current });
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (!systemState.airdrop) {
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
      if (pingRef.current) {
        clearInterval(pingRef.current);
        pingRef.current = null;
      }
      setPeers([]);
      return;
    }

    const cleanups: (() => void)[] = [];

    try {
      const channel = new BroadcastChannel(CHANNEL);
      channelRef.current = channel;

      channel.onmessage = (event) => {
        const data = event.data;
        if (!data || data.from === instanceIdRef.current) return;

        if (data.type === 'airdrop-ping') {
          channel.postMessage({ type: 'airdrop-pong', from: instanceIdRef.current, deviceName: navigator.platform || 'Unknown' });
        } else if (data.type === 'airdrop-pong') {
          setPeers((prev) => {
            const exists = prev.find((p) => p.id === data.from);
            const updated = exists
              ? prev.map((p) => (p.id === data.from ? { ...p, lastSeen: Date.now() } : p))
              : [...prev, { id: data.from, lastSeen: Date.now() }];
            return updated;
          });
        } else if (data.type === 'airdrop-file') {
          setIncomingFiles((prev) => {
            if (prev.some((f) => f.nodeId === data.nodeId)) return prev;
            const file: AirDropFile = { nodeId: data.nodeId, name: data.name, type: data.fileType, size: data.size, from: data.from };
            return [...prev, file];
          });
          addNotification({
            appId: 'finder',
            title: 'AirDrop',
            message: `Incoming file: ${data.name}`,
          });
        }
      };

      const ping = () => {
        broadcast({ type: 'airdrop-ping', deviceName: navigator.platform || 'Unknown' });
      };
      ping();
      pingRef.current = setInterval(ping, PING_INTERVAL);
      cleanups.push(() => { if (pingRef.current) { clearInterval(pingRef.current); pingRef.current = null; } });

      const cleanup = setInterval(() => {
        setPeers((prev) => prev.filter((p) => Date.now() - p.lastSeen < PEER_TIMEOUT));
      }, PEER_TIMEOUT);
      cleanups.push(() => clearInterval(cleanup));
    } catch {
      // BroadcastChannel not supported
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
      cleanups.forEach((fn) => fn());
    };
  }, [systemState.airdrop, broadcast, addNotification]);

  const sendFile = useCallback((nodeId: string, name: string, fileType: 'file' | 'folder', size?: number) => {
    broadcast({ type: 'airdrop-file', nodeId, name, fileType, size });
    return peers.length;
  }, [broadcast, peers]);

  const clearIncoming = useCallback((nodeId: string) => {
    setIncomingFiles((prev) => prev.filter((f) => f.nodeId !== nodeId));
  }, []);

  return { peers, incomingFiles, sendFile, clearIncoming, isAvailable: typeof BroadcastChannel !== 'undefined' };
}
