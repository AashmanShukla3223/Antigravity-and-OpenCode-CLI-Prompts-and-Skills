import { useEffect, useRef, useCallback, useState } from 'react';
import { useSystem } from '../contexts/SystemContext';

let APP_VERSION: string | null = null;

function semverCompare(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

async function fetchVersion(): Promise<string | null> {
  try {
    const res = await fetch('/version.json?t=' + Date.now(), { cache: 'no-store' });
    const data = await res.json();
    return data?.version || null;
  } catch {
    return null;
  }
}

export async function getCurrentVersion(): Promise<string> {
  if (APP_VERSION) return APP_VERSION;
  const v = await fetchVersion();
  APP_VERSION = v || '0.0.0';
  return APP_VERSION;
}

async function checkForUpdate(): Promise<string | null> {
  const remote = await fetchVersion();
  if (!remote || !APP_VERSION) return null;
  return semverCompare(remote, APP_VERSION) > 0 ? remote : null;
}

export function useManualOTACheck() {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const check = useCallback(async () => {
    setChecking(true);
    setResult(null);
    const newer = await checkForUpdate();
    setChecking(false);
    setResult(newer);
  }, []);

  return { checking, result, check, clearResult: () => setResult(null) };
}

export function OtaUpdateChecker() {
  const { startOTAUpdate } = useSystem();
  const initDone = useRef(false);
  const updateStarted = useRef(false);

  useEffect(() => {
    if (updateStarted.current) return;
    let mounted = true;
    let checkTimer: ReturnType<typeof setTimeout>;

    (async () => {
      const v = await fetchVersion();
      if (!mounted) return;
      APP_VERSION = v || '0.0.0';
      initDone.current = true;

      const scheduleCheck = () => {
        checkTimer = setTimeout(async () => {
          if (!mounted || updateStarted.current) return;
          const newer = await checkForUpdate();
          if (!mounted || updateStarted.current) return;
          if (newer) {
            updateStarted.current = true;
            startOTAUpdate(newer);
          } else {
            scheduleCheck();
          }
        }, 10_000);
      };
      scheduleCheck();
    })();

    return () => {
      mounted = false;
      clearTimeout(checkTimer);
    };
  }, [startOTAUpdate]);

  return null;
}
