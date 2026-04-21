# PRD: 🔑 MODULE: TAHOE LOGIN SCREEN (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Login Screen

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Login Screen` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Login Screen` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Login Screen` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE LOGIN 2026 PRINCIPLES)
- **The Atmosphere:** The Tahoe wallpaper is blurred at `80px`, creating a "Deep Sea" or "Soft Aurora" background.
- **The Clock (Top):** - A large, "Liquid Glass" clock face or digital readout centered in the top third.
    - Typography: **SF Pro Display (Ultralight)**.
    - Effect: The numbers have a subtle "Drop Glow" that pulses with the system's "Neural Beat."
- **The Identity (Center-Bottom):**
    - **Avatar:** A circular "Silicon Glass" frame containing the Architect's profile picture (@Aashmanshukla3223).
    - **Username:** Displayed in a semi-bold glass-morphic font.
    - **Password Field:** A rounded "Liquid Glass" pill that glows white when focused.
- **The Controls (Bottom):** Smaller glass icons for **Sleep**, **Restart**, and **Shut Down** (linked to `PowerManagement.md`).

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Login Screen.
1. UI: Create a full-screen blurred wallpaper background with a massive, thin-font clock at the top.
2. Logic: Implement the password 'Shake' animation for incorrect entries.
3. Feature: Create a functional password field that reveals a 'Liquid Glass' login button when text is entered.
4. Interaction: Add a 'Parallax' effect where the background wallpaper moves slightly in the opposite direction of the mouse.
5. Physics: Use 'Obsidian Glass' for the avatar border and a 'Silicon Glow' for the active input field.
Output Code Only."

# 🏛️ The "OpenClaw" Security Civics
To make this the "Golden Sample" of your V3 Release, the Login Screen should include these specific 2026 features:

The "Apple Intelligence" Hint: If the user stays on the screen for too long, a soft glowing orb appears near the password field to offer a "Password Hint" (saved in KeychainAccess.md).

The Transition: When logged in, the wallpaper "Unblurs" over 1.5 seconds while the Dock and Menu Bar slide into place from the edges.

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **The Time Sync:** A real-time `Intl.DateTimeFormat` loop that updates the glass clock every second.
2. **The Auth Handshake:**
    - On 'Enter', the logic compares the input to the `ACCOUNT_PASSWORD` saved during the **Setup Assistant**.
    - **Success:** Triggers a "Shatter-Fade" animation where the login UI dissolves into the Desktop.
    - **Failure:** Triggers the classic macOS "Shake" animation on the password pill.
3. **The User Registry:** Pulls the "Full Name" and "Avatar" from the local system state.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/LoginScreen.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
