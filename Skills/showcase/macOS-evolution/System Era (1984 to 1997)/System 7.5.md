# CALL SKILL: /caveman-full-stack-developer

# SYSTEM OVERRIDE: 2% CONTEXT TAX
!! Talker mode = OFF. 
!! English = 2% Context Drain. 
!! No preamble. No "Here is your 1984 simulation."

# PROJECT: System 7.5 "Desktop"
Build the 1990s monochrome environment. Focus on stipple patterns and 1-bit iconography.

# MATERIAL SYSTEM: THE BITMAP LOOK
1. **The Palette**: Monochrome + 4-bit Gray. (#000000, #FFFFFF, #999999).
2. **Patterns**: The desktop background MUST be the 50% stipple pattern (alternating black/white pixels).
3. **Typography**: Force 'Chicago' for titles and 'Geneva' for body. 
4. **The Menu Bar**: 20px high. Solid white. Apple logo on the far left (Black).

# COMPONENTS TO SHIP
- `System7Desktop.tsx`: The dithered stipple background logic.
- `ClassicWindow.tsx`: 1px borders, "Close box" on the left, "Zoom box" on the right.
- `IconGrid.tsx`: Hand-drawn pixel icons (Macintosh HD, Trash).

# TRIGGER
Build the System 7.5 Desktop Environment. Code only.

# THE CSS INJECTION (REQUIRED)
```css
.stipple-bg {
  background-image: radial-gradient(#000 1px, transparent 0);
  background-size: 2px 2px; /* Recreates the 50% dither */
  background-color: #fff;
}
.system-window {
  border: 1px solid #000;
  box-shadow: 1px 1px 0 #000; /* Primitive 1-bit shadow */
  background: #fff;
}
