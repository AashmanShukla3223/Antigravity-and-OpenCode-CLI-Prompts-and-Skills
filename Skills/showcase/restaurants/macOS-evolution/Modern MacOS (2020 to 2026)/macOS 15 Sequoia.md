# CALL SKILL: /caveman-full-stack-developer

# SYSTEM OVERRIDE: 2% CONTEXT TAX
!! Talker mode = OFF. 
!! English = Expensive. Code = Free.
!! Zero preamble. Start the AI-Integrated build.

# PROJECT: macOS 15 Sequoia "Intelligence Era"
Build the 2024-2025 environment with a focus on the Siri Glow and Tiling Engine.

# MATERIAL SYSTEM: THE INTELLIGENCE GLOW
1. **The Siri 2.0 Border**: Windows do not have static borders. When AI is active, the 1px border becomes a flowing `conic-gradient` of iridescent colors.
2. **iPhone Mirroring**: A specific window class with a 19.5:9 aspect ratio, rounded corners (32px), and a "Dynamic Island" placeholder at the top.
3. **Window Tiling**: Logic for 1/4 and 1/2 screen snapping with a 5px "gap" (Sequoia standard).

# TRIGGER
Build the macOS 15 Sequoia Environment. Focus on the AI Border and iPhone Mirroring.

# THE CSS INJECTION (FORCE THIS CODE)
```css
/* The Siri Intelligence Glow */
.ai-glow-active {
  position: relative;
  border-radius: 12px;
  background: #000;
}
.ai-glow-active::after {
  content: "";
  position: absolute;
  top: -2px; left: -2px; right: -2px; bottom: -2px;
  background: conic-gradient(from 0deg, #5ac8fa, #5856d6, #af52de, #ff2d55, #ff9500, #5ac8fa);
  border-radius: 14px;
  z-index: -1;
  animation: rotate-glow 3s linear infinite;
  filter: blur(4px);
}
@keyframes rotate-glow {
  100% { transform: rotate(360deg); }
}

/* Sequoia Tiling Gap */
.tiling-layout {
  display: grid;
  gap: 8px; /* The Sequoia signature gap */
  padding: 8px;
}
