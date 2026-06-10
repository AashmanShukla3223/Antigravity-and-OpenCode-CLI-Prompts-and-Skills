# macOS 27 Golden Gate

> *"Unit 7" Era — Silicon-Native Liquid Glass*

A high-fidelity web-based macOS simulation built with React 19, TypeScript, and Framer Motion. Experience the complete macOS lifecycle — boot, setup, login, desktop, recovery — all in your browser.

---

## Preview

![Desktop](https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.1.15/macOS.png)
*Desktop with Dock, Menu Bar, and active windows.*

![Video Tour](https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.1.16/macos-tour.gif)

![OTA Update](https://github.com/AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills/releases/download/v1.1.16/ota-upgrade.gif)
*Over-the-air update notification with version comparison.*

---

## Features

### System Lifecycle
- **Boot Sequence** — Apple logo on black with progress bar, startup chime (432Hz sine wave), dead drive state with flashing `?` folder
- **Setup Assistant** — 12-step onboarding: language carousel, region/keyboard selection, privacy analytics, Apple ID & account creation, avatar picker, appearance/tint settings, terms agreement, timezone auto-detect
- **Login Screen** — User authentication with password, time/date display, battery status, sleep/restart/shut down controls
- **Recovery Mode** — Full macOS Recovery environment with 4 utilities: Time Machine restore, Reinstall macOS, Safari support, Disk Utility
- **Activation Lock** — Post-reinstall activation screen

### Desktop Environment
- **Liquid Glass UI** — Glassmorphism with dynamic blur (0-100px) and opacity (0-100%) sliders, CSS-variable-driven theming
- **Menu Bar** — Apple menu, app-specific menus, date/time display, battery with power modes, WiFi, Spotlight, FaceTime, Control Center
- **True-Magnification Dock** — Framer Motion spring physics with magnification effect, Genie minimize animation, running app indicators
- **Window Manager** — Draggable/resizable windows with traffic light controls (close/minimize/maximize), Genie effect minimizes to Dock, z-index stacking
- **Dynamic Wallpaper** — 4-stage 24-hour cycle (Dawn, Day, Dusk, Night)
- **Notifications** — Banner notifications, incoming call overlay
- **Spotlight** — System-wide search (`Cmd+Space`), file/app/contact lookup, AI-powered query answering

### Hardware Simulation
- **Battery Status API** — Real battery level with adaptive power modes (Low Power < 30%, Normal, High Performance > 50%)
- **CPU/Memory Monitor** — `navigator.hardwareConcurrency`, `performance.memory`, real-time telemetry overlay
- **Uptime Tracking** — Elapsed system uptime
- **Simulated Notch** — Hardware notch with camera indicator

### Apps
40+ built-in applications:

| Category | Apps |
|---|---|
| **System** | Finder, Terminal, Activity Monitor, Disk Utility, Time Machine |
| **Communication** | Messages, Mail, FaceTime, Phone, Contacts |
| **Media** | Photos, Apple Music, Apple TV+, iTunes Store, Sound Test |
| **Productivity** | Calendar, Reminders, Notes, Stickies, Calculator, Clock |
| **Internet** | Safari, Maps, Weather, GitHub Navigator |
| **Shopping** | App Store, Apple Books, Apple Wallet, iTunes Store |
| **Utilities** | System Settings, Siri, About This Mac, Launchpad |
| **Special** | Samsung LCD TV Simulator, iPhone Mirroring, Code Viewer, About Me, Installer |

### AI Integration
- **Siri AI** — Multi-provider chat interface (Gemini, Groq, OpenRouter) with system command execution
- **Spotlight AI** — Ask questions directly, get answers via `showAlert` without any API key
- **Weather Queries** — Real weather data from free Open-Meteo API, answered inline in Spotlight, Siri, and Intelligence Popup

### Clock App
- **Alarm** — Scroll wheel time picker, multi-ringtone selector (FaceTime, Halla Bol, Luz Roja, Reflection), toggle on/off
- **World Clock** — Default Mumbai, India; add cities from a searchable timezone list; real-time auto-refresh
- **Stopwatch** — 10ms precision with Start, Lap, Stop, Reset and lap history
- **Timer** — Multiple concurrent timers with per-timer ringtones, progress bars, countdown

### Over-the-Air Updates
The system polls `version.json` 10 seconds after reaching desktop, then every 30 minutes. When a newer version is detected, a notification banner appears with update notes and restart prompt.

```
Local: 27.0.0 → Remote: 27.1.0 → Alert user → Restart → Reboot into new version
```

---

## Evolution: Tahoe → Golden Gate

macOS Golden Gate is the successor to **macOS Tahoe (v26)**.

| | Tahoe (v26) | Golden Gate (v27) |
|---|---|---|
| **Framework** | React 18 | React 19 |
| **Build Tool** | Vite 5/6 | Vite 8 |
| **Styling** | Tailwind CSS 3 | Tailwind CSS 4 |
| **Animations** | Framer Motion 10 | Framer Motion 12 |
| **Storage** | `tahoe_v3_state` | `golden_gate_v27_state` |
| **New Apps** | — | Clock, About Me, Samsung LCD TV Simulator, GitHub Navigator, Code Viewer, EKG Canvas |
| **New Features** | — | OTA updates, System Infection/Chaos Mode, 12-step Setup Assistant, Dynamic Glass sliders, Spotlight AI, Siri multi-provider, Widget Picker, Incoming Call Overlay |

---

## Tech Stack

| Technology | Version | Role |
|---|---|---|
| React | ^19.2.4 | UI framework |
| Vite | ^8.0.4 | Build tool & dev server |
| TypeScript | ~6.0.2 | Language |
| Framer Motion | ^12.38.0 | Animations & gestures |
| Tailwind CSS | ^4.2.2 | Utility-first styling |
| HugeIcons React | ^0.4.0 | Icon library |
| Lucide React | ^1.8.0 | Icon library |

---

## Getting Started

```bash
cd golden-gate-os-v27
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The boot sequence starts immediately.

### Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
golden-gate-os-v27/
├── public/
│   ├── sounds/          # 17 system sounds (Basso, Glass, Hero, etc.)
│   ├── icons/           # 50+ app and system icons
│   ├── wallpapers/      # Desktop wallpapers
│   ├── music/           # 60+ music tracks
│   ├── fonts/           # SF Pro Display font family
│   ├── assets/          # Cursors, status icons, MIME icons, preferences
│   ├── version.json     # OTA version manifest
│   └── favicon.{png,svg} # Browser tab icons
├── src/
│   ├── components/
│   │   ├── desktop/     # OS shell (MenuBar, Dock, Window, ControlCenter, Spotlight)
│   │   ├── apps/        # 40+ application modules
│   │   ├── common/      # Shared UI (AppIcon, SystemMenuBar)
│   │   ├── BootSequence.tsx
│   │   ├── SetupAssistant.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── MacOSRecovery.tsx
│   │   └── MacOSActivation.tsx
│   ├── contexts/
│   │   ├── SystemContext.tsx      # OS state machine
│   │   └── FileSystemContext.tsx  # Virtual file system
│   ├── hooks/           # Dynamic wallpaper, OTA updates, telemetry
│   └── utils/           # AI engine, weather engine, data files
├── vercel.json          # Vercel deployment config
└── vite.config.ts       # Vite build config
```

---

## Configuration

### localStorage Keys

| Key | Purpose |
|---|---|
| `golden_gate_v27_state` | Main OS state (settings, pinned apps, music, notes, widgets) |
| `golden_gate_v27_fs` | Virtual file system data |
| `golden_gate_infected` | System infection flag (chaos mode) |
| `golden_gate_music_unlocked` | Music app unlock |
| `golden_gate_v27_alarms` | Clock alarms |
| `golden_gate_v27_worldcities` | World clock cities |
| `golden_gate_v27_timers` | Timer data |
| `golden_gate_siri_*` | Siri AI provider keys |

### Glass Styling

CSS variables on `:root`:

```css
--glass-blur: 50px;
--glass-bg-dark: rgba(0, 0, 0, var(--glass-opacity));
--glass-bg-light: rgba(255, 255, 255, var(--glass-opacity));
```

Adjustable in System Settings → Appearance → Liquid Glass.

---

## Deployment

### Vercel

The project includes `vercel.json` with SPA rewrites. Deploy from the project directory:

```bash
vercel --prod
```

Set **Root Directory** in Vercel dashboard → Settings → General to:

```
Skills/showcase/restaurants/macOS-evolution/Modern MacOS (2020 to 2026)/macOS 27 Golden Gate/golden-gate-os-v27
```

### Build

```bash
npm run build
```

Outputs to `dist/` — deployable as a static site.

---

## Easter Eggs

- **Chaos Mode** — Run the Installer app to infect the system. Errors cascade until forced restart. Background track: *LUZ ROJA - Sped Up*.
- **Ctrl+M** during boot — Enter Recovery Mode
- **Ctrl+Shift+D** on desktop — Developer debug panel
- **Sound Test Premium** — Unlock via Apple Pay ($5.00 simulated) to access Halla Bol, Luz Roja, and other tracks

---

## Acknowledgments

Built with React, Framer Motion, and Tailwind CSS. Icons from HugeIcons, Lucide, and custom Apple-style SVGs. Sound files sourced from classic macOS system sounds.

---

*macOS Golden Gate v27.0.0 (Build 27A405)*
