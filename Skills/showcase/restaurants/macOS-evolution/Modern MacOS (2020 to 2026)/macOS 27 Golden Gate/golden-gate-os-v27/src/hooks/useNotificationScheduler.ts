import { useEffect, useState, useCallback, useRef } from 'react';
import type { Notification } from '../contexts/SystemContext';
import { useSystem } from '../contexts/SystemContext';
import { contacts } from '../utils/contacts';

const MAIL_DELAY = 10 * 60 * 1000;
const MESSAGES_DELAY = 30 * 60 * 1000;

const SUBJECTS = [
  'Golden Gate OS Review',
  'Q3 Project Timeline',
  'Meeting Tomorrow',
  'Design Assets Attached',
  'Quick Question',
];
const MESSAGE_TEXTS = [
  'Hey, are you free later?',
  'Did you catch the game last night?',
  'Want to grab coffee?',
  'Check this out!',
  'Happy birthday!',
];

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

function playNotificationSound() {
  try {
    const audio = new Audio('/sounds/Glass.mp3');
    audio.volume = 0.6;
    audio.play().catch(() => {});
  } catch {}
}

export function useNotificationScheduler() {
  const { addNotification, launchApp } = useSystem();
  const [pendingToast, setPendingToast] = useState<Notification | null>(null);
  const playedRef = useRef<Set<string>>(new Set());

  const dismissToast = useCallback(() => setPendingToast(null), []);

  const schedule = useCallback((appId: string, title: string, message: string, delay: number) => {
    const key = `${appId}-${delay}`;
    if (playedRef.current.has(key)) return;
    playedRef.current.add(key);
    setTimeout(() => {
      playNotificationSound();
      addNotification({ appId, title, message });
      setPendingToast({
        id: crypto.randomUUID(),
        appId,
        title,
        message,
        timestamp: Date.now(),
        read: false,
      });
    }, delay);
  }, [addNotification]);

  useEffect(() => {
    const contactNames = contacts.map((c) => c.name);
    const sender = pick(contactNames);
    const subject = pick(SUBJECTS);
    schedule('mail', 'New Email', `${sender} — "${subject}"`, MAIL_DELAY);

    const msgSender = pick(contactNames);
    const text = pick(MESSAGE_TEXTS);
    schedule('messages', `Message from ${msgSender}`, text, MESSAGES_DELAY);
  }, [schedule]);

  return { pendingToast, dismissToast, launchApp };
}
