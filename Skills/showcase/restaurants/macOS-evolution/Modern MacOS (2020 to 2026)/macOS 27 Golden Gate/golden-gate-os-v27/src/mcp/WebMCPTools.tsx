import { useEffect, useRef } from 'react';
import { useSystem } from '../contexts/SystemContext';
import { useFileSystem } from '../contexts/FileSystemContext';
import { buildTools } from './tools';
import type { MCPToolContext } from './types';

export const WebMCPTools = () => {
  const sys = useSystem();
  const fs = useFileSystem();

  // Register exactly once. An earlier version re-ran this effect on every
  // system-state change, which aborted and re-registered all 42 tools each
  // time (~750 registerTool calls during a single boot). Agents holding a
  // tool reference would see it invalidated mid-session.
  // The live context is kept in a ref instead, so handlers always read the
  // current state without needing to re-register.
  const ctxRef = useRef<{ sys: ReturnType<typeof useSystem>; fs: ReturnType<typeof useFileSystem> }>({
    sys,
    fs,
  });
  ctxRef.current = { sys, fs };

  useEffect(() => {
    const mc = (document as any).modelContext;
    if (!mc?.registerTool) return;

    const { sys, fs } = ctxRef.current;
    const ctx: MCPToolContext = {
      bootState: sys.bootState,
      setBootState: sys.setBootState,
      resetSystem: sys.resetSystem,
      switchUser: sys.switchUser,
      verifyPassword: sys.verifyPassword,
      showAlert: sys.showAlert,
      showConfirm: sys.showConfirm,
      showPrompt: sys.showPrompt,
      launchApp: sys.launchApp,
      closeApp: sys.closeApp,
      openWindows: sys.openWindows,
      openApps: sys.openApps,
      closeWindow: sys.closeWindow,
      minimizeWindow: sys.minimizeWindow,
      unminimizeWindow: sys.unminimizeWindow,
      toggleMaximizeWindow: sys.toggleMaximizeWindow,
      setActiveWindow: sys.setActiveWindow,
      activeApp: sys.activeApp,
      updateSystemState: sys.updateSystemState,
      setPowerMode: sys.setPowerMode,
      setWifi: sys.setWifi,
      setBluetooth: sys.setBluetooth,
      addNotification: sys.addNotification,
      playSong: sys.playSong,
      pauseSong: sys.pauseSong,
      nextSong: sys.nextSong,
      prevSong: sys.prevSong,
      setVolume: sys.setVolume,
      initiateShutdown: sys.initiateShutdown,
      initiateRestart: sys.initiateRestart,
      triggerSystemError: sys.triggerSystemError,
      systemState: sys.systemState,
      battery: sys.battery,
      hardware: sys.hardware,
      uptime: sys.uptime,
      wifi: sys.wifi,
      bluetooth: sys.bluetooth,
      powerMode: sys.powerMode,
      fsNodes: fs.nodes,
      fsCreateNode: fs.createNode,
      fsUpdateNode: fs.updateNode,
      fsDeleteNode: fs.deleteNode,
      fsGetDirectoryContents: fs.getDirectoryContents,
      fsGetPath: fs.getPath,
      fsFindNode: fs.findNode,
      fsGetNodeContent: fs.getNodeContent,
      fsEmptyTrash: fs.emptyTrash,
      fsRestoreSystemNodes: fs.restoreSystemNodes,
      getSystemState: () => ({ ...sys.systemState }),
    };

    const tools = buildTools(ctx);
    const controllers: AbortController[] = [];

    for (const tool of tools) {
      try {
        const ctrl = new AbortController();
        mc.registerTool(
          {
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
            ...(tool.annotations ? { annotations: tool.annotations } : {}),
            execute: async (
              params: Record<string, unknown>,
              opts?: { signal?: AbortSignal },
            ) => {
              try {
                return await tool.execute(params, opts);
              } catch (e: any) {
                return { error: e?.message || String(e) };
              }
            },
          },
          { signal: ctrl.signal },
        );
        controllers.push(ctrl);
      } catch {
        // browser doesn't support this tool registration
      }
    }

    return () => {
      for (const ctrl of controllers) ctrl.abort();
    };
    // Registration is one-shot; live state is read via ctxRef.
  }, []);

  return null;
};
