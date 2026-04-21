# PRD: 🗑️ MODULE: TAHOE TRASH (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Trash

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Trash` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Trash` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Trash` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE TRASH 2026 PRINCIPLES)
- **The Window:** A "Clean White" or "Translucent Glass" pane with a top-mounted "Empty" button.
- **Dock Icon Logic:** - **State: Empty:** A sleek, refractive wire-mesh bin.
    - **State: Full:** The bin filled with crumpled "Glass Paper" textures.
- **The Divider:** A vertical 1px line (0.2 opacity) that separates the Trash icon from the rest of the Dock apps.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Trash App.
1. Create a dedicated Dock Icon with two states (Empty/Full).
2. Logic: Implement a 'Trash Bin' array that stores deleted objects from the Finder.
3. Feature: Build the 'Empty Trash' function with a confirmation 'Liquid Glass' dialog.
4. UI: The Trash window should display items in a grid with a 'Put Back' option on right-click.
5. Civics: Ensure the Trash icon is positioned on the far right of the dock, separated by a vertical glass divider line.
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **The Trash Registry:** A global `TRASH_BIN` state (Array).
2. **Move-to-Trash:** Any file deleted in **Finder.md** or **Notes.md** is pushed here instead of being permanently erased.
3. **Recovery (Put Back):** A right-click context menu option on items inside the Trash that restores them to their original `parentFolder` path.
4. **Empty Trash:** A final purge that clears the `TRASH_BIN` array and triggers a high-fidelity "Paper Crunch" sound effect.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/Trash.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
