import { useEffect, useState, useCallback } from 'react';
import type { Notification } from '../contexts/SystemContext';
import { useSystem } from '../contexts/SystemContext';

const MAIL_DELAY = 10 * 60 * 1000;
const MESSAGES_DELAY = 30 * 60 * 1000;

const SENDERS = ['Sonia Bajpai', 'James Gordon', 'Maria Chen', 'Alex Rivera', 'Priya Sharma'];
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

export function useNotificationScheduler() {
  const { addNotification, launchApp } = useSystem();
  const [pendingToast, setPendingToast] = useState<Notification | null>(null);

  const dismissToast = useCallback(() => setPendingToast(null), []);

  useEffect(() => {
    const mailTimer = setTimeout(() => {
      const sender = pick(SENDERS);
      const subject = pick(SUBJECTS);
      addNotification({
        appId: 'mail',
        title: 'New Email',
        message: `${sender} — "${subject}"`,
      });
      setPendingToast({
        id: crypto.randomUUID(),
        appId: 'mail',
        title: 'New Email',
        message: `${sender} — "${subject}"`,
        timestamp: Date.now(),
        read: false,
      });
    }, MAIL_DELAY);

    const messagesTimer = setTimeout(() => {
      const sender = pick(SENDERS);
      const text = pick(MESSAGE_TEXTS);
      addNotification({
        appId: 'messages',
        title: `Message from ${sender}`,
        message: text,
      });
      setPendingToast({
        id: crypto.randomUUID(),
        appId: 'messages',
        title: `Message from ${sender}`,
        message: text,
        timestamp: Date.now(),
        read: false,
      });
    }, MESSAGES_DELAY);

    return () => {
      clearTimeout(mailTimer);
      clearTimeout(messagesTimer);
    };
  }, []);

  return { pendingToast, dismissToast, launchApp };
}
