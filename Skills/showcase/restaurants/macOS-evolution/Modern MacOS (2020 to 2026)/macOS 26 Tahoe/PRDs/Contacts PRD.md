# PRD: 👥 MODULE: TAHOE CONTACTS (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Contacts

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Contacts` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Contacts` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Contacts` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE CONTACTS 2026)
- **The Split-Pane:** - **Left Sidebar:** `backdrop-filter: blur(45px)`. A clean alphabetical list with circular monogram avatars.
    - **Right Detail View:** The "Contact Poster." A full-bleed gradient background with the contact's name in giant, translucent "SF Pro Display" text.
- **Visuals:** Functional buttons for "Message", "Call", and "Mail" that trigger their respective Tahoe apps.
- **Icon:** The 2026 "Address Book"—gray/blue silhouette with alphabetized tabs (A-Z) and a glass-morphism cover.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Contacts App.
1. Create a 2-pane layout with a refractive glass sidebar.
2. Logic: Implement a searchable list of 'OpenClaw Contributors' (e.g., Steve Jobs, Windows-XP Chef, The Architect).
3. Feature: Build the 'Contact Poster' UI—when a name is clicked, show a high-impact profile view with 'Call', 'Message', and 'FaceTime' shortcuts.
4. Integration: Ensure these shortcuts actually trigger the state changes to open the other Tahoe Apps.
5. Physics: Use 'Liquid Glass' for the action buttons and sidebar.
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **The Registry:** A JSON array `CONTRIBUTORS`. Each object includes `{ name, role, handle, unit, avatarGradient }`.
2. **Inter-App Handoff:** - Clicking the "Message" icon must trigger `openApp('Messages', { contact: name })`.
    - Clicking the "Call" icon must trigger the **Phone.md** logic.
3. **The "My Card":** The top entry is always the Lead Architect (@Aashmanshukla3223).
4. **Dynamic Search:** A search bar at the top of the sidebar that filters the list in real-time.

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/Contacts.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
