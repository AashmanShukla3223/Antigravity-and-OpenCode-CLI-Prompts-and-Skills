# PRD:  App Store MODULE: TAHOE (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** App Store

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `App Store` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `App Store` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`App Store` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE APP STORE PRINCIPLES)
- **Sidebar:** Categories: "Discover", "Arcade", "Create" (Prosumer), "Develop", "Categories", and "Updates".
- **The Hero Banner:** Large, high-refraction glass cards featuring "App of the Day" (e.g., The Windows XP Restaurant).
- **Product Pages:** Each app gets a "Silicon Glass" detail page with a "Get" or "Open" button, simulated ratings, and version history.
- **Icon:** The 2026 "A" constructed from three refractive glass rods on a vibrant blue gradient base.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe App Store.
1. Create a 2-pane layout with a high-blur sidebar.
2. Logic: Organize all apps into 'Consumer', 'Prosumer', and 'Developer' tabs.
3. Feature: Build a 'Product Detail' view that slides in when an app card is clicked, showing its .md 'Recipe' stats.
4. Feature: The 'Get' button must change to 'Open' once clicked, simulating a high-speed Silicon download.
5. Physics: Use 'Liquid Glass' for the header and 3D-tilt effects for the featured hero banners.
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **Tiered Registry:** A JSON object categorizing all existing .md modules:
    - **Consumer:** Safari, Messages, Mail, Maps, Photos, FaceTime, Music, TV, Arcade.
    - **Prosumer:** Pages, Numbers, Keynote, Notes, Reminders.
    - **Developer:** Terminal (to be built), System Settings, and the "OpenClaw SDK".
2. **The "Open" Bridge:** The "Get" button checks if the app is already in the `DOCK_STATE`. If it is, it becomes an "Open" button that triggers the Shell's `launchApp` function.
3. **Update Engine:** A functional "Updates" tab that pulls the latest commit dates from the GitHub repo.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/AppStore.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
