# PRD: 🌐 MODULE: TAHOE SAFARI (2026) - RESTAURANT EDITION
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Safari

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Safari` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Safari` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Safari` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
*(Details to be implemented according to OpenClaw standards)*

#### Specific Prompt / Feature Injections
THE UPDATED PROMPT
"Using `/caveman-full-stack-developer`: Build the Tahoe Safari App.
- Include a 'Restaurant Mode' in the address bar.
- Logic: When a user selects 'Windows XP' from the Applications App, Safari must navigate to: `./Skills/Showcase/Restaurants/Windows-XP/index.html`.
- UI: Ensure the Iframe has a 'Clean Cut' border so the XP taskbar aligns perfectly with the Tahoe window frame.
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE "RESTAURANT" LOGIC
1. **The Claw-Path:** The Safari address bar must recognize internal repo paths. 
2. **Logic:** If the `URL` input starts with `/Restaurants/`, Safari should attempt to resolve the path relative to the root of the Vercel deployment.
3. **Sandbox:** Ensure the iframe has `allow-scripts` and `allow-same-origin` enabled so the Windows XP "Restaurant" logic actually runs inside the Tahoe window.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/Safari.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
