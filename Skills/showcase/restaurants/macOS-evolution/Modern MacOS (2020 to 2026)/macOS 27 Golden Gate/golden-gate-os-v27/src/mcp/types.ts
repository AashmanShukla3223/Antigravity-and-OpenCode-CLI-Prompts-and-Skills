export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
  execute: (params: Record<string, unknown>) => unknown | Promise<unknown>;
}

export interface MCPToolRequest {
  id: string;
  tool: string;
  params: Record<string, unknown>;
}

export interface MCPToolResponse {
  id: string;
  result?: unknown;
  error?: string;
}

export type BootState = 'booting' | 'setup' | 'login' | 'desktop' | 'recovery' | 'activation';

export interface MCPToolContext {
  // Boot lifecycle
  bootState: BootState;
  setBootState: (state: BootState) => void;
  resetSystem: (targetState?: BootState) => void;
  switchUser: (userId: string) => void;
  verifyPassword: (password: string) => boolean;
  showAlert: (message: string, title?: string) => Promise<void>;
  showConfirm: (message: string, title?: string) => Promise<boolean>;
  showPrompt: (message: string, defaultValue?: string, title?: string) => Promise<string | null>;

  // App management
  launchApp: (appId: string) => void;
  closeApp: (appId: string) => void;
  openWindows: Array<{ id: string; appId: string }>;
  openApps: string[];

  // Window management
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  unminimizeWindow: (windowId: string) => void;
  toggleMaximizeWindow: (windowId: string) => void;
  setActiveWindow: (id: string | null) => void;
  activeApp: string | null;

  // System control
  updateSystemState: (updates: Record<string, unknown>) => void;
  setPowerMode: (mode: 'Low Power' | 'Normal' | 'High Performance') => void;
  setWifi: (val: boolean) => void;
  setBluetooth: (val: boolean) => void;
  addNotification: (notif: { appId: string; title: string; message: string }) => void;
  playSong: (index?: number) => void;
  pauseSong: () => void;
  nextSong: () => void;
  prevSong: () => void;
  setVolume: (val: number) => void;
  initiateShutdown: () => void;
  initiateRestart: () => void;
  triggerSystemError: () => void;

  // State
  systemState: {
    appearance: string;
    brightness: number;
    dockPosition: string;
    dndEnabled: boolean;
    wallpaperUrl: string;
    isSystemInfected: boolean;
    setup_complete: boolean;
    music: { isPlaying: boolean; volume: number; currentSongIndex: number };
    users: Array<{ id: string; fullName: string; accountName: string; avatar?: string }>;
  };
  battery: { level: number; isCharging: boolean };
  hardware: { cores: number; memory?: number };
  uptime: number;
  wifi: boolean;
  bluetooth: boolean;
  powerMode: string;

  // File system
  fsNodes: Array<{
    id: string;
    name: string;
    type: string;
    parentId: string | null;
    content?: string;
    size?: number;
    modifiedAt: number;
  }>;
  fsCreateNode: (node: {
    name: string;
    type: 'file' | 'folder';
    parentId: string;
    content?: string;
  }) => void;
  fsUpdateNode: (id: string, updates: Record<string, unknown>) => void;
  fsDeleteNode: (id: string) => void;
  fsGetDirectoryContents: (folderId: string | null) => Array<{
    id: string;
    name: string;
    type: string;
    parentId: string | null;
  }>;
  fsGetPath: (nodeId: string | null) => Array<{ id: string; name: string }>;
  fsFindNode: (id: string) => { id: string; name: string; type: string; parentId: string | null } | undefined;
  fsGetNodeContent: (content: string | undefined) => string | undefined;
  fsEmptyTrash: () => void;
  fsRestoreSystemNodes: () => void;
  getSystemState: () => Record<string, unknown>;
}

export const MCP_BROADCAST_CHANNEL = 'golden-gate-mcp';
export const MCP_WS_PORT = 9876;
export const MCP_WS_URL = `ws://localhost:${MCP_WS_PORT}`;

export const AVAILABLE_APP_IDS = [
  'finder', 'safari', 'messages', 'mail', 'maps', 'photos', 'facetime',
  'phone', 'calendar', 'contacts', 'notes', 'reminders', 'music', 'tv',
  'keynote', 'numbers', 'pages', 'appstore', 'books', 'wallet', 'games',
  'iphonemirroring', 'siriai', 'settings', 'terminal', 'activitymonitor',
  'calculator', 'weather', 'clock', 'stickies', 'freeform', 'photobooth',
  'quicktime', 'preview', 'voice-memos', 'dictation', 'fontbook', 'color-picker',
  'diskutility', 'timemachine', 'sounds', 'codeviewer', 'github',
  'xcode', 'finalcutpro', 'logicpro', 'motion', 'pixelmatorpro',
  'vmwarefusion', 'samsungtv', 'minecraft', 'chess', 'ekg',
];
