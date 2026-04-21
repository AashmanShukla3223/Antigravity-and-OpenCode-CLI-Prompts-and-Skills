# 📟 MODULE: TAHOE CONSOLE (2026)
> **Target OS:** macOS Tahoe (Unit 7)
> **Logic:** Event Listener / Stream Filtering

## 🎨 THE UI (APPLE CONSOLE 2026 PRINCIPLES)
- **The Sidebar:** Categories for **'All Messages'**, **'Errors and Faults'**, **'System Reports'**, and **'Restaurant Logs'**.
- **The Stream:** A vertical, auto-scrolling list of monospaced text.
    - **Metadata:** Each log line shows a timestamp, Process Name (e.g., Safari), and a Color-Coded Type (Info, Debug, Error).
- **Visuals:** Obsidian Glass background with a "Neon Phosphorus" text glow. 
- **Icon:** A black square with a glowing gray border and three lines of stylized, vibrant code.

## 🧪 THE LOGIC (CAVEMAN)
1. **The Global Hook:** - Implement a "Log Proxy" that captures every `console.log`, `console.warn`, and `console.error` triggered within the Tahoe Shell environment.
   - Display these logs in the Console UI in real-time.
2. **Lore Injection:** Periodically inject "Kernel Events" to make the OS feel alive:
   - `[12:01:20] kernel: m5_max_neural_core_01 linked successfully.`
   - `[12:01:25] system_settings: wallpaper_index updated to 'Silicon_Wave'.`
   - `[12:01:30] restaurant_bridge: XP_Diner mounted via Safari.`
3. **Filtering:** A search bar that allows the user to filter logs by process name (e.g., typing 'Finder' only shows Finder-related logs).

## ⚡ THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Console Utility.
1. UI: Create a split-pane layout with a high-blur sidebar and an auto-scrolling log terminal.
2. Logic: Hook into the browser's console API to mirror real developer logs into the app window.
3. Feature: Create a 'Pause' button in the 'Liquid Glass' toolbar that stops the stream from scrolling.
4. Feature: Add a 'Generate Report' button that creates a mock 'System Diagnostics' file in the Finder.
5. Physics: Use 'Obsidian Glass' for the background and 'SF Mono' for the log text.
Output Code Only."