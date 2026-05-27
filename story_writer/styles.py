"""Style registry — loads, blends, and applies voice/image styles."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import yaml

STYLES_DIR = Path(__file__).parent.parent / "styles"


@dataclass
class Style:
    id: str
    name: str
    type: str  # "voice" or "image"
    description: str = ""
    system_prompt: str = ""
    avoid: str = ""
    positive_prompt: str = ""
    negative_prompt: str = ""
    parameters: dict = field(default_factory=dict)
    intensity_default: float = 0.7


@dataclass
class BlendEntry:
    style: Style
    weight: float


def load_style(style_type: str, style_id: str) -> Style:
    """Load a style YAML from the styles directory."""
    path = STYLES_DIR / style_type / f"{style_id}.yaml"
    if not path.exists():
        raise FileNotFoundError(f"Style not found: {path}")
    with open(path) as f:
        data = yaml.safe_load(f)
    return Style(**{k: v for k, v in data.items() if k != "type"}, type=style_type)


def list_styles(style_type: str) -> list[Style]:
    """List all available styles of a given type."""
    style_dir = STYLES_DIR / style_type
    if not style_dir.exists():
        return []
    styles = []
    for path in sorted(style_dir.glob("*.yaml")):
        with open(path) as f:
            data = yaml.safe_load(f)
        styles.append(Style(**{k: v for k, v in data.items() if k != "type"}, type=style_type))
    return styles


def blend_voice_prompts(entries: list[BlendEntry]) -> str:
    """Merge multiple voice styles into a single system prompt based on weights."""
    if not entries:
        return ""
    if len(entries) == 1:
        e = entries[0]
        return f"{e.style.system_prompt}\n\nAvoid:\n{e.style.avoid}"

    # Sort by weight descending
    entries = sorted(entries, key=lambda e: e.weight, reverse=True)
    total = sum(e.weight for e in entries)

    parts = []
    for e in entries:
        pct = int((e.weight / total) * 100)
        label = f"{'Primary' if e == entries[0] else 'Secondary'} voice ({pct}% — {e.style.name}):"
        parts.append(f"{label}\n{e.style.system_prompt}")

    # Combine avoid sections
    avoids = [e.style.avoid for e in entries if e.style.avoid]
    avoid_section = "\n".join(avoids)

    return "\n\n".join(parts) + f"\n\nAvoid (combined):\n{avoid_section}"


def blend_image_prompts(entries: list[BlendEntry]) -> dict:
    """Merge multiple image styles into combined positive/negative prompts and params."""
    if not entries:
        return {"positive": "", "negative": "", "parameters": {}}

    total = sum(e.weight for e in entries)
    positives = []
    negatives = []
    params = {}

    for e in entries:
        pct = e.weight / total
        if e.style.positive_prompt:
            positives.append(e.style.positive_prompt.strip())
        if e.style.negative_prompt:
            negatives.append(e.style.negative_prompt.strip())
        # Weighted parameter interpolation (highest weight wins ties)
        for k, v in e.style.parameters.items():
            if k not in params or pct > 0.5:
                params[k] = v

    return {
        "positive": ", ".join(positives),
        "negative": ", ".join(negatives),
        "parameters": params,
    }
