# PRD:  MODULE: TAHOE BOOT SEQUENCE (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Boot Sequence

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Boot Sequence` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Boot Sequence` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Boot Sequence` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE BOOT 2026)
- **The Canvas:** A pure, absolute #000000 black background.
- **The Logo:** A centered, high-fidelity Apple Logo. 
  - *Effect:* Instead of a flat white, the logo features a subtle "Silicon Depth" with a faint refractive glow around the edges.
- **The Progress Bar:** A thin, rounded "Liquid Glass" track located 60px below the logo.
  - *The Fill:* A vibrant white/silver gradient that moves with "weighted" physics.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Boot Sequence.
1. UI: Set the background to absolute black and center a high-res SVG Apple logo.
2. Logic: Implement a functional progress bar using a CSS transition. 
3. Feature: The progress bar must have 'Variable Velocity'—starting fast, slowing down mid-way, and finishing with a 'Snap' animation.
4. Sound: Trigger a deep, resonant 'Tahoe Startup Chime' (Synthesized Sine Wave) exactly 0.5s after the logo appears.
5. Exit: Once complete, use a 'Circular Mask' transition to expand into the next UI layer.
6. Strike 1 Linkage: Link BootSequence.jsx to SetupAssistant.jsx via the 'tahoe_v3_state' key.
Output Code Only."

# 🏛️ The "OpenClaw" Startup Chime
In the 2026 Tahoe update, the chime has been re-engineered. It’s no longer just a "G" chord; it’s a Multi-dimensional Pulse that signifies the M5 Max Neural Engine is ready.

Frequency: 432Hz (for that "Organic Silicon" feel).

Decay: A long, 4-second tail that bleeds into the Login Screen's ambient background music.

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **The Handshake:** On `window.onload`, the Boot Sequence begins.
2. **Pre-load Registry:** The progress bar is tied to the loading of the core `.md` modules (Finder, Shell, Settings).
3. **The "Apple Stutter":** To mimic real hardware, the progress bar should move smoothly to 60%, "pause" for 1.2 seconds (simulating kernel extension loading), and then accelerate to 100%.
4. **Transition:** Upon hitting 100%, the logo doesn't just vanish—it "Breathes" once (scales 1.05x) before a Gaussian Blur fade-out reveals either the **Setup Assistant** or the **Login Screen**.
5. **Strike 1 Logic:** On 100% completion, update the `tahoe_v3_state` key in LocalStorage. If `setup_complete` is false, transition immediately to `SetupAssistant.jsx`.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/BootSequence.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
