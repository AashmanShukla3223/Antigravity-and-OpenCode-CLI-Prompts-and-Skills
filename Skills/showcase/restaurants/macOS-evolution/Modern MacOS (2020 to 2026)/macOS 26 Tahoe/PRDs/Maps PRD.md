# PRD: 🗺️ MODULE: TAHOE MAPS (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Maps

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Maps` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Maps` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Maps` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE MAPS 2026 PRINCIPLES)
- **Floating Controls:** Zoom and Compass controls should be "Glass Pills" floating on the right side.
- **Search Bar:** Centered at the top, `backdrop-filter: blur(25px)`, with a pulsing blue location dot.
- **Visuals:** High-saturation satellite tiles with a custom CSS filter: `contrast(1.2) brightness(0.9) saturate(1.4)`.
- **Icon:** A 2026 "Map Fold" with a prominent red location pin and a 3D shadow.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Maps App.
1. Integrate a functional map using the React-Leaflet library (or a native Iframe tile-engine).
2. Logic: Implement a 'Find My Location' button that triggers the Browser Geolocation API.
3. Feature: Create a sidebar that lists 'OpenClaw Restaurants' (e.g., Windows XP, Apple II) as physical landmarks on the map.
4. Physics: Apply a 'Neural Glow' to the user's location dot (a pulsing blue orb with refraction).
5. Style: The window frame must use Tahoe 'Liquid Glass' while the map area is edge-to-edge.
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **Live Tracking:** Use `navigator.geolocation.watchPosition` to center the map on the user’s real-world coordinates.
2. **Engine:** Use a lightweight Leaflet provider (OpenStreetMap Sat Tiles) to avoid heavy Google Maps API keys.
3. **Hardware Sync:** If the `Battery API` shows "Low Power Mode," the map should automatically switch to a "Vector Wireframe" mode to save resources.
4. **The Notch Protocol:** The Maps search bar must automatically slide 40px lower if the window is moved directly under the Hardware Notch.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/Maps.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
