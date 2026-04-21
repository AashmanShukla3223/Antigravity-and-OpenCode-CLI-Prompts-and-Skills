# PRD: 📟 MODULE: TAHOE CONSOLE (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Console

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Console` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Console` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Console` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE CONSOLE 2026 PRINCIPLES)
- **The Sidebar:** Categories for **'All Messages'**, **'Errors and Faults'**, **'System Reports'**, and **'Restaurant Logs'**.
- **The Stream:** A vertical, auto-scrolling list of monospaced text.
    - **Metadata:** Each log line shows a timestamp, Process Name (e.g., Safari), and a Color-Coded Type (Info, Debug, Error).
- **Visuals:** Obsidian Glass background with a "Neon Phosphorus" text glow. 
- **Icon:** A black square with a glowing gray border and three lines of stylized, vibrant code.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Console Utility.
1. UI: Create a split-pane layout with a high-blur sidebar and an auto-scrolling log terminal.
2. Logic: Hook into the browser's console API to mirror real developer logs into the app window.
3. Feature: Create a 'Pause' button in the 'Liquid Glass' toolbar that stops the stream from scrolling.
4. Feature: Add a 'Generate Report' button that creates a mock 'System Diagnostics' file in the Finder.
5. Physics: Use 'Obsidian Glass' for the background and 'SF Mono' for the log text.
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **The Global Hook:** - Implement a "Log Proxy" that captures every `console.log`, `console.warn`, and `console.error` triggered within the Tahoe Shell environment.
   - Display these logs in the Console UI in real-time.
2. **Lore Injection:** Periodically inject "Kernel Events" to make the OS feel alive:
   - `[12:01:20] kernel: m5_max_neural_core_01 linked successfully.`
   - `[12:01:25] system_settings: wallpaper_index updated to 'Silicon_Wave'.`
   - `[12:01:30] restaurant_bridge: XP_Diner mounted via Safari.`
3. **Filtering:** A search bar that allows the user to filter logs by process name (e.g., typing 'Finder' only shows Finder-related logs).

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/Console.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
