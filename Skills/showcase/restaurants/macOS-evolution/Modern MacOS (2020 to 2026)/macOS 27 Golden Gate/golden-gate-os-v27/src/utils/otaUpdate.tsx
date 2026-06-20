import { useState, useEffect, useRef, useCallback } from 'react';

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

async function checkForUpdate(): Promise<string | null> {
  const remote = await fetchVersion();
  if (!remote || !APP_VERSION) return null;
  return semverCompare(remote, APP_VERSION) > 0 ? remote : null;
}

export async function getCurrentVersion(): Promise<string> {
  if (APP_VERSION) return APP_VERSION;
  const v = await fetchVersion();
  APP_VERSION = v || '0.0.0';
  return APP_VERSION;
}

export function useOTACheck() {
  const [updateTarget, setUpdateTarget] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const inModal = useRef(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const v = await fetchVersion();
      if (!mounted) return;
      APP_VERSION = v || '0.0.0';
      const newer = await checkForUpdate();
      if (!mounted) return;
      if (newer) {
        inModal.current = true;
        setUpdateTarget(newer);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!updateTarget) return;
    if (countdown <= 0) {
      location.reload();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [updateTarget, countdown]);

  return { updateTarget, countdown };
}

export function useManualOTACheck() {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const check = useCallback(async () => {
    setChecking(true);
    setResult(null);
    const newer = await checkForUpdate();
    setChecking(false);
    if (newer) setResult(newer);
    else setResult(null);
  }, []);

  return { checking, result, check, clearResult: () => setResult(null) };
}

export function OtaModal({ target, countdown, onClose }: { target: string; countdown: number; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1c1c1e] border border-white/10 rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-9-9" />
            <path d="M21 3v6h-6" />
            <path d="M12 7v5l3 3" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Software Update Available</h2>
        <p className="text-white/50 text-sm mb-1">
          Current version: <span className="text-white font-mono">{APP_VERSION || '—'}</span>
        </p>
        <p className="text-white/50 text-sm mb-6">
          Target version: <span className="text-blue-400 font-mono font-bold">{target}</span>
        </p>
        <p className="text-white/70 text-lg font-bold mb-2">Updating in {countdown}…</p>
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-blue-400 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${((3 - countdown) / 3) * 100}%` }}
          />
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium text-white/70 transition-colors"
          >
            Remind Later
          </button>
          <button
            onClick={() => location.reload()}
            className="px-5 py-2 bg-blue-500 hover:bg-blue-600 rounded-full text-sm font-bold text-white transition-colors"
          >
            Update Now
          </button>
        </div>
      </div>
    </div>
  );
}

export function OtaUpdateChecker() {
  const { updateTarget, countdown } = useOTACheck();
  const [dismissed, setDismissed] = useState(false);

  if (!updateTarget || dismissed) return null;

  return <OtaModal target={updateTarget} countdown={countdown} onClose={() => setDismissed(true)} />;
}
