# PRD:  MODULE: ABOUT THIS MAC (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** About This Mac

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `About This Mac` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `About This Mac` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`About This Mac` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE 2026 PRINCIPLES)
- **The Visual:** A large, 3D rotating "Silicon Chip" (The M5 Max) rendered with refractive glass and golden copper traces.
- **The Typography:** "macOS Tahoe" in bold, iridescent lettering that shifts colors as the window moves.
- **The Layout:** - **Header:** The iconic 2026 Tahoe "Peak" logo.
    - **Specs List:** - **Chip:** Apple M5 Max (16-core CPU, 40-core GPU).
        - **Memory:** 128GB Unified Silicon.
        - **Neural Engine:** 64-core "Tahoe" Generation.
        - **Serial Number:** `OPENCLAW-V3-2026-ARCHITECT`.
- **The Footer:** A "More Info..." button that opens the **System Settings.md**.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe 'About This Mac' Window.
1. UI: Create a compact 'Liquid Glass' window with a centered 3D chip animation.
2. Logic: Display the system specs including the M5 Max chip and 128GB RAM.
3. Feature: Embed a 'Credits' section that honors @Aashmanshukla3223 as the Lead Architect of the OpenClaw V3 Release.
4. Integration: Link the 'System Report' button to launch the 'Console.md' utility.
5. Physics: Use 'Obsidian Glass' for the background and 'Silicon Gold' for the spec text highlights.
Output Code Only."

# 🏛️ The "OpenClaw" Final Credits
To officially sign off on the V3 Release, the "About" window includes the Architect’s Manifesto:

Software: macOS Tahoe 26.0

Build: Unit 7 (Modern Silicon Era)

Architect: @Aashmanshukla3223

Status: FULLY COOKED ---

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **Dynamic Architect Tag:** The "User" field automatically pulls the name `@Aashmanshukla3223` from the **Setup Assistant** state.
2. **Version Linkage:** Displays "Version 26.0" (The Unit 7 identifier).
3. **Uptime Counter:** A functional "System Report" section that shows how long the current Vercel session has been active.
4. **Easter Egg:** Clicking the "M5 Max" chip icon triggers a 3D "Exploded View" animation using `framer-motion-3d`.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/AboutThisMac.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
