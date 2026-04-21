# PRD: 🕹️ MODULE: TAHOE APPLE ARCADE (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Apple Arcade

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Apple Arcade` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Apple Arcade` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Apple Arcade` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE ARCADE 2026 PRINCIPLES)
- **The Dashboard:** A large, edge-to-edge "Cinematic Scroll" featuring the current top game.
- **Glass Tiles:** Each game tile is a "Silicon Glass" container. Hovering over a tile triggers a `framer-motion` 3D-tilt and a subtle "Glow" effect.
- **Visuals:** The sidebar features categories: "Action", "Legacy", "OpenClaw Originals", and "Restaurants".
- **Icon:** A vibrant 3D "Joystick" in Apple Red sitting on a refractive glass base with a 2026 silicon-edge highlight.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Apple Arcade App.
1. Create a 3D-tiled dashboard showing at least 4 game posters.
2. Logic: Implement a 'Play' button on each poster. When clicked, it should render a placeholder 'Loading Silicon Graphics...' screen.
3. Feature: Create a functional 'Snake' game (or a simple 'Arcade' placeholder) that can be played inside the window using arrow keys.
4. Physics: Use 'Liquid Glass' for the navigation and a high-saturation 'Arcade Glow' for the background gradients.
5. Integration: Link one of the tiles to the 'Windows XP Restaurant' for 'Minesweeper'.
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **The Game Registry:** A JSON array `GAMES`. Each object contains `{ title, genre, buildUrl, developer, icon }`.
2. **The Launch Bridge:** Clicking "Play" doesn't just open a window—it triggers `openGame(gameId)`.
3. **Logic:** If a game is from the "Legacy" category (e.g., Apple II Snake), the app bridges to a specialized Emulator Canvas.
4. **Game Center Sync:** Simulated "Achievement" notifications that pop up from the Tahoe Notch when a user "installs" or plays a game.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/AppleArcade.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
