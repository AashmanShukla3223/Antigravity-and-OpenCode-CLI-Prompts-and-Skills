# 🕹️ MODULE: TAHOE APPLE ARCADE (2026)
> **Target OS:** macOS Tahoe (Unit 7)
> **Logic:** Game Loop Registry / Emulator Bridge

## 🎨 THE UI (APPLE ARCADE 2026 PRINCIPLES)
- **The Dashboard:** A large, edge-to-edge "Cinematic Scroll" featuring the current top game.
- **Glass Tiles:** Each game tile is a "Silicon Glass" container. Hovering over a tile triggers a `framer-motion` 3D-tilt and a subtle "Glow" effect.
- **Visuals:** The sidebar features categories: "Action", "Legacy", "OpenClaw Originals", and "Restaurants".
- **Icon:** A vibrant 3D "Joystick" in Apple Red sitting on a refractive glass base with a 2026 silicon-edge highlight.

## 🧪 THE LOGIC (CAVEMAN)
1. **The Game Registry:** A JSON array `GAMES`. Each object contains `{ title, genre, buildUrl, developer, icon }`.
2. **The Launch Bridge:** Clicking "Play" doesn't just open a window—it triggers `openGame(gameId)`.
3. **Logic:** If a game is from the "Legacy" category (e.g., Apple II Snake), the app bridges to a specialized Emulator Canvas.
4. **Game Center Sync:** Simulated "Achievement" notifications that pop up from the Tahoe Notch when a user "installs" or plays a game.

## ⚡ THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Apple Arcade App.
1. Create a 3D-tiled dashboard showing at least 4 game posters.
2. Logic: Implement a 'Play' button on each poster. When clicked, it should render a placeholder 'Loading Silicon Graphics...' screen.
3. Feature: Create a functional 'Snake' game (or a simple 'Arcade' placeholder) that can be played inside the window using arrow keys.
4. Physics: Use 'Liquid Glass' for the navigation and a high-saturation 'Arcade Glow' for the background gradients.
5. Integration: Link one of the tiles to the 'Windows XP Restaurant' for 'Minesweeper'.
Output Code Only."