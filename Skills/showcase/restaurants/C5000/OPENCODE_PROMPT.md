# OpenCode Master Prompt — Samsung TV Simulator: Multi-Path OTA System

> **Repo:** `project-78d0r` (Vercel-hosted, single-page Samsung LCD TV Simulator)
> **Live URL:** https://project-78d0r.vercel.app/Samsung_TV.html
> **Primary file:** `Samsung_TV.html` (~167 KB, ~3,044 lines, vanilla HTML/CSS/JS)
> **Current version:** `APP_VERSION = '1.0.5'`
> **Asset host:** GitHub Releases at `AashmanShukla3223/Antigravity-and-OpenCode-CLI-Prompts-and-Skills`

---

## 🎯 Mission

Implement **two new OTA (over-the-air) firmware update mechanisms** to expand the existing single-path (Internet) update system into a **period-authentic three-path system** that mirrors how real 2010-era Samsung LCD TVs and Indian DTH operators (specifically DishTV India) delivered firmware updates.

The three paths are:

| # | Method | Trigger | Source of truth | User action |
|---|---|---|---|---|
| 1 | **Internet** (already exists) | User clicks "Check now" | `/version.json` on Vercel | Manual check |
| 2 | **USB** (NEW) | User inserts virtual USB + clicks "Read" | `info.xml` inside virtual FAT32 image | Manual insert + manual select |
| 3 | **Broadcast** (NEW) | Passive — fires while DishTV input is active | `/dishtv/firmware.json` on Vercel | None — runs in background |

This is **historically faithful**: real Samsung TVs from ~2008-2012 had three update methods labeled exactly *"Update via Internet"*, *"Update via USB"*, and *"Update via Channel (Broadcast)"* in the Support menu. DishTV India delivered STB firmware over satellite DSM-CC data carousels during the same era. The simulator should recreate the idealized version of this Samsung × DishTV partnership that *should* have worked but rarely did in practice.

---

## 📐 Architecture Overview

### Existing infrastructure to preserve
The simulator already has a **decoupled version-management architecture** that must be respected:

- `APP_VERSION` constant in JS = currently-installed firmware on the simulated TV
- `GH`, `GH2`, ..., `GH7` constants = asset-bundle URL pointers to GitHub Releases (independent of `APP_VERSION`)
- `/version.json` on Vercel = remote manifest advertising the latest available firmware for Internet OTA
- `showUpdateOverlay(version)` = existing function that shows the 3-second shutdown countdown and triggers page reload
- `showUpToDateOverlay()` = existing function that shows the green checkmark "Up to Date" modal
- `isNewerVersion(a, b)` = existing semver comparator

**All three OTA paths must funnel into the same `showUpdateOverlay()` install flow.** Do not duplicate the install logic.

### New infrastructure to build

```
project-78d0r/
├── Samsung_TV.html              ← existing, will be modified
├── version.json                 ← existing (Internet OTA)
├── dishtv/
│   └── firmware.json            ← NEW (Broadcast OTA manifest)
├── usb-images/                  ← NEW directory
│   ├── empty-usb.json           ← NEW (virtual USB with nothing useful)
│   ├── firmware-only-usb.json   ← NEW (virtual USB with firmware folder)
│   ├── multi-firmware-usb.json  ← NEW (virtual USB with multiple firmwares)
│   └── corrupted-usb.json       ← NEW (virtual USB with broken firmware)
└── OPENCODE_PROMPT.md           ← this file
```

---

## 🛠️ Implementation Phases

### Phase 0 — Pre-flight (15 min)

1. **Read the current state of `Samsung_TV.html`** end to end. Pay special attention to:
   - Lines ~1010-1030: the `GH*` constants and `APP_VERSION`
   - Lines ~278-318: the `screenUpToDate` and `screenUpdate` modals
   - Lines ~2035-2080: the existing `fetch('/version.json')` flow and the `showUpdateOverlay` / `showUpToDateOverlay` functions
   - Lines ~587-665: the Samsung OSD menu structure (Picture / Sound / Input / Setup / Support)
   - Lines ~348-505: the input panels (TV/RF, AV/Component=Wii, HDMI 1=AppleTV, HDMI 2=PS3, HDMI 3=DishTV)
   - The `tvSynth` class (Web Audio synthesizer used for system sounds)
   - The `showToast(message, icon, type)` helper

