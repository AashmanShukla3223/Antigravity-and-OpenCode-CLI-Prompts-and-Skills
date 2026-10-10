#!/usr/bin/env bash
# Refresh the India 360 snapshot from the analytics MCP.
# Stable entry point for cron: resolves node and analytics-mcp at run time,
# because cron does not inherit the login PATH.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

find_node() {
  if command -v node >/dev/null 2>&1; then command -v node; return; fi
  for p in "$HOME"/.local/share/fnm/node-versions/*/installation/bin/node \
           "$HOME"/.nvm/versions/node/*/bin/node \
           /usr/local/bin/node /usr/bin/node; do
    [ -x "$p" ] && { echo "$p"; return; }
  done
  return 1
}

NODE="$(find_node)" || { echo "[india360] node not found" >&2; exit 1; }
exec "$NODE" scripts/fetch-india360.mjs "$@"
