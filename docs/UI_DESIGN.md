# Web UI Design

## Philosophy

The UI should feel like a **writing studio**, not an IDE and not a chat app. Dark, cinematic, minimal chrome. The writing canvas dominates. Everything else slides in when needed and disappears when you're in flow.

Think: Notion's clean editor + Spotify's dark aesthetic + a flight deck's purposeful layout.

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Editor**: TipTap (ProseMirror-based, extensible rich text)
- **State**: Zustand (lightweight, no boilerplate)
- **Backend**: FastAPI (same as document_search — proven pattern)
- **Real-time**: WebSocket for streaming AI responses
- **Styling**: Dark theme default, synthwave accent colors (cyan/magenta/amber)

## Layout: Three-Panel with Focus Mode

```
┌──────────────────────────────────────────────────────────────────────┐
│ ⚓ Sky Carriers  │  Ch.4: First Blood  │  Clancy×Synthwave  │ 2,847w │
├────────┬─────────────────────────────────────────────────┬───────────┤
│        │                                                 │           │
│ Chap.  │                                                 │  🔍 Ref   │
│  1 ──  │                                                 │           │
│  2 ──  │          W R I T I N G   C A N V A S            │  results  │
│  3 ──  │                                                 │  here     │
│ >4 ──  │   The catapult runes flared cyan beneath        │           │
│  5     │   Kael's dragon, and for one heartbeat the      │  ─────── │
│        │   entire flight deck held its breath.│          │           │
│ Chars  │                                                 │  🎨 Gen   │
│  Kael  │                                                 │           │
│  Voss  │                                                 │  [img]    │
│        │                                                 │           │
│ World  │                                                 │  📋 Out   │
│ Notes  │                                                 │  • beat 1 │
│        │                                                 │  • beat 2 │
├────────┴─────────────────────────────────────────────────┴───────────┤
│  / type a command...                                        ⌘K       │
└──────────────────────────────────────────────────────────────────────┘
```

### Focus Mode (⌘⇧F)

Collapses both side panels. Just the canvas, full-width, centered text column (max 65ch). Header shrinks to a thin bar. Pure writing.

### Panels

All panels are collapsible and resizable. They remember their state per-project.

## Screens

### 1. Dashboard (Project Select)

What you see on launch. Not a file picker — a visual grid of your projects with mood/cover images.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   YOUR WORLDS                                          [+ New]   │
│                                                                  │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│   │  ⚓          │  │  🏰          │  │  🚀          │            │
│   │  Sky        │  │  The Iron   │  │  Void       │            │
│   │  Carriers   │  │  Throne     │  │  Runners    │            │
│   │             │  │             │  │             │            │
│   │  Ch.4/12    │  │  Ch.2/8     │  │  Ch.1/6     │            │
│   │  2,847 w    │  │  5,200 w    │  │  800 w      │            │
│   │  2 days ago │  │  1 week ago │  │  new        │            │
│   └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 2. The Briefing (on project open)

Full-screen cinematic briefing before you start writing. Fades into the editor when you click "Continue."

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    ⚓ SKY CARRIERS                                │
│                    Chapter 4: First Blood                        │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                         │   │
│   │  LAST TIME                                              │   │
│   │  "The catapult runes flared cyan beneath Kael's         │   │
│   │   dragon, and for one heartbeat the entire flight       │   │
│   │   deck held its breath."                                │   │
│   │                                                         │   │
│   │  WHERE YOU ARE                                          │   │
│   │  Kael is on the catapult, about to launch on his        │   │
│   │  first combat sortie. Enemy fleet: 30 ships.            │   │
│   │                                                         │   │
│   │  NEXT BEATS                                             │   │
│   │  • Launch — hands shaking on the reins                  │   │
│   │  • First sight of enemy dragons                         │   │
│   │  • Scrying-link chatter from squadron lead              │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   [▶ Continue]   [↺ Reread]   [💭 Interview]   [🎲 Dive]        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 3. Writing Canvas

The editor itself. Key features:

- **Ghost text** — AI suggests the next sentence in faded text. Tab to accept, keep typing to ignore. Non-intrusive.
- **Inline commands** — Type `/` anywhere to open command palette contextually.
- **Highlight-to-act** — Select text → floating toolbar: "Rewrite", "Expand", "Image from this", "Reference"
- **Margin notes** — Click the gutter to add notes that don't appear in the export.
- **Word count** — Per-session, per-chapter, per-project. Subtle, always visible.

### 4. Reference Panel (Right)

Search your corpus without leaving the editor. Results show highlighted snippets with source file attribution. Click to insert a quote or just read for context.

### 5. Image Generation Panel (Right)

- Text field for scene description (or auto-fills from selected text)
- Style selector (dropdown of your image styles)
- Generate button → shows loading → displays result
- Gallery of generated images for this chapter
- Click image to insert into manuscript or save to project

### 6. AI Chat Panel (Right)

For longer conversations: brainstorming, plotting, character development. Not inline — this is the "thinking out loud" space. Aware of your full project context.

### 7. Outline Panel (Right)

Shows chapter beats as a checklist. Check them off as you write through them. Drag to reorder. Click to jump to that section in the editor.

## Interactions

### Command Palette (⌘K)

Like VS Code's command palette but for writing:

```
> Generate prose from outline
> Search corpus: "dragon launch procedure"
> Generate image: current scene
> Switch style: jrr-tolkien
> Warm up: mood ramp
> Export chapter as PDF
> Show character: Kael
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` | Command palette |
| `⌘⇧F` | Focus mode (hide panels) |
| `Tab` | Accept AI ghost suggestion |
| `Esc` | Dismiss ghost / close panel |
| `⌘/` | Inline command |
| `⌘⇧I` | Generate image from selection |
| `⌘⇧R` | Search reference from selection |
| `⌘⇧G` | Generate/expand from selection |
| `⌘S` | Save (auto-saves anyway) |
| `⌘⇧E` | Export current chapter |

