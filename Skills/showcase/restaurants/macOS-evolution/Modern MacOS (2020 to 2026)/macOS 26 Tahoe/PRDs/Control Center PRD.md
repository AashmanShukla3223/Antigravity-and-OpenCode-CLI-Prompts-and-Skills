# PRD: 🎛️ MODULE: TAHOE CONTROL CENTER (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Control Center

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Control Center` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Control Center` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Control Center` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE CONTROL CENTER 2026)
- **The Container:** A floating "Liquid Glass" rounded rectangle (`backdrop-filter: blur(60px)`).
- **Connectivity Square:** A 2x2 grid for Wi-Fi, Bluetooth, AirDrop, and "Restaurant Link."
- **The Sliders:** Vertical "Silicon Pillars" for Display Brightness and System Volume. 
    - *Interaction:* The icons inside the sliders (Sun/Speaker) grow larger as the value increases.
- **Now Playing:** A dynamic widget that pulls metadata from **AppleMusic.md** or **AppleTV.md**.
- **The Notch Sync:** In the Tahoe Shell, the Control Center icon in the Menu Bar pulses when a legacy Restaurant is "Casting" to the screen.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Control Center.
1. UI: Create a multi-modular glass panel that appears from the top-right of the screen.
2. Logic: Implement functional vertical sliders for Volume and Brightness (Brightness should dim the Tahoe wallpaper).
3. Feature: Build a 2x2 Connectivity grid with active/inactive 'Silicon Glow' states.
4. Integration: The 'Now Playing' card must display the current track name from the global Music state.
5. Physics: Ensure the panel slides in with an 'Elastic' transition from the Menu Bar.
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **The State Bridge:** - The **Wi-Fi Toggle** must visually "disconnect" the **Safari.md** address bar if turned off.
    - The **Dark Mode Toggle** triggers the "Obsidian Liquid" glass physics defined in your Visual Civics.
2. **Haptic Simulation:** Use `framer-motion` spring physics (Stiffness: 300, Damping: 20) for the sliders to make them feel "heavy."
3. **Ecosystem Control:** Include a "Mirroring" button that acts as a shortcut to launch **iPhoneMirroring.md**.
4. **Volume Engine:** Links directly to the `Web Audio API` gain node used in the Music app.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/ControlCenter.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
