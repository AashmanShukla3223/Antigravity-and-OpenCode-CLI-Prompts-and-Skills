# PRD: 🗒️ MODULE: TAHOE REMINDERS (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Reminders

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Reminders` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Reminders` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Reminders` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE REMINDERS 2026)
- **The Dashboard:** Four main "Smart Tiles" at the top: **Today** (Blue), **Scheduled** (Orange), **All** (Gray), and **Flagged** (Red).
- **Sidebar:** `backdrop-filter: blur(40px)`. Custom lists like "Tahoe Launch", "Restaurant Repairs", and "OpenClaw V4 Ideas".
- **Visuals:** Hollow circular checkboxes that fill with a vibrant color and a checkmark when clicked.
- **Icon:** Three colored horizontal lines (Blue, Orange, Red) with circular dots on a white/glass background.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Reminders App.
1. Create a 2-pane layout: A glass sidebar and a main list view.
2. Logic: Implement the 4 'Smart Lists' (Today, Scheduled, All, Flagged) with dynamic counts.
3. Feature: Add an 'Add Task' button that allows users to type a new reminder and assign it a color-coded list.
4. Physics: Use a bouncy spring animation for checking off tasks.
5. Integration: Pre-load the app with tasks like 'Finalize System Settings.md' and 'Deploy V3 to Vercel'.
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **The Task Registry:** A `tasks` JSON array. Each task has a `list`, `title`, `isCompleted`, and `priority`.
2. **Completion Logic:** When a user clicks a checkbox, use `framer-motion` to trigger a "Strikethrough" animation and move the item to the "Completed" section.
3. **Smart Counting:** The numbers in the top four "Smart Tiles" must update dynamically based on the state of the task registry.
4. **Persistence:** Save the state to `localStorage` so the user's "To-Do" list survives a page refresh.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/Reminders.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
