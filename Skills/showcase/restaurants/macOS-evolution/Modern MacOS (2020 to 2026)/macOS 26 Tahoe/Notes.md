# 📝 MODULE: TAHOE NOTES (2026)
> **Target OS:** macOS Tahoe (Unit 7)
> **Logic:** ContentEditable Engine / LocalStorage Sync (iCloud Simulation)

## 🎨 THE UI (APPLE NOTES 2026 PRINCIPLES)
- **The Triple-Pane:** 1. **Folders Sidebar:** (Blur 45px) "All iCloud", "OpenClaw Drafts", "Restaurant Notes".
    2. **Notes List:** Clean snippets with the Title, Date, and a 1-line preview.
    3. **Editor Surface:** A subtle "Paper-Glass" texture (`rgba(255,255,255,0.85)` with light grain).
- **Toolbar:** Floating "Glass Pill" at the top with formatting buttons (Bold, Checklist, Photos, Share).
- **Icon:** The classic yellow-topped notepad, but with a 2026 "Silicon Refraction" and a glass pencil.

## 🧪 THE LOGIC (CAVEMAN)
1. **The Sync Engine:** Use `window.addEventListener('storage')` to simulate iCloud. If a user opens Notes in a second window/tab, changes sync in real-time.
2. **Rich Text:** Use a `contentEditable` div or a lightweight React library (like `Quill-lite`) to support bolding and lists.
3. **Folders:** Organize notes by "Units." (e.g., A folder for "Unit 5: Flat Era" research).
4. **Auto-Save:** Every keystroke updates a `NOTES_REGISTRY` in `localStorage`.

## ⚡ THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Notes App.
1. Create a 3-pane responsive layout. 
2. Logic: Implement a functional text editor area where users can type and format text.
3. Feature: Create a 'New Note' button that adds a timestamped entry to the middle list.
4. Sync: Use LocalStorage to save and retrieve notes so they persist after a refresh.
5. Physics: Apply 'Liquid Glass' to the sidebar and a 'Paper-Glass' texture to the editor background.
Output Code Only."