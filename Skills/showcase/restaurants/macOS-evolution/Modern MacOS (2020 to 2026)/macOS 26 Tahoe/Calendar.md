# 📅 MODULE: TAHOE CALENDAR (2026)
> **Target OS:** macOS Tahoe (Unit 7)
> **Logic:** System Date API / Dynamic Asset Generation

## 🎨 THE ICON (DYNAMIC SPEC)
- **Top Bar (Month):** Background: Red (#FF3B30). Text: White, "SF Pro Bold", Center-aligned.
- **Bottom Section (Day):** Background: White. Text: Black (or Dark Gray), Large "SF Pro Light".
- **The Logic:** The icon must be a React component that uses `new Date()` to grab the month (short name) and date.
- **Depth:** 0.5px border to separate the red "Month" header from the "Date" body.

## 🧪 THE LOGIC (CAVEMAN)
1. **The Clock Loop:** Use a `useEffect` with a 60-second interval to ensure the icon and the app stay synced with the real world.
2. **The View:** Triple-view toggle (Day, Month, Year).
3. **OpenClaw Events:** Hardcode "Holidays" representing project milestones:
    - **April 14:** "Tahoe V3 Launch Day".
    - **January 1:** "The Genesis (Unit 1) Deployment".
4. **Sidebar:** "Liquid Glass" navigation showing different "Calendars" (Work, Personal, Restaurants).

## ⚡ THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Calendar App.
1. Icon Logic: Create a standalone component for the Calendar Icon that renders the CURRENT Month and Day using the Date API.
2. The App: Create a sleek 'Month View' grid. 
3. Feature: Highlight today's date with a pulsing red circle.
4. Data: Populate the calendar with 'OpenClaw Milestones' (e.g., 'Windows XP Restaurant Grand Opening').
5. Physics: Use 'Liquid Glass' for the app header and sidebar.
Output Code Only."