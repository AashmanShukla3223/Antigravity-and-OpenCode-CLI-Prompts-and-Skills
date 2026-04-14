# 💬 MODULE: TAHOE MESSAGES (2026)
> **Target OS:** macOS Tahoe (Unit 7)
> **Logic:** Simulated iMessage Protocol / Local State Chat

## 🎨 THE UI (APPLE CIVICS)
- **Sidebar:** `backdrop-filter: blur(40px)`. Contact list with circular avatars.
- **Blue Bubbles:** Linear gradient (`#007AFF` to `#00C6FF`). 
- **Gray Bubbles:** `rgba(255, 255, 255, 0.15)` for incoming texts.
- **Typography:** San Francisco (SF Pro). Small "Delivered" text under the last bubble.
- **Input:** A pill-shaped text field with a "+" button and an App Store icon.

## 🧪 THE LOGIC (CAVEMAN)
1. **The Message Array:** Use a `messages` state array containing `{ id, text, sender, timestamp, isBlue }`.
2. **Auto-Reply Engine:** If a user mentions a "Restaurant" (e.g., "Hey XP"), the app triggers a simulated response from that era's persona.
3. **Spring Physics:** Use `framer-motion` for message entry—bubbles should "pop" in from the bottom with a slight bounce.
4. **Typing Indicator:** A small `motion.div` with three pulsing dots when the "AI" is generating a response.

## ⚡ THE PROMPT INJECTION
"Using `/caveman-full-stack-developer` and Framer Motion: Build the Tahoe Messages App.
1. Create a two-pane layout: A blurred sidebar for contacts and a main chat area.
2. Logic: The user can type messages. If the message includes 'OpenClaw', the system replies with a 'Silicon Surge' update.
3. Style: Implement the classic 'Blue Bubble' gradient. Ensure bubbles have a border-radius of 18px, but the corner near the tail is sharper.
4. Feature: Include a functional 'Emoji' picker button that toggles a small popup.
5. Physics: When a new message is sent, the scroll-view must automatically smooth-scroll to the bottom.
Output Code Only."