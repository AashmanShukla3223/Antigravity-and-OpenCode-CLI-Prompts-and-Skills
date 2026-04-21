# 🗺️ MODULE: TAHOE MAPS (2026)
> **Target OS:** macOS Tahoe (Unit 7)
> **Logic:** Hardware-Aware Satellite Tracker

## 🎨 THE UI (APPLE MAPS 2026 PRINCIPLES)
- **Floating Controls:** Zoom and Compass controls should be "Glass Pills" floating on the right side.
- **Search Bar:** Centered at the top, `backdrop-filter: blur(25px)`, with a pulsing blue location dot.
- **Visuals:** High-saturation satellite tiles with a custom CSS filter: `contrast(1.2) brightness(0.9) saturate(1.4)`.
- **Icon:** A 2026 "Map Fold" with a prominent red location pin and a 3D shadow.

## 🧪 THE LOGIC (CAVEMAN)
1. **Live Tracking:** Use `navigator.geolocation.watchPosition` to center the map on the user’s real-world coordinates.
2. **Engine:** Use a lightweight Leaflet provider (OpenStreetMap Sat Tiles) to avoid heavy Google Maps API keys.
3. **Hardware Sync:** If the `Battery API` shows "Low Power Mode," the map should automatically switch to a "Vector Wireframe" mode to save resources.
4. **The Notch Protocol:** The Maps search bar must automatically slide 40px lower if the window is moved directly under the Hardware Notch.

## ⚡ THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Maps App.
1. Integrate a functional map using the React-Leaflet library (or a native Iframe tile-engine).
2. Logic: Implement a 'Find My Location' button that triggers the Browser Geolocation API.
3. Feature: Create a sidebar that lists 'OpenClaw Restaurants' (e.g., Windows XP, Apple II) as physical landmarks on the map.
4. Physics: Apply a 'Neural Glow' to the user's location dot (a pulsing blue orb with refraction).
5. Style: The window frame must use Tahoe 'Liquid Glass' while the map area is edge-to-edge.
Output Code Only."