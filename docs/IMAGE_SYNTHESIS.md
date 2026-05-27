# Scene-to-Image Prompt Synthesis

## The Problem

You can't just say "dragon carrier in synthwave style" to an image model and get consistent, world-accurate results. You need:

1. **World consistency** — The carrier is a living ancient dragon, not a ship. The runes are pink/cyan. The armor is mithril-chrome.
2. **Scene composition** — Camera angle, lighting, focal subject, background elements
3. **Style lock** — Every image feels like it's from the same album cover series
4. **Character consistency** — The same sky jockey should look recognizable across images

## How the Synthesizer Works

```
World Bible (lore, species, aesthetics)
    +
Scene Description (what's happening)
    +
Image Style (synthwave-fantasy.yaml)
    ↓
[Context Assembler pulls relevant world-bible sections]
    ↓
[Bedrock text model generates a detailed image prompt]
    ↓
[Image prompt + style modifiers → Bedrock Image API]
    ↓
Generated Image
```

The trick: we use a **text model as a prompt engineer** for the image model. The text model knows your world bible and translates "launch sequence" into a 200-word detailed prompt that the image model can execute.

## Example Flow

**User input:**
```
/img launch sequence - razor wing taking off at sunset
```

**Context Assembler pulls from world-bible:**
- Razor Wings = fast agile fire-breath dragons, single rider
- Launch = off carrier drake's wing-plate (flat bone surface)
- Rider gear = leather + plate + glowing sigils + visor helmet
- Carrier = ancient living dragon, city on back visible in distance

**Text model generates image prompt:**
```
A sleek razor-wing dragon leaping from the flat bone wing-plate of an
enormous ancient carrier dragon, single rider in chrome-mithril plate armor
with glowing cyan rune sigils, helmet visor reflecting orange sunset,
dragon's wings spread wide catching golden light, neon pink launch runes
flaring along the bone deck, tiny figures of dwarf deck crew below,
the carrier dragon's mountainous back visible in background with city
spires, dramatic sunset sky in purple and orange gradient, lens flare
from the setting sun, VHS film grain texture, 80s fantasy illustration
style, Boris Vallejo composition, epic cinematic wide angle shot
```

**Combined with style yaml positive/negative prompts → sent to image model**

## Character Sheet Generation

For recurring characters, we generate a **reference sheet** first:

```
/char new "Kael Stormrider" --role "sky jockey" --species "human" --dragon "razor wing"
/img charsheet Kael Stormrider
```

This generates a multi-angle reference (front, side, action pose) that gets stored. Future images referencing Kael pull from this sheet for consistency cues in the prompt.

## Scene Types (Pre-built Compositions)

| Scene Type | Composition | Lighting | Scale |
|------------|-------------|----------|-------|
| `portrait` | Character centered, 3/4 view, dragon behind | Rim-lit, neon accent | Close |
| `launch` | Dynamic diagonal, motion blur on wings | Sunset backlit, rune-glow | Medium |
| `carrier` | Wide establishing shot, clouds framing | Golden hour, volumetric | Epic |
| `dogfight` | Dutch angle, crossing fire-breath | Chaotic, multiple light sources | Medium |
| `landing` | Low angle looking up at incoming dragon | Dramatic underlighting | Medium |
| `crew` | Group shot, deck environment | Warm interior + neon accents | Close |
| `command` | Overhead tactical, holographic glow | Cool blue/purple ambient | Interior |
| `poster` | Centered hero, text-space at top/bottom | High contrast, backlit | Full |

## CLI Usage

```bash
# Generate from scene description (uses world bible as context)
/img launch sequence - razor wing at sunset

# Generate character reference sheet
/img charsheet "Kael Stormrider"

# Generate with specific composition
/img --type poster Kael standing before his razor wing

# Generate a series (album cover set)
/img --series "squadron portraits" --count 5

# Regenerate with tweaks
/img --redo --more "add more lens flare, make the sunset more purple"

# Use the world bible for a specific faction
/img --focus dwarves "deck crew preparing storm drake for launch"
```
