/**
 * Golden Gate bridge client.
 *
 * Best-effort connection to mcp-server/index.cjs. If nothing is listening the
 * page does not care and nothing is logged — the console API already works
 * without it. This is for the case where you DO want an external agent to
 * drive the page while it is running.
 *
 * Opt in by adding the bridge before Golden Gate loads:
 *
 *   <script>window.__GOLDEN_GATE_BRIDGE__ = 9876</script>
 *
 * or set it later from the console:
 *
 *   goldenGateBridge.connect()
 */

const DEFAULT_PORT = 9876;

export type BridgeState = 'idle' | 'connecting' | 'connected' | 'unavailable';

declare global {
  interface Window {
    goldenGateBridge?: {
      state: () => BridgeState;
      connect: (port?: number) => void;
      _socket: WebSocket | null;
    };
    __GOLDEN_GATE_BRIDGE__?: number;
  }
}

let socket: WebSocket | null = null;
let state: BridgeState = 'idle';

export function connectBridge(port?: number): void {
  if (typeof window === 'undefined') return;
  if (socket && socket.readyState <= WebSocket.OPEN) return;

  const target = port ?? window.__GOLDEN_GATE_BRIDGE__ ?? DEFAULT_PORT;
  state = 'connecting';

  let ws: WebSocket;
  try {
    ws = new WebSocket(`ws://localhost:${target}`);
  } catch {
    state = 'unavailable';
    return;
  }

  ws.onopen = () => {
    state = 'connected';
    // Announce ourselves so the server knows the page is attached.
    ws.send(JSON.stringify({ type: 'register', tools: window.goldenGate?.names ?? [] }));
  };

  ws.onclose = () => {
    state = 'unavailable';
    socket = null;
  };

  ws.onerror = () => {
    state = 'unavailable';
    socket = null;
  };

  ws.onmessage = (ev) => {
    // The bridge only carries tool calls; route them back through the same
    // registry the console uses, so there is one code path.
    try {
      const msg = JSON.parse(String(ev.data));
      if (msg?.id && msg.method === 'call') {
        window.goldenGate
          ?.call(msg.params?.name, msg.params?.arguments)
          .then((result) => ws.send(JSON.stringify({ id: msg.id, result })))
          .catch((e) =>
            ws.send(JSON.stringify({ id: msg.id, error: { message: String(e) } })),
          );
      }
    } catch {
      /* ignore malformed frames */
    }
  };

  socket = ws;
}

export function installBridgeClient(): void {
  if (typeof window === 'undefined') return;

  window.goldenGateBridge = {
    state: () => state,
    connect: connectBridge,
    _socket: null,
  };

  // Only auto-connect when explicitly requested; otherwise a missing server
  // would cost every page load a failed socket attempt.
  if (window.__GOLDEN_GATE_BRIDGE__) connectBridge();
}
