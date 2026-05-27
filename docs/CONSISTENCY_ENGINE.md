# Plot Hole Detection & Consistency Engine

## Concept

Every entity in your world has **rules** — constraints that must hold true. Characters have traits, abilities have limitations, events have consequences, and story points have states (set up → paid off, or unresolved). The consistency engine tracks all of these and alerts you when something contradicts established canon.

## What Gets Tracked

### Abilities & Magic System

Each ability gets a rule card:

```yaml
name: Windshear
type: ability
users: [Kael, Wind Runners]
rules:
  - "Requires open sky — cannot be used indoors or underground"
  - "Exhausts the user for ~10 minutes after use"
  - "Only Wind Runners and trained sky jockeys can perform it"
  - "Ineffective in dead-calm conditions (needs existing wind)"
constraints:
  - cannot_use_in: [indoors, underground, caves]
  - cooldown: "10 minutes"
  - requires: [wind, open_sky]
  - limited_to: [wind_runners, sky_jockeys]
```

If you later write "Kael used Windshear inside the carrier's hold" → **alert**.

### Character Facts

```yaml
name: Kael Stormrider
facts:
  - species: human
  - eye_color: gray
  - dragon: Cinderfang (Razor Wing, obsidian-black, red underbelly)
  - rank: junior sky jockey
  - injury: broken left wrist (Ch.3) — healed by Ch.6
  - cannot: swim (established Ch.1)
  - mentor: Captain Voss
```

If you write "Kael dove into the harbor and swam to shore" → **alert** (established he can't swim).
If you write "Kael's green eyes narrowed" → **alert** (eyes are gray).

### Story Points (Chekhov's Gun Tracker)

Every setup needs a payoff. Every promise to the reader needs fulfillment.

```yaml
story_points:
  - id: sp_001
    type: setup
    description: "Kael notices a strange rune on Cinderfang's saddle"
    planted_in: Ch.2, line 84
    status: unresolved        # → needs payoff
    expected_payoff: "by Ch.8"

  - id: sp_002
    type: foreshadowing
    description: "Captain Voss mentions 'the last time we lost a carrier'"
    planted_in: Ch.1, line 200
    status: unresolved
    expected_payoff: "reveal what happened"

  - id: sp_003
    type: promise
    description: "Kael vows to prove himself to the squadron"
    planted_in: Ch.1, line 45
    status: partially_resolved  # he launched, but hasn't proven himself yet
    resolution_notes: "Launch in Ch.4 is a step, but needs full payoff"
```

## Alert Types

| Alert | Severity | Example |
|-------|----------|---------|
| **Fact contradiction** | 🔴 High | "blue eyes" when established as gray |
| **Ability rule violation** | 🔴 High | Using Windshear underground |
| **Dead character acting** | 🔴 High | Character killed in Ch.3 appears in Ch.5 |
| **Timeline break** | 🟡 Medium | Event B happens before Event A, but B depends on A |
| **Unresolved setup** | 🟡 Medium | Chekhov's gun planted 4 chapters ago, no payoff yet |
| **Character location conflict** | 🟡 Medium | Character is on two ships at once |
| **Tone inconsistency** | 🟢 Low | Character who never swears suddenly cursing |
| **Forgotten thread** | 🟢 Low | Subplot hasn't been mentioned in 3+ chapters |

## How Detection Works

### Real-Time (As You Write)

Lightweight checks on every paragraph:

1. **Named entity scan** — extract who/what/where from the new text
2. **Fact lookup** — check extracted facts against entity knowledge base
3. **Rule evaluation** — if an ability is used, check its constraints
4. **Location tracking** — where is each character right now?

If a contradiction is found → subtle inline alert (doesn't break flow):

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Kael's blue eyes scanned the horizon as Cinderfang             │
│  ~~~~~~~~~~~                                                    │
│  ⚠️ Kael's eyes are gray (established Ch.1, line 23)            │
│     [Fix] [Update canon] [Ignore]                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### End-of-Session Sweep

Deeper analysis when you stop writing:

1. **Full chapter scan** against all known rules
2. **Story point status update** — did anything get resolved?
3. **Timeline validation** — events in chronological order?
4. **Unresolved thread check** — anything dangling too long?

### On-Demand Audit

```
/audit                    # Full project consistency check
/audit chapter            # Current chapter only
/audit character Kael     # All facts about Kael
/audit abilities          # All ability rule checks
/audit plotpoints         # Story point status report
```

## Story Point Lifecycle

```
PLANTED → REINFORCED → PAYOFF
   ↓          ↓           ↓
 (setup)  (reminded)  (resolved)

If stuck at PLANTED for too long → "Forgotten thread" alert
If jumped to PAYOFF without setup → "Unearned payoff" alert
```

### Auto-Detection of Story Points

When you write something that *feels* like a setup, the system asks:

```
💡 This looks like a setup/foreshadowing:
   "The old dwarf touched the crack in the keel and said nothing."

   Track as story point? [Yes — needs payoff] [No — just flavor]
```

If you say yes, it enters the tracker. The system will remind you if it goes unresolved.

## UI: Consistency Panel

A dedicated panel (or tab in the right sidebar):

```
┌─────────────────────────────────────────────────┐
│  🛡️ CONSISTENCY                                  │
│                                                 │
│  ─── ACTIVE ALERTS (2) ───                      │
│                                                 │
│  🔴 Ch.4 line 67: Kael uses Windshear below     │
│     deck — ability requires open sky             │
│     [Jump to] [Fix] [Update rule]               │
│                                                 │
│  🟡 Ch.4: Dren is on the bridge AND in the      │
│     dragon roost in the same scene               │
│     [Jump to] [Fix]                             │
│                                                 │
│  ─── STORY POINTS (5 open) ───                  │
│                                                 │
│  ⏳ Strange rune on saddle (Ch.2) — unresolved  │
│  ⏳ "Last time we lost a carrier" (Ch.1)        │
│  ✓  Kael's first launch (Ch.4) — resolved      │
│  ⏳ Voss's secret orders (Ch.3)                 │
│  ⏳ The cracked keel (Ch.4) — just planted      │
│                                                 │
│  ─── FORGOTTEN THREADS ───                      │
│                                                 │
│  💤 Kael's rivalry with Soren — last mentioned  │
│     Ch.2, now in Ch.4 with no reference         │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Rule Sources

Rules come from three places:

1. **Extracted from writing** — AI reads your text and infers rules ("Windshear was used outdoors in every instance → likely requires open sky")
2. **Explicit from author** — You define rules directly in entity sheets
3. **Inferred from world bible** — The world bible states constraints that apply globally

## Architecture

```
Writing / Import
    ↓
[Entity Extraction] (existing system)
    ↓
[Fact Extraction] — pulls specific claims about entities
    ↓
[Rule Engine] — evaluates facts against known constraints
    ↓
[Alert Queue] — non-blocking notifications
    ↓
[Story Point Tracker] — lifecycle management
    ↓
[Audit Report] — on-demand full scan
```

The rule engine is simple pattern matching against structured data — not expensive AI calls for every sentence. The AI is only used for:
- Initial rule inference from text (one-time per entity)
- Deep audit scans (on-demand)
- Ambiguous cases where heuristics aren't sure

## CLI Commands

```bash
/audit                      # Full consistency check
/audit chapter              # Current chapter
/plotpoints                 # Show all story points + status
/plotpoint add "description" # Manually add a story point
/plotpoint resolve sp_001   # Mark as resolved
/rules Windshear            # Show rules for an ability
/rules add Windshear "cannot use in rain"  # Add a rule
/timeline                   # Show event timeline
/whereami Kael              # Where is this character right now?
```
