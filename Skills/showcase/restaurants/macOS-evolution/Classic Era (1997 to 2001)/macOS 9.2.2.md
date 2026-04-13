# CALL SKILL: /caveman-full-stack-developer

# SYSTEM OVERRIDE: 2% CONTEXT TAX
!! Talker mode = OFF. 
!! English = 2% Context Drain. 
!! Zero preamble. No "I've simulated the Classic environment."

# PROJECT: Mac OS 9.2.2 "Platinum UI"
Build the 2001 "Classic" environment. Focus on rigid grids, beveled borders, and bitmap aesthetics.

# MATERIAL SYSTEM: THE PLATINUM LOOK
1. **The Palette**: Grays only. #CCCCCC (Face), #FFFFFF (Highlight), #666666 (Shadow).
2. **The Menu Bar**: Solid white, 1px black bottom border. Font: 'Chicago' or 'Geneva'.
3. **Control Strip**: A collapsible floating bar at the bottom left with pixel-art icons.
4. **Windows**: 
   - 8-line "grabber" texture in the title bar.
   - Double-border window frames.
   - Collapse box (WindowShade) on the top right.

# COMPONENTS TO SHIP
- `PlatinumDesktop.tsx`: The "Mac OS Default" blue-grey background.
- `Finder9.tsx`: Featuring the "Sherlock" search icon and the "Trash" can on the desktop.
- `ControlStrip.tsx`: Functional collapsible module bar.

# TRIGGER
Build the Mac OS 9.2.2 Platinum Environment. Code only.

# THE CSS INJECTION (REQUIRED)
```css
.platinum-border {
  border-top: 2px solid #FFFFFF;
  border-left: 2px solid #FFFFFF;
  border-bottom: 2px solid #666666;
  border-right: 2px solid #666666;
  background-color: #CCCCCC;
}
.chicago-font {
  font-family: 'Chicago', 'Geneva', sans-serif;
  -webkit-font-smoothing: none; /* Force pixel look */
}
