# PRD: ⚙️ MODULE: TAHOE SYSTEM SETTINGS (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** System Settings

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `System Settings` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `System Settings` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`System Settings` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE SETTINGS 2026 PRINCIPLES)
- **The Profile Card:** A large, refractive glass card at the top-left featuring the 'Architect' avatar (@Aashmanshukla3223).
- **Sidebar Navigation:** Grouped by:
    - **Connectivity:** Wi-Fi, Bluetooth, Network, AirDrop.
    - **Personalization:** Wallpaper, Appearance (Dark/Light/Silicon), Accessibility.
    - **Hardware:** Battery (M5 Max), Displays (Notch Toggle), Sound.
    - **OpenClaw Civics:** Restaurant Access, Unit History, Repo Sync.
- **Icon:** The 2026 "Nested Gears"—rendered in a matte 'Space Gray' metal with a refractive glass center.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe System Settings.
1. Create a 2-pane layout with a searchable sidebar and a detailed main view.
2. Logic: Implement functional toggles for 'Dark Mode', 'Notch Visibility', and 'Glass Blur Intensity'.
3. Feature: A 'Wallpaper Gallery' where clicking a thumbnail instantly updates the Shell's background.
4. Feature: A 'Hardware Info' tab that displays simulated M5 Max Neural Engine stats.
5. Physics: Use 'Liquid Glass' for all buttons and sliders.
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **The State Bridge:** Every toggle must update a global `SYSTEM_CONFIG` object.
2. **Wallpaper Engine:** A function that updates the `background-image` of the Tahoe Shell in real-time.
3. **The Notch Toggle:** A Boolean switch that hides or reveals the 180px Black Notch in the Shell.
4. **Restaurant Permissions:** A "Security" section where users can "Allow" or "Block" specific restaurants (like Windows XP) from accessing the Tahoe API.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/SystemSettings.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
