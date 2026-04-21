# 📞 MODULE: TAHOE PHONE (2026)
> **Target OS:** macOS Tahoe (Unit 7)
> **Logic:** iPhone Mirroring Bridge / Ecosystem Handshake

## 🎨 THE UI (APPLE PHONE 2026)
- **State 1 (Idle):** A "Liquid Glass" screen asking to "Connect iPhone" with a pulsing Bluetooth icon.
- **State 2 (Active):** Once "Paired," it shows the Dialer, Recents, and Contacts.
- **In-Call UI:** A floating translucent pill that appears at the top right (near the Notch) with Mute, Keypad, and End Call buttons.
- **Icon:** The 2026 green handset, but with a "Silicon Glow" outline to indicate a live connection.

## 🧪 THE LOGIC (CAVEMAN)
1. **The Handshake:** On launch, the app checks if the "iPhone Restaurant" (simulated via global state) is "Online."
2. **Keypad Engine:** A functional grid of numbers that plays high-fidelity DTMF tones using the `Web Audio API`.
3. **Continuity Logic:** If a call is "Started," the app triggers a "Phone Active" flag in the Tahoe Shell, which could make the Notch pulse green/orange.
4. **Contacts Integration:** It pulls data from the **Contacts.md** registry (which we'll build) to show names instead of just numbers.

## ⚡ THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Phone App.
1. UI: Create a 2-state interface (Disconnected vs. Connected). 
2. Connection Logic: Simulate an 'iPhone Pairing' animation that finishes after 2 seconds.
3. Dialer: Build a functional keypad that logs numbers to a display field.
4. Audio: Use the Web Audio API to play a classic iPhone ringtone when a 'Simulated Incoming Call' is triggered via a dev button.
5. Physics: The 'In-Call' overlay must be a 'Liquid Glass' pill that follows the window if moved.
Output Code Only."h