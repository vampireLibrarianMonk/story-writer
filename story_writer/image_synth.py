"""Image prompt synthesizer — uses a text model to write image prompts grounded in the world bible."""

from __future__ import annotations

import os
from pathlib import Path

import boto3
import yaml

_SYNTH_SYSTEM = """You are an expert image prompt engineer for AI image generation models.
You receive:
1. A world bible with lore, species, aesthetics, and visual rules
2. A scene description from the author

Your job: Write a single detailed image generation prompt (150-200 words) that an image model
can execute. Be SPECIFIC about:
- Subject positioning and pose
- Lighting direction and color temperature
- Materials and textures (name them: mithril, bone-plate, leather)
- Camera angle and composition
- Atmospheric effects (clouds, lens flare, grain)
- Color palette (name specific colors)
- Art style references (Boris Vallejo, Frank Frazetta, 80s album art)

Do NOT include:
- Story or narrative text
- Dialogue or character thoughts
- Multiple sequential scenes
- Instructions to the viewer

Return ONLY the image prompt text. No preamble, no explanation."""


def load_style(style_path: str) -> dict:
    """Load an image style YAML file."""
    with open(style_path) as f:
        return yaml.safe_load(f)


def synthesize_image_prompt(
    scene_description: str,
    world_context: str,
    character_context: str = "",
    style: dict | None = None,
) -> str:
    """Use a text model to generate a detailed image prompt from scene + world bible."""
    client = boto3.client("bedrock-runtime", region_name=os.getenv("AWS_REGION", "us-east-1"))
    model_id = os.getenv("BEDROCK_CHEAP_MODEL_ID", "amazon.nova-lite-v1:0")

    user_msg = f"World Bible Context:\n{world_context}\n\n"
    if character_context:
        user_msg += f"Character Details:\n{character_context}\n\n"
    user_msg += f"Scene to visualize:\n{scene_description}"

    resp = client.converse(
        modelId=model_id,
        system=[{"text": _SYNTH_SYSTEM}],
        messages=[{"role": "user", "content": [{"text": user_msg}]}],
        inferenceConfig={"maxTokens": 512},
    )

    synthesized = resp["output"]["message"]["content"][0]["text"].strip()

    # Merge with style modifiers if provided
    if style:
        positive = style.get("positive_prompt", "")
        synthesized = f"{synthesized}, {positive}"

    return synthesized


def generate_image(
    prompt: str,
    negative_prompt: str = "",
    output_path: str = "output.png",
    style: dict | None = None,
) -> str:
    """Call Bedrock image generation API with the synthesized prompt."""
    client = boto3.client("bedrock-runtime", region_name=os.getenv("AWS_REGION", "us-east-1"))
    model_id = os.getenv("BEDROCK_IMAGE_MODEL_ID", "stability.stable-diffusion-xl-v1")

    if style:
        negative_prompt = f"{negative_prompt} {style.get('negative_prompt', '')}".strip()
        params = style.get("parameters", {})
    else:
        params = {}

    import json

    body = json.dumps({
        "text_prompts": [
            {"text": prompt, "weight": 1.0},
            {"text": negative_prompt, "weight": -1.0},
        ],
        "cfg_scale": params.get("cfg_scale", 8),
        "steps": params.get("steps", 50),
        "seed": params.get("seed", 0),
        "style_preset": params.get("style_preset", "fantasy-art"),
    })

    resp = client.invoke_model(modelId=model_id, body=body, contentType="application/json", accept="application/json")
    result = json.loads(resp["body"].read())

    import base64
    image_bytes = base64.b64decode(result["artifacts"][0]["base64"])
    Path(output_path).write_bytes(image_bytes)
    return output_path
