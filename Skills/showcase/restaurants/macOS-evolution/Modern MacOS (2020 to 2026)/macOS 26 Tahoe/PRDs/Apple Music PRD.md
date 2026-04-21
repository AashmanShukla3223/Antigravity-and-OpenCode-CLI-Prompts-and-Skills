# PRD: 🎵 MODULE: TAHOE APPLE MUSIC (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Apple Music

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Apple Music` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Apple Music` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Apple Music` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE MUSIC 2026 PRINCIPLES)
- **The Now Playing View:** A massive, high-res album art cover with "Liquid Shadows." 
- **The Adaptive Background:** The app background must use a `canvas` or CSS blur to "bleed" the colors of the album art into the entire window.
- **Glass Controls:** A floating "Refractive Pill" at the bottom with Play/Pause, Skip, and a functional Volume Slider.
- **Icon:** The classic Note icon, but rendered in a 3D "Silicon Pink/Red" gradient with a glass-morphism finish.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Apple Music App.
1. Create a 'Listen Now' grid with 2026-style album posters.
2. Logic: Implement a functional audio player that can Play/Pause and seek through a track.
3. Feature: 'Liquid Background'—the window's background must smoothly transition colors based on the selected song's artwork.
4. Visualization: Include a simple 'Frequency Wave' animation that reacts when audio is playing.
5. Physics: Use 'Liquid Glass' for the player controls and sidebar navigation.
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **The Audio Pipeline:** Use the HTML5 `<audio>` element. 
2. **Dynamic Lyrics:** A side-panel that scrolls time-synced lyrics (simulated) as the song plays.
3. **Color Extraction:** A function that analyzes the "Album Art" and updates the CSS variables for the app’s background blur.
4. **Mini Player:** A logic that allows the window to shrink into a tiny "Refractive Tile" that stays on top of other apps.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/AppleMusic.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
