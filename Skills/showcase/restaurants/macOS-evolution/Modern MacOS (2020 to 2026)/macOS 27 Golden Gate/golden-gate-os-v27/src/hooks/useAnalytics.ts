import { useCallback, useRef } from 'react';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const enabled = () =>
  typeof window !== 'undefined' &&
  typeof window.gtag === 'function' &&
  Boolean(window.dataLayer);

/**
 * Sends custom events to GA4 for in-app app launches and closes.
 *
 * The app has no router, so page views can only ever report "/" on first load.
 * These events are the only way to measure per-app engagement.
 *
 * All calls are no-ops until the gtag tag finishes loading, which keeps this
 * safe to call during boot and in environments without analytics.
 */
export const useAnalytics = () => {
  const launchTimes = useRef<Record<string, number>>({});

  const track = useCallback((name: string, params: Record<string, unknown> = {}) => {
    if (!enabled()) return;
    try {
      window.gtag?.('event', name, params);
    } catch (e) {
      console.error(`Failed to send analytics event '${name}'`, e);
    }
  }, []);

  /** Record an app launch. Call before the window open animation starts. */
  const trackAppOpen = useCallback(
    (appId: string) => {
      launchTimes.current[appId] = performance.now();
      track('app_open', { app_id: appId });
    },
    [track],
  );

  /** Record an app close, including how long the window stayed open. */
  const trackAppClose = useCallback(
    (appId: string) => {
      const started = launchTimes.current[appId];
      const params: Record<string, unknown> = { app_id: appId };
      if (typeof started === 'number') {
        params.duration_ms = Math.round(performance.now() - started);
        delete launchTimes.current[appId];
      }
      track('app_close', params);
    },
    [track],
  );

  /** Record time from first paint to a usable desktop. */
  const trackBootComplete = useCallback(() => {
    const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navigation) {
      track('boot_complete', { dom_interactive_ms: Math.round(navigation.domInteractive) });
    }
  }, [track]);

  return { track, trackAppOpen, trackAppClose, trackBootComplete };
};