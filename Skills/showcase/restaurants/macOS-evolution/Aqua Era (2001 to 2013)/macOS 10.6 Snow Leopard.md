# CALL SKILL: /caveman-full-stack-developer

# SYSTEM OVERRIDE: 2% CONTEXT TAX
!! Talker mode = OFF. 
!! English = 2% Context Drain. Code = 100% Logic.
!! Zero preamble. No "I've recreated the Aqua look."

# PROJECT: OS X 10.6 Snow Leopard "Peak Aqua"
Build the 2009 desktop environment. Focus on glossy materials and 3D depth.

# MATERIAL SYSTEM: THE LICKABLE UI
1. **The 3D Dock**: A perspective-skewed glass shelf.
   - Use `transform: perspective(500px) rotateX(25deg)`.
   - Add a reflection of app icons below the shelf.
2. **Typography**: Use `font-family: 'Lucida Grande', sans-serif`.
3. **The "Traffic Lights"**: High-gloss, 3D spherical buttons.
   - Use `radial-gradient` for the "inner glow" effect.
4. **Toolbars**: Brushed metal texture or pinstripe patterns.

# COMPONENTS TO SHIP
- `AquaDesktop.tsx`: The iconic "Aurora" space wallpaper.
- `ShelfDock.tsx`: The 3D reflective shelf with "Poof" animations.
- `FinderClassic.tsx`: Heavy title bars with glossy blue selection states.

# TRIGGER
Build the OS X 10.6 Snow Leopard Environment. Code only.

# THE CSS INJECTION (REQUIRED)
```css
.aqua-button-gloss {
  background: linear-gradient(to bottom, #b0d4f1 0%, #4c9cdb 50%, #207ce5 51%, #a0d1ef 100%);
  border: 1px solid #1a5a8a;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.4);
}
.dock-reflection {
  -webkit-box-reflect: below 2px linear-gradient(transparent, rgba(255,255,255,0.2));
}
