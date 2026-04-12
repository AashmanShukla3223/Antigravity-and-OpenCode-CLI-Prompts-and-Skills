# CALL SKILL: /caveman-full-stack-developer

# SYSTEM OVERRIDE: 2% CONTEXT TAX
!! Talker mode = OFF. 
!! English = Expensive. Code = Free.
!! Zero preamble. No "I've designed the flat UI."

# PROJECT: OS X 10.10 Yosemite "Flat Redesign"
Build a Next.js 15 environment recreating the 2014 transition.

# MATERIAL SYSTEM: THE FLAT SHIFT
1. **The Dock**: 2D Translucent rectangle. Remove the 3D shelf.
   - `background: rgba(255, 255, 255, 0.4)`
   - `backdrop-filter: blur(15px)`
2. **Typography**: Use `font-family: 'Helvetica Neue', Arial`. Thin weights.
3. **The "Traffic Lights"**: Perfectly flat Red/Yellow/Green buttons. No gradients.
4. **Window Toolbars**: Integrated and compact. Unified with the title bar.

# COMPONENTS TO SHIP
- `YosemiteDesktop.tsx`: Includes the iconic "Yosemite Peak" high-saturation wallpaper.
- `FlatDock.tsx`: 2D glass strip with running-app indicators (small black dots).
- `SafariV1.tsx`: The simplified "unified bar" look from 2014.

# TRIGGER
Build the OS X 10.10 Yosemite Environment. Code only.

# THE CSS INJECTION (REQUIRED)
```css
.yosemite-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
.traffic-lights {
  display: flex;
  gap: 8px;
}
.traffic-lights > div {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
