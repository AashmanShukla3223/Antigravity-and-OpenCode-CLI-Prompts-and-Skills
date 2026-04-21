# PRD: 🏛️ OPENCLAW RECIPE: TAHOE V3 SHELL
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Tahoe-V3-Shell

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Tahoe-V3-Shell` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Tahoe-V3-Shell` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Tahoe-V3-Shell` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
VISUAL ASSETS
- **Wallpaper:** Replicate macOS Tahoe 2026 (Liquid gradients of Blue/Purple).
- **Notch Indicator:** Green LED dot (Active when `isCameraOn` is true).
- **Traffic Lights:** Red, Yellow, Green (Middle-aligned window title).

#### Specific Prompt / Feature Injections
THE MASTER PROMPT (CAVEMAN)
"Using `/caveman-full-stack-developer` and Framer Motion: 
Build the OpenClaw V3 Shell. The Shell must be the 'Front Door' of the OS. 
- Center a black Notch (180px) with a camera LED.
- Build a Menu Bar that splits around the notch; Left side changes with 'activeApp' state.
- Build a Desktop with right-click contextual menus (New Folder, Change Wallpaper).
- Build a Dock with 'True Magnification' physics (Icons grow and shift as mouse moves over them).
- Include a Control Center overlay on the top right.
- Ensure all windows have traffic light buttons and middle-aligned titles.
- Strike 1 Logic: The Shell must only render if `setup_complete` is true within the `tahoe_v3_state` key in LocalStorage.
Output ONLY the clean React JSX code block."

### Component Architecture & State Management
#### Core Logic
PHYSICS & CIVICS (SYSTEM CONSTANTS)
- **Glass:** `backdrop-filter: blur(50px) saturate(190%)`
- **Notch:** 180px x 30px (Center Anchor)
- **Dock:** Dynamic Scaling (Scale: 1.0 -> 1.5 on Hover)
- **Kernel:** Simulated Darwin 25.0.0

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/Tahoe-V3-Shell.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
