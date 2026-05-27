"""Session manager — project state, chapter tracking, immersion briefings."""

from __future__ import annotations

import json
import os
import sqlite3
import uuid

from .models import get_db, init_db


class Session:
    """Manages project state and provides immersion features."""

    def __init__(self, db_path: str = "story_writer.db"):
        self.conn = get_db(db_path)
        init_db(self.conn)
        self.project_id: str | None = None
        self.chapter_id: str | None = None

    def create_project(self, name: str, genre: str = "") -> str:
        project_id = uuid.uuid4().hex[:16]
        self.conn.execute(
            "INSERT INTO projects (project_id, name, genre) VALUES (?, ?, ?)",
            (project_id, name, genre),
        )
        self.conn.execute(
            "INSERT INTO session_state (project_id) VALUES (?)", (project_id,)
        )
        self.conn.commit()
        self.project_id = project_id
        return project_id

    def open_project(self, name: str) -> dict | None:
        row = self.conn.execute("SELECT * FROM projects WHERE name = ?", (name,)).fetchone()
        if not row:
            return None
        self.project_id = row["project_id"]
        state = self.conn.execute(
            "SELECT * FROM session_state WHERE project_id = ?", (self.project_id,)
        ).fetchone()
        if state and state["current_chapter"]:
            self.chapter_id = state["current_chapter"]
        return dict(row)

    def get_briefing(self) -> dict:
        """Generate the immersion briefing for the current project."""
        if not self.project_id:
            return {}

        state = self.conn.execute(
            "SELECT * FROM session_state WHERE project_id = ?", (self.project_id,)
        ).fetchone()

        chapter = None
        if self.chapter_id:
            chapter = self.conn.execute(
                "SELECT * FROM chapters WHERE chapter_id = ?", (self.chapter_id,)
            ).fetchone()

        # Get next beats from outline
        outline = chapter["outline"] if chapter else ""
        next_beats = [line.strip("- •") for line in outline.split("\n") if line.strip()] if outline else []

        return {
            "project_name": self.conn.execute(
                "SELECT name FROM projects WHERE project_id = ?", (self.project_id,)
            ).fetchone()["name"],
            "chapter_title": chapter["title"] if chapter else None,
            "last_line": state["last_line"] if state else "",
            "next_beats": next_beats[:5],
            "notes": json.loads(state["notes"]) if state and state["notes"] else [],
        }

    def save_state(self, last_line: str = "", cursor_position: int = 0) -> None:
        """Save current session state."""
        if not self.project_id:
            return
        self.conn.execute(
            "UPDATE session_state SET current_chapter = ?, cursor_position = ?, last_line = ?, updated_at = CURRENT_TIMESTAMP WHERE project_id = ?",
            (self.chapter_id, cursor_position, last_line, self.project_id),
        )
        self.conn.commit()

    def add_note(self, note: str) -> None:
        """Add a session note."""
        if not self.project_id:
            return
        state = self.conn.execute(
            "SELECT notes FROM session_state WHERE project_id = ?", (self.project_id,)
        ).fetchone()
        notes = json.loads(state["notes"]) if state and state["notes"] else []
        notes.append(note)
        self.conn.execute(
            "UPDATE session_state SET notes = ? WHERE project_id = ?",
            (json.dumps(notes), self.project_id),
        )
        self.conn.commit()
