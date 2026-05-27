# Writer Immersion Interface

## The Problem

You sit down to write. You open the tool. You stare at a cursor. The world you built last week feels distant. You can't remember where you left off, what the tone was, what scene was next.

The tool should **pull you back in** — fast.

## Immersion Flow: "The Briefing"

When you open a project, the tool doesn't just show a file list. It runs a **briefing** — a short, atmospheric summary that puts you back in the world.

### On Project Open

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ⚓ SKY CARRIERS — Dragon Carrier Operations                    │
│  Style: Tom Clancy × Synthwave Fantasy                         │
│                                                                 │
│  ─── LAST SESSION ───                                          │
│  Chapter 4: "First Blood"                                      │
│  Last line written:                                            │
│  "The catapult runes flared cyan beneath Kael's dragon, and    │
│   for one heartbeat the entire flight deck held its breath."   │
│                                                                 │
│  ─── WHERE YOU LEFT OFF ───                                    │
│  Kael is about to launch on his first combat sortie.           │
│  The enemy fleet was spotted at dawn — 30 ships, unknown       │
│  dragon complement. Captain Voss ordered all Razor Wings        │
│  to ready status. Tension on the deck is high.                 │
│                                                                 │
│  ─── WHAT'S NEXT (from your outline) ───                       │
│  • Launch sequence — Kael's hands shaking on the reins         │
│  • First sight of enemy dragons — more than expected           │
│  • Radio chatter (scrying-link) from squadron leader           │
│                                                                 │
│  ─── MOOD ───                                                  │
│  🎵 Synthwave tension. Pre-battle nerves. The calm before.     │
│                                                                 │
│  Ready to write? [continue] [reread last page] [ref search]    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### How It Works

1. **Last line written** — Shows the exact sentence you stopped at. Instant memory trigger.
2. **Where you left off** — AI-generated 2-3 sentence summary of the current scene state (generated from the last ~500 words + outline).
3. **What's next** — Pulls from your chapter outline. Shows the beats you planned.
4. **Mood** — One-line atmospheric note based on the active style + scene context.
5. **Quick actions** — Continue writing, reread the last page for flow, or search your corpus.

## Starting a New Project: "World Forge"

For a brand new project, the tool walks you through world-building interactively:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  🔥 NEW PROJECT — World Forge                                   │
│                                                                 │
│  Let's build your world. Answer what you feel like,            │
│  skip what you don't know yet.                                 │
│                                                                 │
│  What's the core concept? (one sentence)                       │
│  > Naval carriers with dragons instead of aircraft,            │
│    multi-species crews, 80s synthwave military fantasy          │
│                                                                 │
│  What's the vibe? Pick or describe:                            │
│  [1] Epic & mythic    [2] Technical & gritty                   │
│  [3] Warm & whimsical [4] Dark & tense                         │
│  [5] Mix: ___                                                  │
│  > 5: Technical military ops with mythic world history          │
│                                                                 │
│  Who's the main character? (name + one line)                   │
│  > Kael — young sky jockey, first deployment, something        │
│    to prove                                                     │
│                                                                 │
│  What's the opening scene?                                     │
│  > Kael arriving on the carrier for the first time,            │
│    seeing the dragons on the flight deck                        │
│                                                                 │
│  ─── GENERATING ───                                            │
│  ✓ World bible draft created                                   │
│  ✓ Character sheet: Kael                                       │
│  ✓ Chapter 1 outline generated                                 │
│  ✓ Style set: tom-clancy + synthwave-fantasy                   │
│  ✓ Opening paragraph drafted (review below)                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Returning to a Project: "Warm-Up Modes"

Different writers need different on-ramps. The tool offers:

### 1. Quick Resume (default)
Shows the briefing above, drops you at the cursor. 5 seconds to writing.

### 2. Reread Mode
```
/warmup reread
```
Shows the last 1-2 pages of what you wrote, scrolling slowly (or all at once). Gets your voice back in your ear. Then drops you at the cursor.

### 3. Mood Ramp
```
/warmup mood
```
Generates a short atmospheric paragraph in your active style — not part of the story, just a vibe-setter. Like a musician playing scales before a performance.

Example output:
```
The salt air carried the smell of dragon-musk and hot iron across the
flight deck of the Ironvow. Somewhere below, the dwarven rune-forges
hummed their endless bass note. Third watch. The kind of quiet that
meant something was about to not be quiet anymore.
```

Then: "Ready? [continue writing] [generate another] [start fresh scene]"

### 4. Interview Mode
```
/warmup interview
```
The AI asks you questions about what happens next, in character as a curious reader:

```
AI: "Last time, Kael was about to launch. Is he scared?"
You: "Terrified but hiding it. His hands are steady but his stomach isn't."
AI: "What does the deck look like from the catapult position?"
You: "He can see the whole bow, the ocean beyond, the other dragons waiting."
AI: "Got it. Here's a possible opening line for the scene..."
```

This gets your brain *talking* about the story before you have to *write* it. Lower barrier.

### 5. Corpus Dive
```
/warmup dive
```
Surfaces a random relevant passage from your corpus/world-bible that relates to the current scene. Sparks connections you forgot about.

## Session Persistence

The tool tracks:
- Exact cursor position (line + character)
- Last 5 lines written
- Time spent in last session
- Current chapter + scene beat
- Active style/mode
- Any notes you left yourself (`/note "remember to foreshadow the storm"`)

All stored in SQLite, restored instantly on open.

## CLI Commands for Immersion

```bash
/open sky-carriers          # Opens project with full briefing
/warmup reread              # Show last 1-2 pages
/warmup mood                # Generate atmospheric vibe-setter
/warmup interview           # AI asks you about the next scene
/warmup dive                # Random relevant corpus passage
/note "text"                # Leave a note for next session
/notes                      # Show all session notes
/recap                      # AI summarizes the story so far
/recap chapter              # AI summarizes current chapter
/playlist                   # Suggest music mood (based on scene)
```

## The Philosophy

The interface should feel like:
- Opening a well-worn notebook that falls open to the right page
- A co-pilot who remembers where you were and what's next
- A writing room that's already set up when you walk in

NOT like:
- A blank IDE
- A chat interface waiting for commands
- A tool you have to configure before you can start
