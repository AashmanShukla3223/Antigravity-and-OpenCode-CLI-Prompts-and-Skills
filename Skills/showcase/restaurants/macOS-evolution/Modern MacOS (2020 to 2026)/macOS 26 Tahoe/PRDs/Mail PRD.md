# PRD: ✉️ MODULE: TAHOE MAIL (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Mail

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Mail` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Mail` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Mail` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE MAIL PRINCIPLES)
- **The Triple-Pane:** 1. **Sidebar:** (Blur 40px) Folders like "Inbox", "Sent", "Drafts", and "Restaurants".
    2. **Message List:** Subject, Date, and a 2-line preview. Highlighting uses Unit 7 Sky Blue.
    3. **Reader Pane:** Clean white (or dark glass) background with a functional "Reply/Forward" toolbar.
- **Visuals:** Use the 2026 "Envelope" icon with a subtle blue/cyan gradient.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Mail App.
1. Implement a responsive 3-pane layout using CSS Grid.
2. Logic: Populate the inbox with 5 simulated emails about 'OpenClaw' project updates (e.g., 'Unit 6: Flat Era is now open for contributors').
3. Physics: Ensure the sidebar uses the Tahoe 'Liquid Glass' refraction.
4. Feature: Clicking an email in the middle pane must render the full content in the right-hand reader pane with 'SF Pro' typography.
5. Search: Include a top-bar search that filters the subject lines.
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **The Inbox Registry:** A `emails` JSON array. Each entry has a `sender` (e.g., "M1-Steve"), `subject`, and `body` (repo lore).
2. **Dynamic Filtering:** Clicking "Windows-XP" in the sidebar filters the list to only show messages from the XP Restaurant.
3. **Draft Engine:** A functional text area where the user can "type" a mail; clicking Send triggers a "Swoosh" sound and adds it to the "Sent" state.
4. **Unread Badge:** Logic to update the red dot on the Mail icon in the Tahoe Dock.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/Mail.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
