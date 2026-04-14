# 💾 MODULE: TAHOE DISK UTILITY (2026)
> **Target OS:** macOS Tahoe (Unit 7)
> **Logic:** Storage Quota API / Partition Lifecycle

## 🎨 THE UI (APPLE DISK UTILITY 2026)
- **The Sidebar:** Lists the primary **'Macintosh HD'** and sub-volumes like **'iOS Diner Cache'** and **'XP Restaurant Data'**.
- **The Visualization:** A large, multi-colored horizontal bar chart showing data distribution:
    - **Blue:** System (Tahoe Core)
    - **Green:** Apps (.md Modules)
    - **Yellow:** Restaurants (Legacy OS Assets)
    - **Gray:** Free Space (Remaining LocalStorage)
- **Visuals:** High-gloss "Silicon" buttons for **First Aid**, **Partition**, and **Erase**.
- **Icon:** A refractive sapphire-glass hard drive with a glowing read/write actuator.

## 🧪 THE LOGIC (CAVEMAN)
1. **The Capacity Engine:** - Use `JSON.stringify(localStorage).length` to calculate exactly how many bytes are currently occupied.
   - Simulate a "500GB M5 Max SSD" by scaling the browser's 5MB-10MB limit to a realistic percentage.
2. **First Aid:** A functional script that iterates through the `localStorage` keys and removes any corrupted or "Orphaned" data strings from old V2 builds.
3. **Partition Logic:** Visualizes the "Containers"—explaining that Unit 1, Unit 5, and Unit 7 share the same physical drive but exist in different "Temporal Partitions."

## ⚡ THE PROMPT INJECTION
"Using `/caveman-full-stack-developer`: Build the Tahoe Disk Utility.
1. UI: Create a split-view with a sidebar showing the drive hierarchy and a main view with the 'Storage Bar'.
2. Logic: Implement a real-time calculation of LocalStorage usage to drive the 'Storage Bar' widths.
3. Feature: Build a 'First Aid' animation—when clicked, show a pulsing glass scan that finishes with a green checkmark.
4. Feature: Include an 'Erase' button that (with a double-confirmation glass dialog) clears the localStorage.
5. Physics: Use 'Liquid Glass' for the action bar and 'Obsidian Glass' for the sidebar.
Output Code Only."