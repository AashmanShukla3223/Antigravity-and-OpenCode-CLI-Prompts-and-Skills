# CALL SKILL: /caveman-hardware-design-functional
# TARGET: MacBook Pro (2026) - M5 Max / Tahoe Edition

# 1. THE CHASSIS (PHYSICALITY)
- **Primary Material**: Grade 5 Aerospace Titanium (Polished Finish).
- **Surface**: "Refractive Matte" — a finish that subtly mirrors the dominant UI color on the palm rest.
- **Thermal Envelope**: Dual-phase Vapor Chamber + Cryo-fans. 
  - *Logic*: `MAX_FPS` set to 120Hz. If internal temps > 85°C, toggle `Tahoe_Eco_Mode` (reduce blur saturation).

# 2. THE OPTICS (VISUAL DENSITY)
- **Panel Technology**: Tandem OLED "Infinite Contrast" (XDR 3.0).
- **Luminance**: 2,000 Nits peak HDR / 1,200 Nits sustained.
- **Refresh Rate**: 120Hz ProMotion (Adaptive down to 0.5Hz for Tahoe Standby).
  - *Logic*: `--ui-edge-glow` intensity maps to `current_nits / peak_nits`.

# 3. THE INPUT (HAPTICS)
- **Tactile Feedback**: Electro-Static Glass Trackpad (simulates physical textures for Tahoe "Liquid Glass" sliders).
- **Navigation**: Multi-touch + FaceID 3.0 (Sub-display sensor).

# 4. THE JSON BRIDGE (REQUIRED)
```json
{
  "system_id": "MBP-2026-M5MAX",
  "materials": {
    "body": "Titanium-G5",
    "gloss_factor": 0.85,
    "corner_radius": "4.5mm"
  },
  "display": {
    "type": "Tandem-OLED",
    "peak_nits": 2000,
    "refresh_hz": 120
  },
  "logic_constraints": {
    "throttle_at_temp": 85,
    "pixel_perfect": true,
    "refractive_index_match": 1.52
  }
}
