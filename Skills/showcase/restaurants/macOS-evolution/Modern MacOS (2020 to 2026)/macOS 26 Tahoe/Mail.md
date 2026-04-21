# ✉️ MODULE: TAHOE MAIL (2026)
> **Target OS:** macOS Tahoe (Unit 7)
> **Logic:** Repository Update Feed / JSON-to-Email Simulator

## 🎨 THE UI (APPLE MAIL PRINCIPLES)
- **The Triple-Pane:** 1. **Sidebar:** (Blur 40px) Folders like "Inbox", "Sent", "Drafts", and "Restaurants".
    2. **Message List:** Subject, Date, and a 2-line preview. Highlighting uses Unit 7 Sky Blue.
    3. **Reader Pane:** Clean white (or dark glass) background with a functional "Reply/Forward" toolbar.
- **Visuals:** Use the 2026 "Envelope" icon with a subtle blue/cyan gradient.

## 🧪 THE LOGIC (CAVEMAN)
1. **The Inbox Registry:** A `emails` JSON array. Each entry has a `sender` (e.g., "M1-Steve"), `subject`, and `body` (repo lore).
2. **Dynamic Filtering:** Clicking "Windows-XP" in the sidebar filters the list to only show messages from the XP Restaurant.
3. **Draft Engine:** A functional text area where the user can "type" a mail; clicking Send triggers a "Swoosh" sound and adds it to the "Sent" state.
4. **Unread Badge:** Logic to update the red dot on the Mail icon in the Tahoe Dock.

## ⚡ THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Mail App.
1. Implement a responsive 3-pane layout using CSS Grid.
2. Logic: Populate the inbox with 5 simulated emails about 'OpenClaw' project updates (e.g., 'Unit 6: Flat Era is now open for contributors').
3. Physics: Ensure the sidebar uses the Tahoe 'Liquid Glass' refraction.
4. Feature: Clicking an email in the middle pane must render the full content in the right-hand reader pane with 'SF Pro' typography.
5. Search: Include a top-bar search that filters the subject lines.
Output Code Only."