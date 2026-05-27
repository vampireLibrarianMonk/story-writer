"""Text generator — prose generation via Bedrock Converse API."""

from __future__ import annotations

import os

import boto3

from .styles import BlendEntry, blend_voice_prompts


def generate_prose(
    instruction: str,
    context: str,
    style_entries: list[BlendEntry] | None = None,
    model_id: str | None = None,
    max_tokens: int = 2048,
) -> str:
    """Generate prose from instruction + context, applying blended voice styles."""
    model = model_id or os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-haiku-20240307-v1:0")
    client = boto3.client("bedrock-runtime", region_name=os.getenv("AWS_REGION", "us-east-1"))

    # Build system prompt from style blend
    style_prompt = blend_voice_prompts(style_entries) if style_entries else ""
    system = f"You are a creative fiction writer.\n\n{style_prompt}" if style_prompt else "You are a creative fiction writer."

    user_msg = f"Context:\n{context}\n\nInstruction:\n{instruction}\n\nWrite the prose."

    resp = client.converse(
        modelId=model,
        system=[{"text": system}],
        messages=[{"role": "user", "content": [{"text": user_msg}]}],
        inferenceConfig={"maxTokens": max_tokens},
    )

    return resp["output"]["message"]["content"][0]["text"]
