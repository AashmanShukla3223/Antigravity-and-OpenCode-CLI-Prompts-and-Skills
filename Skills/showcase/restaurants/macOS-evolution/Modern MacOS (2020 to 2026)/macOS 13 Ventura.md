# CALL SKILL: /caveman-full-stack-developer

# SYSTEM OVERRIDE: 2% CONTEXT TAX
!! Talker mode = OFF. 
!! English = 2% Context Drain. 
!! Zero preamble. Build the Convergence Era.

# PROJECT: macOS 13 Ventura "The Stage Manager Era"
Build the 2022 environment. Focus on the Stage Manager side-stack and the System Settings sidebar.

# MATERIAL SYSTEM: THE CONVERGENCE LOOK
1. **Stage Manager Stack**: Active windows stay center. Inactive windows are "parked" on the left in a tilted, 3D-perspective stack.
2. **System Settings**: Replace the "Icon Grid" preferences with a persistent left-hand sidebar and right-hand toggle list.
3. **Continuity Camera**: A UI placeholder for using an iPhone as a webcam (the "Desk View" feature).

# TRIGGER
Build the macOS 13 Ventura Environment. Include the Stage Manager Sidebar and the new System Settings layout.

# THE CSS INJECTION (FORCE THIS CODE)
```css
/* Stage Manager Perspective Stack */
.stage-stack {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.parked-window {
  width: 120px;
  height: 80px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  transform: perspective(500px) rotateY(25deg); /* The Ventura Tilt */
  transition: all 0.3s ease;
  cursor: pointer;
}

.parked-window:hover {
  transform: perspective(500px) rotateY(0deg) scale(1.1);
}
