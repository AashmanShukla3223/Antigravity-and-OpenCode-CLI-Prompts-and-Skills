import type { MCPToolDefinition, MCPToolContext, BootState } from './types';
import { AVAILABLE_APP_IDS } from './types';
import { songs } from '../utils/MusicData';

function skipIfNotDesktop(ctx: MCPToolContext) {
  if (ctx.bootState !== 'desktop') {
    return {
      error: `This tool is only available in desktop mode. Current state: ${ctx.bootState}. Use get_system_status to see available actions.`,
    };
  }
  return null;
}

const VALID_TRANSITIONS: Record<BootState, BootState[]> = {
  booting: ['setup', 'login', 'recovery', 'activation'],
  setup: ['login', 'desktop', 'recovery'],
  login: ['desktop', 'recovery'],
  desktop: ['recovery', 'login'],
  recovery: ['desktop', 'login'],
  activation: ['desktop'],
};

export function buildTools(ctx: MCPToolContext): MCPToolDefinition[] {
  return [
    // ─── Boot Lifecycle (available in ALL states) ──────────────────
    {
      name: 'get_system_status',
      description: 'Get the current boot state, what phase the OS is in, and which actions are available right now.',
      inputSchema: { type: 'object', properties: {} },
      execute: () => {
        const bootState = ctx.bootState;
        const users = ctx.systemState.users.map((u: any) => ({
          id: u.id,
          name: u.fullName,
          accountName: u.accountName,
        }));
        const info: Record<string, unknown> = {
          bootState,
          users,
          setupComplete: ctx.systemState.setup_complete,
          isInfected: ctx.systemState.isSystemInfected,
        };
        switch (bootState) {
          case 'booting':
            info.description = 'System is booting up with the Apple logo and progress bar';
            info.availableActions = [];
            break;
          case 'setup':
            info.description = 'Setup Assistant is running — configure language, region, and account';
            info.availableActions = ['get_system_status', 'set_boot_state', 'set_appearance', 'list_users', 'shutdown', 'restart'];
            break;
          case 'login':
            info.description = 'Login screen — select a user and enter password';
            info.availableActions = ['get_system_status', 'set_boot_state', 'list_users', 'login_user', 'shutdown', 'restart'];
            break;
          case 'desktop':
            info.description = 'Desktop is fully loaded with Dock, Menu Bar, and apps';
            info.availableActions = [
              'get_system_status', 'launch_app', 'close_app', 'list_running_apps',
              'list_available_apps', 'list_windows', 'focus_window', 'minimize_window',
              'close_window', 'get_system_info', 'get_desktop_state', 'set_appearance',
              'set_power_mode', 'set_brightness', 'toggle_wifi', 'toggle_bluetooth',
              'send_notification', 'shutdown', 'restart', 'list_directory', 'read_file',
              'create_file', 'create_folder', 'delete_node', 'search_files', 'get_file_info',
              'play_music', 'pause_music', 'next_track', 'previous_track', 'set_volume',
            ];
            break;
          case 'recovery':
            info.description = 'Recovery mode — Disk Utility, Reinstall macOS, Terminal';
            info.availableActions = ['get_system_status', 'set_boot_state', 'shutdown', 'restart'];
            break;
          case 'activation':
            info.description = 'Activation Lock — requires iCloud authentication';
            info.availableActions = ['get_system_status', 'set_boot_state', 'shutdown', 'restart'];
            break;
        }
        return info;
      },
    },
    {
      name: 'set_boot_state',
      description:
        'Transition the system to a different boot state. Valid transitions depend on current state. Use get_system_status to see available actions.',
      inputSchema: {
        type: 'object',
        properties: {
          state: {
            type: 'string',
            enum: ['booting', 'setup', 'login', 'desktop', 'recovery', 'activation'],
            description: 'Target boot state',
          },
        },
        required: ['state'],
      },
      execute: ({ state }) => {
        const target = state as BootState;
        const current = ctx.bootState;
        const valid = VALID_TRANSITIONS[current];
        if (!valid?.includes(target)) {
          return {
            error: `Cannot transition from ${current} to ${target}. Valid targets: ${valid?.join(', ') || 'none'}`,
          };
        }
        ctx.setBootState(target);
        return { success: true, from: current, to: target };
      },
    },
    {
      name: 'list_users',
      description: 'List all user accounts on the system. Available in setup, login, and desktop states.',
      inputSchema: { type: 'object', properties: {} },
      execute: () => {
        const users = ctx.systemState.users.map((u: any) => ({
          id: u.id,
          name: u.fullName,
          accountName: u.accountName,
          hasPassword: !!u.password,
        }));
        return { users };
      },
    },
    {
      name: 'login_user',
      description: 'Log in as a specific user and go to the desktop. If the user has a password, it must be provided.',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'User ID to log in as. Use list_users to get valid IDs.' },
          password: { type: 'string', description: 'User password (required if user has one set)' },
        },
        required: ['userId'],
      },
      execute: ({ userId, password }) => {
        const user = ctx.systemState.users.find((u: any) => u.id === userId);
        if (!user) return { error: `User "${userId}" not found. Use list_users to see available users.` };
        if (password && (user as any).password && String(password) !== (user as any).password) {
          return { error: 'Incorrect password' };
        }
        ctx.switchUser(String(userId));
        ctx.setBootState('desktop');
        return { success: true, user: user.fullName || user.accountName };
      },
    },
    {
      name: 'show_dialog',
      description: 'Show a system dialog (alert, confirm, or prompt) to the user and wait for their response.',
      inputSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['alert', 'confirm', 'prompt'], description: 'Dialog type' },
          title: { type: 'string', description: 'Dialog title' },
          message: { type: 'string', description: 'Dialog message' },
          defaultValue: { type: 'string', description: 'Default value for prompt dialogs' },
        },
        required: ['type', 'title', 'message'],
      },
      execute: async ({ type, title, message, defaultValue }) => {
        const t = String(type);
        const ti = String(title);
        const m = String(message);
        if (t === 'alert') {
          await ctx.showAlert(m, ti);
          return { success: true, response: 'acknowledged' };
        }
        if (t === 'confirm') {
          const result = await ctx.showConfirm(m, ti);
          return { success: true, response: result ? 'confirmed' : 'cancelled' };
        }
        if (t === 'prompt') {
          const result = await ctx.showPrompt(m, defaultValue ? String(defaultValue) : '');
          return { success: true, response: result };
        }
        return { error: 'Invalid dialog type' };
      },
    },

    // ─── App Management (desktop only) ────────────────────────────
    {
      name: 'launch_app',
      description: 'Launch an application by ID. Use list_available_apps to get valid IDs.',
      inputSchema: {
        type: 'object',
        properties: {
          appId: { type: 'string', description: 'Application ID to launch' },
        },
        required: ['appId'],
      },
      execute: ({ appId }) => {
        const blocked = skipIfNotDesktop(ctx);
        if (blocked) return blocked;
        if (typeof appId !== 'string') return { error: 'appId must be a string' };
        ctx.launchApp(appId);
        return { success: true, appId };
      },
    },
    {
      name: 'close_app',
      description: 'Close a running application.',
      inputSchema: {
        type: 'object',
        properties: {
          appId: { type: 'string', description: 'Application ID to close' },
        },
        required: ['appId'],
      },
      execute: ({ appId }) => {
        const blocked = skipIfNotDesktop(ctx);
        if (blocked) return blocked;
        if (typeof appId !== 'string') return { error: 'appId must be a string' };
        ctx.closeApp(appId);
        return { success: true, appId };
      },
    },
    {
      name: 'list_running_apps',
      description: 'List all currently running applications.',
      inputSchema: { type: 'object', properties: {} },
      execute: () => {
        const blocked = skipIfNotDesktop(ctx);
        if (blocked) return blocked;
        return { runningApps: ctx.openApps, windows: ctx.openWindows };
      },
    },
    {
      name: 'list_available_apps',
      description: 'List all application IDs that can be launched.',
      inputSchema: { type: 'object', properties: {} },
      execute: () => {
        return { apps: AVAILABLE_APP_IDS };
      },
    },

    // ─── Window Management (desktop only) ──────────────────────────
    {
      name: 'list_windows',
      description: 'List all open windows with their app association.',
      inputSchema: { type: 'object', properties: {} },
      execute: () => {
        const blocked = skipIfNotDesktop(ctx);
        if (blocked) return blocked;
        return { windows: ctx.openWindows, activeApp: ctx.activeApp };
      },
    },
    {
      name: 'focus_window',
      description: 'Bring a window to the front and focus it.',
      inputSchema: {
        type: 'object',
        properties: {
          windowId: { type: 'string', description: 'Window ID to focus' },
        },
        required: ['windowId'],
      },
      execute: ({ windowId }) => {
        const blocked = skipIfNotDesktop(ctx);
        if (blocked) return blocked;
        if (typeof windowId !== 'string') return { error: 'windowId must be a string' };
        ctx.setActiveWindow(windowId);
        return { success: true, windowId };
      },
    },
    {
      name: 'minimize_window',
      description: 'Minimize a window to the Dock.',
      inputSchema: {
        type: 'object',
        properties: {
          windowId: { type: 'string', description: 'Window ID to minimize' },
        },
        required: ['windowId'],
      },
      execute: ({ windowId }) => {
        const blocked = skipIfNotDesktop(ctx);
        if (blocked) return blocked;
        if (typeof windowId !== 'string') return { error: 'windowId must be a string' };
        ctx.minimizeWindow(windowId);
        return { success: true, windowId };
      },
    },
    {
      name: 'close_window',
      description: 'Close a specific window.',
      inputSchema: {
        type: 'object',
        properties: {
          windowId: { type: 'string', description: 'Window ID to close' },
        },
        required: ['windowId'],
      },
      execute: ({ windowId }) => {
        const blocked = skipIfNotDesktop(ctx);
        if (blocked) return blocked;
        if (typeof windowId !== 'string') return { error: 'windowId must be a string' };
        ctx.closeWindow(windowId);
        return { success: true, windowId };
      },
    },

    // ─── System Control ───────────────────────────────────────────
    {
      name: 'get_system_info',
      description: 'Get system information including battery, CPU, RAM, uptime and appearance.',
      inputSchema: { type: 'object', properties: {} },
      execute: () => {
        return {
          bootState: ctx.bootState,
          battery: ctx.battery,
          hardware: ctx.hardware,
          uptime: ctx.uptime,
          appearance: ctx.systemState.appearance,
          brightness: ctx.systemState.brightness,
          powerMode: ctx.powerMode,
          wifi: ctx.wifi,
          bluetooth: ctx.bluetooth,
          dnd: ctx.systemState.dndEnabled,
          dockPosition: ctx.systemState.dockPosition,
        };
      },
    },
    {
      name: 'get_desktop_state',
      description: 'Get a comprehensive summary of the current desktop and system state.',
      inputSchema: { type: 'object', properties: {} },
      execute: () => {
        return {
          bootState: ctx.bootState,
          runningApps: ctx.openApps,
          windows: ctx.openWindows,
          activeApp: ctx.activeApp,
          battery: ctx.battery,
          hardware: ctx.hardware,
          uptime: ctx.uptime,
          appearance: ctx.systemState.appearance,
          brightness: ctx.systemState.brightness,
          powerMode: ctx.powerMode,
          wifi: ctx.wifi,
          bluetooth: ctx.bluetooth,
          music: ctx.systemState.music,
          dnd: ctx.systemState.dndEnabled,
          isInfected: ctx.systemState.isSystemInfected,
        };
      },
    },
    {
      name: 'set_appearance',
      description: 'Switch between light, dark, or auto appearance mode.',
      inputSchema: {
        type: 'object',
        properties: {
          mode: { type: 'string', enum: ['light', 'dark', 'auto'] },
        },
        required: ['mode'],
      },
      execute: ({ mode }) => {
        if (!['light', 'dark', 'auto'].includes(mode as string)) {
          return { error: 'mode must be light, dark, or auto' };
        }
        ctx.updateSystemState({ appearance: mode });
        return { success: true, mode };
      },
    },
    {
      name: 'set_power_mode',
      description: 'Set the system power mode.',
      inputSchema: {
        type: 'object',
        properties: {
          mode: { type: 'string', enum: ['Low Power', 'Normal', 'High Performance'] },
        },
        required: ['mode'],
      },
      execute: ({ mode }) => {
        if (!['Low Power', 'Normal', 'High Performance'].includes(mode as string)) {
          return { error: 'mode must be Low Power, Normal, or High Performance' };
        }
        ctx.setPowerMode(mode as 'Low Power' | 'Normal' | 'High Performance');
        return { success: true, mode };
      },
    },
    {
      name: 'set_brightness',
      description: 'Set display brightness (0-100).',
      inputSchema: {
        type: 'object',
        properties: {
          value: { type: 'number', minimum: 0, maximum: 100, description: 'Brightness 0-100' },
        },
        required: ['value'],
      },
      execute: ({ value }) => {
        const v = Number(value);
        if (isNaN(v) || v < 0 || v > 100) return { error: 'value must be 0-100' };
        ctx.updateSystemState({ brightness: v });
        return { success: true, brightness: v };
      },
    },
    {
      name: 'toggle_wifi',
      description: 'Toggle WiFi on or off.',
      inputSchema: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
        },
        required: ['enabled'],
      },
      execute: ({ enabled }) => {
        ctx.setWifi(Boolean(enabled));
        return { success: true, wifi: Boolean(enabled) };
      },
    },
    {
      name: 'toggle_bluetooth',
      description: 'Toggle Bluetooth on or off.',
      inputSchema: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
        },
        required: ['enabled'],
      },
      execute: ({ enabled }) => {
        ctx.setBluetooth(Boolean(enabled));
        return { success: true, bluetooth: Boolean(enabled) };
      },
    },
    {
      name: 'send_notification',
      description: 'Send a system notification.',
      inputSchema: {
        type: 'object',
        properties: {
          appId: { type: 'string', description: 'App identifier for the notification' },
          title: { type: 'string', description: 'Notification title' },
          message: { type: 'string', description: 'Notification body text' },
        },
        required: ['appId', 'title', 'message'],
      },
      execute: ({ appId, title, message }) => {
        ctx.addNotification({
          appId: String(appId),
          title: String(title),
          message: String(message),
        });
        return { success: true };
      },
    },
    {
      name: 'shutdown',
      description: 'Initiate system shutdown. Available in any state.',
      inputSchema: { type: 'object', properties: {} },
      execute: () => {
        ctx.initiateShutdown();
        return { success: true, message: 'System shutting down...' };
      },
    },
    {
      name: 'restart',
      description: 'Initiate system restart. Available in any state.',
      inputSchema: { type: 'object', properties: {} },
      execute: () => {
        ctx.initiateRestart();
        return { success: true, message: 'System restarting...' };
      },
    },

    // ─── File System ──────────────────────────────────────────────
    {
      name: 'list_directory',
      description: 'List contents of a directory by node ID. Use "root" for Macintosh HD.',
      inputSchema: {
        type: 'object',
        properties: {
          nodeId: { type: 'string', description: 'Directory node ID (use "root" for Macintosh HD)' },
        },
        required: ['nodeId'],
      },
      execute: ({ nodeId }) => {
        const id = nodeId === 'root' ? 'root' : String(nodeId);
        const contents = ctx.fsGetDirectoryContents(id);
        const path = ctx.fsGetPath(id);
        return { path: path.map((n) => n.name), contents };
      },
    },
    {
      name: 'read_file',
      description: 'Read the content of a file by node ID.',
      inputSchema: {
        type: 'object',
        properties: {
          nodeId: { type: 'string', description: 'File node ID' },
        },
        required: ['nodeId'],
      },
      execute: ({ nodeId }) => {
        const node = ctx.fsFindNode(String(nodeId));
        if (!node) return { error: 'Node not found' };
        if (node.type !== 'file') return { error: 'Node is not a file' };
        const content = ctx.fsGetNodeContent((node as any).content);
        return { name: node.name, content };
      },
    },
    {
      name: 'create_file',
      description: 'Create a new file in a directory.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'File name with extension' },
          parentId: { type: 'string', description: 'Parent directory node ID' },
          content: { type: 'string', description: 'Optional file content' },
        },
        required: ['name', 'parentId'],
      },
      execute: ({ name, parentId, content }) => {
        ctx.fsCreateNode({
          name: String(name),
          type: 'file',
          parentId: String(parentId),
          content: content ? String(content) : undefined,
        });
        return { success: true, name: String(name) };
      },
    },
    {
      name: 'create_folder',
      description: 'Create a new folder in a directory.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Folder name' },
          parentId: { type: 'string', description: 'Parent directory node ID' },
        },
        required: ['name', 'parentId'],
      },
      execute: ({ name, parentId }) => {
        ctx.fsCreateNode({
          name: String(name),
          type: 'folder',
          parentId: String(parentId),
        });
        return { success: true, name: String(name) };
      },
    },
    {
      name: 'delete_node',
      description: 'Move a file or folder to Trash.',
      inputSchema: {
        type: 'object',
        properties: {
          nodeId: { type: 'string', description: 'Node ID to delete' },
        },
        required: ['nodeId'],
      },
      execute: ({ nodeId }) => {
        const node = ctx.fsFindNode(String(nodeId));
        if (!node) return { error: 'Node not found' };
        ctx.fsDeleteNode(String(nodeId));
        return { success: true, name: node.name, movedToTrash: true };
      },
    },
    {
      name: 'search_files',
      description: 'Search for files by name across the file system.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search term' },
        },
        required: ['query'],
      },
      execute: ({ query }) => {
        const q = String(query).toLowerCase();
        const results = ctx.fsNodes.filter(
          (n) => n.name.toLowerCase().includes(q) && n.parentId !== 'trash',
        );
        return { query, results: results.map((n) => ({ id: n.id, name: n.name, type: n.type })) };
      },
    },
    {
      name: 'get_file_info',
      description: 'Get metadata and path for a file or folder by node ID.',
      inputSchema: {
        type: 'object',
        properties: {
          nodeId: { type: 'string', description: 'Node ID' },
        },
        required: ['nodeId'],
      },
      execute: ({ nodeId }) => {
        const node = ctx.fsFindNode(String(nodeId));
        if (!node) return { error: 'Node not found' };
        const path = ctx.fsGetPath(String(nodeId));
        return {
          ...node,
          path: path.map((n) => n.name),
        };
      },
    },

    // ─── Media Control (desktop only) ──────────────────────────────
    {
      name: 'play_music',
      description: 'Start music playback. Optionally specify a track index.',
      inputSchema: {
        type: 'object',
        properties: {
          index: { type: 'number', description: 'Optional track index to play' },
        },
      },
      execute: ({ index }) => {
        const blocked = skipIfNotDesktop(ctx);
        if (blocked) return blocked;
        ctx.playSong(index !== undefined ? Number(index) : undefined);
        return { success: true, isPlaying: true };
      },
    },
    {
      name: 'pause_music',
      description: 'Pause music playback.',
      inputSchema: { type: 'object', properties: {} },
      execute: () => {
        const blocked = skipIfNotDesktop(ctx);
        if (blocked) return blocked;
        ctx.pauseSong();
        return { success: true, isPlaying: false };
      },
    },
    {
      name: 'next_track',
      description: 'Skip to the next track.',
      inputSchema: { type: 'object', properties: {} },
      execute: () => {
        const blocked = skipIfNotDesktop(ctx);
        if (blocked) return blocked;
        ctx.nextSong();
        return { success: true };
      },
    },
    {
      name: 'previous_track',
      description: 'Go back to the previous track.',
      inputSchema: { type: 'object', properties: {} },
      execute: () => {
        const blocked = skipIfNotDesktop(ctx);
        if (blocked) return blocked;
        ctx.prevSong();
        return { success: true };
      },
    },
    {
      name: 'set_volume',
      description: 'Set the system volume (0.0 to 1.0).',
      inputSchema: {
        type: 'object',
        properties: {
          volume: { type: 'number', minimum: 0, maximum: 1, description: 'Volume 0.0 to 1.0' },
        },
        required: ['volume'],
      },
      execute: ({ volume }) => {
        const v = Number(volume);
        if (isNaN(v) || v < 0 || v > 1) return { error: 'volume must be 0.0 to 1.0' };
        ctx.setVolume(v);
        return { success: true, volume: v };
      },
    },

    // ─── Music Search (desktop only) ───────────────────────────
    {
      name: 'search_music',
      description: 'Search the music library by song title or artist name. Returns matching tracks with title, artist, and cover.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query (title or artist)' },
        },
        required: ['query'],
      },
      execute: ({ query }) => {
        const q = String(query || '').toLowerCase().trim();
        if (!q) return { results: [], total: 0 };
        const results = songs
          .filter((s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q))
          .map((s) => ({
            id: s.id,
            index: songs.findIndex((x) => x.id === s.id),
            title: s.title,
            artist: s.artist,
            cover: s.cover,
          }));
        return { results, total: results.length, query };
      },
    },
  ];
}
