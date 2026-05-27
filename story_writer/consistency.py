"""Consistency engine — checks for plot holes, fact contradictions, and stale story points."""

from __future__ import annotations

import json
import sqlite3
from dataclasses import dataclass


@dataclass
class Alert:
    severity: str  # "high", "medium", "low"
    alert_type: str
    message: str
    chapter_id: str = ""
    line_hint: str = ""


def check_entity_facts(conn: sqlite3.Connection, project_id: str, text: str) -> list[Alert]:
    """Check new text against known entity facts for contradictions."""
    alerts = []
    entities = conn.execute(
        "SELECT name, metadata FROM entities WHERE project_id = ? AND metadata != '{}'",
        (project_id,),
    ).fetchall()

    for entity in entities:
        name = entity["name"]
        if name.lower() not in text.lower():
            continue

        metadata = json.loads(entity["metadata"])
        facts = metadata.get("facts", {})

        # Check color contradictions
        for fact_key, fact_value in facts.items():
            if "color" in fact_key and fact_value:
                # Look for color mentions near the entity name
                import re
                pattern = rf"{re.escape(name)}.*?(\w+)[\s-](?:eye|hair|scale|skin)"
                matches = re.findall(pattern, text, re.IGNORECASE)
                for match in matches:
                    if match.lower() != fact_value.lower():
                        alerts.append(Alert(
                            severity="high",
                            alert_type="fact_contradiction",
                            message=f"{name}'s {fact_key} is '{fact_value}' but text says '{match}'",
                        ))

    return alerts


def check_stale_story_points(conn: sqlite3.Connection, project_id: str, current_chapter_order: int) -> list[Alert]:
    """Find story points that have been unresolved for too long."""
    alerts = []
    points = conn.execute(
        "SELECT sp.description, sp.planted_chapter, c.order_index FROM story_points sp "
        "JOIN chapters c ON sp.planted_chapter = c.chapter_id "
        "WHERE sp.project_id = ? AND sp.status = 'unresolved'",
        (project_id,),
    ).fetchall()

    for point in points:
        chapters_since = current_chapter_order - point["order_index"]
        if chapters_since >= 4:
            alerts.append(Alert(
                severity="medium",
                alert_type="forgotten_thread",
                message=f"Unresolved for {chapters_since} chapters: {point['description']}",
                chapter_id=point["planted_chapter"],
            ))

    return alerts


def run_audit(conn: sqlite3.Connection, project_id: str, text: str = "", current_chapter_order: int = 0) -> list[Alert]:
    """Run all consistency checks. Returns combined alerts."""
    alerts = []
    if text:
        alerts.extend(check_entity_facts(conn, project_id, text))
    alerts.extend(check_stale_story_points(conn, project_id, current_chapter_order))
    return alerts