### Streaming AI Responses

When generating prose, the text streams in token-by-token below your cursor (or in a preview pane). You watch it arrive, then accept/edit/reject. Feels alive, not batch.

## Visual Design

### Style Mixer Panel (UI)

Accessible from the header style badge or ⌘⇧S. A dedicated panel for blending:

```
┌─────────────────────────────────────────────────────────────┐
│  🎨 STYLE MIXER                              [Save Preset]  │
│                                                             │
│  ─── VOICE BLEND ───                                        │
│                                                             │
│  Tom Clancy          ████████████░░░░░░░░  60%   [×]       │
│                      ◄━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━►       │
│                                                             │
│  J.R.R. Tolkien      ████████░░░░░░░░░░░░  40%   [×]       │
│                      ◄━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━►       │
│                                                             │
│  [+ Add voice]                                              │
│                                                             │
│  ─── IMAGE BLEND ───                                        │
│                                                             │
│  Synthwave Fantasy   ██████████████░░░░░░  70%   [×]       │
│                      ◄━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━►       │
│                                                             │
│  Oil Painting        ██████░░░░░░░░░░░░░░  30%   [×]       │
│                      ◄━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━►       │
│                                                             │
│  [+ Add image style]                                        │
│                                                             │
│  ─── PREVIEW ───                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ "The Ironvow cut through the gray swell, her hull   │   │
│  │  groaning with the weight of ages. On the flight    │   │
│  │  deck, Launch Officer Dren ran through the pre-     │   │
│  │  flight sequence: rune charge at nominal, arrest    │   │
│  │  chains tensioned, wind bearing zero-four-five."    │   │
│  └─────────────────────────────────────────────────────┘   │
│  [↻ Regenerate Preview]                                     │
│                                                             │
│  ─── PRESETS ───                                            │
│  [carrier-epic] [battle-mode] [lore-chapter] [+ New]       │
│                                                             │
│  Scope: ○ This chapter  ○ Whole project                    │
│                                                             │
│  [Apply]                                              [Cancel]│
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- **Sliders** — Drag to adjust weight per style. Values auto-normalize to 100%.
- **Live preview** — Generates a short sample paragraph in the current blend so you can hear the voice before committing.
- **Add/remove** — Click [+ Add voice] to pick from the style library. [×] to remove one from the blend.
- **Presets** — Save blends as named presets, load them with one click.
- **Scope** — Apply to just this chapter or the whole project.
- **Per-chapter indicator** — The header badge shows the active blend and updates when you switch chapters.

### Header Badge (always visible)

```
┌──────────────────────────────────────────────────────────────────┐
│ ⚓ Sky Carriers │ Ch.4: First Blood │ 🎨 Clancy 60 / Tolkien 40 │
└──────────────────────────────────────────────────────────────────┘
```

Click the badge → opens the mixer. Hover → shows full blend details.

### Quick-Adjust from Editor

While writing, without opening the full mixer:

- **⌘⇧↑ / ⌘⇧↓** — Nudge primary style weight up/down by 10%
- **Right-click style badge** → quick preset switcher dropdown

### Color Palette



```
Background:     #0A0A0F (near-black with blue tint)
Surface:        #1A1A2E (panels, cards)
Editor bg:      #0D0D14 (slightly different from panels)
Text:           #E2E2E8 (warm white)
Accent primary: #06B6D4 (cyan — rune glow)
Accent secondary: #D946EF (magenta — magic)
Accent warm:    #F59E0B (amber — fire/warmth)
Muted:          #6B7280 (gray for secondary text)
Success:        #10B981 (green for saves/completions)
```

### Typography

- **Editor**: Serif font (Literata or Source Serif Pro) — feels like writing, not coding
- **UI chrome**: Sans-serif (Inter) — clean, doesn't compete
- **Monospace**: Only for command palette and code/stats

### Animations

- Briefing fades in on open, fades out when you start writing
- Panels slide in/out smoothly
- Ghost text fades in gently (not jarring)
- Image generation shows a subtle shimmer while loading
- Word count ticks up satisfyingly

## Mobile / Tablet

Not a priority for v1, but the layout is responsive:
- Tablet: Two-panel (editor + one side panel, swipeable)
- Phone: Editor only with bottom sheet for commands

## Project Structure (Frontend)

```
frontend/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   │   ├── Dashboard.tsx         # Project grid
│   │   ├── Briefing.tsx          # Immersion screen
│   │   ├── Editor.tsx            # TipTap writing canvas
│   │   ├── GhostText.tsx         # AI suggestion overlay
│   │   ├── CommandPalette.tsx    # ⌘K palette
│   │   ├── panels/
│   │   │   ├── ChapterNav.tsx
│   │   │   ├── ReferenceSearch.tsx
│   │   │   ├── ImageGen.tsx
│   │   │   ├── Outline.tsx
│   │   │   ├── AiChat.tsx
│   │   │   └── Characters.tsx
│   │   └── layout/
│   │       ├── ThreePanel.tsx
│   │       ├── Header.tsx
│   │       └── BottomBar.tsx
│   ├── stores/
│   │   ├── projectStore.ts       # Zustand: project state
│   │   ├── editorStore.ts        # Zustand: editor state
│   │   └── styleStore.ts         # Zustand: active styles
│   ├── hooks/
│   │   ├── useStreaming.ts       # WebSocket streaming
│   │   ├── useSearch.ts          # Corpus search
│   │   └── useImageGen.ts       # Image generation
│   └── styles/
│       └── globals.css           # Tailwind + custom theme
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```
