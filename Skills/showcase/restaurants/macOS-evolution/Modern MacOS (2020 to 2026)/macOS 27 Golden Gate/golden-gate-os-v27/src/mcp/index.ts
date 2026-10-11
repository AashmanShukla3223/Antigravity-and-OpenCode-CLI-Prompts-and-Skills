export { WebMCPTools } from './WebMCPTools';
export { MCPBridge } from './MCPBridge';
export { buildTools } from './tools';
export { installConsoleApi, uninstallConsoleApi } from './consoleApi';
export { installBridgeClient, connectBridge } from './bridgeClient';
export type { GoldenGateConsole, ConsoleToolSummary } from './consoleApi';
export type { BridgeState } from './bridgeClient';
export type {
  MCPToolDefinition,
  MCPToolRequest,
  MCPToolResponse,
  MCPToolContext,
  BootState,
} from './types';
export {
  MCP_BROADCAST_CHANNEL,
  MCP_WS_PORTS,
  AVAILABLE_APP_IDS,
} from './types';
