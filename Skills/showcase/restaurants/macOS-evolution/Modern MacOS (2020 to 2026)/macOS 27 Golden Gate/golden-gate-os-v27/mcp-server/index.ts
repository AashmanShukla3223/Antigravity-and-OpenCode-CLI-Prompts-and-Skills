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
let registeredBrowserTools: ToolDef[] = [];
const pendingToolCalls = new Map<string, (result: unknown) => void>();
let toolRequestIdCounter = 0;

// Graceful connection recovery queue
interface QueuedConnectionPromise {
  resolve: (ws: import('ws').WebSocket) => void;
  reject: (err: Error) => void;
  timeout: NodeJS.Timeout;
}
let connectionWaitQueue: QueuedConnectionPromise[] = [];

// Concurrency queue
const READ_ONLY_TOOLS = new Set([
  'get_system_status',
  'list_users',
  'list_running_apps',
  'list_available_apps',
  'list_windows',
  'get_system_info',
  'get_desktop_state',
  'list_directory',
  'read_file',
  'search_files',
  'get_file_info',
  'search_music'
]);
let writeQueueChain = Promise.resolve();

// Static core tool list metadata
const CORE_TOOLS: ToolDef[] = [
  {
    name: 'execute_os_tool',
    description: 'Execute any macOS system tool by name as a proxy.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Tool name to execute' },
        arguments: { type: 'object', description: 'Tool arguments' }
      },
      required: ['name', 'arguments']
    }
  },
  {
    name: 'get_system_status',
    description: 'Get current boot state, setup phase, and available actions.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'set_boot_state',
    description: 'Transition system state (booting, setup, login, desktop, recovery, activation).',
    inputSchema: {
      type: 'object',
      properties: {
        state: { type: 'string', enum: ['booting', 'setup', 'login', 'desktop', 'recovery', 'activation'] }
      },
      required: ['state']
    }
  },
  {
    name: 'list_users',
    description: 'List user accounts configured on the system.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'login_user',
    description: 'Log in as a specific user.',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        password: { type: 'string' }
      },
      required: ['userId']
    }
  },
  {
    name: 'show_dialog',
    description: 'Show a system alert dialog.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        message: { type: 'string' },
        type: { type: 'string' }
      },
      required: ['title', 'message']
    }
  },
  {
    name: 'launch_app',
    description: 'Open a specified application.',
    inputSchema: {
      type: 'object',
      properties: {
        appId: { type: 'string' }
      },
      required: ['appId']
    }
  },
  {
    name: 'close_app',
    description: 'Quit a specified application.',
    inputSchema: {
      type: 'object',
      properties: {
        appId: { type: 'string' }
      },
      required: ['appId']
    }
  },
  {
    name: 'list_running_apps',
    description: 'Get list of currently running apps.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'list_available_apps',
    description: 'Get list of all installed apps.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'list_windows',
    description: 'List all open windows on the screen.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'focus_window',
    description: 'Bring a specific window to focus.',
    inputSchema: {
      type: 'object',
      properties: {
        windowId: { type: 'string' }
      },
      required: ['windowId']
    }
  },
  {
    name: 'minimize_window',
    description: 'Minimize a specified window.',
    inputSchema: {
      type: 'object',
      properties: {
        windowId: { type: 'string' }
      },
      required: ['windowId']
    }
  },
  {
    name: 'close_window',
    description: 'Close a specified window.',
    inputSchema: {
      type: 'object',
      properties: {
        windowId: { type: 'string' }
      },
      required: ['windowId']
    }
  },
  {
    name: 'get_system_info',
    description: 'Retrieve general macOS hardware & system info.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'get_desktop_state',
    description: 'Retrieve desktop layout settings, Dock parameters, wallpaper status, appearance, etc.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'set_appearance',
    description: 'Set system appearance (light, dark).',
    inputSchema: {
      type: 'object',
      properties: {
        appearance: { type: 'string', enum: ['light', 'dark'] }
      },
      required: ['appearance']
    }
  },
  {
    name: 'set_power_mode',
    description: 'Set system power mode (normal, low power).',
    inputSchema: {
      type: 'object',
      properties: {
        lowPower: { type: 'boolean' }
      },
      required: ['lowPower']
    }
  },
  {
    name: 'set_brightness',
    description: 'Set screen brightness (0.0 to 1.0).',
    inputSchema: {
      type: 'object',
      properties: {
        brightness: { type: 'number' }
      },
      required: ['brightness']
    }
  },
  {
    name: 'toggle_wifi',
    description: 'Toggle Wi-Fi adapter state.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'toggle_bluetooth',
    description: 'Toggle Bluetooth adapter state.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'send_notification',
    description: 'Send a desktop notification.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        message: { type: 'string' },
        icon: { type: 'string' }
      },
      required: ['title', 'message']
    }
  },
  {
    name: 'shutdown',
    description: 'Shut down the virtual macOS system.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'restart',
    description: 'Restart the virtual macOS system.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'list_directory',
    description: 'List contents of a directory in the simulator.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string' }
      },
      required: ['path']
    }
  },
  {
    name: 'read_file',
    description: 'Read file contents from the simulator.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string' }
      },
      required: ['path']
    }
  },
  {
    name: 'create_file',
    description: 'Create a new file in the simulator.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        content: { type: 'string' }
      },
      required: ['path', 'content']
    }
  },
  {
    name: 'create_folder',
    description: 'Create a new folder in the simulator.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string' }
      },
      required: ['path']
    }
  },
  {
    name: 'delete_node',
    description: 'Delete a file or folder in the simulator.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string' }
      },
      required: ['path']
    }
  },
  {
    name: 'search_files',
    description: 'Search for files matching a query.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' }
      },
      required: ['query']
    }
  },
  {
    name: 'get_file_info',
    description: 'Retrieve file properties and metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string' }
      },
      required: ['path']
    }
  },
  {
    name: 'play_music',
    description: 'Play music player track.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'pause_music',
    description: 'Pause music player track.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'next_track',
    description: 'Skip to next music track.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'previous_track',
    description: 'Go back to previous music track.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'set_volume',
    description: 'Set music player volume (0.0 to 1.0).',
    inputSchema: {
      type: 'object',
      properties: {
        volume: { type: 'number' }
      },
      required: ['volume']
    }
  },
  {
    name: 'search_music',
    description: 'Search music database.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' }
      },
      required: ['query']
    }
  }
];

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
          resolve();
        }
      });
    }
    tryPort(WS_PORT);
  });
}

