/**
 * macOS 27 Golden Gate — MCP Server (Node.js)
 *
 * Bridges between MCP clients (Claude Desktop, Cursor, etc.) via stdio
 * and the browser app via WebSocket.
 *
 * Run: npm run mcp-server
 *     (or: npx tsx mcp-server/index.ts)
 */

import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { writeFileSync } from 'fs';

const WS_PORT = 9876;
const SERVER_NAME = 'macOS 27 Golden Gate';
const SERVER_VERSION = '1.0.0';
const PROTOCOL_VERSION = '2024-11-05';

// ─── Types ───────────────────────────────────────────────────────

interface ToolDef {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface MCPRequest {
  jsonrpc: string;
  id?: number | string;
  method: string;
  params?: Record<string, unknown>;
}

interface MCPResponse {
  jsonrpc: string;
  id: number | string | null;
  result?: unknown;
  error?: { code: number; message: string };
}

// ─── State ───────────────────────────────────────────────────────

let browserSocket: import('ws').WebSocket | null = null;
let queuedMessages: string[] = [];
const pendingToolCalls = new Map<string, (result: unknown) => void>();
let toolRequestIdCounter = 0;

// ─── WebSocket Server ────────────────────────────────────────────

let wss: WebSocketServer;

async function startWSServer(): Promise<void> {
  return new Promise((resolve) => {
    function tryPort(port: number) {
      if (port > WS_PORT + 10) {
        console.error(`[MCP] No available ports found — browser bridge disabled`);
        resolve();
        return;
      }
      const server = new WebSocketServer({ port });
      server.on('listening', () => {
        wss = server;
        console.error(`[MCP] WebSocket server listening on ws://localhost:${port}`);
        resolve();
      });
      server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          server.close();
          console.error(`[MCP] Port ${port} in use, trying ${port + 1}...`);
          tryPort(port + 1);
        } else {
          console.error(`[MCP] WebSocket error:`, err);
          resolve(); // continue without WS
        }
      });
    }
    tryPort(WS_PORT);
  });
}

const wsReady = startWSServer();
let activePort = WS_PORT;

wsReady.then(() => {
  if (!wss) {
    console.error(`[MCP] WebSocket server not available — browser bridge disabled`);
    return;
  }
  const addr = wss.address();
  activePort = typeof addr === 'object' && addr ? addr.port : WS_PORT;

  console.error(`[MCP] Waiting for browser to connect on ws://localhost:${activePort}...`);
  console.error(`[MCP] Enable in Hermes via: hermes mcp add golden-gate --command npx --args tsx ${process.argv[1]}`);
  console.error(`[MCP] Or test with: npx @modelcontextprotocol/inspector node mcp-server/index.ts`);

  wss.on('connection', (ws) => {
    console.error(`[MCP] Browser connected on ws://localhost:${activePort}`);
    browserSocket = ws;

    for (const msg of queuedMessages) {
      try { ws.send(msg); } catch { /* ignore */ }
    }
    queuedMessages = [];

    ws.on('message', (raw) => {
      let data: any;
      try { data = JSON.parse(raw.toString()); } catch { return; }

      if (data.type === 'register') {
        console.error(`[MCP] Browser registered ${data.tools?.length || 0} tools`);
        return;
      }

      if (data.id && ('result' in data || 'error' in data)) {
        const handler = pendingToolCalls.get(String(data.id));
        if (handler) {
          handler(data);
          pendingToolCalls.delete(String(data.id));
        }
      }
    });

    ws.on('close', () => {
      console.error('[MCP] Browser disconnected');
      browserSocket = null;
    });
  });
});

// ─── Stdio MCP Protocol (JSON-RPC 2.0) ───────────────────────────

function sendMCPResponse(response: MCPResponse) {
  writeFileSync(process.stdout.fd, JSON.stringify(response) + '\n');
}

function sendMCPError(id: number | string | null, code: number, message: string) {
  sendMCPResponse({ jsonrpc: '2.0', id: id ?? 0, error: { code, message } });
}

