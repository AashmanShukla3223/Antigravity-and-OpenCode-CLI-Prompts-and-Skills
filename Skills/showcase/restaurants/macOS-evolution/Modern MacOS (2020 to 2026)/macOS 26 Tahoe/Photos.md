# 🖼️ MODULE: TAHOE PHOTOS (2026)
> **Target OS:** macOS Tahoe (Unit 7)
> **Logic:** Shared Media Registry / LocalStorage Gallery

## 🎨 THE UI (APPLE PHOTOS 2026)
- **Sidebar:** Categories: "All Photos", "Museum Units", "Photo Booth", "Deleted".
- **Dynamic Grid:** Photos should vary slightly in size (Pinterest-style) or stay in a perfect, sharp "Square Grid" with 2px gaps.
- **Lightbox:** Clicking a photo expands it into a "Liquid Glass" modal with blurred background and metadata (Dimensions, Camera: M5 Max Neural).
- **Icon:** The multi-colored "Flower" but with a 2026 glass-morphism depth.

## 🧪 THE LOGIC (CAVEMAN)
1. **The Shared Library:** Use a global state (or `LocalStorage`) `OPENCLAW_GALLERY`. 
2. **Auto-Import:** The app must listen for new blobs sent from the **Photo Booth** or **FaceTime** modules.
3. **Museum Folders:** Hardcode 7 folders representing your 7 Units (Unit 1: Genesis to Unit 7: Silicon).
4. **Hardware Sync:** Images taken via the Tahoe "Camera" get a "Neural Enhanced" badge.

## ⚡ THE PROMPT INJECTION
"Using `/caveman-full-stack-developer` and Framer Motion: Build the Tahoe Photos App.
1. Create a Sidebar + Grid layout.
2. Logic: Implement a 'Photo Registry' that pulls images from a shared array. 
3. Feature: Create a functional 'Lightbox'—when an image is clicked, it zooms to the center with a backdrop-blur.
4. Museum Mode: Pre-load the gallery with 7 placeholder 'Museum Unit' images (Unit 1 to Unit 7).
5. Integration: Ensure the app can receive 'New Photo' events from other apps in the Shell.
Output Code Only."