# Design System — Digital Business After 40

## Brand Feel
Dark, moody, editorial. Feels expensive and calm, not loud or "hustle-bro." Serif headlines give it authority; soft mauve/pink keeps it warm and approachable. Built for a woman 40+ audience — confident, not cutesy.

## Color Palette

| Token | Hex (approx) | Use |
|---|---|---|
| `--bg-base` | `#0d0a0c` | Page/app background, near-black with a warm tint |
| `--bg-surface` | `#1a1416` | Cards, panels, sidebar |
| `--accent-primary` | `#d97a93` | Buttons, links, highlighted text, active nav state |
| `--accent-primary-soft` | `#3a2530` | Pill badges, subtle tag backgrounds |
| `--text-primary` | `#f5ede7` | Headlines, primary text on dark |
| `--text-secondary` | `#b8aaa8` | Body copy, descriptions |
| `--text-muted` | `#7a6f6d` | Placeholder text, tertiary labels |
| `--border-subtle` | `#2a2224` | Card borders, dividers |
| `--cream` | `#f0e9dd` | Light section backgrounds (e.g. card decks, light CTAs) |

Cream/light sections are used as a contrast break inside an otherwise dark page — not the default.

## Typography

- **Display / Headlines:** Serif (e.g. Playfair Display or similar high-contrast serif). Large, bold, often mixes regular + italic within the same headline for emphasis (italic word in accent color).
- **Body / UI:** Clean sans-serif (e.g. Inter). Used for paragraphs, nav labels, buttons, form inputs.
- **Labels / Eyebrow text:** Sans-serif, uppercase, letter-spaced, small size, often in muted or accent color. Used above headlines as a category tag (e.g. "DIGITAL BUSINESS AFTER 40").

Hierarchy:
1. Eyebrow label (uppercase, tracked out, small)
2. Headline (serif, large, mixed weight/style)
3. Subhead/body (sans-serif, secondary text color)
4. CTA button

## Components

**Buttons (primary)**
- Pill-shaped (fully rounded), solid accent-primary fill, dark/cream text
- Uppercase or sentence-case bold label
- Used for single dominant CTA per screen

**Badges / Pills**
- Rounded-full, soft accent background, small uppercase text
- Used for category tags, "FOR X AUDIENCE" labels, meta info (e.g. "Takes 3 minutes")

**Cards**
- Dark surface color, subtle border, generous padding, rounded corners (~16–24px)
- Used for dashboard panels, content blocks, pricing cards

**Sidebar Nav**
- Dark background, active item gets solid accent-primary pill background
- Icon + label pairs, generous vertical spacing
- User account footer pinned to bottom with avatar circle + sign out

**Input fields**
- Dark fill, subtle border, rounded-full or large radius, placeholder in muted text
- Paired inline with a primary button (search/generate pattern)

## Layout Patterns
- Centered, narrow-measure hero text blocks on marketing/landing pages
- App/dashboard views use a fixed left sidebar + flexible main content area
- Generous whitespace/negative space around headlines — content never feels cramped
- Ticker/marquee strip at very top of landing pages for urgency messaging

## Voice in UI Copy
Warm, direct, plain language. Short sentences. Speaks to a specific struggle ("Stop dreading the blinking cursor") rather than generic marketing fluff. Avoids jargon.
