# PRD: 📈 MODULE: TAHOE ACTIVITY MONITOR (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Activity Monitor

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Activity Monitor` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Activity Monitor` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Activity Monitor` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE ACTIVITY MONITOR 2026)
- **The Header:** A "Liquid Glass" toolbar with tabs for **CPU**, **Memory**, **Energy**, **Disk**, **Network**, and **Neural**.
- **The Table:** A list of all "Active" .md modules currently running in the Shell.
    - **Columns:** Process Name, % CPU, Memory, Threads, User (@Aashmanshukla3223).
- **The Bottom Dashboard:** Real-time line charts with a "Silicon Glow."
    - **CPU Load:** Neon Green wave.
    - **Neural Engine:** Silicon Pink pulse.
- **Icon:** A heartbeat pulse on a black obsidian grid with a 2026 refractive glass border.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Activity Monitor.
1. UI: Create a 6-tab navigation bar using 'Liquid Glass'.
2. Logic: Implement a real-time line chart at the bottom using the HTML5 Canvas API.
3. Feature: The Process Table must update live, showing which Tahoe apps (e.g., Safari, Phone, Arcade) are currently open.
4. Feature: Add a 'Neural Engine' tab that displays a futuristic 3D 'Hex-Grid' animation that pulses based on CPU activity.
5. Physics: Use 'Obsidian Glass' for the table background and a 'Refractive Glow' for the graph lines.
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **The Telemetry Engine:** - Use `window.performance.memory` to calculate real RAM usage of the Tahoe instance.
   - Use a `setInterval` (1000ms) to generate a randomized "Neural Load" percentage (15% - 40%) to simulate AI processing.
2. **Process List:** Dynamically list the apps currently marked as `isOpen: true` in the Tahoe global state.
3. **The "Quit Process" Button:** A functional button that sends a `forceClose` signal to the Shell, allowing users to "Kill" a frozen Safari restaurant window.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/ActivityMonitor.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
