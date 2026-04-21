# PRD: 📊 MODULE: TAHOE NUMBERS (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Numbers

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Numbers` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Numbers` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Numbers` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE NUMBERS 2026 PRINCIPLES)
- **The Canvas:** Unlike Excel, the grid doesn't fill the whole screen. It’s a "Glass Table" sitting on a deep obsidian background.
- **Visuals:** Column headers use `backdrop-filter: blur(20px)` with a light blue selection tint.
- **Charts:** 2026 "Neural Charts" that pulse with a soft glow when data is updated.
- **Icon:** A vibrant green 3D bar chart (3 bars) rising out of a refractive glass base.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Numbers App.
1. Create a 'Floating Table' UI where the grid is an object on a canvas.
2. Logic: Implement an editable grid where users can click any cell to change the value.
3. Feature: A functional 'Total' row at the bottom that automatically sums the values in a column.
4. Physics: Use 'Liquid Glass' for the table headers and the inspector sidebar.
5. Content: Pre-load a 'Repo Metrics' table showing: Unit 1 (100% Done), Unit 7 (In Progress), Windows XP Restaurant (Cooking).
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **The Grid Engine:** A 2D array state `grid[row][col]`. 
2. **Formula Solver:** A lightweight `eval()`-based parser that handles basic math (e.g., `=SUM(A1:A5)`).
3. **Smart Categories:** Logic to automatically group "Restaurant" data by Unit number.
4. **Data Sync:** A "Live Mode" that pulls the current star-count or commit-count from the OpenClaw GitHub API (simulated or real).

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/Numbers.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
