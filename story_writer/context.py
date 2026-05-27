"""Context assembler — gathers relevant material for generation prompts."""

from __future__ import annotations

import sqlite3

from .retriever import search_corpus


def assemble_context(
    conn: sqlite3.Connection,
    project_id: str,
    chapter_id: str,
    query: str | None = None,
    max_corpus_results: int = 5,
) -> str:
    """Build a context string from outline, characters, and corpus search."""
    parts = []

    # Current chapter outline
    row = conn.execute("SELECT outline, content FROM chapters WHERE chapter_id = ?", (chapter_id,)).fetchone()
    if row and row["outline"]:
        parts.append(f"Chapter Outline:\n{row['outline']}")

    # Relevant characters
    characters = conn.execute(
        "SELECT name, description, metadata FROM entities WHERE project_id = ? AND entity_type = 'character'",
        (project_id,),
    ).fetchall()
    if characters:
        char_lines = [f"- {c['name']}: {c['description']}" for c in characters]
        parts.append(f"Characters:\n" + "\n".join(char_lines))

    # Corpus search (if query provided or use outline as query)
    search_query = query or (row["outline"][:200] if row and row["outline"] else None)
    if search_query:
        results = search_corpus(search_query, project_id=project_id, page_size=max_corpus_results)
        if results["results"]:
            snippets = [f"[{r['title']}]: {r['snippet']}" for r in results["results"]]
            parts.append(f"Relevant Reference Material:\n" + "\n\n".join(snippets))

    return "\n\n---\n\n".join(parts)
