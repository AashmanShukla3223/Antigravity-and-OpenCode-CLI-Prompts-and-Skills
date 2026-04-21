# 🌐 MODULE: TAHOE SAFARI (2026) - RESTAURANT EDITION
> **Target OS:** macOS Tahoe (Unit 7)
> **Bridge:** Cross-Folder Iframe Navigation

## 🧪 THE "RESTAURANT" LOGIC
1. **The Claw-Path:** The Safari address bar must recognize internal repo paths. 
2. **Logic:** If the `URL` input starts with `/Restaurants/`, Safari should attempt to resolve the path relative to the root of the Vercel deployment.
3. **Sandbox:** Ensure the iframe has `allow-scripts` and `allow-same-origin` enabled so the Windows XP "Restaurant" logic actually runs inside the Tahoe window.

## ⚡ THE UPDATED PROMPT
"Using `/caveman-full-stack-developer`: Build the Tahoe Safari App.
- Include a 'Restaurant Mode' in the address bar.
- Logic: When a user selects 'Windows XP' from the Applications App, Safari must navigate to: `./Skills/Showcase/Restaurants/Windows-XP/index.html`.
- UI: Ensure the Iframe has a 'Clean Cut' border so the XP taskbar aligns perfectly with the Tahoe window frame.
Output Code Only."