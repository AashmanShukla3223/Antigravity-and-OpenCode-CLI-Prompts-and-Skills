# 🚀 MODULE: TAHOE APPLICATIONS (2026)
> **Target OS:** macOS Tahoe (Unit 7)
> **Logic:** Dynamic Indexing & Safari Bridge

## 🧪 THE LOGIC (CAVEMAN)
1. **Local Indexing:** Automatically scan the `/Applications` folder in the simulated Macintosh HD (JSON).
2. **Remote Indexing:** Use a keyword registry (e.g., "Windows XP", "Apple II"). If a keyword matches a folder in the GitHub repo, flag it as a "Web App."
3. **The Safari Bridge:** If a user clicks a "Web App" (remote repo item), the logic triggers `openApp('Safari', {url: 'repo-path'})` instead of opening a local window.

## 🎨 THE UI (TAHOE)
- **Search Bar:** A large, "Liquid Glass" input field at the top with a pulsing AI glow.
- **Grid View:** 2026-style icons with high-refraction hover effects.
- **Remote Badging:** Remote apps (from GitHub) get a small "Cloud" or "Claw" icon badge to distinguish them from local Tahoe apps.

## ⚡ THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Applications App.
1. Create a searchable Grid View of icons.
2. Logic: Define a `LOCAL_APPS` constant (Maps, FaceTime, Finder) and a `REMOTE_INDEX` constant (Windows XP, Apple II, etc.).
3. When a REMOTE item is clicked, it MUST execute a function that opens the Safari App and loads the corresponding GitHub/Vercel URL.
4. Implement a 'Neural Search' that filters icons in real-time as the user types.
5. Use the Tahoe 'Liquid Glass' style for the window frame.
Output Code Only."