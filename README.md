# Story Writer

An AI creative writing studio. Blend author voices (Tolkien, Clancy, King, Rowling) with weight sliders. Generate scene art in any visual style. Search your entire corpus instantly. Auto-detects characters, abilities, and events as you write. Tracks plot points to prevent holes. Immerses you in your world each session via briefings and context recall.

## Quick Start

```bash
# Install backend (from project root)
pip install -e ".[dev]"

# Install frontend
cd frontend && npm install && cd ..

# Start backend API (terminal 1)
uvicorn story_writer.api:app --reload --host 0.0.0.0 --port 8000

# Start frontend dev server (terminal 2)
cd frontend && npm run dev
```

Open **http://localhost:5173** in your browser (not port 8000).

The backend API is available at `http://localhost:8000` (e.g. `/health`, `/api/projects`).

```bash
# Other commands
story-writer index ~/writing/worldbuilding/   # Index your corpus
story-writer cli                               # CLI mode
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [UI Design](docs/UI_DESIGN.md)
- [Styles & Blending](docs/STYLES.md)
- [Image Synthesis](docs/IMAGE_SYNTHESIS.md)
- [Immersion System](docs/IMMERSION.md)
- [Live Extraction](docs/LIVE_EXTRACTION.md)
- [Consistency Engine](docs/CONSISTENCY_ENGINE.md)
