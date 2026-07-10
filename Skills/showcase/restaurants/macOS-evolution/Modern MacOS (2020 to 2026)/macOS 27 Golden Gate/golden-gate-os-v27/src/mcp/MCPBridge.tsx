import { useEffect, useRef, useCallback } from 'react';
import { useSystem } from '../contexts/SystemContext';
import { useFileSystem } from '../contexts/FileSystemContext';
import { buildTools } from './tools';
import { MCP_BROADCAST_CHANNEL, MCP_WS_PORTS } from './types';
import type { MCPToolContext, MCPToolDefinition, MCPToolRequest, MCPToolResponse } from './types';

interface QueuedResponse {
  resolve: (value: unknown) => void;
  reject: (err: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

async function executeTool(
  tools: MCPToolDefinition[],
  request: MCPToolRequest,
): Promise<{ result?: unknown; error?: string }> {
  const tool = tools.find((t) => t.name === request.tool);
  if (!tool) return { error: `Unknown tool: ${request.tool}` };
  try {
    const result = await tool.execute(request.params);
    return { result };
  } catch (e: any) {
    return { error: e?.message || String(e) };
  }
}

function buildContext(sys: ReturnType<typeof useSystem>, fs: ReturnType<typeof useFileSystem>): MCPToolContext {
  return {
    bootState: sys.bootState,
    setBootState: sys.setBootState,
    resetSystem: sys.resetSystem,
    switchUser: sys.switchUser,
    verifyPassword: sys.verifyPassword,
    showAlert: sys.showAlert,
    showConfirm: sys.showConfirm,
    showPrompt: sys.showPrompt,
    launchApp: sys.launchApp,
    closeApp: sys.closeApp,
    openWindows: sys.openWindows,
    openApps: sys.openApps,
    closeWindow: sys.closeWindow,
    minimizeWindow: sys.minimizeWindow,
    unminimizeWindow: sys.unminimizeWindow,
    toggleMaximizeWindow: sys.toggleMaximizeWindow,
    setActiveWindow: sys.setActiveWindow,
    activeApp: sys.activeApp,
    updateSystemState: sys.updateSystemState,
    setPowerMode: sys.setPowerMode,
    setWifi: sys.setWifi,
    setBluetooth: sys.setBluetooth,
    addNotification: sys.addNotification,
    playSong: sys.playSong,
    pauseSong: sys.pauseSong,
    nextSong: sys.nextSong,
    prevSong: sys.prevSong,
    setVolume: sys.setVolume,
    initiateShutdown: sys.initiateShutdown,
    initiateRestart: sys.initiateRestart,
    triggerSystemError: sys.triggerSystemError,
    systemState: sys.systemState,
    battery: sys.battery,
    hardware: sys.hardware,
    uptime: sys.uptime,
    wifi: sys.wifi,
    bluetooth: sys.bluetooth,
    powerMode: sys.powerMode,
    fsNodes: fs.nodes,
    fsCreateNode: fs.createNode,
    fsUpdateNode: fs.updateNode,
    fsDeleteNode: fs.deleteNode,
    fsGetDirectoryContents: fs.getDirectoryContents,
    fsGetPath: fs.getPath,
    fsFindNode: fs.findNode,
    fsGetNodeContent: fs.getNodeContent,
    fsEmptyTrash: fs.emptyTrash,
    fsRestoreSystemNodes: fs.restoreSystemNodes,
    getSystemState: () => ({ ...sys.systemState }),
  };
}

export const MCPBridge = () => {
  const sys = useSystem();
  const fs = useFileSystem();
  const wsRef = useRef<WebSocket | null>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);
  const toolsRef = useRef<MCPToolDefinition[]>([]);
  const pendingRef = useRef<Map<string, QueuedResponse>>(new Map());
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const bridgeIframeRef = useRef<HTMLIFrameElement | null>(null);
  const bridgeSourceRef = useRef<MessageEventSource | null>(null);
  const portDiscoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleToolRequest = useCallback(async (request: MCPToolRequest) => {
    const response: MCPToolResponse = {
      id: request.id,
      ...(await executeTool(toolsRef.current, request)),
    };
    return response;
  }, []);

  // Build tools when context changes
  useEffect(() => {
    toolsRef.current = buildTools(buildContext(sys, fs));
  });

  // BroadcastChannel bridge — for same-origin cross-tab agents
  useEffect(() => {
    try {
      const bc = new BroadcastChannel(MCP_BROADCAST_CHANNEL);
      bcRef.current = bc;

      bc.onmessage = async (event: MessageEvent) => {
        const data = event.data as MCPToolRequest | MCPToolResponse;

        if (data && 'id' in data && 'result' in data) {
          const pending = pendingRef.current.get(data.id);
          if (pending) {
            pending.resolve(data);
            pendingRef.current.delete(data.id);
          }
          return;
        }

        if (data && 'id' in data && 'tool' in data) {
          const response = await handleToolRequest(data as MCPToolRequest);
          bc.postMessage(response);
        }
      };
    } catch {
      // BroadcastChannel not supported
    }

    return () => {
      bcRef.current?.close();
    };
  }, [handleToolRequest]);

  // Transport bridge — direct WebSocket (HTTP dev) or iframe relay (HTTPS/Vercel)
  useEffect(() => {
    const isHttps = window.location.protocol === 'https:';

    // ── Shared message dispatch ──────────────────────────────────
    function handleIncoming(raw: string) {
      try {
        const data = JSON.parse(raw) as MCPToolRequest | MCPToolResponse;

        if ('result' in data || 'error' in data) {
          const pending = pendingRef.current.get(data.id);
          if (pending) {
            pending.resolve(data);
            pendingRef.current.delete(data.id);
          }
          return;
        }

        if ('tool' in data) {
          handleToolRequest(data).then((response) => {
            sendOutgoing(JSON.stringify(response));
          });
        }
      } catch { /* JSON parse error */ }
    }

    function sendOutgoing(raw: string) {
      // Try WS first, then iframe bridge
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(raw);
      } else if (bridgeSourceRef.current) {
        try {
          bridgeSourceRef.current.postMessage(JSON.parse(raw), { targetOrigin: '*' });
        } catch { /* ignore */ }
      }
    }

    // ── Direct WebSocket (HTTP dev server) ───────────────────────
    function connectDirectWS() {
      let urlIndex = 0;
      let ws: WebSocket | null = null;

      const tryNext = () => {
        if (urlIndex >= MCP_WS_PORTS.length) {
          console.log('[MCP] Local WebSocket unavailable — MCP features require a local dev server. Run: npm run mcp-server');
          return;
        }

        const url = `ws://localhost:${MCP_WS_PORTS[urlIndex]}`;
        try {
          ws = new WebSocket(url);
          wsRef.current = ws;

          ws.onopen = () => {
            console.log(`[MCP] WebSocket connected to ${url}`);
          };

          ws.onmessage = (event: MessageEvent) => {
            handleIncoming(event.data as string);
          };

          ws.onclose = () => {
            wsRef.current = null;
          };

          ws.onerror = () => {
            urlIndex++;
            ws?.close();
          };
        } catch {
          urlIndex++;
          tryNext();
        }
      };

      tryNext();
      return () => {
        ws?.close();
      };
    }

    // ── Iframe relay (HTTPS / Vercel) ────────────────────────────
    function connectViaIframe() {
      let portIndex = 0;
      let currentIframe: HTMLIFrameElement | null = null;

      function cleanupIframe() {
        if (currentIframe) {
          currentIframe.remove();
          currentIframe = null;
        }
      }

      const tryNext = () => {
        if (portIndex >= MCP_WS_PORTS.length) {
          console.log('[MCP] Local network bridge unavailable — MCP features require a local dev server. Run: npm run mcp-server');
          return;
        }

        cleanupIframe();
        const port = MCP_WS_PORTS[portIndex];
        portIndex++;

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = `http://localhost:${port}/bridge.html#${port}`;
        currentIframe = iframe;
        bridgeIframeRef.current = iframe;

        iframe.onerror = () => {
          console.warn(`[MCP] Local network request to localhost:${port} blocked by browser. Grant local network permission or run MCP server locally.`);
          tryNext();
        };

        try {
          document.body.appendChild(iframe);
        } catch {
          console.warn(`[MCP] Cannot create bridge iframe — local network access blocked.`);
          return;
        }

        portDiscoverTimer.current = setTimeout(() => {
          tryNext();
        }, 3000);
      };

      tryNext();
      return () => {
        cleanupIframe();
        bridgeSourceRef.current = null;
      };
    }

    // ── Message listener (shared by all transports) ──────────────
    const onMessage = (event: MessageEvent) => {
      // Iframe bridge ready
      if (event.data?.type === 'bridge_ready') {
        clearTimeout(portDiscoverTimer.current);
        bridgeSourceRef.current = event.source;
        console.log(`[MCP] Iframe bridge connected on port ${event.data.port}`);
        return;
      }

      // Iframe bridge error (port unreachable)
      if (event.data?.type === 'bridge_error') {
        // Try next port
        if (bridgeSourceRef.current === null) {
          // We don't have a bridge yet, try next port
          // (handled by timeout in connectViaIframe)
        }
        return;
      }

      // Relay messages from the iframe bridge
      if (event.source === bridgeSourceRef.current && event.data) {
        if ('result' in event.data || 'error' in event.data) {
          const pending = pendingRef.current.get(event.data.id);
          if (pending) {
            pending.resolve(event.data);
            pendingRef.current.delete(event.data.id);
          }
          return;
        }
        if ('tool' in event.data) {
          handleToolRequest(event.data as MCPToolRequest).then((response) => {
            try {
              (event.source as Window).postMessage(response, '*');
            } catch { /* ignore */ }
          });
        }
      }
    };

    window.addEventListener('message', onMessage);

    const cleanupDirect = isHttps ? connectViaIframe() : connectDirectWS();

    return () => {
      window.removeEventListener('message', onMessage);
      cleanupDirect();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (portDiscoverTimer.current) clearTimeout(portDiscoverTimer.current);
      wsRef.current?.close();
      wsRef.current = null;
      bridgeSourceRef.current = null;
    };
  }, [handleToolRequest]);

  return null;
};
