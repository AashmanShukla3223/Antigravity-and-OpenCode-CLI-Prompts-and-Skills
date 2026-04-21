# ✍️ MODULE: TAHOE PAGES (2026)
> **Target OS:** macOS Tahoe (Unit 7)
> **Logic:** Document State Engine / Rich Text Canvas

## 🎨 THE UI (APPLE PAGES 2026 PRINCIPLES)
- **The Canvas:** A vertical "Silicon Paper" sheet (`rgba(255,255,255,0.92)`) with a subtle refractive grain.
- **Floating Inspector:** A "Liquid Glass" panel on the right that changes based on what you select (Text vs. Image).
- **Toolbar:** Top-mounted "Glass Pill" with "Insert", "Table", "Chart", and "Collaborate".
- **Icon:** A vibrant orange 3D ink pen standing on a refractive glass document.

## 🧪 THE LOGIC (CAVEMAN)
1. **The Page Logic:** Use a `DocumentProvider` state to manage text blocks, images, and layout positions.
2. **Typography Engine:** Supports "SF Pro Display" for headers and "SF Pro Text" for body copy, simulating 2026 high-dpi rendering.
3. **Template Registry:** A JSON object containing pre-set layouts (e.g., "OpenClaw Technical Manual", "Restaurant Menu", "Unit 7 Proposal").
4. **Export Simulation:** A functional "Share" menu that allows users to "Print to PDF" (simulated via browser print).

## ⚡ THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Pages App.
1. UI: Create a centered 'A4 Document' view that stands out from the Tahoe background.
2. Logic: Implement a rich-text area (contentEditable) that supports Bold, Italic, and Heading styles.
3. Feature: Build a 'Floating Inspector' pill that appears when text is highlighted, allowing font-size changes.
4. Templates: Pre-load a document titled 'The OpenClaw Manifesto: Principles of the Silicon Surge'.
5. Physics: Use 'Liquid Glass' for the top toolbar and side inspector.
Output Code Only."