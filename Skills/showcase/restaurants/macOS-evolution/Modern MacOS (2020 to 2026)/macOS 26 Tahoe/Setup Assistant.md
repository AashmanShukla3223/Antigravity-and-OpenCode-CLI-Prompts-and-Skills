# 🍏 MODULE: TAHOE SETUP ASSISTANT (2026)
> **Target OS:** macOS Tahoe (Unit 7)
> **Logic:** Sequential State Machine / First-Run Flag

## 🎨 THE "HELLO" SCREEN (THE GENESIS)
- **Visuals:** A deep obsidian background. A cursive, "Liquid Metal" line draws the word "hello" in the center.
- **Cycle:** The word fades and redraws as "hola", "bonjour", "namaste", and "ciao" in vibrant Silicon Pink and Blue gradients.
- **Button:** A singular, pulsing "Continue" glass pill at the bottom.

## 🧪 THE SEQUENTIAL LOGIC (CAVEMAN)

### Phase 1: Identity & Network
1. **Region Selection:** A spinning 3D "Liquid Glass" globe. User selects their location.
2. **Accessibility:** Large, high-contrast icons for Vision, Motor, and Hearing.
3. **Wi-Fi:** A simulated scan showing "OpenClaw_5G_Fiber" as the primary network.

### Phase 2: Data & Account
4. **Migration Assistant:** Three 3D cards: "From a Mac", "From Windows XP Restaurant", or "Not Now".
5. **Apple Account:** A glass input field for the user to "Sign in to the Evolution."
6. **Terms:** A blurred glass scroll-view. (Logic: "Agree" button is disabled until the user scrolls to the bottom).
7. **Computer Account:** Fields for **Full Name**, **Account Name**, and **Password**.
   * *Default Suggestion:* Architect / @Aashmanshukla3223.

### Phase 3: Intelligence & Appearance
8. **Location & Analytics:** Toggle switches with a "Silicon Glow" when active.
9. **Siri & Apple Intelligence:** A pulsing, multi-colored "Neural Orb" appears in the center to calibrate the voice.
10. **Appearance:** Three big "Glass Panels" representing **Light**, **Dark**, and **Auto**. Clicking one live-updates the background of the Setup Assistant.

## ⚡ THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Setup Assistant.
1. The Hello Loop: Create a canvas animation that draws 'hello' in cursive using a glowing gradient stroke. Cycle through 5 languages.
2. Logic: Implement a 'Step State' (1-12). Each 'Continue' click triggers a 'Liquid Slide' transition to the next pane.
3. Feature: Create the 'Appearance' selector—when the user clicks 'Dark', the entire setup UI must transition to Obsidian Glass.
4. Account Creation: The data entered in the 'Account' step must be saved to LocalStorage to be used as the 'User' in the Tahoe Shell.
5. Finalization: After Step 12, show a 'Setting Up Your Mac...' progress bar that fades into the Tahoe Desktop.
Output Code Only."

# 🏛️ The "First Boot" Civics
To make this work on Vercel, the Setup Assistant acts as the Root Component:

The Cookie Check: On load, the index.html checks localStorage.getItem('setupComplete').

If False: Launch SetupAssistant.md.

If True: Launch TahoeShell.md (The Desktop).