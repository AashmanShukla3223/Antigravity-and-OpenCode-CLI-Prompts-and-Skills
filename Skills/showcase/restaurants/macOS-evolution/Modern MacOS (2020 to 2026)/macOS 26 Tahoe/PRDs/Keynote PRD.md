# PRD: 📊 MODULE: TAHOE KEYNOTE (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Keynote

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Keynote` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Keynote` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Keynote` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE KEYNOTE 2026 PRINCIPLES)
- **The Navigator:** A left-hand "Liquid Glass" strip showing slide thumbnails.
- **The Stage:** A wide-screen (16:9) canvas with a deep obsidian background. 
- **Toolbar:** Top-mounted "Glass Pill" with "Play", "Animate", and "Collaborate" icons.
- **Icon:** A blue-to-purple 3D lectern with a refractive glass screen reflecting the Tahoe wallpaper.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer` and Framer Motion: Build the Tahoe Keynote App.
1. Create a 'Deck Navigator' sidebar and a central 'Slide Stage'.
2. Logic: Implement a slide state (e.g., Slide 1, 2, 3) that changes on click.
3. Feature: 'Magic Move' Transitions—when moving between slides, animate the position and scale of shared elements.
4. Physics: Apply 'Liquid Glass' to the inspector panel on the right.
5. Content: Pre-load a deck titled 'The Future of OpenClaw: Unit 8 & Beyond'.
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **The Slide Registry:** A JSON array `slides`. Each object contains `{ title, content, image, transitionEffect }`.
2. **Presentation Mode:** A functional "Play" button that takes the window full-screen (within the Tahoe Shell) and allows navigation via Arrow Keys.
3. **Magic Move:** Use `framer-motion` layout animations to simulate "Magic Move"—where text and objects from Slide 1 smoothly transform into Slide 2.
4. **Export Logic:** A simulated "Export to PDF" button that generates a "Claw-Print" of the presentation.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/Keynote.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
