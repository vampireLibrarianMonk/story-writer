"""CLI entry point — interactive writing interface."""

from __future__ import annotations

import click
from rich.console import Console
from rich.panel import Panel

from .session import Session

console = Console()


@click.group()
def main():
    """Story Writer — An AI creative writing studio."""
    pass


@main.command()
@click.argument("name")
@click.option("--genre", default="", help="Genre for the project")
def new(name: str, genre: str):
    """Create a new story project."""
    s = Session()
    project_id = s.create_project(name, genre)
    console.print(f"[green]✓[/green] Created project '{name}' ({project_id})")


@main.command()
@click.argument("name")
def open(name: str):
    """Open an existing project and show the briefing."""
    s = Session()
    project = s.open_project(name)
    if not project:
        console.print(f"[red]Project '{name}' not found.[/red]")
        return

    briefing = s.get_briefing()
    _display_briefing(briefing)


@main.command()
@click.argument("path", type=click.Path(exists=True))
@click.option("--project", required=True, help="Project name to index into")
@click.option("--category", default="general", help="Category for indexed content")
def index(path: str, project: str, category: str):
    """Index a directory of txt files into the corpus."""
    from pathlib import Path

    from .corpus_indexer import ensure_index, get_client, index_directory

    client = get_client()
    ensure_index(client)
    stats = index_directory(client, project, Path(path), category)
    console.print(f"[green]✓[/green] Indexed {stats['files']} files ({stats['chunks']} chunks) as '{category}'")


@main.command()
@click.argument("query")
@click.option("--project", default=None, help="Limit search to a project")
def ref(query: str, project: str | None):
    """Search the corpus for reference material."""
    from .retriever import search_corpus

    results = search_corpus(query, project_id=project)
    if not results["results"]:
        console.print("[dim]No results found.[/dim]")
        return

    for r in results["results"]:
        console.print(Panel(r["snippet"], title=f"[cyan]{r['title']}[/cyan] ({r['score']})", border_style="dim"))


@main.command()
def styles():
    """List available styles."""
    from .styles import list_styles

    for style_type in ("voice", "image"):
        console.print(f"\n[bold]{style_type.upper()} STYLES[/bold]")
        for s in list_styles(style_type):
            console.print(f"  [cyan]{s.id}[/cyan] — {s.description}")


@main.command(name="index-project")
@click.argument("project_path", type=click.Path(exists=True))
def index_project(project_path: str):
    """Index an entire project directory (characters/, chapters/, world-building/)."""
    from pathlib import Path

    from .corpus_indexer import ensure_index, get_client, index_directory, index_file

    proj = Path(project_path)
    project_name = proj.name
    client = get_client()
    ensure_index(client)

    total_files = 0
    total_chunks = 0

    for subdir in ("characters", "chapters", "world-building"):
        path = proj / subdir
        if path.exists():
            stats = index_directory(client, project_name, path, category=subdir)
            total_files += stats["files"]
            total_chunks += stats["chunks"]
            console.print(f"  [dim]{subdir}/[/dim] — {stats['files']} files, {stats['chunks']} chunks")

    # Root-level txt/md
    for f in list(proj.glob("*.txt")) + list(proj.glob("*.md")):
        total_chunks += index_file(client, project_name, f, category="general")
        total_files += 1

    console.print(f"\n[green]✓[/green] Indexed [bold]{project_name}[/bold]: {total_files} files, {total_chunks} chunks")


@main.command()
def serve():
    """Launch the web UI."""
    import uvicorn

    console.print("[green]Starting Story Writer on http://localhost:8000[/green]")
    uvicorn.run("story_writer.api:app", host="0.0.0.0", port=8000, reload=True)


def _display_briefing(briefing: dict):
    """Render the immersion briefing to the terminal."""
    lines = []
    if briefing.get("chapter_title"):
        lines.append(f"[bold]Chapter:[/bold] {briefing['chapter_title']}")
    if briefing.get("last_line"):
        lines.append(f"\n[dim]Last line:[/dim]\n\"{briefing['last_line']}\"")
    if briefing.get("next_beats"):
        lines.append("\n[bold]Next beats:[/bold]")
        for beat in briefing["next_beats"]:
            lines.append(f"  • {beat}")
    if briefing.get("notes"):
        lines.append("\n[bold]Notes:[/bold]")
        for note in briefing["notes"]:
            lines.append(f"  📝 {note}")

    console.print(Panel(
        "\n".join(lines),
        title=f"[bold magenta]⚓ {briefing.get('project_name', 'Story Writer')}[/bold magenta]",
        border_style="magenta",
    ))


if __name__ == "__main__":
    main()
