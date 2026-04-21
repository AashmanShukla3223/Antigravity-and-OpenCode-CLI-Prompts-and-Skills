# PRD: 🚀 MODULE: TAHOE APPLICATIONS (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Applications

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Applications` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Applications` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Applications` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (TAHOE)
- **Search Bar:** A large, "Liquid Glass" input field at the top with a pulsing AI glow.
- **Grid View:** 2026-style icons with high-refraction hover effects.
- **Remote Badging:** Remote apps (from GitHub) get a small "Cloud" or "Claw" icon badge to distinguish them from local Tahoe apps.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Applications App.
1. Create a searchable Grid View of icons.
2. Logic: Define a `LOCAL_APPS` constant (Maps, FaceTime, Finder) and a `REMOTE_INDEX` constant (Windows XP, Apple II, etc.).
3. When a REMOTE item is clicked, it MUST execute a function that opens the Safari App and loads the corresponding GitHub/Vercel URL.
4. Implement a 'Neural Search' that filters icons in real-time as the user types.
5. Use the Tahoe 'Liquid Glass' style for the window frame.
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **Local Indexing:** Automatically scan the `/Applications` folder in the simulated Macintosh HD (JSON).
2. **Remote Indexing:** Use a keyword registry (e.g., "Windows XP", "Apple II"). If a keyword matches a folder in the GitHub repo, flag it as a "Web App."
3. **The Safari Bridge:** If a user clicks a "Web App" (remote repo item), the logic triggers `openApp('Safari', {url: 'repo-path'})` instead of opening a local window.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/Applications.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
