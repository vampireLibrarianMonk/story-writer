"""FastAPI backend — serves the web UI and exposes the API."""

from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .session import Session

PROJECTS_DIR = Path(os.getenv("PROJECTS_DIR", Path(__file__).parent.parent / "projects"))

app = FastAPI(title="Story Writer API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -- Health --

@app.get("/health")
def health():
    return {"status": "ok"}


# -- Projects --

@app.get("/api/projects")
def list_projects():
    """List projects from the projects/ directory."""
    if not PROJECTS_DIR.exists():
        return []
    return [
        {"name": d.name, "path": str(d)}
        for d in sorted(PROJECTS_DIR.iterdir())
        if d.is_dir()
    ]


@app.post("/api/projects")
def create_project(body: dict):
    s = Session()
    project_id = s.create_project(body["name"], body.get("genre", ""))
    # Create project directory
    proj_dir = PROJECTS_DIR / body["name"].lower().replace(" ", "-")
    for sub in ("characters", "chapters", "world-building", "images"):
        (proj_dir / sub).mkdir(parents=True, exist_ok=True)
    return {"project_id": project_id, "path": str(proj_dir)}


# -- Index corpus --

@app.post("/api/projects/{project_name}/index")
def index_project(project_name: str):
    """Index all txt files in a project into OpenSearch."""
    from .corpus_indexer import ensure_index, get_client, index_directory

    proj_dir = PROJECTS_DIR / project_name
    if not proj_dir.exists():
        return {"error": "Project not found"}

    client = get_client()
    ensure_index(client)

    total_files = 0
    total_chunks = 0
    for subdir in ("characters", "chapters", "world-building"):
        path = proj_dir / subdir
        if path.exists():
            stats = index_directory(client, project_name, path, category=subdir)
            total_files += stats["files"]
            total_chunks += stats["chunks"]

    # Also index root-level txt/md files
    for f in proj_dir.glob("*.txt"):
        from .corpus_indexer import index_file
        total_chunks += index_file(client, project_name, f, category="general")
        total_files += 1
    for f in proj_dir.glob("*.md"):
        from .corpus_indexer import index_file
        total_chunks += index_file(client, project_name, f, category="general")
        total_files += 1

    return {"files": total_files, "chunks": total_chunks}


# -- Search --

@app.get("/api/search")
def search(q: str, project_id: str | None = None):
    from .retriever import search_corpus
    return search_corpus(q, project_id=project_id)


# -- Characters --

@app.get("/api/projects/{project_name}/characters")
def list_characters(project_name: str):
    """List character profile files for a project."""
    char_dir = PROJECTS_DIR / project_name / "characters"
    if not char_dir.exists():
        return []
    return [
        {"name": f.stem.replace("_Character_Profile", "").replace("_", " "), "file": f.name}
        for f in sorted(char_dir.glob("*.txt"))
    ]


@app.get("/api/projects/{project_name}/characters/{filename}")
def get_character(project_name: str, filename: str):
    """Read a character profile file."""
    path = PROJECTS_DIR / project_name / "characters" / filename
    if not path.exists():
        return {"error": "Not found"}
    return {"name": filename, "content": path.read_text(encoding="utf-8", errors="replace")}


@app.get("/api/projects/{project_name}/characters-parsed")
def get_parsed_characters(project_name: str):
    """Return pre-parsed character data if available."""
    import json as _json
    parsed_path = PROJECTS_DIR / project_name / ".characters-parsed.json"
    if parsed_path.exists():
        return _json.loads(parsed_path.read_text())
    return []


# -- Chapters --

@app.get("/api/projects/{project_name}/chapters")
def list_chapters(project_name: str):
    """List chapter files for a project."""
    ch_dir = PROJECTS_DIR / project_name / "chapters"
    if not ch_dir.exists():
        return []
    return [
        {"title": f.stem, "file": f.name}
        for f in sorted(ch_dir.iterdir())
        if f.is_file()
    ]


@app.get("/api/projects/{project_name}/chapters/{filename:path}")
def get_chapter(project_name: str, filename: str):
    """Read a chapter file."""
    path = PROJECTS_DIR / project_name / "chapters" / filename
    if not path.exists():
        return {"error": "Not found"}
    return {"title": path.stem, "content": path.read_text(encoding="utf-8", errors="replace")}


# -- Styles --

@app.get("/api/styles/{style_type}")
def get_styles(style_type: str):
    from .styles import list_styles
    styles = list_styles(style_type)
    return [{"id": s.id, "name": s.name, "description": s.description} for s in styles]


# -- Briefing --

@app.get("/api/projects/{project_name}/briefing")
def get_briefing(project_name: str):
    s = Session()
    s.open_project(project_name)
    return s.get_briefing()


# -- Serve frontend static build --
FRONTEND_DIST = Path(__file__).parent.parent / "frontend" / "dist"

if FRONTEND_DIST.exists():
    @app.get("/")
    def serve_root():
        return FileResponse(FRONTEND_DIST / "index.html")

    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST)), name="static")
