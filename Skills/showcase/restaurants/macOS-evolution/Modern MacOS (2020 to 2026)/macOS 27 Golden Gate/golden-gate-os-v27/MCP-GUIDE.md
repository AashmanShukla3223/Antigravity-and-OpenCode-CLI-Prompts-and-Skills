# 🧠 macOS 27 Golden Gate — MCP Agent Control Guide

Control the macOS 27 simulator (`macos-27-golden-gate.vercel.app`)
using **any** MCP-compatible agent — Hermes CLI, Hermes Telegram,
OpenCode, Claude Desktop, Cursor, or anything that speaks the
Model Context Protocol.

---

## How it works

```
┌──────────────────┐     stdio/JSON-RPC 2.0     ┌──────────────────┐
│  Your Agent       │ ◄────────────────────────► │  MCP Server      │
│  (Hermes, Claude, │                            │  (Node.js)       │
│   OpenCode, etc.) │                            │                  │
└──────────────────┘                             └────────┬─────────┘
                                                          │ WebSocket
                                                          ▼
┌──────────────────┐                             ┌──────────────────┐
│  Browser Tab     │ ◄──────────────────────────► │  MCPBridge.tsx   │
│  (Vercel)        │     ws://localhost:9876      │  (in-page JS)    │
└──────────────────┘                             └──────────────────┘
```

- The **MCP Server** runs on your machine (Node.js).
- The **browser tab** must be open at `macos-27-golden-gate.vercel.app`
  so the in-page `MCPBridge` can connect via WebSocket.
- Your agent spawns or connects to the MCP Server via **stdio**
  (JSON-RPC 2.0) and calls `execute_os_tool`.

---

## 1. Start the MCP Server

In the project root:

```bash
npm run mcp-server
```

Or directly:

```bash
node mcp-server/index.cjs
```

You'll see:

```
[MCP] WebSocket server listening on ws://localhost:9877
[MCP] Waiting for browser to connect on ws://localhost:9877...
```

Leave this running in a terminal tab.

---

## 2. Open the Simulator

Open `https://macos-27-golden-gate.vercel.app` in a browser
on the **same machine** as the MCP server. The page's
`MCPBridge` auto-connects via WebSocket (tries ports 9876–9879).

When connected:

```
[MCP] Browser connected on ws://localhost:9877
```

---

## 3. Connect Your Agent

### Option A: Hermes CLI

Add the server once:

```bash
hermes mcp add golden-gate \
  --command node \
  --args /absolute/path/to/mcp-server/index.cjs
```

Then ask:

```
Hey macOS, what state is the system in?
```

Hermes auto-resolves `execute_os_tool(get_system_status)`.

### Option B: Hermes Telegram

Once configured via `hermes mcp add`, Telegram sessions share
the same MCP config. Just send a message:

> "On macOS 27, launch Finder and open the Documents folder."

Hermes spawns the MCP server on the Linux host and executes
the tool chain.

### Option C: OpenCode / OpenClaw

OpenCode supports the standard MCP stdio protocol. In your
OpenCode config (`opencode.json` or `.opencode/mcp.json`):

```json
{
  "mcpServers": {
    "golden-gate": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/index.cjs"]
    }
  }
}
```

### Option D: Claude Desktop

```json
{
  "mcpServers": {
    "golden-gate": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/index.cjs"]
    }
  }
}
```

Or test with the inspector:

```bash
npx @modelcontextprotocol/inspector node mcp-server/index.cjs
```

### Option E: Cursor

Same as Claude Desktop — add the server in Cursor's MCP settings.

### Option F: Any MCP client

The server speaks JSON-RPC 2.0 over stdio with the standard
`initialize` → `tools/list` → `tools/call` handshake.
Point any MCP client at `node /path/to/index.cjs`.

---

## 4. Available Tools (36 total)

All tools go through a single MCP tool called **`execute_os_tool`**:

