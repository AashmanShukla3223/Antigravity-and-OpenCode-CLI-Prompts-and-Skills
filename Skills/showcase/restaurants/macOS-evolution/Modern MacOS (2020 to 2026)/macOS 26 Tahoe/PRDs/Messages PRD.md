# PRD: 💬 MODULE: TAHOE MESSAGES (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Messages

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Messages` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Messages` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Messages` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE CIVICS)
- **Sidebar:** `backdrop-filter: blur(40px)`. Contact list with circular avatars.
- **Blue Bubbles:** Linear gradient (`#007AFF` to `#00C6FF`). 
- **Gray Bubbles:** `rgba(255, 255, 255, 0.15)` for incoming texts.
- **Typography:** San Francisco (SF Pro). Small "Delivered" text under the last bubble.
- **Input:** A pill-shaped text field with a "+" button and an App Store icon.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer` and Framer Motion: Build the Tahoe Messages App.
1. Create a two-pane layout: A blurred sidebar for contacts and a main chat area.
2. Logic: The user can type messages. If the message includes 'OpenClaw', the system replies with a 'Silicon Surge' update.
3. Style: Implement the classic 'Blue Bubble' gradient. Ensure bubbles have a border-radius of 18px, but the corner near the tail is sharper.
4. Feature: Include a functional 'Emoji' picker button that toggles a small popup.
5. Physics: When a new message is sent, the scroll-view must automatically smooth-scroll to the bottom.
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **The Message Array:** Use a `messages` state array containing `{ id, text, sender, timestamp, isBlue }`.
2. **Auto-Reply Engine:** If a user mentions a "Restaurant" (e.g., "Hey XP"), the app triggers a simulated response from that era's persona.
3. **Spring Physics:** Use `framer-motion` for message entry—bubbles should "pop" in from the bottom with a slight bounce.
4. **Typing Indicator:** A small `motion.div` with three pulsing dots when the "AI" is generating a response.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/Messages.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
