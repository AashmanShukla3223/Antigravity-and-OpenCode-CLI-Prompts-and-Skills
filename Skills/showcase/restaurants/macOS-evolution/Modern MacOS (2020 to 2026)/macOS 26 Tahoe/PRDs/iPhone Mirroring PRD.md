# PRD: 📱 MODULE: TAHOE iPHONE MIRRORING (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** iPhone Mirroring

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `iPhone Mirroring` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `iPhone Mirroring` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`iPhone Mirroring` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE MIRRORING 2026 PRINCIPLES)
- **The Chassis:** A floating "Titanium" frame with perfect rounded corners (38px radius).
- **The Dynamic Island:** A functional black pill at the top of the "Phone" screen that reacts to Tahoe notifications.
- **Visuals:** The window has no standard macOS title bar; instead, it uses a "Hidden Handle" that appears on hover.
- **Icon:** Two overlapping rounded rectangles (Mac & iPhone) with a 2026 refractive "Silicon Link" glow.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe iPhone Mirroring App.
1. Create a vertical window frame that looks like an iPhone 16/17 Pro.
2. Logic: The frame must contain an iframe pointing to the 'iOS Diner' index.
3. Feature: Implement 'Side-to-Side' handoff—if the user drags a file from the Tahoe Finder onto the iPhone window, simulate a 'Received via AirDrop' alert.
4. Physics: Use 'Liquid Glass' for the iPhone's wallpaper background and a 'Titanium' CSS border for the hardware frame.
5. Civics: Ensure the window remains 'Always on Top' if the user toggles a pin icon.
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **The Handshake:** On launch, the app "pings" the `Skills/Showcase/Restaurants/iOS-Diner` path.
2. **The Mirror Engine:** Use a high-density `<iframe>` styled with `object-fit: contain` to fit the iPhone aspect ratio (9:19.5).
3. **Event Mapping:** Translate desktop `onClick` and `onDrag` events into `touchStart` and `touchMove` events for the mirrored iOS content.
4. **Keyboard Passthrough:** If the user types while the Mirroring window is active, send those strings directly to the simulated iPhone input.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/iPhoneMirroring.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
