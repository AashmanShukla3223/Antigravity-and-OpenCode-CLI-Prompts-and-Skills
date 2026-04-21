# PRD: 🐚 MODULE: TAHOE TERMINAL (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Terninal

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Terninal` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Terninal` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Terninal` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE TERMINAL 2026 PRINCIPLES)
- **The Window:** "Obsidian Glass" (`rgba(10, 10, 10, 0.85)`) with 50px background blur.
- **Typography:** "SF Mono" or "JetBrains Mono" in a soft "Phosphor Green" or "Silicon White".
- **Visuals:** A blurred, glowing cursor that pulses with the system's "Neural Beat."
- **Icon:** A black square with a white `>_` prompt, rendered with a 2026 glass-morphism depth.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Terminal Utility.
1. Create a deep-black refractive glass window with no scrollbars (auto-scroll only).
2. Logic: Implement a basic command parser for 'ls', 'cd', 'clear', and 'help'.
3. Feature: Create a custom 'claw' command that displays an ASCII art of a mechanical claw and repo stats.
4. Integration: Ensure it resides in the 'Applications' state and is NOT pinned to the Dock by default.
5. Physics: Use a 'Neon Glow' effect for the monospaced text to simulate 2026 high-contrast displays.
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **The Shell Interpreter:** A functional `onKeyPress` handler that parses strings into commands.
2. **The File System Bridge:** The Terminal must be "Aware" of the **Finder.md** registry. Running `ls` should return the same files seen in the Tahoe Finder.
3. **Core Commands:**
    - `ls`: List files in the current Unit.
    - `cd [unit]`: Navigate between Unit 1 and Unit 7.
    - `claw -v`: Display the OpenClaw version and Architect info (@Aashmanshukla3223).
    - `open [app]`: Launch a Tahoe app module via the command line.
    - `sudo restaurant [name]`: Force-load a legacy OS (like Windows XP) into the Safari bridge.
4. **Environment:** Set the prompt to `OpenClaw-V3: [Current_Folder] user$`.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/Terninal.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
