# PRD: 🔋 MODULE: TAHOE POWER MANAGEMENT (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Power Management

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Power Management` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Power Management` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Power Management` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE POWER PRINCIPLES)
- **The Dialog:** When triggered from the Apple Menu, a centered "Liquid Glass" modal appears with four frosted icons: **Sleep**, **Restart**, **Shut Down**, and **Log Out**.
- **The Battery Dropdown:** A Menu Bar extra showing a vertical "Silicon Pillar" indicating charge percentage.
- **The Visuals:** Clicking "Shut Down" triggers a "Deep Obsidian" fade-out across the entire Shell, where all window refractions slowly dim until the screen is black.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Power Management System.
1. Logic: Use the navigator.getBattery() API to drive a functional battery icon in the Menu Bar.
2. Feature: Build the 'Power Dialog' modal with 'Sleep', 'Restart', and 'Shut Down' buttons.
3. Feature: Implement a 'Deep Fade' transition for the Shut Down sequence using Framer Motion.
4. Feature: Add a 'Low Power Mode' listener that automatically reduces CSS blur effects when the battery is low.
5. Physics: Use 'Liquid Glass' for the modal and ensure it blurs the entire desktop when active.
Output Code Only."

# 🏛️ The "OpenClaw" Power Civics
To make this functional for your V3 Deployment, the Power Management app should communicate with other modules:

Sync with Activity Monitor: The "Energy" tab in Activity Monitor should pull its "Impact" data from this module.

The "Wake" Event: When "Waking from Sleep," the Tahoe Shell should show a "Liquid Ripple" animation emanating from the Notch.

Restaurant Protection: If the user clicks "Shut Down" while a Restaurant is open in Safari, show a "Liquid Glass" alert: "Windows XP is still cooking. Force Quit and Shut Down?"

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **The Battery Bridge:** - Use the `navigator.getBattery()` API to pull real-time data from the user's laptop/device.
   - Map the `level` and `charging` status directly to the Tahoe Menu Bar icon.
2. **System Lifecycle:**
   - **Sleep:** Triggers a `0.1` opacity "Sleep Mask" overlay. All animations in the Shell are paused to save browser CPU.
   - **Restart:** Clears the React/App state and re-triggers the **Boot Sequence** and **Setup Assistant** (if configured).
   - **Shut Down:** Persists all `localStorage` data and redirects the browser tab to a "System Off" static page.
3. **Low Power Mode:** When the Battery API reports <20%, the module forces the Tahoe Shell into "Low Power Mode," reducing the background blur radius to `5px` and disabling "Neural Glow" animations.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/PowerManagement.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
