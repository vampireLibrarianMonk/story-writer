# Live Extraction & Entity Detection

## Concept

As you write or import content, the system continuously scans for **new entities** — characters, abilities, locations, events, factions, items — that don't yet exist in your project's knowledge base. It queues them in a sidebar tray for you to fill out when you're ready, without interrupting your flow.

## Triggers

| Trigger | What Happens |
|---------|--------------|
| You type a new proper noun | Detected on pause, queued silently |
| You paste in a chapter/scene | Batch extraction runs immediately |
| You import a .txt file | Indexed + extracted on ingest |
| You `/index` a directory | All files scanned for entities |
| You finish a writing session | End-of-session sweep catches anything missed |

## Entity Types Detected

| Type | Detection Signal | Example |
|------|-----------------|---------|
| **Character** | Capitalized name + action/dialogue | "Kael gripped the reins" → new character: Kael |
| **Ability/Magic** | Named power, spell, technique | "the Windshear technique" → new ability |
| **Location** | Named place, geographic reference | "the port of Ashenmoor" → new location |
| **Event** | Named battle, historical reference | "the Third Carrier War" → new event |
| **Faction/Group** | Named organization, species, crew | "the Ironvow's crew" → new faction |
| **Item/Artifact** | Named weapon, ship, object | "the Stormcaller lance" → new item |
| **Dragon/Creature** | Named beast or breed | "his Razor Wing, Cinderfang" → new creature |
| **Relationship** | Two known entities linked | "Kael's mentor, Captain Voss" → relationship |

## How It Works

```
Text input (writing / paste / import)
    ↓
[Lightweight NER pass — regex + heuristics]
    ↓
Candidate entities (fast, local, no API call)
    ↓
[Deduplicate against existing project entities]
    ↓
New entities only
    ↓
[Queue in extraction tray — silent, non-blocking]
    ↓
Author clicks entity when ready
    ↓
[AI generates suggested fill-out from context]
    ↓
Author reviews / edits / confirms
    ↓
Entity saved to project knowledge base
```

### Two-Pass System

**Pass 1: Fast local detection (no API cost)**
- Regex patterns for capitalized multi-word names
- Heuristics: "the [Name]", "[Name] said", "in [Place]", "[Name]'s [ability]"
- Runs on every paragraph break or paste event
- Zero latency, zero cost

**Pass 2: AI-powered deep extraction (on demand or batch)**
- Sends text to a cheap model (Nova Lite) with extraction prompt
- Catches subtler entities: implied relationships, unnamed-but-important concepts
- Runs on import, end-of-session, or when you click "Scan this chapter"

## UI: The Extraction Tray

A small badge/counter appears in the left panel when new entities are detected:

```
┌──────────────┐
│ 📁 Chapters  │
│ 👤 Characters │  ← 3 new
│ ⚔️ Abilities  │  ← 1 new
│ 🌍 Locations  │  ← 2 new
│ 📅 Events    │
│ 🐉 Creatures  │  ← 1 new
│              │
│ ─────────── │
│ 📥 Queue (7) │  ← click to review
└──────────────┘
```

Clicking the queue opens a review panel:

```
┌─────────────────────────────────────────────────┐
│  📥 NEW ENTITIES DETECTED                       │
│                                                 │
│  👤 Dren Ashford          [Fill Out] [Dismiss]  │
│     "Dren Ashford signaled from the bridge"     │
│     Appears in: Ch.4, line 47                   │
│                                                 │
│  ⚔️ Windshear             [Fill Out] [Dismiss]  │
│     "executed a perfect Windshear turn"         │
│     Appears in: Ch.4, line 62                   │
│                                                 │
│  🌍 Ashenmoor             [Fill Out] [Dismiss]  │
│     "three days out of Ashenmoor"               │
│     Appears in: Ch.4, line 12                   │
│                                                 │
│  [Fill All with AI suggestions]                 │
└─────────────────────────────────────────────────┘
```

### "Fill Out" Flow

When you click Fill Out, the AI reads all mentions of that entity across your project and generates a suggested profile:

```
┌─────────────────────────────────────────────────┐
│  👤 DREN ASHFORD — Character Sheet              │
│                                                 │
│  AI Suggestion (edit freely):                   │
│                                                 │
│  Role: Bridge officer aboard the Ironvow        │
│  Species: Human                                 │
│  Rank: Lieutenant (signals)                     │
│  Description: [needs more context — only 1      │
│    mention so far]                              │
│  Relationships:                                 │
│    → serves under Captain Voss                  │
│    → works alongside Kael (same ship)           │
│                                                 │
│  Mentioned in:                                  │
│    • Ch.4 line 47: "Dren Ashford signaled..."   │
│                                                 │
│  [Save] [Edit More] [Merge with existing]       │
└─────────────────────────────────────────────────┘
```

## Import & Paste Handling

### Paste a Chapter

You paste 2000 words into the editor. Immediately:

1. Text is saved to the chapter
2. Text is indexed into OpenSearch (searchable within seconds)
3. Fast NER pass runs → entities queued
4. Toast notification: "Indexed. Found 5 new entities → [Review]"

### Import a File

```
/import ~/writing/old-draft-ch1.txt
```

Or drag-and-drop onto the UI. Same flow:
1. File copied to project corpus
2. Indexed into OpenSearch
3. Entity extraction (both passes)
4. Queue populated
5. "Imported old-draft-ch1.txt — 12 entities detected → [Review]"

### Bulk Import

```
/index ~/writing/worldbuilding-notes/
```

Scans entire directory. Progress bar. At the end:
"Indexed 47 files. Found 83 new entities → [Review All]"

You can review them one by one or hit "Fill All with AI" to get suggested profiles for everything, then batch-review.

## Consistency Checking

Once entities are in the knowledge base, the system can also **flag inconsistencies** as you write:

```
⚠️ You wrote "Kael's blue-scaled dragon" but Cinderfang is
   described as "obsidian-black with red underbelly" in the
   character sheet. [Ignore] [Fix] [Update sheet]
```

This is a later feature but the entity extraction makes it possible.

## CLI Equivalents

```bash
/import <file>              # Import and extract
/index <directory>          # Bulk import + extract
/scan                       # Re-scan current chapter for entities
/queue                      # Show extraction queue
/fill <entity_name>         # AI-generate a profile for an entity
/fill --all                 # AI-generate profiles for all queued
/entities                   # List all known entities
/entity <name>              # Show entity details
```

## Architecture Integration

```
                    ┌─────────────┐
  Write/Paste/Import → │ NER Pass 1  │ (local, fast, free)
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │ Dedup Check │ (against known entities)
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │ Queue (SQLite)│
                    └──────┬──────┘
                           ↓ (on user action or batch)
                    ┌─────────────┐
                    │ NER Pass 2  │ (Bedrock Nova Lite)
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │ AI Fill-Out │ (Bedrock, reads all mentions)
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │ Entity Store│ (SQLite knowledge base)
                    └─────────────┘
```
