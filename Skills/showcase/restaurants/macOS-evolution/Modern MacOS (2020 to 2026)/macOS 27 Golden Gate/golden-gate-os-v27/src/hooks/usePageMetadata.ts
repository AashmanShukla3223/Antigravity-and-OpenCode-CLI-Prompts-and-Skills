import { useEffect } from 'react';
import { useSystem } from '../contexts/SystemContext';

type MetaConfig = {
  title: string;
  description: string;
};

const PAGE_META: Record<string, MetaConfig> = {
  booting: {
    title: 'macOS 27 Golden Gate — Booting',
    description: 'Starting up macOS 27 Golden Gate — the next era of silicon-native desktop computing.',
  },
  setup: {
    title: 'macOS 27 Golden Gate — Setup Assistant',
    description: 'Configure your macOS 27 Golden Gate experience with personalization and system preferences.',
  },
  login: {
    title: 'macOS 27 Golden Gate — Login',
    description: 'Unlock your macOS 27 Golden Gate desktop and enter the Unit 7 era.',
  },
  desktop: {
    title: 'macOS 27 Golden Gate',
    description:
      'Experience the future of desktop computing with macOS 27 Golden Gate — a silicon-native OS simulation with liquid glass aesthetics and 120fps physics.',
  },
  recovery: {
    title: 'macOS 27 Golden Gate — Recovery',
    description: 'macOS 27 Golden Gate recovery and system diagnostics mode.',
  },
  activation: {
    title: 'macOS 27 Golden Gate — Activation',
    description: 'Activate your macOS 27 Golden Gate system to begin.',
  },
};

function ensureMetaTag(attr: string, value: string) {
  const isProperty = attr.startsWith('og:') || attr.startsWith('twitter:');
  const selector = isProperty ? `meta[property="${attr}"]` : `meta[name="${attr}"]`;
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    if (isProperty) {
      el.setAttribute('property', attr);
    } else {
      el.setAttribute('name', attr);
    }
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

export function usePageMetadata() {
  const { bootState } = useSystem();

  useEffect(() => {
    const meta = PAGE_META[bootState] || PAGE_META.desktop;

    document.title = meta.title;
    ensureMetaTag('description', meta.description);
    ensureMetaTag('og:title', meta.title);
    ensureMetaTag('og:description', meta.description);
    ensureMetaTag('og:url', window.location.href);
    ensureMetaTag('og:type', 'website');
    ensureMetaTag('twitter:title', meta.title);
    ensureMetaTag('twitter:description', meta.description);
    ensureMetaTag('twitter:url', window.location.href);
    ensureMetaTag('twitter:card', 'summary_large_image');
  }, [bootState]);
}
