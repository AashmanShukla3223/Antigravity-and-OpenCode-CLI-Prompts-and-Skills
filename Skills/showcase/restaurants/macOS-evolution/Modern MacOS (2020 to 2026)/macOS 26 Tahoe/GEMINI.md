# OpenClaw V3: macOS Tahoe Ecosystem (2026) - Project Blueprint

## 🌌 Project Vision & Philosophy
**macOS Tahoe (v26.0)** is a high-fidelity web-based OS simulation representing the "Unit 7" era of Apple computing. It is built as a React SPA that bridges the gap between legacy desktop metaphors and futuristic "Frozen Prompt" architectures.

- **Aesthetic:** "Silicon-Native Liquid Glass" (Glassmorphism + 50px blur + 190% saturation + 120fps Framer Motion physics).
- **Architecture:** Modular component architecture with a centralized `SystemContext` state machine and a persistent `FileSystemContext` virtual drive.
- **Hardware Simulation:** Real-time integration with Battery Status API, Performance Memory API (heap size), and Storage Estimation API.

---

## 🏗️ Technical Stack
- **Framework:** React 18 + Vite (TypeScript)
- **Styling:** Tailwind CSS (Custom utilities for glassmorphism)
- **Animations:** Framer Motion (Transitions, Physics, True-Magnification Dock, Genie Effect)
- **Icons:** HugeIcons + Lucide React + Custom SVG paths for brand icons (Apple, Finder)
- **Persistence:** LocalStorage keys: `tahoe_v3_state` (System) and `tahoe_v3_fs` (Filesystem).

---

## 📂 Directory Structure (Architecture Map)
```bash
/macos-26-tahoe
├── PRDs/                 # Functional & Design Specs (Markdown)
│   ├── Utilities/        # System Utility PRDs (Terminal, Disk Utility, etc.)
│   └── [App] PRD.md      # Application-specific specifications
├── tahoe-os-v4/          # Implementation Root (React App)
│   ├── src/
│   │   ├── components/
│   │   │   ├── desktop/   # OS Shell (MenuBar, Dock, ControlCenter, Window)
│   │   │   ├── apps/      # Individual Application Modules (Finder, Safari, etc.)
│   │   │   ├── common/    # Reusable UI (AppIcon, etc.)
│   │   │   └── ...        # Lifecycle (BootSequence, SetupAssistant, LoginScreen)
│   │   ├── contexts/      # SystemContext (OS State), FileSystemContext (VFS)
│   │   ├── hooks/         # useDynamicWallpaper, useDynamicMenu
│   │   └── App.tsx        # Boot-state routing orchestrator
```

---

## ⚙️ Core System Logic (Single Source of Truth)

### 1. System Lifecycle & Routing (`App.tsx` & `BootSequence.tsx`)
- **Boot Flow:** `BootSequence` (432Hz sine chime) -> `SetupAssistant` (if `!setup_complete`) -> `LoginScreen` -> `Desktop`.
- **Recovery Mode:** Triggered by `Ctrl + M` during the boot sequence.
- **Persistence:** `localStorage` allows the OS to "freeze" its state across reloads.

### 2. Virtual File System (`FileSystemContext.tsx`)
- **Virtual Nodes:** Files and folders represented as objects with unique IDs, parent IDs, and metadata (tags, locked status, modification date).
- **Persistent Storage:** Synchronized to `localStorage` on every change.
- **Trash Logic:** Deletion moves nodes to the `trash` folder; `emptyTrash` recursively purges child IDs.

### 3. Window Management (`Window.tsx`)
- **Genie Effect:** Custom cubic-bezier transition paths using Framer Motion to simulate "sucking" into the Dock.
- **Active State:** Z-index and focus managed via `activeApp` state.
- **Injection:** Apps are dynamically rendered inside the window frame based on the `AppMap` registry.

### 4. Hardware & Environment Integration
- **Dynamic Menu Bar:** Subscriber-based items that change context based on the foreground application.
- **Dynamic Wallpaper:** 4-stage 24-hour cycle (Dawn, Day, Dusk, Night) using the `useDynamicWallpaper` hook and Unsplash representative assets.
- **Battery & Power:** Real hardware level tracking + simulated "Power Modes" (Low Power, Normal, High Performance) determined by battery percentage.

---

## 🛠️ Development Workflow
```bash
cd tahoe-os-v4
npm install     # Install architecture dependencies
npm run dev     # Launch OS simulation (Vite)
npm run build   # Production static deployment
```

## 📜 Development Conventions
- **Naming:** PascalCase for components, camelCase for props/hooks.
- **Animation First:** All UI interactions *must* have a Framer Motion wrapper for the "Liquid Glass" feel.
- **Verification:** Changes to system settings or apps should be validated by triggering a system reset via `Settings -> General -> Transfer or Reset`.
- **Z-Index Map:**
  - Wallpaper: -1
  - Desktop Grid: 0
  - Windows: 10-50
  - Dock/MenuBar: 40
  - Spotlight/Modals: 100+
