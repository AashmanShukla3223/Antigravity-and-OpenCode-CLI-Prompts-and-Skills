# PRD: 📂 MODULE: TAHOE FINDER (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Finder

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Finder` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Finder` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Finder` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE ICON (THE BLUEPRINT)
- **Primary Shape:** Rounded Square (Silicon Curve).
- **Colors:** Linear Gradient (Top-Left: #5AC8FA "Light Blue" | Bottom-Right: #007AFF "Dark Blue").
- **Face Physics:** Two vertical oval eyes + a wide "Silicon Smile" in white (0.8 opacity).
- **Depth:** 0.5px inner-glow to simulate 2026 depth.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Finder App. 
1. Render the Finder Icon as a CSS/SVG hybrid using the Dual-Blue Smiling Face spec.
2. Build a functional sidebar with 'Active State' highlighting.
3. The main area must list 'Macintosh HD' contents using a JSON object as the source.
4. Apply 'Liquid Glass' blur to the window sidebar but 'Clean White' to the main file area.
5. Ensure the window is draggable within the Tahoe Shell.
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
- **Directory Tree:** Map the `showcase/` folder structure from the OpenClaw repo.
- **Sidebar:** Functional navigation (Recents, Applications, Desktop, Documents).
- **View Modes:** Toggle between Icon View and List View.
- **Breadcrumbs:** Path display at the bottom (e.g., `Macintosh HD > Users > OpenClaw`).

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/Finder.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
