import os
import glob
import re

def extract_section(content, header_regex):
    match = re.search(header_regex + r'(.*?)(?=## |$)', content, re.IGNORECASE | re.DOTALL)
    if match:
        return match.group(1).strip()
    return "*(Details to be implemented according to OpenClaw standards)*"

def create_prd(filepath, dest_dir):
    with open(filepath, 'r') as f:
        content = f.read()

    filename = os.path.basename(filepath)
    app_name = filename.replace('.md', '')

    # Try to extract main title
    title_match = re.search(r'#\s*(.*?)(?=\n|$)', content)
    title = title_match.group(1).strip() if title_match else app_name

    ui_text = extract_section(content, r'##\s*🎨.*?')
    logic_text = extract_section(content, r'##\s*(?:🧪|🛠️).*?')
    prompt_text = extract_section(content, r'##\s*⚡.*?')

    prd = f"""# PRD: {title}
> **Target:** macOS Tahoe 26.0 (OpenClaw V3)
> **Component:** {app_name}

## 1. Problem
### User Experience
There are no accurate clones of macOS 26 Tahoe. The user requires a fully functional, high-fidelity simulation of `{app_name}` within the web ecosystem. The goal is to provide an immersive, visually appealing, and interactive experience that behaves exactly like its native OS counterpart, fulfilling user workflows like file management, settings adjustments, or media consumption.

### Technical Implementation
The primary technical challenge is simulating `{app_name}` within the browser DOM using React. Challenges include:
- Implementing the complex "Liquid Glass" aesthetics and lighting physics.
- Managing local application state without a backend.
- Ensuring buttery smooth 120fps animations and transitions using Framer Motion.
- Respecting the "Frozen Prompt" constraints and cross-app communication via the React Context API (`SystemContext`).

## 2. Role
### Developer Persona
- **Frontend / UI Engineer:** Must possess deep expertise in React (TypeScript) and Tailwind CSS for replicating exact refractive gradients and blurs.
- **Motion Designer:** Requires strong experience with `framer-motion` for spring physics, dragging mechanics, and multi-state animations.

### Module Architecture Role
`{app_name}` operates as a modular application within the Tahoe OS. It sits inside a Window container managed by the Desktop Shell. It must interface cleanly with global states (e.g., `LocalStorage` for persistence or `FileSystemContext` for data) to communicate with other ecosystem apps seamlessly.

## 3. Deliverables
### High-Level Checklist
#### UI Requirements
{ui_text}

#### Specific Prompt / Feature Injections
{prompt_text}

### Component Architecture & State Management
#### Core Logic
{logic_text}

#### Implementation Steps
1. **Component Creation:** Build `src/components/apps/{app_name.replace(' ', '')}.tsx`.
2. **State Integration:** Use `useSystem()` hooks to register the app, handle window focus (z-index), and close/minimize actions.
3. **Styling:** Apply `glass` and `glass-dark` Tailwind utilities as per the Visual Civics.
4. **Testing:** Verify edge cases like window resizing, background blurring efficiency, and persistence of user data upon reload.
"""

    dest_file = os.path.join(dest_dir, f"{app_name} PRD.md")
    os.makedirs(os.path.dirname(dest_file), exist_ok=True)
    with open(dest_file, 'w') as f:
        f.write(prd)
    print(f"Generated: {dest_file}")

def main():
    os.makedirs('PRDs', exist_ok=True)
    os.makedirs('PRDs/Utilities', exist_ok=True)

    files = glob.glob('*.md') + glob.glob('Utlities/*.md')
    for f in files:
        if f in ['README.md', 'GEMINI.md']:
            continue
        
        dest_dir = 'PRDs/Utilities' if 'Utlities' in f else 'PRDs'
        create_prd(f, dest_dir)

if __name__ == '__main__':
    main()
