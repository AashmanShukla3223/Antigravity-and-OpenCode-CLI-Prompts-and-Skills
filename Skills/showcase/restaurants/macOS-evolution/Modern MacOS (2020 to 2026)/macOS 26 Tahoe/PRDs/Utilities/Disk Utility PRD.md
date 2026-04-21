# PRD: 💾 MODULE: TAHOE DISK UTILITY (2026)
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** Disk Utility

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `Disk Utility` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `Disk Utility` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`Disk Utility` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
THE UI (APPLE DISK UTILITY 2026)
- **The Sidebar:** Lists the primary **'Macintosh HD'** and sub-volumes like **'iOS Diner Cache'** and **'XP Restaurant Data'**.
- **The Visualization:** A large, multi-colored horizontal bar chart showing data distribution:
    - **Blue:** System (Tahoe Core)
    - **Green:** Apps (.md Modules)
    - **Yellow:** Restaurants (Legacy OS Assets)
    - **Gray:** Free Space (Remaining LocalStorage)
- **Visuals:** High-gloss "Silicon" buttons for **First Aid**, **Partition**, and **Erase**.
- **Icon:** A refractive sapphire-glass hard drive with a glowing read/write actuator.

#### Specific Prompt / Feature Injections
THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Disk Utility.
1. UI: Create a split-view with a sidebar showing the drive hierarchy and a main view with the 'Storage Bar'.
2. Logic: Implement a real-time calculation of LocalStorage usage to drive the 'Storage Bar' widths.
3. Feature: Build a 'First Aid' animation—when clicked, show a pulsing glass scan that finishes with a green checkmark.
4. Feature: Include an 'Erase' button that (with a double-confirmation glass dialog) clears the localStorage.
5. Physics: Use 'Liquid Glass' for the action bar and 'Obsidian Glass' for the sidebar.
Output Code Only."

### Component Architecture & State Management
#### Core Logic
THE LOGIC (CAVEMAN)
1. **The Capacity Engine:** - Use `JSON.stringify(localStorage).length` to calculate exactly how many bytes are currently occupied.
   - Simulate a "500GB M5 Max SSD" by scaling the browser's 5MB-10MB limit to a realistic percentage.
2. **First Aid:** A functional script that iterates through the `localStorage` keys and removes any corrupted or "Orphaned" data strings from old V2 builds.
3. **Partition Logic:** Visualizes the "Containers"—explaining that Unit 1, Unit 5, and Unit 7 share the same physical drive but exist in different "Temporal Partitions."

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/DiskUtility.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
