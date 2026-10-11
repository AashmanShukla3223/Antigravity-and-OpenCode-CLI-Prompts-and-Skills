/**
 * WebMCP host shim.
 *
 * Chrome's WebMCP API lives on `document.modelContext` and follows a specific
 * shape that is NOT the MCP JSON-RPC shape:
 *
 *   await document.modelContext.registerTool(tool, { signal, exposedTo })
 *   await document.modelContext.getTools({ fromOrigins })
 *   await document.modelContext.executeTool(tool, args, { signal })
 *   document.modelContext.addEventListener('toolchange', fn)
 *
 * An earlier version of this shim used MCP-style names (listTools/callTool),
 * which no WebMCP consumer looks for. This version matches the spec.
 *
 * IMPORTANT: a shim living in page JS cannot make tools visible to a
 * browser-side DevTools panel, which reads the browser's own registry rather
 * than the page's object. For the panel, enable chrome://flags and use the
 * native API. See README "WebMCP".
 */

export type WebMCPToolDefinition = {
  name: string;
  title?: string;
  description?: string;
  inputSchema?: unknown;
  annotations?: unknown;
  execute?: (
    params: Record<string, unknown>,
    opts?: { signal?: AbortSignal },
  ) => unknown;
};

/** What getTools() returns: the definition plus browser-added metadata. */
export type WebMCPDiscoveredTool = WebMCPToolDefinition & {
  origin?: string;
  window?: unknown;
};

type Registration = {
  tool: WebMCPToolDefinition;
  controller: AbortController;
  exposedTo?: string[];
};

export type ModelContextHost = {
  registerTool: (
    def: WebMCPToolDefinition,
    opts?: { signal?: AbortSignal; exposedTo?: string[] },
  ) => Promise<void> | void;
  unregisterTool?: (name: string) => Promise<void> | void;
  /** Spec name. */
  getTools?: (opts?: { fromOrigins?: string[] }) => Promise<WebMCPDiscoveredTool[]>;
  /** Spec name. */
  executeTool?: (
    tool: WebMCPToolDefinition | string,
    args?: Record<string, unknown>,
    opts?: { signal?: AbortSignal },
  ) => Promise<unknown>;
  addEventListener?: (type: string, fn: () => void) => void;
  removeEventListener?: (type: string, fn: () => void) => void;
  dispatchEvent?: (ev: Event) => boolean;
  /** MCP-style aliases, kept so non-WebMCP callers still work. */
  listTools?: () => Promise<WebMCPDiscoveredTool[]>;
  callTool?: (
    name: string,
    args?: Record<string, unknown>,
  ) => Promise<unknown>;
};

declare global {
  interface Document {
    modelContext?: ModelContextHost;
  }
  interface Navigator {
    modelContext?: ModelContextHost;
  }
}

export function hostTargets(): ModelContextHost[] {
  if (typeof window === 'undefined') return [];
  return [
    (window.document as any)?.modelContext,
    (window.navigator as any)?.modelContext,
  ]
    .filter((h): h is ModelContextHost => !!h?.registerTool)
    .filter((h, i, all) => all.indexOf(h) === i);
}

export function ensureWebMCPHost(): ModelContextHost[] {
  if (typeof window === 'undefined') return [];
  const installed: ModelContextHost[] = [];

  const makeShim = (): ModelContextHost => {
    const registry = new Map<string, Registration>();
    const listeners = new Set<() => void>();

    const fire = () => {
      // Spec event name is `toolchange` on the modelContext object itself.
      try {
        const ev = new Event('toolchange');
        (host as any).dispatchEvent?.(ev);
      } catch {
        /* Event may be unavailable; listeners are called below regardless */
      }
      for (const fn of listeners) {
        try {
          fn();
        } catch {
          /* a bad listener must not break registration */
        }
      }
    };

    const resolve = (tool: WebMCPToolDefinition | string) => {
      const name = typeof tool === 'string' ? tool : tool?.name;
      const entry = registry.get(name);
      if (!entry) throw new DOMException(`Unknown tool: ${name}`, 'NotFoundError');
      return entry;
    };

    const host: ModelContextHost = {
      async registerTool(def, opts) {
        if (!def?.name) throw new TypeError('registerTool requires a name');
        if (registry.has(def.name)) {
          throw new DOMException(
            `A tool named "${def.name}" is already registered.`,
            'InvalidStateError',
          );
        }
        const controller = new AbortController();

        if (opts?.signal) {
          if (opts.signal.aborted) return;
          opts.signal.addEventListener('abort', () => {
            registry.delete(def.name);
            fire();
          });
        }

        registry.set(def.name, { tool: def, controller, exposedTo: opts?.exposedTo });
        fire();
      },

      async unregisterTool(name) {
        registry.delete(name);
        fire();
      },

      async getTools(opts) {
        const from = opts?.fromOrigins;
        return [...registry.values()]
          .filter((r) => !from || !r.exposedTo?.length || r.exposedTo.some((o) => from.includes(o)))
          .map((r) => ({
            ...r.tool,
            // Read through window, not the bare global: `location` is not
            // reliably a global in every context (workers, some test DOMs).
            origin: typeof window !== 'undefined' ? window.location?.origin : undefined,
            window: typeof window !== 'undefined' ? window : undefined,
          }))
          .sort((a, b) => a.name.localeCompare(b.name)); // spec: alphabetical
      },

      async executeTool(tool, args = {}, opts) {
        const entry = resolve(tool);
        // The real API returns the handler's value directly, not an MCP
        // content wrapper, so tools can return plain strings or objects.
        return entry.tool.execute?.(args ?? {}, {
          signal: opts?.signal ?? entry.controller.signal,
        });
      },

      addEventListener(type, fn) {
        if (type === 'toolchange') listeners.add(fn);
      },
      removeEventListener(type, fn) {
        if (type === 'toolchange') listeners.delete(fn);
      },
      dispatchEvent: () => true,

      // MCP-style aliases
      listTools: () => host.getTools!(),
      callTool: async (name, args) => {
        const entry = registry.get(name);
        if (!entry) return { error: `Unknown tool: ${name}` };
        try {
          return await entry.tool.execute?.(args ?? {}, {
            signal: entry.controller.signal,
          });
        } catch (e) {
          return { error: (e as Error)?.message ?? String(e) };
        }
      },
    };

    return host;
  };

  const doc = window.document as any;
  if (!doc.modelContext?.registerTool) {
    doc.modelContext = makeShim();
    installed.push(doc.modelContext);
  }

  const nav = window.navigator as any;
  if (!nav.modelContext?.registerTool) {
    nav.modelContext = makeShim();
    installed.push(nav.modelContext);
  }

  if (installed.length) shimmed = true;
  return installed;
}

let shimmed = false;

/** True when the page is using this shim rather than a native host. */
export function isShimmed(): boolean {
  return shimmed;
}
