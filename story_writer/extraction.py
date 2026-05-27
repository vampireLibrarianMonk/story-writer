"""Live entity extraction — detects characters, abilities, locations, events from text."""

from __future__ import annotations

import re
import sqlite3
import uuid


# Pass 1: Fast local NER via regex heuristics
_PATTERNS = {
    "character": [
        re.compile(r"\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)\b"),  # Multi-word proper nouns
        re.compile(r"(?:Captain|Lord|Lady|Sir|Commander|Officer|Pilot)\s+([A-Z][a-z]+)"),
    ],
    "location": [
        re.compile(r"(?:the\s+(?:port|city|island|fortress|bay|harbor|tower)\s+of\s+)([A-Z][a-z]+)"),
        re.compile(r"(?:in|at|from|to)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)"),
    ],
    "ability": [
        re.compile(r"(?:the\s+)([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s+(?:technique|maneuver|spell|ability|ritual)"),
        re.compile(r"(?:performed|executed|cast|used)\s+(?:a\s+)?([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)"),
    ],
}

# Common words to skip
_SKIP = {"The", "This", "That", "They", "Then", "There", "Their", "When", "What", "Where", "Which", "After", "Before"}


def extract_entities_local(text: str) -> list[dict]:
    """Fast local extraction — regex + heuristics. No API calls."""
    found = []
    seen_names = set()

    for entity_type, patterns in _PATTERNS.items():
        for pattern in patterns:
            for match in pattern.finditer(text):
                name = match.group(1) if match.lastindex else match.group(0)
                name = name.strip()
                if name in _SKIP or name in seen_names or len(name) < 3:
                    continue
                seen_names.add(name)

                # Get surrounding context
                start = max(0, match.start() - 40)
                end = min(len(text), match.end() + 40)
                snippet = text[start:end].strip()

                found.append({"name": name, "entity_type": entity_type, "snippet": snippet})

    return found


def queue_new_entities(conn: sqlite3.Connection, project_id: str, chapter_id: str, text: str) -> int:
    """Extract entities from text and queue any that are new. Returns count of new entities queued."""
    candidates = extract_entities_local(text)

    # Get existing entity names for this project
    existing = {
        row[0].lower()
        for row in conn.execute("SELECT name FROM entities WHERE project_id = ?", (project_id,)).fetchall()
    }
    # Also check already-queued names
    queued = {
        row[0].lower()
        for row in conn.execute(
            "SELECT name FROM extraction_queue WHERE project_id = ? AND status = 'pending'", (project_id,)
        ).fetchall()
    }

    new_count = 0
    for candidate in candidates:
        if candidate["name"].lower() in existing or candidate["name"].lower() in queued:
            continue
        conn.execute(
            "INSERT INTO extraction_queue (queue_id, project_id, name, entity_type, source_snippet, source_chapter) VALUES (?, ?, ?, ?, ?, ?)",
            (uuid.uuid4().hex[:16], project_id, candidate["name"], candidate["entity_type"], candidate["snippet"], chapter_id),
        )
        new_count += 1

    conn.commit()
    return new_count
