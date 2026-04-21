# PRD: 🎨 MODULE: TAHOE COLORSYNC UTILITY (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** ColorSync Utility

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `ColorSync Utility` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `ColorSync Utility` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`ColorSync Utility` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE COLORSYNC 2026 PRINCIPLES)
- **The Browser Window:** A "Crystalline Glass" interface with tabs for **'Profiles'**, **'Devices'**, and **'Filters'**.
- **The Gamut Viewer:** A 3D, rotatable "Color Cloud" (using Three.js or a simulated CSS 3D object) showing the sRGB vs. P3 vs. Silicon-Tahoe gamut.
- **Visuals:** A sidebar listing display profiles like **'OpenClaw Reference (D65)'** and **'Restaurant Retro (CRT)'**.
- **Icon:** A translucent, multi-faceted crystal prism reflecting a rainbow of "Silicon Light" onto a glass base.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe ColorSync Utility.
1. UI: Create a 'Device Gallery' sidebar and a central '3D Color Cloud' visualization area.
2. Logic: Implement a 'Filter Preview' mode where selecting a profile applies a real CSS `filter` (e.g., contrast/sepia/hue-rotate) to the entire Tahoe Shell background.
3. Feature: Build a 'Color Picker' tool that allows the user to click anywhere in the Tahoe window and returns the exact 2026 Silicon Hex value.
4. Feature: Add a 'Repair' button with a scanning glass animation.
5. Physics: Use 'Crystalline Glass' for the main window and a 'Prism Glow' for the selected profile highlight.
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **The Profile Engine:** - Each "Profile" selected updates global CSS variables like `--accent-saturation`, `--glass-opacity`, and `--glow-intensity`.
   - **'Silicon Surge' Profile:** Increases saturation and adds a subtle purple tint to shadows.
   - **'Classic Gray' Profile:** Desaturates the Tahoe UI to mimic a 1990s workstation.
2. **The Calculator:** A functional tool that lets you input Hex codes and converts them to the "Silicon Gamut" (simulated color space math).
3. **Repair Utility:** A button that "Verifies" the system CSS variables to ensure they haven't been corrupted by legacy "Restaurant" styles.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/ColorSyncUtility.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
