import { useEffect, useRef } from 'react';
import { useSystem } from '../contexts/SystemContext';
import { useFileSystem } from '../contexts/FileSystemContext';
import { buildTools } from './tools';
import type { MCPToolContext } from './types';

export const WebMCPTools = () => {
  const sys = useSystem();
  const fs = useFileSystem();
  const registered = useRef(false);

  useEffect(() => {
    const mc = (document as any).modelContext;
    if (!mc?.registerTool) return;
    if (registered.current) return;
    registered.current = true;

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
            execute: async (params: Record<string, unknown>) => {
              try {
                return await tool.execute(params);
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
      registered.current = false;
    };
  }, [
    sys.bootState, sys.setBootState, sys.resetSystem,
    sys.switchUser, sys.verifyPassword, sys.showAlert, sys.showConfirm, sys.showPrompt,
    sys.launchApp, sys.closeApp, sys.openWindows, sys.openApps,
    sys.closeWindow, sys.minimizeWindow, sys.unminimizeWindow,
    sys.toggleMaximizeWindow, sys.setActiveWindow, sys.activeApp,
    sys.updateSystemState, sys.setPowerMode, sys.setWifi, sys.setBluetooth,
    sys.addNotification, sys.playSong, sys.pauseSong, sys.nextSong,
    sys.prevSong, sys.setVolume, sys.initiateShutdown, sys.initiateRestart,
    sys.triggerSystemError,
    sys.systemState, sys.battery, sys.hardware, sys.uptime,
    sys.wifi, sys.bluetooth, sys.powerMode,
    fs.nodes, fs.createNode, fs.updateNode, fs.deleteNode,
    fs.getDirectoryContents, fs.getPath, fs.findNode, fs.getNodeContent,
    fs.emptyTrash, fs.restoreSystemNodes,
  ]);

  return null;
};