```
execute_os_tool(name="get_system_status", arguments={})
execute_os_tool(name="launch_app", arguments={appId: "finder"})
execute_os_tool(name="search_music", arguments={query: "faltu"})
```

### System State

| Tool | Params | Description |
|---|---|---|
| `get_system_status` | — | Current boot phase + available actions |
| `set_boot_state` | `state` | boot/setup/login/desktop/recovery/activation |
| `list_users` | — | Available user accounts |
| `login_user` | `userId, password` | Log in |
| `show_dialog` | `message` | Show a dialog |

### App Management

| Tool | Params | Description |
|---|---|---|
| `launch_app` | `appId` | Open an app |
| `close_app` | `appId` | Close an app |
| `list_running_apps` | — | What's currently open |
| `list_available_apps` | — | All 50+ app IDs |

### Window Management

| Tool | Params | Description |
|---|---|---|
| `list_windows` | — | Open windows |
| `focus_window` | `windowId` | Bring to front |
| `minimize_window` | `windowId` | Minimize |
| `close_window` | `windowId` | Close window |

### System Info & Settings

| Tool | Params | Description |
|---|---|---|
| `get_system_info` | — | Hardware, memory, storage |
| `get_desktop_state` | — | Wallpaper, music, power mode |
| `set_appearance` | `appearance` | "light", "dark", "auto" |
| `set_power_mode` | `mode` | "Low Power", "Normal", "High Performance" |
| `set_brightness` | `level` | 0–100 |
| `toggle_wifi` | — | On/Off |
| `toggle_bluetooth` | — | On/Off |
| `send_notification` | `appId, title, message` | Push notification |
| `shutdown` | — | Shut down |
| `restart` | — | Restart |

### File System

| Tool | Params | Description |
|---|---|---|
| `list_directory` | `parentId` | Folder contents |
| `read_file` | `nodeId` | File content |
| `create_file` | `name, parentId, content` | New file |
| `create_folder` | `name, parentId` | New folder |
| `delete_node` | `nodeId` | Move to trash |
| `search_files` | `query` | Search by name |
| `get_file_info` | `nodeId` | Metadata + tags |

### Music

| Tool | Params | Description |
|---|---|---|
| `play_music` | `index?` | Start playback |
| `pause_music` | — | Pause |
| `next_track` | — | Skip |
| `previous_track` | — | Previous |
| `set_volume` | `volume` | 0.0–1.0 |
| `search_music` | `query` | Search by title/artist |

---

## 5. Boot States

The simulator has 6 states. `get_system_status` tells you where
you are. Desktop-only tools return a clear error if called in
another state.

| State | What happens | Tools available |
|---|---|---|
| `booting` | Apple logo + progress bar | state transitions only |
| `setup` | First-run assistant | state transitions only |
| `login` | User/password screen | state + login tools |
| `desktop` | Full macOS | **all tools** |
| `recovery` | Recovery mode | state transitions only |
| `activation` | iCloud lock | state transitions only |

---

## 6. Troubleshooting

| Symptom | Fix |
|---|---|
| `Browser not connected` | Open `macos-27-golden-gate.vercel.app` and reload |
| `Connection refused` | MCP server not running — run `npm run mcp-server` |
| Tools return error in boot/login state | Use `set_boot_state` or `login_user` first |
| WebSocket port conflict | Server tries 9876→9877→9878→9879 automatically |

---

## Architecture Files

| File | Role |
|---|---|
| `mcp-server/index.cjs` | Node.js MCP server (stdio + WebSocket) |
| `src/mcp/tools.ts` | 36 tool definitions shared by all tiers |
| `src/mcp/MCPBridge.tsx` | Browser-side WebSocket + BroadcastChannel bridge |
| `src/mcp/WebMCPTools.tsx` | Browser-native `modelContext` registration |
| `src/mcp/types.ts` | Interfaces, constants, app ID list |
