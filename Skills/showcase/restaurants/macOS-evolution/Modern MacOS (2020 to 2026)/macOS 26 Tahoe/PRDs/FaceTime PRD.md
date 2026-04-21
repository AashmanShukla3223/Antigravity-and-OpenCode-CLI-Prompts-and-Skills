# PRD: 🤳 MODULE: TAHOE FACETIME (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** FaceTime

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `FaceTime` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `FaceTime` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`FaceTime` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE FACETIME 2026)
- **The Frame:** Edge-to-edge video with "Liquid Glass" controls that auto-hide.
- **Neural Sidebar:** A retractable panel for "Studio Lighting," "Portrait Blur," and "Eye Contact Correction."
- **Visuals:** A "Neural Glow" indicator (Green LED) in the Tahoe Notch must activate when this app is open.
- **Icon:** The 2026 FaceTime camera—vibrant green with a refractive glass lens.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe FaceTime App.
1. Implement a full-window `<video>` element that connects to the user's camera on mount.
2. Logic: Create a 'Capture' function that saves the current frame to the shared 'Photos' registry.
3. Feature: Add a 'Neural Blur' toggle that applies a heavy blur filter to the background (simulated via CSS mask or simple overlay).
4. Civics: Ensure the 'Green LED' in the Tahoe Shell Notch is triggered while the stream is active.
5. Physics: Use the Tahoe 'Liquid Glass' for the floating control pill at the bottom.
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **Camera Bridge:** Use `navigator.mediaDevices.getUserMedia({ video: true })` to pull the local stream.
2. **Snapshot Logic:** A "Capture" button that takes a frame from the `<video>` element and converts it to a Blob/Base64.
3. **Registry Handshake:** Send the captured image to the `OPENCLAW_GALLERY` (LocalStorage) so it appears in the **Photos app**.
4. **Studio Filter:** Apply a CSS `backdrop-filter: brightness(1.1) contrast(1.1) saturate(1.2)` to the video feed to simulate M5 Max image processing.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/FaceTime.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
