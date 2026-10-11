/**
 * WebMCP host shim.
 *
 * The WebMCP panel in DevTools reads tools from `document.modelContext`. That
 * object is supplied by a host — normally the standalone mcp-server, via its
 * bridge page, or a browser extension. With neither running there is no host,
 * so the panel reports "No tools have been registered" even though the app has
 * 42 perfectly good tools.
 *
 * This installs a minimal in-page host when one is absent, so the tools are
 * registered and discoverable without any second process. If a real host is
 * already present it is left completely alone.
 */

export type WebMCPToolDefinition = {
  name: string;
  description?: string;
  inputSchema?: unknown;
  annotations?: unknown;
  execute?: (params: Record<string, unknown>, opts?: { signal?: AbortSignal }) => unknown;
};

type Registration = {
  tool: WebMCPToolDefinition;
  controller: AbortController;
};

declare global {
  interface Document {
    modelContext?: {
      registerTool: (
        def: WebMCPToolDefinition,
        opts?: { signal?: AbortSignal },
      ) => Promise<void> | void;
      unregisterTool?: (name: string) => Promise<void> | void;
      listTools?: () => Promise<WebMCPToolDefinition[]> | WebMCPToolDefinition[];
      callTool?: (
        name: string,
        args?: Record<string, unknown>,
      ) => Promise<unknown>;
    };
  }
}

/**
 * Announce a change. The panel polls some hosts and listens for events on
 * others; firing both a namespaced and a generic event covers either, and is
 * harmless if nobody is listening.
 */
function announce(event: string, detail?: unknown): void {
  if (typeof document === 'undefined') return;
  try {
    document.dispatchEvent(
      new CustomEvent(event, { detail, bubbles: false }),
    );
    document.dispatchEvent(new CustomEvent('webmcp', { detail, bubbles: false }));
  } catch {
    /* CustomEvent unavailable: the panel will fall back to polling */
  }
}

/**
 * Returns true when this module installed the shim, false when a real host was
 * already present. Callers can use it to decide whether to log a hint.
 */
export function ensureWebMCPHost(): boolean {
  if (typeof document === 'undefined') return false;
  if (document.modelContext?.registerTool) return false; // a real host wins

  const registry = new Map<string, Registration>();

  document.modelContext = {
    async registerTool(def, opts) {
      const controller = new AbortController();

      // Respect an AbortSignal from the caller: WebMCPTools registers all 42
      // tools and aborts them together on unmount.
      if (opts?.signal) {
        if (opts.signal.aborted) return;
        opts.signal.addEventListener('abort', () => {
          registry.delete(def.name);
          announce('webmcp:toolchange', { name: def.name, removed: true });
        });
      }

      registry.set(def.name, { tool: def, controller });
      announce('webmcp:toolchange', { name: def.name, removed: false });
    },

    async unregisterTool(name) {
      registry.delete(name);
      announce('webmcp:toolchange', { name, removed: true });
    },

    async listTools() {
      return [...registry.values()].map((r) => r.tool);
    },

    async callTool(name, args = {}) {
      const entry = registry.get(name);
      if (!entry) throw new Error(`Unknown tool: ${name}`);
      const result = await entry.tool.execute?.(args, {
        signal: entry.controller.signal,
      });
      // MCP tool results are wrapped so a value is never mistaken for an error.
      return {
        content: [{ type: 'text', text: JSON.stringify(result ?? null, null, 2) }],
        isError: false,
      };
    },
  };

  announce('webmcp:hostready');
  shimmed = true;
  return true;
}

/** True when the page is using this shim rather than a real host. */
let shimmed = false;

export function isShimmed(): boolean {
  return shimmed;
}