2. **Confirm Vercel deployment access** — verify you can push new files to the project root (for `dishtv/firmware.json` and `usb-images/*.json`).

3. **Do not modify `version.json`** during this work. It's the user's deployment trigger and bumping it would falsely advertise updates.

---

### Phase 1 — The "Choose Update Method" sub-menu (1-2 hours)

**Goal:** Replace the direct "Check for Updates" action in the Support menu with a sub-menu offering all three update methods.

#### 1.1 — Locate the Software Update entry in the OSD

In the Samsung OSD (`samsungOSD` div, ~line 587), the **Support** category (`cat-4`) currently exposes a "Software Update" item. Find the option panel that renders when the Support category is selected (`osdOptionsPanel` div, ~line 620). The existing options likely include things like "Self Diagnosis", "Software Update", "Contact Samsung", etc.

#### 1.2 — Add the three-option sub-menu state

When the user navigates to **Software Update**, show a new sub-screen with three rows:

```
┌─────────────────────────────────────────────────┐
│  Software Update                                │
│  ─────────────                                  │
│                                                 │
│  ▶  Update via Internet                         │
│     Check for updates online                    │
│     Status: [live status line]                  │
│                                                 │
│     Update via USB                              │
│     Read update file from USB drive             │
│     Status: [live status line]                  │
│                                                 │
│     Update via Channel (Broadcast)              │
│     Receive updates from DishTV                 │
│     Status: [live status line]                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Status line behavior:**
- **Internet**: shows `✓ Up to date (v{APP_VERSION})` if last check was up-to-date, or `! Update v{x} available` if pending, or `... Not checked yet` initially
- **USB**: shows `No USB connected` if none, or `📀 SANDISK_USB connected (FAT32, 4GB)` if inserted
- **Broadcast**: shows `● Listening on HDMI 3 (DishTV)` if DishTV input is active, or `○ Switch to DishTV to enable` otherwise

#### 1.3 — Navigation behavior

- Arrow up/down between the three options
- Enter activates the selected method
- Back/Esc returns to the Support category list
- The currently-selected option should have a `▶` indicator and the Samsung sky-blue highlight class (`samsung-osd-selected` or equivalent — match the existing OSD selection style)

#### 1.4 — Activation behavior

- **Internet**: calls the existing fetch + `showUpdateOverlay` / `showUpToDateOverlay` flow (no change in logic, just a new entry point)
- **USB**: opens the USB file browser (Phase 2)
- **Broadcast**: opens the broadcast status screen (Phase 3)

#### 1.5 — Acceptance criteria for Phase 1

- ✅ The Support → Software Update path now leads to a sub-menu, not directly to the update check
- ✅ All three options are visible and navigable
- ✅ Live status lines update in real time (e.g., switching inputs updates the Broadcast status immediately)
- ✅ The Internet option still works exactly as before
- ✅ USB and Broadcast options open placeholder screens that say "Coming in Phase 2/3" — wire the navigation first, fill in functionality next

---

### Phase 2 — Virtual USB filesystem + file browser (3-5 hours)

**Goal:** Build a simulated FAT32 USB drive system that the TV can read firmware updates from.

#### 2.1 — Design the virtual USB data model

**Use the simulated-JS-object approach (Option A from the design discussion), not a real FAT32 byte layout.** Real FAT32 implementation is out of scope for this phase. The JS API should be designed so a future Phase 4 could swap in a real FAT32 backend without changing the UI layer.

```js
class VirtualUSB {
  constructor(config) {
    this.label = config.label || "USB_DRIVE";
    this.format = "FAT32";
    this.capacity_bytes = config.capacity_bytes || 4 * 1024 * 1024 * 1024; // 4GB default
    this.used_bytes = 0;
    this.files = config.files || {}; // tree structure, see below
    this.is_connected = false;
  }
  
