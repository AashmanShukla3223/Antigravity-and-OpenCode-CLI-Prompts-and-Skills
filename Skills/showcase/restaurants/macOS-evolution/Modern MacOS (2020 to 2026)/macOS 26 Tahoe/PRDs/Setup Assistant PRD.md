# PRD: 🍏 MODULE: TAHOE SETUP ASSISTANT (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Setup Assistant

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Setup Assistant` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Setup Assistant` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Setup Assistant` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE "HELLO" SCREEN (THE GENESIS)
- **Visuals:** A deep obsidian background. A cursive, "Liquid Metal" line draws the word "hello" in the center.
- **Cycle:** The word fades and redraws as "hola", "bonjour", "namaste", and "ciao" in vibrant Silicon Pink and Blue gradients.
- **Button:** A singular, pulsing "Continue" glass pill at the bottom.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Setup Assistant.
1. The Hello Loop: Create a canvas animation that draws 'hello' in cursive using a glowing gradient stroke. Cycle through 5 languages.
2. Logic: Implement a 'Step State' (1-12). Each 'Continue' click triggers a 'Liquid Slide' transition to the next pane.
3. Feature: Create the 'Appearance' selector—when the user clicks 'Dark', the entire setup UI must transition to Obsidian Glass.
4. Account Creation: The data entered in the 'Account' step must be saved to LocalStorage to be used as the 'User' in the Tahoe Shell.
5. Finalization: After Step 12, show a 'Setting Up Your Mac...' progress bar that fades into the Tahoe Desktop.
6. Strike 1 Logic: This module is linked from `BootSequence.jsx` via the `tahoe_v3_state` key. On finalization, set `setup_complete: true` within the `tahoe_v3_state` object in LocalStorage.
Output Code Only."

# 🏛️ The "First Boot" Civics
To make this work on Vercel, the Setup Assistant acts as the Root Component:

The Cookie Check: On load, the index.html checks localStorage.getItem('tahoe_v3_state').

If setup_complete is False: Launch SetupAssistant.md.

If setup_complete is True: Launch Tahoe-V3-Shell.md (The Desktop).

### Component Architecture & State Management
#### Core Logic
THE SEQUENTIAL LOGIC (CAVEMAN)

#

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/SetupAssistant.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
