import { useEffect, useRef, useCallback } from 'react';
import { useSystem } from '../contexts/SystemContext';
import { useFileSystem } from '../contexts/FileSystemContext';
import { buildTools } from './tools';
import {
  MCP_BROADCAST_CHANNEL,
  MCP_WS_PORTS,
  MCP_WSS_PORT_OFFSET,
} from './types';
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
          // Incoming response — resolve a pending request
          const pending = pendingRef.current.get(data.id);
          if (pending) {
            pending.resolve(data);
            pendingRef.current.delete(data.id);
          }
          return;
        }

        if (data && 'id' in data && 'tool' in data) {
          // Incoming tool request — execute and respond
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

  // WebSocket bridge — for the external MCP server (desktop/terminal agents)
  useEffect(() => {
    let ws: WebSocket | null = null;
    const isHttps = window.location.protocol === 'https:';

    const connect = () => {
      // Build list of URLs to try: for each port, try ws and optionally wss
      const urls: string[] = [];
      for (const port of MCP_WS_PORTS) {
        urls.push(`ws://localhost:${port}`);
        if (isHttps) {
          urls.push(`wss://localhost:${port + MCP_WSS_PORT_OFFSET}`);
        }
      }

      let urlIndex = 0;

      const tryNext = () => {
        if (urlIndex >= urls.length) {
          reconnectTimer.current = setTimeout(connect, 10000);
          return;
        }

        const url = urls[urlIndex];

        try {
          ws = new WebSocket(url);
          wsRef.current = ws;

          ws.onopen = () => {
            urlIndex = 0;
            console.log(`[MCP] Connected to server at ${url}`);
          };

          ws.onmessage = async (event: MessageEvent) => {
            try {
              const data = JSON.parse(event.data as string) as MCPToolRequest | MCPToolResponse;

              if ('result' in data || 'error' in data) {
                const pending = pendingRef.current.get(data.id);
                if (pending) {
                  pending.resolve(data);
                  pendingRef.current.delete(data.id);
                }
                return;
              }

              if ('tool' in data) {
                const response = await handleToolRequest(data);
                ws?.send(JSON.stringify(response));
              }
            } catch {
              // JSON parse error
            }
          };

          ws.onclose = () => {
            wsRef.current = null;
            reconnectTimer.current = setTimeout(connect, 5000);
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
    };

    connect();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [handleToolRequest]);

  return null;
};
