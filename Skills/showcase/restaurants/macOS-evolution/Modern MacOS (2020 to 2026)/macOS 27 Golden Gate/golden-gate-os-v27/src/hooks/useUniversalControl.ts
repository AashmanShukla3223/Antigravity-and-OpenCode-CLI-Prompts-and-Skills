import { useEffect, useRef, useState, useCallback } from 'react';

const CHANNEL = 'golden-gate-universal-control';
const PING_INTERVAL = 100;

interface CursorState {
  peerId: string;
  x: number;
  y: number;
  screenW: number;
  screenH: number;
}

export const useUniversalControl = () => {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const peerIdRef = useRef(`cursor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  const [remoteCursors, setRemoteCursors] = useState<CursorState[]>([]);
  const lastSentRef = useRef(0);

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL);
    channelRef.current = channel;

    const handleMessage = (e: MessageEvent) => {
      const data = e.data as CursorState;
      if (!data || data.peerId === peerIdRef.current) return;
      setRemoteCursors((prev) => {
        const existing = prev.findIndex((c) => c.peerId === data.peerId);
        if (existing >= 0) {
          const next = [...prev];
          next[existing] = data;
          return next;
        }
        return [...prev, data];
      });
    };

    channel.addEventListener('message', handleMessage);

    const cursorInterval = setInterval(() => {
      channel.postMessage({
        peerId: peerIdRef.current,
        x: 0,
        y: 0,
        screenW: window.innerWidth,
        screenH: window.innerHeight,
      } as CursorState);
    }, PING_INTERVAL * 5);

    const cleanup = setInterval(() => {
      setRemoteCursors((prev) => prev.filter((_c) => Date.now() - lastSentRef.current < 5000));
    }, 3000);

    return () => {
      clearInterval(cursorInterval);
      clearInterval(cleanup);
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, []);

  const broadcastCursor = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - lastSentRef.current < 50) return;
    lastSentRef.current = now;
    channelRef.current?.postMessage({
      peerId: peerIdRef.current,
      x,
      y,
      screenW: window.innerWidth,
      screenH: window.innerHeight,
    } as CursorState);
  }, []);

  return { remoteCursors, broadcastCursor };
};
