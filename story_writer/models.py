"""SQLite models and schema for story projects."""

from __future__ import annotations

import sqlite3
from dataclasses import dataclass, field
from pathlib import Path


def get_db(db_path: str = "story_writer.db") -> sqlite3.Connection:
    """Get a connection to the project database."""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db(conn: sqlite3.Connection) -> None:
    """Create all tables if they don't exist."""
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS projects (
            project_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            genre TEXT DEFAULT '',
            style_config TEXT DEFAULT '{}',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS chapters (
            chapter_id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL REFERENCES projects(project_id),
            title TEXT NOT NULL,
            order_index INTEGER DEFAULT 0,
            outline TEXT DEFAULT '',
            content TEXT DEFAULT '',
            style_config TEXT DEFAULT '{}',
            status TEXT DEFAULT 'draft',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS corpus_files (
            file_id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL REFERENCES projects(project_id),
            path TEXT NOT NULL,
            title TEXT DEFAULT '',
            category TEXT DEFAULT 'general',
            indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS entities (
            entity_id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL REFERENCES projects(project_id),
            name TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            description TEXT DEFAULT '',
            metadata TEXT DEFAULT '{}',
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS entity_mentions (
            mention_id TEXT PRIMARY KEY,
            entity_id TEXT NOT NULL REFERENCES entities(entity_id),
            chapter_id TEXT NOT NULL REFERENCES chapters(chapter_id),
            line_number INTEGER DEFAULT 0,
            context_snippet TEXT DEFAULT '',
            detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS extraction_queue (
            queue_id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL REFERENCES projects(project_id),
            name TEXT NOT NULL,
            entity_type TEXT DEFAULT 'unknown',
            source_snippet TEXT DEFAULT '',
            source_chapter TEXT DEFAULT '',
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS story_points (
            point_id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL REFERENCES projects(project_id),
            description TEXT NOT NULL,
            point_type TEXT DEFAULT 'setup',
            planted_chapter TEXT DEFAULT '',
            planted_line INTEGER DEFAULT 0,
            status TEXT DEFAULT 'unresolved',
            resolution_notes TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS images (
            image_id TEXT PRIMARY KEY,
            chapter_id TEXT NOT NULL REFERENCES chapters(chapter_id),
            prompt_used TEXT DEFAULT '',
            style_config TEXT DEFAULT '{}',
            file_path TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS generation_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id TEXT NOT NULL REFERENCES projects(project_id),
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            model_id TEXT DEFAULT '',
            operation TEXT DEFAULT '',
            input_tokens INTEGER DEFAULT 0,
            output_tokens INTEGER DEFAULT 0,
            cost_usd REAL DEFAULT 0.0,
            chapter_id TEXT DEFAULT ''
        );

        CREATE TABLE IF NOT EXISTS session_state (
            project_id TEXT PRIMARY KEY REFERENCES projects(project_id),
            current_chapter TEXT DEFAULT '',
            cursor_position INTEGER DEFAULT 0,
            last_line TEXT DEFAULT '',
            notes TEXT DEFAULT '[]',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
