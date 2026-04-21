# 👥 MODULE: TAHOE CONTACTS (2026)
> **Target OS:** macOS Tahoe (Unit 7)
> **Logic:** Contributor Registry / Shared Identity State

## 🎨 THE UI (APPLE CONTACTS 2026)
- **The Split-Pane:** - **Left Sidebar:** `backdrop-filter: blur(45px)`. A clean alphabetical list with circular monogram avatars.
    - **Right Detail View:** The "Contact Poster." A full-bleed gradient background with the contact's name in giant, translucent "SF Pro Display" text.
- **Visuals:** Functional buttons for "Message", "Call", and "Mail" that trigger their respective Tahoe apps.
- **Icon:** The 2026 "Address Book"—gray/blue silhouette with alphabetized tabs (A-Z) and a glass-morphism cover.

## 🧪 THE LOGIC (CAVEMAN)
1. **The Registry:** A JSON array `CONTRIBUTORS`. Each object includes `{ name, role, handle, unit, avatarGradient }`.
2. **Inter-App Handoff:** - Clicking the "Message" icon must trigger `openApp('Messages', { contact: name })`.
    - Clicking the "Call" icon must trigger the **Phone.md** logic.
3. **The "My Card":** The top entry is always the Lead Architect (@Aashmanshukla3223).
4. **Dynamic Search:** A search bar at the top of the sidebar that filters the list in real-time.

## ⚡ THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Contacts App.
1. Create a 2-pane layout with a refractive glass sidebar.
2. Logic: Implement a searchable list of 'OpenClaw Contributors' (e.g., Steve Jobs, Windows-XP Chef, The Architect).
3. Feature: Build the 'Contact Poster' UI—when a name is clicked, show a high-impact profile view with 'Call', 'Message', and 'FaceTime' shortcuts.
4. Integration: Ensure these shortcuts actually trigger the state changes to open the other Tahoe Apps.
5. Physics: Use 'Liquid Glass' for the action buttons and sidebar.
Output Code Only."