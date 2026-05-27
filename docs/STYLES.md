# Style & Mode System

## Concept

Styles are prompt engineering fragments stored as config. They modify how the generation models behave without changing the underlying content/context. You can:

- Apply a single style: `/style voice stephen-king`
- Apply an image aesthetic: `/style image 80s-retro`
- Use a composite mode: `/mode 80s-horror` (combines 80s visuals + King's voice)
- Stack styles: `/style voice chandler` then `/style image noir`
- Create your own: drop a YAML file in `styles/custom/`

## How It Works

Styles are **not** fine-tuning. They're structured system prompt injections that tell the model *how* to write or *what aesthetic* to target. The strength comes from:

1. **Specificity** — Each style has detailed craft-level instructions (not just "write like King" but the actual techniques: short punchy sentences, internal monologue, brand-name details, building dread through mundane observation)
2. **Negative constraints** — What to avoid is as important as what to do
3. **Composability** — Voice and image styles are orthogonal; mix freely
4. **Tunable intensity** — Dial from subtle influence (0.3) to full pastiche (1.0)

## Built-in Voice Styles

| Style ID | Characteristics |
|----------|----------------|
| `stephen-king` | Conversational internal monologue, brand-name specificity, dread through mundane detail, short punchy sentences mixed with longer flowing ones, colloquial Maine-isms |
| `cormac-mccarthy` | No quotation marks, minimal punctuation, biblical cadence, landscape as character, violence rendered plainly, archaic vocabulary |
| `ursula-leguin` | Anthropological distance, precise but warm prose, world-building through implication, gender/power awareness, lyrical restraint |
| `raymond-chandler` | First-person wisecrack, simile-heavy, LA noir atmosphere, clipped dialogue, world-weary observations |
| `terry-pratchett` | Footnotes as commentary, satirical observation, warmth beneath cynicism, capitalized Abstract Concepts, absurdist logic played straight |
| `hemingway` | Short declarative sentences, iceberg theory (meaning beneath surface), dialogue-heavy, no adverbs, physical action over emotion |
| `tom-clancy` | Technical military precision, procedural detail that builds tension, multi-POV geopolitical scope, hardware/systems described lovingly, "the reader should feel like they have clearance" |
| `jk-rowling` | Whimsical naming, warmth and humor masking darker themes, found-family bonds, world-building through throwaway detail, escalating stakes across arcs, British wit in narration |
| `jrr-tolkien` | Mythic register, deep history, landscape as sacred, formal dialogue, eucatastrophe, songs/lore woven in, moral clarity, the narrator as chronicler |

## Built-in Image Styles

| Style ID | Prompt Modifiers |
|----------|-----------------|
| `80s-retro` | Neon colors, VHS grain, chrome text, synthwave palette, lens flare, grid lines, sunset gradients |
| `noir` | High contrast B&W, venetian blind shadows, rain-slicked streets, cigarette smoke, dutch angles |
| `watercolor` | Soft edges, paper texture, bleeding colors, white space, impressionistic detail |
| `comic-book` | Bold outlines, halftone dots, dynamic angles, speech bubbles, saturated flat colors |
| `photorealistic` | 8K detail, natural lighting, shallow depth of field, film grain, accurate materials |
| `studio-ghibli` | Soft pastels, detailed backgrounds, whimsical nature, hand-painted feel, atmospheric clouds |
| `pixel-art` | 16-bit aesthetic, limited palette, dithering, chunky pixels, retro game feel |
| `oil-painting` | Visible brushstrokes, rich impasto texture, classical composition, warm undertones |

## Composite Modes (Presets)

| Mode | Image Style | Voice Style | Vibe |
|------|-------------|-------------|------|
| `80s-horror` | 80s-retro | stephen-king | VHS-era horror paperback |
| `literary-noir` | noir | raymond-chandler | Classic detective fiction |
| `fantasy-literary` | watercolor | ursula-leguin | Thoughtful speculative fiction |
| `comic-action` | comic-book | hemingway | Punchy graphic novel energy |
| `cozy-whimsy` | studio-ghibli | terry-pratchett | Warm, funny, gentle |
| `carrier-ops` | synthwave-fantasy | tom-clancy | Technical military fantasy with 80s aesthetic |
| `magic-academy` | studio-ghibli | jk-rowling | Whimsical world-building with warmth |
| `dragon-war` | synthwave-fantasy | tom-clancy | Fleet engagements, multi-POV carrier battles |

## Style Blending

You can stack multiple voice and image styles with individual weight control. The system merges their prompt fragments proportionally.

### Usage

```bash
# Blend two voices with weights
/style voice tom-clancy 0.6 + jrr-tolkien 0.4

# Blend three
/style voice tom-clancy 0.5 + jk-rowling 0.3 + hemingway 0.2

# Blend image styles
/style image synthwave-fantasy 0.7 + oil-painting 0.3

# Shorthand: equal blend
/style voice tom-clancy + jrr-tolkien
```

### How Blending Works

Each style has a `system_prompt` and `avoid` section. When blending:

1. **Weighted inclusion** — At 0.6, the full technique list is included. At 0.3, only the top 3-4 core techniques are pulled. At 0.1, just the one-line essence.
2. **Conflict resolution** — If Style A says "use short sentences" and Style B says "use long flowing sentences", the higher-weighted style wins, and the blender adds "lean toward short sentences but allow occasional longer ones for rhythm."
3. **Avoid merging** — All `avoid` rules from all styles are combined (union, not intersection). If any style says "no adverbs," no adverbs.

### Blend Prompt Construction

```
SYSTEM PROMPT (blended):

Primary voice (60% — Tom Clancy):
- Technical precision: name the systems, procedures, chain of command
- Multi-POV structure: cut between officers, pilots, commanders
- Tension through procedure
- Characters defined by competence
- Dialogue is clipped, professional, jargon-heavy

Secondary voice (40% — J.R.R. Tolkien):
- The prose carries mythic weight — history being recorded
- Landscape described with reverence
- Reference ages past, fallen kingdoms, deep time
- Names carry etymological weight

Blending notes:
- Lead with Clancy's procedural precision but let Tolkien's
  mythic register color the narration between action beats
- Technical dialogue stays clipped (Clancy), but descriptive
  passages gain Tolkien's reverence for place and history
- The world feels ancient and storied, but the characters
  operate with modern military professionalism within it

Avoid (combined):
- Flowery purple prose (Clancy)
- Cynicism or moral relativism (Tolkien)
- Casual/humorous tone during operations (Clancy)
- Modern slang (Tolkien)
- Rushing to action without buildup (both)
```

### Blend Presets

Save your favorite blends as named presets:

```bash
# Save current blend
/style save "carrier-epic"

# Load it later
/style load carrier-epic
```

### Per-Chapter Blending

Different chapters can have different blends:

```bash
# Battle chapter: heavy Clancy
/style voice tom-clancy 0.8 + tolkien 0.2

# Lore/history chapter: heavy Tolkien
/style voice jrr-tolkien 0.7 + tom-clancy 0.3

# Character downtime: add Rowling warmth
/style voice jk-rowling 0.5 + tom-clancy 0.3 + tolkien 0.2
```

The active blend is saved per-chapter, so switching chapters restores the right voice automatically.

### Image Blending

Same principle for visuals:

```bash
# Synthwave + oil painting = painterly neon fantasy
/style image synthwave-fantasy 0.7 + oil-painting 0.3
```

Merges positive prompts (weighted), unions negative prompts, and interpolates parameters (cfg_scale, steps) proportionally.

## Style Definition Format

```yaml
# styles/voice/stephen-king.yaml
id: stephen-king
name: "Stephen King"
type: voice
description: "Conversational horror with brand-name specificity"
intensity_default: 0.7

system_prompt: |
  Write in the style of Stephen King's narrative voice. Key techniques:
  - Internal monologue that feels like eavesdropping on thought
  - Specific brand names and pop culture references to ground the mundane
  - Build dread through ordinary observation before the horror arrives
  - Mix short punchy sentences with longer flowing ones
  - Use italics for emphasis and internal screaming
  - Characters notice small wrong details before the big wrong thing
  - Colloquial, almost chatty narrator voice
  - Parenthetical asides that feel like the author confiding in you

avoid: |
  - Purple prose or overwrought description
  - Passive voice (unless deliberately for effect)
  - Abstract philosophical musing
  - Formal or academic tone
  - Rushing to the scare without building the normal first
```

```yaml
# styles/image/80s-retro.yaml
id: 80s-retro
name: "80s Retro"
type: image
description: "Synthwave neon VHS aesthetic"
intensity_default: 0.8

positive_prompt: |
  1980s aesthetic, neon pink and cyan lighting, chrome reflections,
  VHS scan lines, synthwave color palette, retro-futuristic,
  lens flare, grid horizon, sunset gradient background,
  airbrushed quality, Trapper Keeper art style

negative_prompt: |
  modern, minimalist, flat design, muted colors, realistic lighting,
  contemporary fashion, smartphones, LED screens

parameters:
  cfg_scale: 8
  sampler: "DPMPP_2M"
  style_preset: "neon-punk"
```

## Architecture Integration

The style system slots into the existing architecture at the **Prompt Orchestrator** level:

```
Context Assembler (what to write about)
    ↓
Style Registry (how to write/render it)
    ↓
Prompt Builder (merges context + style into final prompt)
    ↓
Bedrock API (generates)
```

For text generation, the style's `system_prompt` gets prepended to the existing system prompt. Intensity controls how much of the style instruction is included (at 0.3, only the core voice notes; at 1.0, full technique list + avoidance rules).

For image generation, the style's `positive_prompt` and `negative_prompt` get merged with the scene description. Parameters like `cfg_scale` override defaults.
