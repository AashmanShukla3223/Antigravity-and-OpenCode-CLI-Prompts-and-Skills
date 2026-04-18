# 🗒️ MODULE: TAHOE REMINDERS (2026)
> **Target OS:** macOS Tahoe (Unit 7)
> **Logic:** State-Persistence Checklist / Project Roadmap

## 🎨 THE UI (APPLE REMINDERS 2026)
- **The Dashboard:** Four main "Smart Tiles" at the top: **Today** (Blue), **Scheduled** (Orange), **All** (Gray), and **Flagged** (Red).
- **Sidebar:** `backdrop-filter: blur(40px)`. Custom lists like "Tahoe Launch", "Restaurant Repairs", and "OpenClaw V4 Ideas".
- **Visuals:** Hollow circular checkboxes that fill with a vibrant color and a checkmark when clicked.
- **Icon:** Three colored horizontal lines (Blue, Orange, Red) with circular dots on a white/glass background.

## 🧪 THE LOGIC (CAVEMAN)
1. **The Task Registry:** A `tasks` JSON array. Each task has a `list`, `title`, `isCompleted`, and `priority`.
2. **Completion Logic:** When a user clicks a checkbox, use `framer-motion` to trigger a "Strikethrough" animation and move the item to the "Completed" section.
3. **Smart Counting:** The numbers in the top four "Smart Tiles" must update dynamically based on the state of the task registry.
4. **Persistence:** Save the state to `localStorage` so the user's "To-Do" list survives a page refresh.

## ⚡ THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Reminders App.
1. Create a 2-pane layout: A glass sidebar and a main list view.
2. Logic: Implement the 4 'Smart Lists' (Today, Scheduled, All, Flagged) with dynamic counts.
3. Feature: Add an 'Add Task' button that allows users to type a new reminder and assign it a color-coded list.
4. Physics: Use a bouncy spring animation for checking off tasks.
5. Integration: Pre-load the app with tasks like 'Finalize System Settings.md' and 'Deploy V3 to Vercel'.
Output Code Only."