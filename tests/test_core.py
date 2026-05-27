"""Tests for models, styles, extraction, and consistency — no external services needed."""

import sqlite3
import tempfile
from pathlib import Path

import pytest

from story_writer.models import get_db, init_db
from story_writer.styles import BlendEntry, Style, blend_voice_prompts, load_style, list_styles
from story_writer.extraction import extract_entities_local, queue_new_entities
from story_writer.consistency import check_stale_story_points, Alert


# -- Models --

def test_init_db():
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    init_db(conn)
    tables = [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
    assert "projects" in tables
    assert "chapters" in tables
    assert "entities" in tables
    assert "story_points" in tables
    assert "extraction_queue" in tables


# -- Styles --

def test_list_voice_styles():
    styles = list_styles("voice")
    assert len(styles) > 0
    names = [s.id for s in styles]
    assert "tom-clancy" in names
    assert "jrr-tolkien" in names


def test_blend_voice_prompts():
    s1 = Style(id="a", name="A", type="voice", system_prompt="Be concise.", avoid="No fluff.")
    s2 = Style(id="b", name="B", type="voice", system_prompt="Be poetic.", avoid="No jargon.")
    result = blend_voice_prompts([BlendEntry(s1, 0.6), BlendEntry(s2, 0.4)])
    assert "Be concise" in result
    assert "Be poetic" in result
    assert "No fluff" in result
    assert "No jargon" in result


# -- Extraction --

def test_extract_entities_local():
    text = "Captain Voss signaled from the bridge. Kael executed a perfect Windshear turn over the port of Ashenmoor."
    entities = extract_entities_local(text)
    names = [e["name"] for e in entities]
    assert any("Voss" in n for n in names)


def test_queue_new_entities():
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    init_db(conn)
    conn.execute("INSERT INTO projects (project_id, name) VALUES ('p1', 'test')")
    conn.execute("INSERT INTO chapters (chapter_id, project_id, title) VALUES ('c1', 'p1', 'Ch1')")
    conn.commit()

    text = "Commander Dren Ashford stood on the bridge of the Ironvow."
    count = queue_new_entities(conn, "p1", "c1", text)
    assert count > 0

    # Running again should not re-queue
    count2 = queue_new_entities(conn, "p1", "c1", text)
    assert count2 == 0


# -- Consistency --

def test_stale_story_points():
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    init_db(conn)
    conn.execute("INSERT INTO projects (project_id, name) VALUES ('p1', 'test')")
    conn.execute("INSERT INTO chapters (chapter_id, project_id, title, order_index) VALUES ('c1', 'p1', 'Ch1', 1)")
    conn.execute(
        "INSERT INTO story_points (point_id, project_id, description, planted_chapter, status) VALUES ('sp1', 'p1', 'Strange rune', 'c1', 'unresolved')"
    )
    conn.commit()

    # At chapter 3, not stale yet
    alerts = check_stale_story_points(conn, "p1", 3)
    assert len(alerts) == 0

    # At chapter 6, stale
    alerts = check_stale_story_points(conn, "p1", 6)
    assert len(alerts) == 1
    assert "Strange rune" in alerts[0].message