  insert() { this.is_connected = true; emitUSBEvent('inserted', this); }
  eject() { this.is_connected = false; emitUSBEvent('ejected', this); }
  
  ls(path) { /* returns [{name, type, size, modified}] */ }
  readFile(path) { /* returns string (for text files) or null */ }
  getFreeSpace() { return this.capacity_bytes - this.used_bytes; }
}

// File tree example:
const exampleFiles = {
  "T-CHL7DEUC": {
    type: "directory",
    modified: "2010-11-15",
    children: {
      "info.xml": { type: "file", size: 1024, content: "<?xml ... ?>" },
      "image": {
        type: "directory",
        children: {
          "exe.img": { type: "file", size: 234567890, content: null /* binary, not stored */ }
        }
      },
      "MICOM.bin": { type: "file", size: 45678, content: null },
      "validinfo.txt": { type: "file", size: 256, content: "CHECKSUM:abc123..." }
    }
  },
  "Holiday_Photos": {
    type: "directory",
    children: {
      "IMG_001.JPG": { type: "file", size: 2048576, content: null },
      "IMG_002.JPG": { type: "file", size: 1872453, content: null },
      // ... etc
    }
  }
};
```

#### 2.2 — Load USB profiles from Vercel

Each USB profile lives in `/usb-images/*.json` on Vercel. Format:

```json
{
  "label": "SANDISK_USB",
  "capacity_bytes": 4294967296,
  "files": { /* file tree as above */ }
}
```

Ship **four profiles** in Phase 2:

1. **`empty-usb.json`** — Empty 4GB USB. Used to test "No firmware found" error path.
2. **`firmware-only-usb.json`** — Contains one `T-CHL7DEUC/` folder with `info.xml` advertising `v1.0.6`. Standard happy path.
3. **`multi-firmware-usb.json`** — Contains `T-CHL7DEUC_v1.0.6/` and `T-CHL7DEUC_v1.0.7/` folders. Tests user choice between multiple firmwares.
4. **`corrupted-usb.json`** — Contains `T-CHL7DEUC/` with `info.xml` missing the `<Version>` field, or with a malformed XML structure. Tests error handling.

#### 2.3 — The "Insert USB" interaction

Add a small **USB-shaped icon button** in a discreet corner of the TV chassis (or wherever fits the existing layout — maybe near the remote area or on the chassis itself). Clicking it opens a dropdown:

```
┌─────────────────────────────┐
│  Insert USB Drive           │
│  ─────────────              │
│  ○ Empty USB                │
│  ○ Firmware Update v1.0.6   │
│  ○ Multi-Firmware USB       │
│  ○ Corrupted Firmware USB   │
│  ─────────────              │
│  ⏏ Eject current USB        │
└─────────────────────────────┘
```

When user selects a profile:
1. Fetch the corresponding `usb-images/*.json` from Vercel
2. Instantiate a new `VirtualUSB` with the data
3. Set `is_connected = true`
4. Show a Samsung-style notification toast: *"📀 USB Device Connected: {label} - FAT32 - {capacity}"*
5. Update the Software Update menu's USB status line in real time

When "Eject" is clicked:
- Show toast: *"USB Device Disconnected"*
- Clear the active USB object
- Status line updates

#### 2.4 — The file browser UI

When the user selects **Update via USB** from the Software Update menu (AND a USB is connected), open a Samsung-style file browser:

```
┌─────────────────────────────────────────────────┐
│  USB Device: SANDISK_USB (FAT32, 4.0 GB)        │
│  Path: /                                        │
│  ─────────────                                  │
│                                                 │
│  📁 T-CHL7DEUC          [Firmware]              │
│  📁 Holiday_Photos       234 files              │
│  📁 Movies               12 files               │
│  📄 readme.txt           2 KB                   │
│                                                 │
│  ─────────────                                  │
│  [▲▼] Navigate  [→/Enter] Open  [←] Back        │
└─────────────────────────────────────────────────┘
```

**Behavior:**
- Arrow keys navigate the file list
- Enter on a directory enters that directory
- Enter on a `.xml` or `.bin` file in a `T-CHL7DEUC*` folder triggers the firmware version check
- Back/Esc goes up one directory (or exits the browser if at root)
- The path header updates as the user navigates

If the user is at the root and presses Back, exit to the Software Update sub-menu.

If the user navigates into a `T-CHL7DEUC*` folder and the `info.xml` is found, **automatically trigger the firmware version check** rather than requiring further navigation — this matches real Samsung TV behavior of auto-detecting valid firmware folders.

#### 2.5 — Parsing `info.xml` and triggering the install

When the file browser detects a valid `T-CHL7DEUC*` folder:

1. Read `info.xml`
2. Parse out `<Version>`, `<ReleaseDate>`, `<ReleaseNotes>`, `<RequiredVersion>`
3. Validate:
   - If `<Version>` is missing or unparseable → show error: *"Update file is corrupted. Please check the USB drive."*
   - If `<RequiredVersion>` > `APP_VERSION` → show error: *"This update requires firmware version {x}. Please install intermediate updates first."*
   - If `<Version>` <= `APP_VERSION` → show error: *"This update file is not newer than the currently installed firmware (v{APP_VERSION})."*
4. If all checks pass → show a Samsung-style confirmation modal:
   ```
   ┌─────────────────────────────────────────┐
   │  Firmware Update Found on USB           │
   │  ─────────────                          │
   │  Current version: v1.0.5                │
   │  Update to:       v1.0.6                │
   │                                         │
   │  Release Notes:                         │
   │  [release notes from info.xml]          │
   │                                         │
   │  [Cancel]                  [Install]    │
   └─────────────────────────────────────────┘
   ```
5. If user clicks Install → call the existing `showUpdateOverlay(version)` — this triggers the same 3-second shutdown + page-refresh flow as the Internet OTA

#### 2.6 — Acceptance criteria for Phase 2

- ✅ A discreet "Insert USB" UI element is visible somewhere on the TV chassis or near the remote
- ✅ User can select from 4 pre-built USB profiles
- ✅ Inserting a USB triggers an authentic Samsung-style notification
- ✅ Software Update → USB option opens the file browser (or shows "No USB connected" error)
- ✅ File browser navigation works (arrows, Enter, Back)
- ✅ Valid firmware folder auto-triggers version check
- ✅ All four USB profiles produce the correct outcome (empty=error, firmware-only=happy path, multi-firmware=user picks, corrupted=error)
- ✅ Install flow uses existing `showUpdateOverlay()` without duplication
- ✅ Period-authentic Samsung error messages for all failure modes

---

### Phase 3 — Broadcast OTA via DishTV (3-4 hours)

**Goal:** Implement passive firmware reception over the DishTV input, with a progress bar simulating real broadcast carousel behavior.

#### 3.1 — Create `dishtv/firmware.json` on Vercel

```json
{
  "broadcaster": "DishTV India",
  "carrier_signal": "NSS-6 95.0°E TP-3",
  "broadcast_started": "2026-05-29T18:00:00Z",
  "broadcast_loop_duration_minutes": 4,
  "target_models": ["Samsung BN59", "Samsung LE40C530", "Samsung UE32C5000"],
  "firmware": {
    "version": "1.0.6",
    "release_notes": "Adds support for new DishTV EPG v2 integration, broadcast OTA partnership with Samsung. Channels above 135 now supported.",
    "size_kb": 12345,
    "required_min_version": "1.0.5",
    "signed_by": "DishTV-Samsung Partnership Certificate 2010"
  }
}
```

**Note:** `broadcast_loop_duration_minutes: 4` is intentionally short for testing. In production, you might set it to 60-240 minutes for a more authentic "slow trickle" experience. Start with 4 minutes so testers can verify the full flow without waiting hours.

#### 3.2 — The passive scanner

Implement a scanner that runs **only when the DishTV input (HDMI 3) is the active input**:

```js
const TV_MODEL_CODE = "Samsung BN59"; // matches the chassis label in your existing UI

let broadcastState = {
  scanning: false,
  manifestAvailable: null,    // last fetched firmware manifest
  receptionProgress: 0,        // 0 to 1, fills over broadcast_loop_duration_minutes
  receptionStartedAt: null,
  scannerInterval: null,
  progressInterval: null
};

function onInputChange(newInput) {
  if (newInput === 'DishTV') {
    startBroadcastScanner();
  } else {
    pauseBroadcastReception();
  }
}

async function startBroadcastScanner() {
  if (broadcastState.scanning) return;
  broadcastState.scanning = true;
  
  // Initial fetch after a 5-second "tuning in" delay
  setTimeout(checkBroadcastManifest, 5000);
  
  // Then poll every 90 simulated seconds
  broadcastState.scannerInterval = setInterval(checkBroadcastManifest, 90000);
  
  // Start the reception progress ticker (updates progress bar every 1 sec)
  broadcastState.progressInterval = setInterval(updateReceptionProgress, 1000);
}

function pauseBroadcastReception() {
  // Do NOT reset progress — keep it accumulated even when user switches inputs
  // But pause the active polling and progress ticking
  if (broadcastState.scannerInterval) clearInterval(broadcastState.scannerInterval);
  if (broadcastState.progressInterval) clearInterval(broadcastState.progressInterval);
  broadcastState.scanning = false;
}

async function checkBroadcastManifest() {
  try {
    const res = await fetch(VERCEL_URL + '/dishtv/firmware.json', { cache: 'no-store' });
    if (!res.ok) return; // silent failure — authentic broadcast OTA behavior
    
    const data = await res.json();
    if (!data.firmware) return;
    
    // Compatibility checks
    if (!data.target_models.includes(TV_MODEL_CODE)) return;
    if (!isCompatible(APP_VERSION, data.firmware.required_min_version)) return;
    if (!isNewerVersion(data.firmware.version, APP_VERSION)) {
      // No update needed — clear any in-progress reception
      broadcastState.manifestAvailable = null;
      broadcastState.receptionProgress = 0;
      hideReceptionProgressBar();
      return;
    }
    
    // New update detected!
    if (!broadcastState.manifestAvailable || 
        broadcastState.manifestAvailable.firmware.version !== data.firmware.version) {
      // First time seeing this version — start reception
      broadcastState.manifestAvailable = data;
      broadcastState.receptionStartedAt = Date.now();
      broadcastState.receptionProgress = 0;
      showReceptionProgressBar();
    }
    // (Otherwise we're already receiving this version — let progress continue)
  } catch (e) {
    // Silent failure
  }
}

function updateReceptionProgress() {
  if (!broadcastState.manifestAvailable) return;
  
  const loopMs = broadcastState.manifestAvailable.broadcast_loop_duration_minutes * 60 * 1000;
  const elapsed = Date.now() - broadcastState.receptionStartedAt;
  broadcastState.receptionProgress = Math.min(elapsed / loopMs, 1.0);
  
  renderProgressBar(broadcastState.receptionProgress);
  
  if (broadcastState.receptionProgress >= 1.0) {
    // Reception complete!
    onBroadcastUpdateReady(broadcastState.manifestAvailable.firmware);
  }
}
```

**Important detail:** When the user switches *away* from DishTV, the reception is **paused but not reset**. If they come back to DishTV later, progress continues from where it left off. This recreates the real "you have to leave DishTV on to get updates" mechanic.

#### 3.3 — The progress bar overlay

Add a small, unobtrusive indicator to the existing DishTV input overlay (the `inputDishTV` div, ~line 374). Something like:

```html
<div id="broadcastReceptionBar" class="absolute bottom-12 right-4 bg-black/60 border border-amber-400/30 p-2 rounded text-[9px] text-amber-300 font-mono hidden z-25">
  <div class="flex items-center gap-2">
    <i class="fa-solid fa-satellite-dish text-amber-400 animate-pulse"></i>
    <span>Firmware Data: <span id="broadcastProgressText">0%</span></span>
  </div>
  <div class="w-32 h-1 bg-amber-900/40 rounded mt-1 overflow-hidden">
    <div id="broadcastProgressFill" class="h-full bg-amber-400 transition-all" style="width: 0%"></div>
  </div>
</div>
```

Show this bar when reception starts, update the fill % every second, hide when complete or when no update is being received.

#### 3.4 — The completion notification

When reception hits 100%, show a Samsung-style corner notification:

```
┌──────────────────────────────────────────┐
│  📡 DishTV Software Update Ready         │
│  Version 1.0.6 — Press OK to install     │
│  or wait — will install at 3:00 AM       │
│                              [OK] [Later]│
└──────────────────────────────────────────┘
```

- **OK** → calls `showUpdateOverlay(broadcastState.manifestAvailable.firmware.version)`
- **Later** → dismisses notification; firmware will install on next "power off → power on" cycle (use the existing power button flow to detect this)

#### 3.5 — Update the Software Update menu's Broadcast status line

The status line should reflect the real-time state:

- DishTV input not active: `○ Switch to DishTV (HDMI 3) to enable`
- DishTV active, no update available: `● Listening on HDMI 3 — no updates pending`
- DishTV active, receiving update: `● Receiving v{x} — {progress}% complete`
- Reception complete, awaiting install: `✓ Update v{x} ready to install`

If the user clicks **Update via Channel (Broadcast)** in the menu and an update is ready, immediately show the install confirmation. If reception is in progress, show a screen displaying the current reception status with a progress bar mirror of the corner indicator.

#### 3.6 — Subtle audio cues (optional but recommended)

Use the existing `tvSynth` to add subtle "data carrier" sounds:

- When reception starts: a short low-frequency burst (220 Hz, 0.1s) — the "carrier lock" sound
- Every 25% reception progress: a brief soft beep (440 Hz, 0.05s, very low volume)
- When reception completes: an ascending three-note chime (440 → 660 → 880 Hz)

These should be very quiet, easily missed if the user isn't paying attention — matching the "passive broadcast" feel.

#### 3.7 — Acceptance criteria for Phase 3

- ✅ `dishtv/firmware.json` is deployed to Vercel and fetchable at the expected URL
- ✅ Switching to DishTV input starts the broadcast scanner after a 5-second delay
- ✅ Switching away pauses the scanner without resetting progress
- ✅ Progress bar appears in the DishTV overlay when an update is being received
- ✅ Progress bar fills over the configured `broadcast_loop_duration_minutes`
- ✅ At 100% reception, the completion notification appears
- ✅ Install flow uses existing `showUpdateOverlay()`
- ✅ Software Update menu's Broadcast status line updates in real time
- ✅ Subtle audio cues fire at the right moments
- ✅ All silent-failure behaviors work (network error, wrong model, version too old)

---

### Phase 4 — Cross-method conflict handling (1-2 hours)

**Goal:** Handle the edge cases where two OTA paths offer different things simultaneously.

#### 4.1 — Internet update completes while Broadcast reception is in progress

If user manually triggers Internet update and successfully installs v1.0.6 while broadcast is at 60% reception of v1.0.6:
- Page reloads after install (existing behavior)
- On reload, broadcast scanner checks manifest again
- Sees `APP_VERSION` is now 1.0.6, manifest also offers 1.0.6
- `isNewerVersion()` returns false → reception cancelled cleanly
- Progress bar disappears
- No conflict, no error

#### 4.2 — USB offers v1.0.6 while Broadcast offers v1.0.7

When user opens USB file browser and the broadcast manifest also has an update:
- Show a small note in the USB confirmation modal:
  *"Note: A newer version (v1.0.7) is available via DishTV broadcast. Install USB version anyway?"*
- User chooses; no automatic preference

#### 4.3 — Update menu shows all three statuses simultaneously

The Software Update sub-menu should reflect the real state of all three paths at once, so users can see at a glance which paths have updates pending.

#### 4.4 — Acceptance criteria for Phase 4

- ✅ Conflicts are resolved without crashing or producing inconsistent state
- ✅ User is never "stuck" — every dialog has a way out
- ✅ Cross-method information is shown when relevant

---

### Phase 5 — Polish & period-authentic touches (1-2 hours)

#### 5.1 — Update menu status icons should match Samsung 2010 design language

Use the existing Tailwind + Font Awesome icons. Match the sky-blue Samsung accent color (`text-sky-400`, `border-sky-400`) for selected items. Match the amber color for DishTV-related items (the existing DishTV overlay already uses amber).

#### 5.2 — The Broadcast notification should auto-minimize after 30 seconds

If the user doesn't interact with the "Update Ready" notification within 30 seconds, it should shrink to a small icon in the corner (a satellite-dish badge) that pulses gently. Clicking the icon re-expands the notification.

#### 5.3 — Update the `version.json` schema documentation

In a comment block near the existing `version.json` fetch code, document the three-manifest architecture:

```js
// OTA Manifest Architecture:
//   1. /version.json          → Internet OTA (manual check)
//   2. /dishtv/firmware.json  → Broadcast OTA (passive, DishTV-input-gated)
//   3. /usb-images/*.json     → USB OTA (manual insert + select)
//
// All three converge at showUpdateOverlay(version) for installation.
// Bumping any manifest does not bump APP_VERSION — they are decoupled by design.
```

#### 5.4 — Acceptance criteria for Phase 5

- ✅ All new UI matches existing Samsung 2010 design language
- ✅ Notifications auto-minimize sensibly
- ✅ Code is documented for future maintenance

---

## 🎨 UI/UX Style Guide (must follow existing patterns)

- **Font:** Use existing classes — `aero-font` (Exo) for Samsung UI chrome, `digital-font` (Share Tech Mono) for technical/digital readouts, `futuristic-font` (Outfit) for Apple TV
- **Colors:**
  - Samsung sky blue: `text-sky-400`, `border-sky-400`, `bg-sky-400/30`
  - DishTV amber: `text-amber-400`, `border-amber-400`, `bg-amber-400/30`
  - Success green: `text-emerald-400`
  - Error red: `text-red-400`
- **Glass panels:** Use the existing `glass-panel` class for modal containers
- **Animations:** Use existing `transition-all`, `animate-pulse` patterns; don't introduce new animation libraries
- **Audio:** All sounds via existing `tvSynth` class — don't load new audio files for system sounds (only for media content)
- **Modals:** Match the existing `screenUpdate` / `screenUpToDate` modal structure for consistency

---

## ⚙️ Technical Constraints

1. **No new external dependencies.** Use only what's already loaded: Tailwind CDN, Font Awesome, hls.js. Do not add npm packages, no Vite, no build step. The entire simulator must remain a single static HTML file deployable to Vercel.

2. **No backend.** Everything must work as static files. The "manifests" are all `.json` files on Vercel, fetched directly.

3. **Preserve `APP_VERSION = '1.0.5'`.** Do not bump this. The user controls when to bump it.

4. **Do not modify `version.json`** during implementation. It's the user's deploy trigger.

5. **Test with `cache: 'no-store'`** on all fetches to Vercel JSON manifests, matching the existing pattern.

6. **Idempotent code:** Multiple insertions of the same USB, multiple input switches, multiple update checks must not produce duplicate scanners, leaked intervals, or memory issues.

7. **Mobile-aware (best-effort):** The simulator's existing layout cramps on mobile; don't make this worse. New UI elements should respect the existing flex/grid structure.

---

## 📋 Final Acceptance Test (run after Phase 5)

Walk through this scenario manually and verify every step works:

1. **Power on TV.** APP_VERSION reads 1.0.5.
2. **Go to Menu → Support → Software Update.** See three options, all with correct status lines.
3. **Select Update via Internet.** Verify it still works as before.
4. **Eject any USB. Select Update via USB.** See "No USB connected" error.
5. **Insert "Empty USB" via the chassis icon.** Status line updates. Go back to USB option. See file browser open with empty USB. Navigate around. Press Back to exit.
6. **Eject. Insert "Firmware Update v1.0.6" USB.** Re-enter USB option. File browser opens. Navigate into `T-CHL7DEUC` folder. Confirmation modal auto-appears with release notes. Cancel out.
7. **Eject. Insert "Corrupted USB."** Verify error message appears with appropriate text.
8. **Switch to DishTV input (HDMI 3).** Wait 5 seconds. After ~10 seconds, broadcast scanner should detect the firmware in `dishtv/firmware.json`. Progress bar appears in DishTV overlay.
9. **Switch to Wii input mid-reception.** Progress pauses. Verify by switching back to DishTV — progress resumes from where it left off, not from 0%.
10. **Wait for 100% reception** (will take `broadcast_loop_duration_minutes` of accumulated DishTV time). Completion notification appears.
11. **Click Install.** Same shutdown countdown + page reload as Internet OTA.
12. **After reload, check version.** Should now show 1.0.6 (if you also bumped APP_VERSION in the HTML for the test — otherwise reset back to 1.0.5).
13. **Verify all three Software Update statuses** are consistent post-update.

If all 13 steps work without errors, the system is ready to ship.

---

## 🚀 Deployment Notes

1. **Vercel auto-deploys on push.** Pushing to the main branch should publish all new files including `dishtv/firmware.json` and `usb-images/*.json`.

2. **Test live URLs after deploy:**
   - `https://project-78d0r.vercel.app/dishtv/firmware.json` → should return 200
   - `https://project-78d0r.vercel.app/usb-images/firmware-only-usb.json` → should return 200

3. **Cache busting:** The simulator uses `cache: 'no-store'` on all manifest fetches. No additional cache busting needed.

4. **Rollback strategy:** If anything breaks, revert the commit. The decoupled architecture means the new OTA paths are additive — removing them does not break the existing Internet OTA.

---

## 🧭 Design Philosophy Reminders

This is a **2010-era Samsung LCD TV simulator**. Every design choice should ask: *"would this have felt right in 2010?"*

- **No modern UX patterns** (no command palettes, no AI assistants, no swipe gestures)
- **Slow is okay** — the broadcast OTA taking 4+ minutes to "receive" is a feature, not a bug
- **Silent failure is period-authentic** for broadcast OTA — don't add helpful error toasts where real TVs would just stay quiet
- **Multiple incompatible methods coexisting** is the whole point — don't unify them into a "smart" single update flow
- **The user is allowed to be confused.** That's how 2010 firmware updates felt. Don't over-explain.

The goal is not the *best* update system. It's the *historically faithful* update system that captures what consumer electronics felt like in the era of physical media, satellite broadcasts, and manual firmware management — before everything became cloud-mediated and invisible.

---

## 💡 Stretch Goals (do NOT implement in this pass, but design for compatibility)

These are out of scope for this implementation but the architecture should not preclude them:

- **Real FAT32 byte layout** behind the VirtualUSB JS object (Phase 6+)
- **Drag-and-drop real files** onto the virtual USB from the user's computer (Phase 6+)
- **DishTV-side narrative content:** Channel 999 (firmware test pattern), Channel 0 (release notes ticker), 2:55 AM "Update in Progress" interstitial (Phase 7+)
- **Channel pack delivery** via USB or Broadcast — sideload new AajTak MP4s into the simulator (Phase 8+)
- **Regional ad-layer packs:** AajTak USA (with Remitly ads), AajTak UK (with Lebara ads), AajTak Gulf (with Lulu ads) — controllable via USB profiles (Phase 9+)

When designing data structures and state machines for the current phases, leave room for these — e.g., the `VirtualUSB` class should not assume firmware is the only payload type; it should be generic enough to carry channel packs, ad packs, or media files.

---

## 📞 If You Get Stuck

If any aspect of this prompt is unclear, **do not invent behavior.** Instead:

1. Read the existing `Samsung_TV.html` more carefully — most patterns are already established
2. Check the live deployment for current behavior
3. Ask the user a specific, narrow question rather than making a guess

The user is media-literate, technically engaged, and prefers correctness over speed. Bluffing or pattern-matching from generic TV simulators will produce wrong results. Stay grounded in *this specific simulator's* existing code.

---

**End of master prompt.** Begin with Phase 0. Report back after each phase with a brief summary of what was built and any deviations from this spec.
