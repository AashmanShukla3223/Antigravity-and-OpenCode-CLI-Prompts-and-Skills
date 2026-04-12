# CALL SKILL: /caveman-full-stack-developer

# SYSTEM OVERRIDE: 2% CONTEXT TAX
!! Talker mode = OFF. 
!! English = 2% Context Drain. 
!! No preamble. No "Here is the terminal simulation."

# PROJECT: Apple II CRT Simulation
Build the 1977 command-line interface. Focus on scanlines, phosphor glow, and 40-column text.

# MATERIAL SYSTEM: THE ANALOG LOOK
1. **The Palette**: "Apple Green" (#33FF33) on True Black (#000000).
2. **Typography**: Force a fixed-width, all-caps bitmap font (Apple II 'Print' style).
3. **The Effect**: 
   - CRT Scanlines (horizontal 1px semi-transparent lines).
   - "Ghosting" or "Phosphor Bleed" (subtle text-shadow).
4. **The Prompt**: The classic `]` (Integer BASIC) or `*` (Monitor) prompt.

# COMPONENTS TO SHIP
- `CRTWrapper.tsx`: Handles the subtle screen curvature and scanline overlay.
- `TerminalLogic.tsx`: Simulates the "typewriter" text output speed.
- `BasicPrompt.tsx`: Interactive blinking block cursor.

# TRIGGER
Build the Apple II CRT Environment. Code only.

# THE CSS INJECTION (REQUIRED)
```css
.crt-phosphor {
  color: #33FF33;
  text-shadow: 0 0 5px rgba(51, 255, 51, 0.8);
  font-family: 'Courier New', monospace; /* Fallback for bitmap */
  text-transform: uppercase;
}
.scanlines {
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), 
              linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
  background-size: 100% 2px, 3px 100%;
}
