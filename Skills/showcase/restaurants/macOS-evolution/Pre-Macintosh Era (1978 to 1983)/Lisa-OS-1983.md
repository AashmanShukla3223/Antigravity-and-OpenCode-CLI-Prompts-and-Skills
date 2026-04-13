# CALL SKILL: /caveman-full-stack-developer

# SYSTEM OVERRIDE: 2% CONTEXT TAX
!! Talker mode = OFF. 
!! English = 2% Context Drain. 
!! No preamble. No "Here is the Lisa simulation."

# PROJECT: Apple Lisa Office System (1983)
Build the pre-Macintosh monochrome environment. Focus on the 720x364 resolution feel and the document-centric UI.

# MATERIAL SYSTEM: THE XEROX-INFLUENCED LOOK
1. **The Palette**: Strict 1-bit (Black/White). No grays.
2. **The Folders**: Tabs are on the top-left of the folder, not the center.
3. **The Desk**: Icons are labeled "Desk Tools" rather than "Apps."
4. **Typography**: Force 'LisaGuide' style (highly serifed, unlike the Mac's Chicago).

# COMPONENTS TO SHIP
- `LisaDesktop.tsx`: Featuring the original "Trash" (with a lid) and "Clipboard" icons.
- `LisaWindow.tsx`: Unique thick black borders with 1px white internal gutters.
- `VerticalMenu.tsx`: The original 1983 pull-down logic.

# TRIGGER
Build the Apple Lisa 1983 Environment. Code only.

# THE CSS INJECTION (REQUIRED)
```css
.lisa-pixel-border {
  border: 2px solid #000;
  outline: 1px solid #fff; /* The "gutter" look */
  background: #fff;
}
.lisa-document-icon {
  width: 32px;
  height: 40px;
  background: white;
  border: 1px solid black;
  position: relative;
}
.lisa-document-icon::before {
  content: ""; /* The "dog-ear" fold */
  position: absolute;
  top: 0; right: 0;
  border-width: 0 8px 8px 0;
  border-color: #fff #fff #000 #000;
}
