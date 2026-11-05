# DESIGN SYSTEM: Linear Minimalist

## 1. Overview & Visual Atmosphere
- **Archetype:** Linear (Dark Minimalist Developer Aesthetic)
- **Mood:** Deep obsidian dark mode, ultra-refined 1px borders, subtle indigo glow, high information density, keyboard-first precision.
- **Target Audience:** Modern software engineers, product designers, and power users.
- **Visual Source of Truth:** Enforced via `VoltAgent/awesome-design-md` standard.

## 2. Color Palette & Semantic Tokens
### Background & Surfaces
- **Canvas Background:** `#08090a`
- **Surface (Cards, Panels, Modals):** `#101114`
- **Surface Raised / Hover:** `#16181d`
- **Surface Sunken / Recessed:** `#0c0d0e`

### Borders & Dividers
- **Border Subtle (Default Dividers):** `#1f2228`
- **Border Strong (Active, Hovered, Selected):** `#2e323b`
- **Border Focus Ring:** `#5e6ad2`

### Text & Inks
- **Text Primary (Headings, titles, high contrast):** `#f7f8f8`
- **Text Secondary (Body, descriptions, labels):** `#8a8f98`
- **Text Muted (Placeholders, inactive meta):** `#62666d`

### Semantic & Action States
- **Brand / Primary Action:** `#5e6ad2` (Hover: `#6875e8`, Active: `#4f59b8`)
- **Secondary Action:** `#16181d` (Border: `#1f2228`, Text: `#f7f8f8`, Hover: `#1f2228`)
- **Destructive:** `#e5484d` (Hover: `#f2555a`)
- **Success / Online Indicator:** `#30a46c` / `#10B981`
- **Warning:** `#f5a623`

## 3. Typography
- **Primary Font Family:** Inter, Geist Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Monospace Font Family:** Geist Mono, "SF Mono", Consolas, monospace
- **Headline Restraint (Taste Skill):** All hero and primary section titles must fit in 2 lines or fewer.
- **Type Scale:**
  - `xs`: 12px / Line Height: 16px (Badges, timestamps, technical indicators)
  - `sm`: 13px / Line Height: 18px (Navigation links, metadata, secondary captions)
  - `base`: 14px / Line Height: 20px (Body messages, input text, table rows)
  - `lg`: 16px / Line Height: 24px (Subheadings, card titles)
  - `xl`: 20px / Line Height: 28px (Panel headers, modal titles)
  - `2xl`: 24px / Line Height: 32px (Section headlines)
  - `3xl`: 32px / Line Height: 40px (Hero headlines - max 2 lines)

## 4. Spacing, Sizing & Radii
- **Base Grid:** 4px scale (4, 8, 12, 16, 20, 24, 32, 48, 64px)
- **Border Radii:**
  - Small (`rounded-[6px]`): Buttons, inputs, search bars, pill tags
  - Medium (`rounded-[8px]`): Cards, conversation items, floating docks
  - Large (`rounded-[12px]`): Modals, main workspace panels

## 5. Component Patterns (Impeccable Craft)
- **Buttons:**
  - Primary: `bg-[#5e6ad2] hover:bg-[#6875e8] text-[#f7f8f8] rounded-[6px] transition-all duration-150`
  - Secondary: `bg-[#101114] hover:bg-[#16181d] border border-[#1f2228] hover:border-[#2e323b] text-[#f7f8f8] rounded-[6px]`
  - Focus Ring: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090a]`
- **Cards & Bento Cells:**
  - `bg-[#101114] border border-[#1f2228] hover:border-[#2e323b] transition-colors duration-150`
- **Input Fields:**
  - `bg-[#0c0d0e] border border-[#1f2228] focus:border-[#5e6ad2] text-[#f7f8f8] placeholder-[#62666d] rounded-[6px]`

## 6. Implementation Tokens
```css
:root {
  --bg-canvas: #08090a;
  --bg-surface: #101114;
  --bg-surface-raised: #16181d;
  --bg-surface-sunken: #0c0d0e;
  --border-subtle: #1f2228;
  --border-strong: #2e323b;
  --brand-primary: #5e6ad2;
  --brand-hover: #6875e8;
  --brand-active: #4f59b8;
  --text-primary: #f7f8f8;
  --text-secondary: #8a8f98;
  --text-muted: #62666d;
}
```
