# PRD: 📝 MODULE: TAHOE NOTES (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Notes

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Notes` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Notes` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Notes` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE NOTES 2026 PRINCIPLES)
- **The Triple-Pane:** 1. **Folders Sidebar:** (Blur 45px) "All iCloud", "OpenClaw Drafts", "Restaurant Notes".
    2. **Notes List:** Clean snippets with the Title, Date, and a 1-line preview.
    3. **Editor Surface:** A subtle "Paper-Glass" texture (`rgba(255,255,255,0.85)` with light grain).
- **Toolbar:** Floating "Glass Pill" at the top with formatting buttons (Bold, Checklist, Photos, Share).
- **Icon:** The classic yellow-topped notepad, but with a 2026 "Silicon Refraction" and a glass pencil.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Notes App.
1. Create a 3-pane responsive layout. 
2. Logic: Implement a functional text editor area where users can type and format text.
3. Feature: Create a 'New Note' button that adds a timestamped entry to the middle list.
4. Sync: Use LocalStorage to save and retrieve notes so they persist after a refresh.
5. Physics: Apply 'Liquid Glass' to the sidebar and a 'Paper-Glass' texture to the editor background.
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **The Sync Engine:** Use `window.addEventListener('storage')` to simulate iCloud. If a user opens Notes in a second window/tab, changes sync in real-time.
2. **Rich Text:** Use a `contentEditable` div or a lightweight React library (like `Quill-lite`) to support bolding and lists.
3. **Folders:** Organize notes by "Units." (e.g., A folder for "Unit 5: Flat Era" research).
4. **Auto-Save:** Every keystroke updates a `NOTES_REGISTRY` in `localStorage`.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/Notes.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
