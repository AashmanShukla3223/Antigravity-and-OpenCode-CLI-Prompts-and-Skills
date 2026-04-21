# 📊 MODULE: TAHOE KEYNOTE (2026)
> **Target OS:** macOS Tahoe (Unit 7)
> **Logic:** Sequential Slide Engine / Presentation Mode

## 🎨 THE UI (APPLE KEYNOTE 2026 PRINCIPLES)
- **The Navigator:** A left-hand "Liquid Glass" strip showing slide thumbnails.
- **The Stage:** A wide-screen (16:9) canvas with a deep obsidian background. 
- **Toolbar:** Top-mounted "Glass Pill" with "Play", "Animate", and "Collaborate" icons.
- **Icon:** A blue-to-purple 3D lectern with a refractive glass screen reflecting the Tahoe wallpaper.

## 🧪 THE LOGIC (CAVEMAN)
1. **The Slide Registry:** A JSON array `slides`. Each object contains `{ title, content, image, transitionEffect }`.
2. **Presentation Mode:** A functional "Play" button that takes the window full-screen (within the Tahoe Shell) and allows navigation via Arrow Keys.
3. **Magic Move:** Use `framer-motion` layout animations to simulate "Magic Move"—where text and objects from Slide 1 smoothly transform into Slide 2.
4. **Export Logic:** A simulated "Export to PDF" button that generates a "Claw-Print" of the presentation.

## ⚡ THE PROMPT INJECTION
"Using `/caveman-full-stack-developer` and Framer Motion: Build the Tahoe Keynote App.
1. Create a 'Deck Navigator' sidebar and a central 'Slide Stage'.
2. Logic: Implement a slide state (e.g., Slide 1, 2, 3) that changes on click.
3. Feature: 'Magic Move' Transitions—when moving between slides, animate the position and scale of shared elements.
4. Physics: Apply 'Liquid Glass' to the inspector panel on the right.
5. Content: Pre-load a deck titled 'The Future of OpenClaw: Unit 8 & Beyond'.
Output Code Only."