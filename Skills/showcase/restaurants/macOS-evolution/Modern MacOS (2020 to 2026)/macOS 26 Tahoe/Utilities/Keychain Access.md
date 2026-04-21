# 🔑 MODULE: TAHOE KEYCHAIN ACCESS (2026)
> **Target OS:** macOS Tahoe (Unit 7)
> **Logic:** LocalStorage Encryption / Passkey Registry

## 🎨 THE UI (APPLE KEYCHAIN 2026 PRINCIPLES)
- **The Sidebar:** Categories for **'All Items'**, **'Passwords'**, **'Passkeys'**, **'Certificates'**, and **'Secure Notes'**.
- **The Vault View:** A list of credentials with "Liquid Glass" rows. Each entry shows the Name, Kind (e.g., Restaurant Auth), and Date Modified.
- **Visuals:** A large, 3D "Silicon Gold" key icon in the detail pane that pulses when an item is selected.
- **Icon:** A vibrant gold-glass 3D key floating inside a refractive transparent cube.

## 🧪 THE LOGIC (CAVEMAN)
1. **The Secure Registry:** A JSON object `KEYCHAIN_DATA` stored in an encrypted (Base64-simulated) string within `localStorage`.
2. **The "Unlock" Mechanic:** When the app opens, it requires a "Passkey" (a simulated "Touch ID" or "Face ID" pulse on the screen) to reveal the data.
3. **Lore-Based Keys:** Pre-populate the vault with:
   - **XP_Restaurant_Admin:** Password: `••••••••`
   - **Unit_1_Kernel_Root:** Passkey: `Silicon_Genesis_1984`
   - **OpenClaw_Global_SSH:** Certificate: `Valid until 2029`
4. **Copy Logic:** A functional "Copy Password" button that puts the string into the browser's clipboard.

## ⚡ THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Keychain Access Utility.
1. UI: Create a split-pane layout with a 'Secure Obsidian' sidebar and a high-refraction main list.
2. Logic: Implement a 'Search' bar that filters the keychain items in real-time.
3. Feature: Build a 'Password Generator' tool inside the app that suggests strong 'Silicon-Grade' strings.
4. Feature: Create a 'Lock' button in the toolbar that blurs the entire window until the user clicks a simulated 'Touch ID' sensor.
5. Physics: Use 'Liquid Gold' gradients for the key icons and 'Glassmorphism' for the list items.
Output Code Only."