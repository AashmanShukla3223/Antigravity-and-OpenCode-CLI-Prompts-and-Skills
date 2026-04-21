# PRD: tv MODULE: TAHOE APPLE TV (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Apple TV

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Apple TV` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Apple TV` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Apple TV` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE TV 2026 PRINCIPLES)
- **The Hero Header:** A massive, auto-playing video banner with a "Liquid Glass" gradient overlay that blends into the window background.
- **Shelf Logic:** "Continue Watching", "OpenClaw Originals", and "Restaurant Trailers".
- **Visuals:** Posters use a high-refraction hover effect—when you hover, the poster tilts (parallax) and a subtle glow appears behind it.
- **Icon:** The Apple TV logo (tv) on a deep "Obsidian Glass" background with a 2026 silicon-edge highlight.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Apple TV App.
1. Create a cinematic 'Home' screen with a large Hero Video Banner.
2. Logic: Implement a row of clickable 'Posters'. Clicking a poster opens a dedicated 'Video Detail' view.
3. Feature: Build a custom 'Liquid Glass' video player controller.
4. Physics: Use Framer Motion to create the 3D 'Parallax Tilt' effect on the movie posters when hovered.
5. Content: Populate with 'OpenClaw Originals' (e.g., 'The Making of Tahoe', 'Unit 1: The Beginning').
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **The Video Registry:** A `media` JSON array. Each object includes `{ title, category, videoUrl, posterUrl, description }`.
2. **The Player Engine:** A custom-styled HTML5 `<video>` player with a Tahoe "Glass Pill" control bar (Play/Pause, Progress, AirPlay).
3. **Cinematic Blur:** When a video is playing, the background of the Tahoe Shell should subtly "dim" and pick up the dominant colors of the video frame.
4. **Integration:** If a user clicks a "Windows XP" trailer, the app offers a "Visit Restaurant" button that bridges to **Safari.md**.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/AppleTV.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
