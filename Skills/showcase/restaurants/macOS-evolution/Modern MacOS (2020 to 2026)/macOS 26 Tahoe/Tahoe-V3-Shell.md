# 🏛️ OPENCLAW RECIPE: TAHOE V3 SHELL
> **Lead Architect:** @Aashmanshukla3223
> **Target:** M5 Max Hardware Simulation (2026)

## 🧪 PHYSICS & CIVICS (SYSTEM CONSTANTS)
- **Glass:** `backdrop-filter: blur(50px) saturate(190%)`
- **Notch:** 180px x 30px (Center Anchor)
- **Dock:** Dynamic Scaling (Scale: 1.0 -> 1.5 on Hover)
- **Kernel:** Simulated Darwin 25.0.0

## 🛠️ CORE LOGIC MODULES
1. **Power & Time:** Sync with Browser `Battery API` and `Date()`.
2. **Context Engine:** Implement `onContextMenu` for Desktop Right-Click.
3. **Control Center:** Stateful toggle for Wi-Fi, Bluetooth, and Brightness sliders.
4. **App Registry:** Logic to switch the Menu Bar title based on the active window.

## 🎨 VISUAL ASSETS
- **Wallpaper:** Replicate macOS Tahoe 2026 (Liquid gradients of Blue/Purple).
- **Notch Indicator:** Green LED dot (Active when `isCameraOn` is true).
- **Traffic Lights:** Red, Yellow, Green (Middle-aligned window title).

## ⚡ THE MASTER PROMPT (CAVEMAN)
"Using `/caveman-full-stack-developer` and Framer Motion: 
Build the OpenClaw V3 Shell. The Shell must be the 'Front Door' of the OS. 
- Center a black Notch (180px) with a camera LED.
- Build a Menu Bar that splits around the notch; Left side changes with 'activeApp' state.
- Build a Desktop with right-click contextual menus (New Folder, Change Wallpaper).
- Build a Dock with 'True Magnification' physics (Icons grow and shift as mouse moves over them).
- Include a Control Center overlay on the top right.
- Ensure all windows have traffic light buttons and middle-aligned titles.
- Strike 1 Logic: The Shell must only render if `setup_complete` is true within the `tahoe_v3_state` key in LocalStorage.
Output ONLY the clean React JSX code block."