async function forwardToolCallToBrowser(
  toolName: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  if (!browserSocket) {
    // Browser not connected — return meaningful fallback responses
    switch (toolName) {
      case 'list_available_apps':
        return {
          apps: [
            'finder', 'safari', 'messages', 'mail', 'maps', 'photos',
            'facetime', 'phone', 'calendar', 'contacts', 'notes',
            'reminders', 'music', 'tv', 'keynote', 'numbers', 'pages',
            'appstore', 'books', 'wallet', 'games', 'iphonemirroring',
            'siriai', 'settings', 'terminal', 'activitymonitor',
            'calculator', 'weather', 'clock',
          ],
        };
      case 'get_system_status':
        return {
          bootState: 'unknown',
          browserConnected: false,
          message: 'No browser tab connected. Open macos-27-golden-gate.vercel.app and reload to enable full control.',
          availableTools: 'get_system_status, list_available_apps, get_system_info',
        };
      case 'get_system_info':
        return {
          error: 'Browser not connected. Start the macOS 27 Golden Gate app and reload this page.',
        };
      case 'get_desktop_state':
        return {
          error: 'Browser not connected. Desktop state unavailable until a browser tab connects via WebSocket.',
        };
      default:
        return { error: 'Browser not connected. Open the macOS 27 Golden Gate app (macos-27-golden-gate.vercel.app) in a browser tab first, then retry.' };
    }
  }

  return new Promise((resolve) => {
    const requestId = String(++toolRequestIdCounter);
    pendingToolCalls.set(requestId, resolve);

    const message = JSON.stringify({ id: requestId, tool: toolName, params: args });
    browserSocket!.send(message);

    // Safety timeout
    setTimeout(() => {
      if (pendingToolCalls.has(requestId)) {
        pendingToolCalls.delete(requestId);
        resolve({ error: 'Tool execution timed out' });
      }
    }, 10000);
  });
}

function handleMCPRequest(request: MCPRequest) {
  const id = request.id ?? null;

  switch (request.method) {
    case 'initialize': {
      const clientInfo = (request.params as any)?.clientInfo;
      console.error(`[MCP] Client connected: ${clientInfo?.name || 'unknown'} v${clientInfo?.version || '?'}`);
      sendMCPResponse({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: { tools: {} },
          serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
        },
      });
      break;
    }

    case 'notifications/initialized': {
      // Client ready — no response needed
      break;
    }

    case 'tools/list': {
      // Return a single proxy tool that forwards to the browser
      // The browser registers all its tools on connection
      sendMCPResponse({
        jsonrpc: '2.0',
        id,
        result: {
          tools: [
            {
              name: 'execute_os_tool',
              description:
                'Execute any macOS system tool by name. Available tools: ' +
                'get_system_status, set_boot_state, list_users, login_user, show_dialog, ' +
                'launch_app, close_app, list_running_apps, list_available_apps, ' +
                'list_windows, focus_window, minimize_window, close_window, ' +
                'get_system_info, get_desktop_state, set_appearance, set_power_mode, ' +
                'set_brightness, toggle_wifi, toggle_bluetooth, send_notification, ' +
                'shutdown, restart, list_directory, read_file, create_file, ' +
                'create_folder, delete_node, search_files, get_file_info, ' +
                'play_music, pause_music, next_track, previous_track, set_volume, search_music. ' +
                'All tools work across ALL system states (boot, setup, login, desktop, recovery, activation). ' +
                'Use get_system_status first to see what state the system is in and which tools are available. ' +
                'Use this tool to instruct the OS to perform any action.',
              inputSchema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'Tool name to execute',
                  },
                  arguments: {
                    type: 'object',
                    description: 'Tool arguments as a JSON object',
                  },
                },
                required: ['name', 'arguments'],
              },
            },
          ],
        },
      });
      break;
    }

    case 'tools/call': {
      const params = request.params as any;
      const toolName = params?.name as string;
      const args = (params?.arguments as Record<string, unknown>) || {};

      if (toolName === 'execute_os_tool') {
        const innerName = args.name as string;
        const innerArgs = (args.arguments as Record<string, unknown>) || {};
        forwardToolCallToBrowser(innerName, innerArgs)
          .then((result) => {
            sendMCPResponse({
              jsonrpc: '2.0',
              id,
              result: {
                content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
              },
            });
          })
          .catch((err) => {
            sendMCPError(id, -1, String(err));
          });
      } else {
        forwardToolCallToBrowser(toolName, args)
          .then((result) => {
            sendMCPResponse({
              jsonrpc: '2.0',
              id,
              result: {
                content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
              },
            });
          })
          .catch((err) => {
            sendMCPError(id, -1, String(err));
          });
      }
      break;
    }

    default: {
      sendMCPError(id, -32601, `Method not found: ${request.method}`);
    }
  }
}

// ─── Read JSON-RPC 2.0 from stdin ────────────────────────────────

let buffer = '';
process.stdin.on('data', (chunk: Buffer) => {
  buffer += chunk.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const request = JSON.parse(trimmed) as MCPRequest;
      handleMCPRequest(request);
    } catch {
      sendMCPError(0, -32700, 'Parse error');
    }
  }
});

process.stdin.on('end', () => {
  process.exit(0);
});

// ─── Health check HTTP server (optional) ─────────────────────────

const httpServer = createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    server: SERVER_NAME,
    version: SERVER_VERSION,
    browserConnected: !!browserSocket,
    wsPort: WS_PORT,
  }));
});

httpServer.listen(0, () => {
  // Random port for health check, not critical
});
