# Story Writer - Architecture

## Overview

A writing tool that combines AI text generation, image generation, and fast cross-document reference search. Designed for authors working with large corpuses of reference material (world-building notes, character sheets, research docs — mostly `.txt` files) who need to quickly pull relevant context into their creative workflow.

## Core Capabilities

1. **Text Generation** — Prose generation via Bedrock Converse API with style enforcement, streaming output, and RAG-grounded context from the corpus
2. **Image Generation** — Scene illustrations via Bedrock Image models (Stability SDXL / Titan Image), driven by narrative context
3. **Cross-Document Reference** — OpenSearch BM25 index over the entire corpus, enabling instant search across thousands of txt files with highlighted snippets and source attribution

## Architecture Decisions

### What we reuse from `document_search`

| Component | Reuse Pattern |
|-----------|--------------|
| OpenSearch indexing/search | Same BM25 multi_match pattern, English analyzer, chunk-based indexing |
| Bedrock Converse client | Same model-agnostic wrapper, token tracking, cost estimation |
| PlantUML renderer | Same JAR-based rendering for story structure diagrams |
| Chunking strategy | Adapted — txt files chunked by paragraph/section rather than PDF pages |

### What's new

| Component | Purpose |
|-----------|---------|
| Corpus Indexer | Scans directories of .txt files, chunks by paragraph, indexes into OpenSearch |
| Context Assembler | Pulls relevant passages + character sheets + outline into a context window for generation |
| Style Enforcer | System prompts that maintain consistent voice/tone across chapters |
| Session Manager | SQLite-backed project state: chapters, progress, generation history |
| CLI/TUI | Rich/Textual-based interactive interface (web UI is a future option) |

### Storage

- **SQLite** for project metadata, chapters, characters, generation logs (lightweight, no server needed)
- **OpenSearch** for full-text search over corpus (same Docker instance pattern as document_search)
- **Filesystem** for corpus txt files, generated images, chapter drafts

### Why not Postgres?

Story Writer is a single-user creative tool. SQLite gives us zero-config persistence, easy project portability (copy the `.db` file), and no Docker dependency for basic usage. OpenSearch is the only service dependency, and only when you need cross-corpus search.

## Interface Design

### CLI Commands (interactive mode)

```
/new <project_name>     — Create a new story project
/open <project_name>    — Open existing project
/chapter <title>        — Create/switch to chapter
/index <path>           — Index a directory of txt files into corpus
/ref <query>            — Search corpus, show ranked snippets
/gen <instruction>      — Generate prose from instruction + context
/img <scene_desc>       — Generate an illustration for a scene
/outline                — Show/edit chapter outline
/chars                  — List/edit characters
/status                 — Show project stats, token usage, costs
/export                 — Export chapter/project to docx/pdf/md
```

### Generation Flow

```
Author writes instruction
  → Context Assembler gathers: current chapter outline + relevant corpus passages + character info
  → Prompt Orchestrator builds: system prompt (style) + user message (context + instruction)
  → Bedrock generates prose
  → Author reviews, edits, accepts
  → Session saves progress
```

## Diagrams

See `docs/diagrams/` for PlantUML sources. Render with:

```bash
make diagrams
```

- `architecture.puml` — System-level component diagram
- `data_flow.puml` — Generation workflow (activity diagram)
- `data_model.puml` — SQLite schema (ER diagram)
- `components.puml` — Module interactions showing reuse from document_search

## Project Structure

```
story-writer/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── STYLES.md           # Style & mode system documentation
│   ├── IMMERSION.md        # Writer immersion / warm-up flows
│   ├── IMAGE_SYNTHESIS.md  # Scene-to-image pipeline
│   ├── UI_DESIGN.md        # Web UI design spec
│   └── diagrams/           # PlantUML sources + rendered PNGs
├── frontend/               # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/     # Dashboard, Briefing, Editor, Panels
│   │   ├── stores/         # Zustand state management
│   │   ├── hooks/          # Streaming, search, image gen
│   │   └── styles/         # Tailwind theme
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
├── story_writer/           # Python backend + CLI
│   ├── __init__.py
│   ├── api.py              # FastAPI routes (serves frontend + API)
│   ├── cli.py              # TUI/CLI interface (alternative to web)
│   ├── session.py          # Project & chapter state management
│   ├── corpus_indexer.py   # Scan, chunk, index txt files
│   ├── retriever.py        # Search corpus via OpenSearch
│   ├── text_gen.py         # Bedrock prose generation
│   ├── image_synth.py      # Scene-to-image synthesis pipeline
│   ├── context.py          # Context assembly for prompts
│   ├── styles.py           # Style registry & prompt injection
│   ├── models.py           # SQLite schema / dataclasses
│   └── plantuml.py         # Diagram rendering
├── styles/
│   ├── voice/              # Built-in voice styles (YAML)
│   ├── image/              # Built-in image styles (YAML)
│   ├── modes/              # Composite presets
│   └── custom/             # User-defined styles
├── projects/               # User story projects
├── tests/
├── Makefile
├── pyproject.toml
└── README.md
```

## Dependencies

- **Python 3.12+**
- **boto3** — Bedrock API access
- **opensearch-py** — Corpus indexing and search
- **rich** or **textual** — TUI interface
- **Pillow** — Image handling
- **PlantUML JAR** — Diagram rendering (optional)

## Next Steps

1. Set up `pyproject.toml` with dependencies
2. Implement `models.py` (SQLite schema) and `session.py`
3. Port OpenSearch indexing pattern → `corpus_indexer.py`
4. Build `retriever.py` and `context.py`
5. Wire up `text_gen.py` with Bedrock
6. Build CLI with basic `/ref`, `/gen`, `/index` commands
7. Add image generation
8. Add export capabilities