const wsReady = startWSServer();
let activePort = WS_PORT;

function waitForBrowserConnection(timeoutMs = 10000): Promise<import('ws').WebSocket> {
  return new Promise((resolve, reject) => {
    if (browserSocket) {
      resolve(browserSocket);
      return;
    }
    const item: QueuedConnectionPromise = {
      resolve,
      reject,
      timeout: setTimeout(() => {
        const index = connectionWaitQueue.indexOf(item);
        if (index > -1) {
          connectionWaitQueue.splice(index, 1);
        }
        reject(new Error('No browser tab connected. Open the macOS 27 Golden Gate app (macos-27-golden-gate.vercel.app) in a browser tab first, then retry.'));
      }, timeoutMs)
    };
    connectionWaitQueue.push(item);
  });
}

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

    // Resolve all waiting connection promises
    while (connectionWaitQueue.length > 0) {
      const item = connectionWaitQueue.shift();
      if (item) {
        clearTimeout(item.timeout);
        item.resolve(ws);
      }
    }

    for (const msg of queuedMessages) {
      try { ws.send(msg); } catch { /* ignore */ }
    }
    queuedMessages = [];

    ws.on('message', (raw) => {
      let data: any;
      try { data = JSON.parse(raw.toString()); } catch { return; }

      if (data.type === 'register') {
        console.error(`[MCP] Browser registered ${data.tools?.length || 0} tools`);
        registeredBrowserTools = data.tools || [];
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
  let socket: import('ws').WebSocket;
  try {
    socket = await waitForBrowserConnection(10000);
  } catch (err: any) {
    // Return meaningful fallback responses if offline recovery timeout expired
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
        return { error: err.message };
    }
  }

  return new Promise((resolve) => {
    const requestId = String(++toolRequestIdCounter);
    pendingToolCalls.set(requestId, resolve);

    const message = JSON.stringify({ id: requestId, tool: toolName, params: args });
    socket.send(message);

    // Execution safety timeout
    setTimeout(() => {
      if (pendingToolCalls.has(requestId)) {
        pendingToolCalls.delete(requestId);
        resolve({ error: 'Tool execution timed out' });
      }
    }, 15000);
  });
}

async function executeTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
  const isReadOnly = READ_ONLY_TOOLS.has(toolName);
  if (isReadOnly) {
    return forwardToolCallToBrowser(toolName, args);
  } else {
    // Serialize mutating calls via promise chain
    const promise = writeQueueChain.then(() => forwardToolCallToBrowser(toolName, args));
    writeQueueChain = promise.then(() => {}, () => {}); // protect chain continuation
    return promise;
  }
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
      break;
    }

    case 'tools/list': {
      // Expose core tools + dynamic custom registered tools from the browser
      const browserTools = registeredBrowserTools.filter(t => t.name !== 'execute_os_tool');
      const combinedTools = [...CORE_TOOLS];
      for (const bt of browserTools) {
        if (!combinedTools.some(ct => ct.name === bt.name)) {
          combinedTools.push(bt);
        }
      }

      sendMCPResponse({
        jsonrpc: '2.0',
        id,
        result: {
          tools: combinedTools
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
        executeTool(innerName, innerArgs)
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
        executeTool(toolName, args)
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
