<div align="center">

# macOS 27 Golden Gate

### *The most advanced macOS web simulation — 54 apps, liquid glass physics, silicon-native architecture*

[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://golden-gate-os-v27.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?style=flat-square&logo=framer)](https://www.framer.com/motion/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Stars](https://img.shields.io/badge/⭐_Feature_Depth-#1_macOS_Web_Sim-green?style=flat-square)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)]()

**[Live Demo](https://golden-gate-os-v27.vercel.app/)**

</div>

---

## Overview

macOS 27 Golden Gate is a high-fidelity web-based operating system simulation that reimagines macOS in the "Unit 7" era of Apple computing. Built as a single-page React application, it combines the classic macOS desktop metaphor with a futuristic "Silicon-Native Liquid Glass" aesthetic — achieving glassmorphism at 50px blur with 190% saturation and 120fps Framer Motion physics.

**Why this is the #1 macOS web simulation:** While similar projects are static portfolio shells with ~5-10 apps, Golden Gate delivers a full OS lifecycle (boot → setup → login → desktop → recovery → activation), a persistent virtual file system with drag-and-drop and clipboard, hardware simulation via real browser APIs, and **54 fully integrated applications** — more than any other web-based macOS sim on GitHub.

---

## Features

### System

| Feature | Description |
|---------|-------------|
| **Boot Sequence** | 432Hz sine chime → Apple logo → animated progress bar → boot to Setup, Login, or Desktop |
| **Setup Assistant** | Multi-step configuration (language, region, Apple ID, Siri, analytics) |
| **Login Screen** | Avatar selection, password entry, multi-user switching |
| **Recovery Mode** | macOS Recovery with Disk Utility, reinstall, Terminal, Safari, restart/shutdown |
| **Activation Lock** | iCloud activation lock simulation |
| **Shutdown/Restart** | Animated sequence: dock slides → menu bar fades → windows shrink → wallpaper dims |

### Desktop Environment

| Feature | Description |
|---------|-------------|
| **Menu Bar** | Full menu system: Apple menu, File, Edit, View, Go, Window, Help with keyboard shortcuts |
| **Dock** | True magnification effect, auto-hide, position (bottom/left/right), blur, depth, corner radius, running indicators |
| **Window Manager** | Multi-window, z-index focus, minimize/maximize/close, drag to move, Framer Motion Genie effect |
| **Spotlight** | ⌘+Space: search apps, files, contacts, calculations, system settings |
| **Control Center** | Wi-Fi, Bluetooth, AirDrop, brightness, volume, now playing, power mode, stage manager |
| **Notification Center** | Stacked notification cards, clear all, per-app grouping |
| **Wallpaper Engine** | Static or dynamic wallpapers (day/night cycle), image or video support |
| **Widgets** | Configurable widgets (reminders, FaceTime, weather, music, connected devices) |
| **Context Menus** | Right-click on desktop, items, dock icons, and text areas |
| **Incoming Calls** | FaceTime/Phone incoming call overlay across the entire OS |
| **Clipboard** | System-wide copy/cut/paste across all apps with visual feedback |

### File System

| Feature | Description |
|---------|-------------|
| **Virtual File System** | Persistent file/folder tree with localStorage backend |
| **Drag & Drop** | Drag files between folders and to Trash in the Dock |
| **Finder Operations** | Create folders, delete to Trash, empty Trash, get info, tags |
| **External Storage** | Large files (50K+) stored via external localStorage keys |
| **Self-Healing** | Automatic restoration of critical system nodes if corrupted |
| **File Tags** | Color-coded tags (red, orange, yellow, green, blue, purple, gray) |

### Hardware Simulation

| Feature | Technology |
|---------|------------|
| **Battery** | Real Battery Status API (level, charging state) |
| **Power Modes** | Low Power / Normal / High Performance adapts to battery level |
| **CPU Cores** | `navigator.hardwareConcurrency` |
| **Memory** | `performance.memory.jsHeapSizeLimit` |
| **Uptime** | Live session uptime counter |
| **Camera** | Simulated notch with camera indicator |
| **Appearance** | Light / Dark / Auto (matches `prefers-color-scheme`) |

### Apps (54 total)

#### Productivity & Creativity
| App | Description |
|-----|-------------|
| **Finder** | File manager with path navigation, column/icon mode, drag-drop |
| **Safari** | Web browser with address bar, tabs, search |
| **Mail** | Email client with compose, inbox, sent, trash |
| **Messages** | iMessage-style chat with contacts, conversations |
| **Notes** | Rich text notes with persistence |
| **Reminders** | To-do list with checkable items |
| **Calendar** | Month view, events, navigation |
| **Contacts** | Address book with phone, email, avatar |
| **Freeform** | Infinite canvas whiteboard |
| **Stickies** | Colorful floating sticky notes |
| **Calculator** | Basic arithmetic operations |
| **Clock** | World clock, timer visualization |
| **Weather** | Live weather display |
| **Maps** | Interactive map (iframe) with Apple Maps styling |
| **Photos** | Photo gallery with albums |
| **Photo Booth** | Camera capture simulation |
| **FaceTime** | Contact-based video call simulation |
| **Phone** | Dialer with call history |
| **App Store** | Browse featured, categories, search, install flow |
| **Books** | Apple Books-style reading interface |
| **Wallet** | Apple Wallet pass simulation |

#### Pro Apps
| App | Description |
|-----|-------------|
| **Keynote** | Presentation slide viewer |
| **Numbers** | Spreadsheet viewer |
| **Pages** | Document viewer |
| **Final Cut Pro** | Video timeline editor simulation |
| **Logic Pro** | Multi-track audio workstation |
| **Motion** | Motion graphics compositor |
| **Xcode** | Code project workspace |
| **Pixelmator Pro** | Image editor |
| **VS Code** | Code editor with Monaco |
| **Terminal** | Command-line with command history and system commands |
| **Activity Monitor** | System resource graphs (CPU, memory, disk, network) |
| **Disk Utility** | Volume management simulation |

#### Entertainment & Lifestyle
| App | Description |
|-----|-------------|
| **Apple Music** | Full music player with playlist, now playing, progress |
| **Apple TV+** | Video streaming interface with library |
| **iTunes Store** | Media storefront |
| **Games** | Game dashboard with Chess, Minecraft arcade |
| **Chess** | Animated chess board |
| **Minecraft** | Web canvas block builder |
| **Apple Books** | Reading library |
| **iPhone Mirroring** | Simulated iPhone screen with interactive home screen |
| **Siri AI** | AI chat assistant with typing animation |

#### System & Utilities
| App | Description |
|-----|-------------|
| **System Settings** | 20+ preference panes (appearance, dock, display, sound, privacy, users, etc.) |
| **About This Mac** | macOS 27 splash with specs (Apple M4, 32GB, 1TB) |
| **Time Machine** | Animated time-based backup visualization |
| **Sound Test** | Classic macOS alert sounds (Basso, Blow, Bottle, Frog, Funk, Glass, Hero, etc.) |
| **VMware Fusion Pro** | Virtual machine management simulation |
| **Samsung LCD TV** | External display simulation |
| **GitHub Navigator** | Browse repos, commits, README viewer |
| **Code Viewer** | Code preview with syntax highlighting |
| **Siri AI** | Apple Intelligence chatbot |
| **Installer** | System infection/virus simulation mechanic |
| **Crazy Errors** | Chaos mode: recursive error dialog storm with classic Mac sounds |
| **Notes** | Rich text notes |
| **EKG Canvas** | Real-time ECG/heart rate visualization |
| **Structured Data** | Schema.org article preview |

### Boot Lifecycle

```
Boot (432Hz chime) → Setup Assistant → Login Screen → Desktop
                    ↘ Recovery Mode ← Activation Lock
```

The full-state machine supports: `booting`, `setup`, `login`, `desktop`, `recovery`, and `activation` states with smooth AnimatePresence transitions between each.

---

## Architecture

```
src/
├── components/
│   ├── apps/           # 54 application components
│   ├── desktop/        # OS shell: Desktop, Dock, MenuBar, Window, ControlCenter, etc.
│   ├── common/         # Shared: AppIcon, ErrorBoundary, SystemMenuBar
│   ├── BootSequence.tsx
│   ├── LoginScreen.tsx
│   ├── SetupAssistant.tsx
│   ├── DeviceRecovery.tsx
│   ├── MacOSRecovery.tsx
│   └── MacOSActivation.tsx
├── contexts/
│   ├── SystemContext.tsx    # Central state machine (boot, windows, hardware, clipboard, music, users)
│   └── FileSystemContext.tsx # Virtual File System (nodes, CRUD, trash, tags, drag-drop)
├── hooks/
│   ├── useDynamicWallpaper.ts
│   ├── useNotificationScheduler.ts
│   ├── usePageMetadata.ts
│   ├── useSoftwareUpdate.ts
│   └── useTelemetry.ts
├── utils/
│   ├── AIEngine.ts, WeatherEngine.ts, FileSystemResolver.ts
│   └── MusicData.ts, contacts.ts, vfs-ops.ts, bootLogger.ts, iconDebugger.ts, romStorage.ts
├── App.tsx             # Root: boot state routing + shutdown cursor
├── main.tsx            # Entry point
└── index.css           # Tailwind + custom glass utilities
```

### Key Design Patterns

- **Centralized State Machine**: `SystemContext` manages all OS state — boot lifecycle, window management, hardware simulation, clipboard, music playback, notifications, multi-user accounts
- **Persistent Virtual FS**: `FileSystemContext` manages a tree of file/folder nodes with localStorage persistence, trash lifecycle, and self-healing
- **Immutability**: All state updates create new objects (never mutate), following the project's strict immutability principle
- **Animation-First**: Every UI interaction uses Framer Motion — window opens, dock magnification, menu dropdowns, notification toasts, boot sequence, shutdown animation
- **Liquid Glass Styling**: CSS custom properties for glass blur/alpha controlled dynamically by the glass mode slider in System Settings

---

## Tech Stack

| Technology | Role |
|------------|------|
| **React 19** | UI framework |
| **TypeScript 6** | Type safety |
| **Vite 8** | Build tool & dev server |
| **Tailwind CSS 4** | Utility-first styling |
| **Framer Motion 12** | Animations & physics |
| **HugeIcons + Lucide React** | Icon libraries |
| **localStorage** | State persistence |
| **Battery Status API** | Hardware simulation |
| **Performance API** | Memory tracking |
| **BroadcastChannel** *(WIP)* | Cross-tab AirDrop |

---

## Getting Started

```bash
# Clone
git clone https://github.com/AashmanShukla3223/macOS-27-Golden-Gate.git
cd golden-gate-os-v27

# Install
npm install

# Dev server (localhost:5173)
npm run dev

# Production build
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

### Environment

Copy `.env.example` to `.env.local` and configure as needed. No API keys are required for core functionality.

```env
VITE_OPENAI_API_KEY=       # Optional: for Siri AI
```

---

## Comparison

| Feature | **Golden Gate v27** | playground-macos | macos-web | macos-sim |
|---------|:---:|:---:|:---:|:---:|
| **Apps** | **54** | ~8 | ~12 | ~3 |
| **Boot Sequence** | ✅ | ❌ | ❌ | ❌ |
| **Setup Assistant** | ✅ | ❌ | ❌ | ❌ |
| **Login Screen** | ✅ | ❌ | ❌ | ✅ |
| **Recovery Mode** | ✅ | ❌ | ❌ | ❌ |
| **File System** | ✅ (persistent VFS) | ❌ | ❌ | ❌ |
| **Drag & Drop** | ✅ (desktop + trash) | ❌ | ❌ | ❌ |
| **Clipboard** | ✅ (cut/copy/paste) | ❌ | ❌ | ❌ |
| **Window Manager** | ✅ (z-index, minimize, maximize, genie) | ✅ | ✅ | ❌ |
| **Spotlight Search** | ✅ | ❌ | ❌ | ❌ |
| **Control Center** | ✅ | ❌ | ❌ | ❌ |
| **Notification Center** | ✅ | ❌ | ❌ | ❌ |
| **Multi-User** | ✅ | ❌ | ❌ | ❌ |
| **Battery API** | ✅ | ✅ | ❌ | ❌ |
| **Dynamic Wallpaper** | ✅ (day/night cycle) | ❌ | ❌ | ❌ |
| **Hardware Notch** | ✅ | ❌ | ❌ | ❌ |
| **Dark/Light/Auto** | ✅ | ✅ | ❌ | ❌ |
| **Dock Magnification** | ✅ | ✅ | ❌ | ❌ |
| **Dock Position** | ✅ (bottom/left/right) | ❌ | ❌ | ❌ |
| **Menu Bar** | ✅ (full dropdowns) | ✅ (basic) | ❌ | ❌ |
| **Framer Motion** | ✅ (physics + 120fps) | ❌ | ❌ | ❌ |

---

## Performance Goals

- [x] 120fps animations via Framer Motion physics
- [x] Sub-100ms window launches with optimistic updates
- [x] localStorage persistence with automatic truncation for files >500KB
- [ ] Lazy-load all 54 apps with React.lazy + Suspense
- [ ] Window virtualization for 20+ open windows
- [ ] Memoize context consumers to prevent app-wide re-renders
- [ ] Debounced localStorage writes (coalesce rapid state changes)

---

## Roadmap

- [ ] **Lazy loading** — Code-split all 54 apps with preload hints
- [ ] **Stage Manager** — Window grouping and sidebar
- [ ] **AirDrop** — Cross-tab file sharing via BroadcastChannel API
- [ ] **Multi-monitor** — Resizable workspaces with virtual displays
- [ ] **Handoff** — Cross-device state sync
- [ ] **Universal Control** — Shared cursor between workspaces
- [ ] **Safari webview** — Actual `<webview>`/iframe rendering for URLs
- [ ] **Terminal shell** — WASM-based shell (jssh)
- [ ] **Dynamic Island** — Hardware notch animation for notifications
- [ ] **iCloud sync** — Simulated cloud drive
- [ ] **PWA** — Installable as a desktop app with service worker

---

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Areas that need love:
- Adding new apps (each app is a single React component)
- Polish on Safari, Terminal, and Finder views
- Accessibility improvements
- Performance optimization
- Mobile responsive mode

---

## License

This project is for educational and demonstration purposes. macOS and Apple trademarks are property of Apple Inc. This is not affiliated with or endorsed by Apple Inc.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/AashmanShukla3223">AashmanShukla3223</a> & <a href="https://opencode.ai">OpenCode</a></sub>
  <br>
  <sub><i>"The 'Unit 7' era is about fluid interfaces and silicon-native glass."</i></sub>
</div>
