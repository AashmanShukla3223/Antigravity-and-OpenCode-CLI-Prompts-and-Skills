# 🗑️ MODULE: TAHOE TRASH (2026)
> **Target OS:** macOS Tahoe (Unit 7)
> **Logic:** State-Based File Deletion / Recovery Engine

## 🎨 THE UI (APPLE TRASH 2026 PRINCIPLES)
- **The Window:** A "Clean White" or "Translucent Glass" pane with a top-mounted "Empty" button.
- **Dock Icon Logic:** - **State: Empty:** A sleek, refractive wire-mesh bin.
    - **State: Full:** The bin filled with crumpled "Glass Paper" textures.
- **The Divider:** A vertical 1px line (0.2 opacity) that separates the Trash icon from the rest of the Dock apps.

## 🧪 THE LOGIC (CAVEMAN)
1. **The Trash Registry:** A global `TRASH_BIN` state (Array).
2. **Move-to-Trash:** Any file deleted in **Finder.md** or **Notes.md** is pushed here instead of being permanently erased.
3. **Recovery (Put Back):** A right-click context menu option on items inside the Trash that restores them to their original `parentFolder` path.
4. **Empty Trash:** A final purge that clears the `TRASH_BIN` array and triggers a high-fidelity "Paper Crunch" sound effect.

## ⚡ THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Trash App.
1. Create a dedicated Dock Icon with two states (Empty/Full).
2. Logic: Implement a 'Trash Bin' array that stores deleted objects from the Finder.
3. Feature: Build the 'Empty Trash' function with a confirmation 'Liquid Glass' dialog.
4. UI: The Trash window should display items in a grid with a 'Put Back' option on right-click.
5. Civics: Ensure the Trash icon is positioned on the far right of the dock, separated by a vertical glass divider line.
Output Code Only."