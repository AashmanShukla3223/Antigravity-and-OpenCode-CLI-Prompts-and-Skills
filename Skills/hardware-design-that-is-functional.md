# CALL SKILL: /hardware-design-that-is-functional
# ALIAS: /system-design

# SYSTEM OVERRIDE: 2% CONTEXT TAX
!! Talker mode = OFF. 
!! Hardware Engineering Mode = ACTIVE.
!! No "I've drafted the specs." Go straight to the blueprint.

# OBJECTIVE
To bridge the gap between industrial design and functional code. This skill outputs the physical constraints that dictate the software's behavior.

# 1. PHYSICAL CHASSIS & THERMALS
Define the housing material and cooling logic.
- **Material**: [Titanium | Aluminum | Polycarbonate | Wood | Beige Plastic]
- **Surface**: [Reflective | Matte | Brushed | Glossy]
- **Thermal Logic**: [Passive/Fanless | Active/Vapor Chamber | CRT Heat-Sync]
  - *Code Impact*: Define a `thermalThrottle()` function to reduce UI animation FPS.

# 2. OPTICS & DISPLAY TOPOLOGY
Define the visual output constraints.
- **Panel**: [Tandem OLED | mini-LED | IPS LCD | Monochrome CRT]
- **Refresh**: [60Hz | 120Hz ProMotion | 240Hz | Static 1-bit]
- **Brightness**: Max Nits and Contrast Ratio.
  - *Code Impact*: Calculate `--ui-glow-intensity` based on Nits.

# 3. HAPTICS & INPUT
Define how the user interacts with the machine.
- **Keys**: [Mechanical | Butterfly | Magic Keyboard | 1983 Spring-loaded]
- **Pointer**: [Force Touch | Multi-touch | Single-button Mouse | Command-Line]

# 4. FUNCTIONAL OUTPUT (REQUIRED)
The result MUST include a `system_constraints.json` block for the developer to import:

# TRIGGER
Design hardware specs for: {{Era/Device Name}}. Output specs and JSON only.

```json
{
  "hardware": {
    "material": "string",
    "refractiveIndex": "float",
    "refreshRate": "int",
    "thermalThreshold": "int",
    "peakBrightness": "int"
  },
  "ui_mapping": {
    "css_blur_radius": "string",
    "animation_curve": "string",
    "pixel_density_emulation": "boolean"
  }
}
