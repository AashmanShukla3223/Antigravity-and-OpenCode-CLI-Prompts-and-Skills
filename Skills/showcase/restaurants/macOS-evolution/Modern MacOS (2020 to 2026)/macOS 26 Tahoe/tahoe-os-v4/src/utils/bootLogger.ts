/**
 * Boot Logger - Tracks the initialization sequence with timestamps
 * For debugging localStorage and state initialization issues
 */

interface BootLog {
  timestamp: number;
  stage: string;
  message: string;
  data?: any;
}

const logs: BootLog[] = [];
const startTime = performance.now();

export const bootLogger = {
  log: (stage: string, message: string, data?: any) => {
    const entry: BootLog = {
      timestamp: performance.now() - startTime,
      stage,
      message,
      data
    };
    logs.push(entry);
    console.log(`[${stage}] ${message}`, data ? data : '');
  },

  error: (stage: string, message: string, error?: any) => {
    const entry: BootLog = {
      timestamp: performance.now() - startTime,
      stage,
      message: `ERROR: ${message}`,
      data: { error: error?.message || error }
    };
    logs.push(entry);
    console.error(`[${stage}] ${message}`, error);
  },

  getLogs: () => logs,

  dump: () => {
    console.group('🥾 Tahoe OS Boot Sequence');
    logs.forEach(log => {
      const elapsed = `+${log.timestamp.toFixed(0)}ms`.padStart(8);
      const msg = `${elapsed} [${log.stage}] ${log.message}`;
      if (String(log.message).includes('ERROR')) {
        console.error(msg, log.data);
      } else {
        console.log(msg, log.data || '');
      }
    });
    console.groupEnd();
  }
};

// Auto-dump logs on window unload for debugging
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (window.__TAHOE_DEBUG__) {
      bootLogger.dump();
    }
  });
}

// Make available globally for debugging
(window as any).__tahoeBootLogger = bootLogger;
