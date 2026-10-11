/**
 * Golden Gate console API.
 *
 * Publishes the MCP tool registry on `window.goldenGate` so every tool is
 * reachable from the DevTools console with no server, bridge or extension:
 *
 *   goldenGate.tools                    // all 42 definitions
 *   goldenGate.names                    // just the names
 *   goldenGate.schema('launch_app')     // input schema for one tool
 *   await goldenGate.call('launch_app', { appId: 'safari' })
 *   await goldenGate.status()           // system status, same as get_system_status
 *
 * This is the same registry the MCP host registers, built from the same
 * context, so the console and an agent can never drift apart.
 */

import { buildTools } from './tools';
import type { MCPToolContext } from './types';

export type ConsoleToolSummary = {
  name: string;
  description: string;
};

export type GoldenGateConsole = {
  tools: ReturnType<typeof buildTools>;
  names: string[];
  schema: (name: string) => unknown;
  call: (name: string, params?: Record<string, unknown>) => Promise<unknown>;
  status: () => Promise<unknown>;
  /** Register the context. Called once by WebMCPTools. */
  _install: (ctx: MCPToolContext) => void;
};

declare global {
  interface Window {
    goldenGate?: GoldenGateConsole;
  }
}

function install(ctx: MCPToolContext): void {
  const tools = buildTools(ctx);
  const byName = new Map(tools.map((t) => [t.name, t]));

  const api: GoldenGateConsole = {
    tools,
    names: tools.map((t) => t.name),

    schema(name: string) {
      const t = byName.get(name);
      if (!t) {
        throw new Error(
          `Unknown tool "${name}". Try: goldenGate.names.join(', ')`,
        );
      }
      return { name: t.name, description: t.description, inputSchema: t.inputSchema };
    },

    async call(name, params = {}) {
      const t = byName.get(name);
      if (!t) {
        throw new Error(
          `Unknown tool "${name}". Try: goldenGate.names.join(', ')`,
        );
      }
      try {
        return await t.execute(params);
      } catch (e) {
        return { error: (e as Error)?.message ?? String(e) };
      }
    },

    async status() {
      return api.call('get_system_status');
    },

    _install() {
      /* set below */
    },
  };

  window.goldenGate = api;

  // A single console line, so it is obvious the API is live without having to
  // go looking for it.
  console.info(
    `%c Golden Gate %c ${tools.length} tools on window.goldenGate — try goldenGate.names`,
    'background:#111;color:#fff;padding:2px 6px;border-radius:3px 0 0 3px;font-weight:700',
    'background:linear-gradient(90deg,#eea82d,#963e60,#1a2a60);color:#fff;padding:2px 8px;border-radius:0 3px 3px 0',
  );
}

export function installConsoleApi(ctx: MCPToolContext): void {
  if (typeof window === 'undefined') return;
  install(ctx);
}

/** Remove the global. Used on unmount so a reload does not leave a stale handle. */
export function uninstallConsoleApi(): void {
  if (typeof window !== 'undefined') delete window.goldenGate;
}

export const summarize = (t: { name: string; description: string }): ConsoleToolSummary => ({
  name: t.name,
  description: t.description,
});
