# PRD: 📞 MODULE: TAHOE PHONE (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Phone

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Phone` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Phone` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Phone` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE PHONE 2026)
- **State 1 (Idle):** A "Liquid Glass" screen asking to "Connect iPhone" with a pulsing Bluetooth icon.
- **State 2 (Active):** Once "Paired," it shows the Dialer, Recents, and Contacts.
- **In-Call UI:** A floating translucent pill that appears at the top right (near the Notch) with Mute, Keypad, and End Call buttons.
- **Icon:** The 2026 green handset, but with a "Silicon Glow" outline to indicate a live connection.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Phone App.
1. UI: Create a 2-state interface (Disconnected vs. Connected). 
2. Connection Logic: Simulate an 'iPhone Pairing' animation that finishes after 2 seconds.
3. Dialer: Build a functional keypad that logs numbers to a display field.
4. Audio: Use the Web Audio API to play a classic iPhone ringtone when a 'Simulated Incoming Call' is triggered via a dev button.
5. Physics: The 'In-Call' overlay must be a 'Liquid Glass' pill that follows the window if moved.
Output Code Only."h

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **The Handshake:** On launch, the app checks if the "iPhone Restaurant" (simulated via global state) is "Online."
2. **Keypad Engine:** A functional grid of numbers that plays high-fidelity DTMF tones using the `Web Audio API`.
3. **Continuity Logic:** If a call is "Started," the app triggers a "Phone Active" flag in the Tahoe Shell, which could make the Notch pulse green/orange.
4. **Contacts Integration:** It pulls data from the **Contacts.md** registry (which we'll build) to show names instead of just numbers.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/Phone.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
