# PRD: 🖼️ MODULE: TAHOE PHOTOS (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Photos

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Photos` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Photos` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Photos` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE PHOTOS 2026)
- **Sidebar:** Categories: "All Photos", "Museum Units", "Photo Booth", "Deleted".
- **Dynamic Grid:** Photos should vary slightly in size (Pinterest-style) or stay in a perfect, sharp "Square Grid" with 2px gaps.
- **Lightbox:** Clicking a photo expands it into a "Liquid Glass" modal with blurred background and metadata (Dimensions, Camera: M5 Max Neural).
- **Icon:** The multi-colored "Flower" but with a 2026 glass-morphism depth.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer` and Framer Motion: Build the Tahoe Photos App.
1. Create a Sidebar + Grid layout.
2. Logic: Implement a 'Photo Registry' that pulls images from a shared array. 
3. Feature: Create a functional 'Lightbox'—when an image is clicked, it zooms to the center with a backdrop-blur.
4. Museum Mode: Pre-load the gallery with 7 placeholder 'Museum Unit' images (Unit 1 to Unit 7).
5. Integration: Ensure the app can receive 'New Photo' events from other apps in the Shell.
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **The Shared Library:** Use a global state (or `LocalStorage`) `OPENCLAW_GALLERY`. 
2. **Auto-Import:** The app must listen for new blobs sent from the **Photo Booth** or **FaceTime** modules.
3. **Museum Folders:** Hardcode 7 folders representing your 7 Units (Unit 1: Genesis to Unit 7: Silicon).
4. **Hardware Sync:** Images taken via the Tahoe "Camera" get a "Neural Enhanced" badge.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/Photos.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
