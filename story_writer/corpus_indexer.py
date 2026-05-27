"""Corpus indexer — scans directories of txt files, chunks, and indexes into OpenSearch."""

from __future__ import annotations

import hashlib
import logging
from pathlib import Path

from opensearchpy import OpenSearch, helpers

logger = logging.getLogger(__name__)

INDEX_NAME = "story_writer_corpus"

_MAPPING = {
    "settings": {"number_of_shards": 1, "number_of_replicas": 0},
    "mappings": {
        "properties": {
            "chunk_id": {"type": "keyword"},
            "file_id": {"type": "keyword"},
            "project_id": {"type": "keyword"},
            "title": {"type": "text"},
            "content": {"type": "text", "analyzer": "english"},
            "category": {"type": "keyword"},
        }
    },
}


def get_client(host: str = "localhost", port: int = 9200) -> OpenSearch:
    return OpenSearch(hosts=[{"host": host, "port": port}], use_ssl=False, verify_certs=False)


def ensure_index(client: OpenSearch) -> None:
    """Create the corpus index if it doesn't exist."""
    if not client.indices.exists(index=INDEX_NAME):
        client.indices.create(index=INDEX_NAME, body=_MAPPING)
        logger.info("Created index: %s", INDEX_NAME)


def chunk_text(text: str, max_chunk: int = 500) -> list[str]:
    """Split text into chunks by paragraph, respecting max size."""
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks = []
    current = ""

    for para in paragraphs:
        if len(current) + len(para) + 2 > max_chunk and current:
            chunks.append(current)
            current = para
        else:
            current = f"{current}\n\n{para}" if current else para

    if current:
        chunks.append(current)
    return chunks


def index_file(client: OpenSearch, project_id: str, file_path: Path, category: str = "general") -> int:
    """Index a single txt file into OpenSearch. Returns chunk count."""
    text = file_path.read_text(encoding="utf-8", errors="replace")
    file_id = hashlib.sha256(str(file_path).encode()).hexdigest()[:16]
    title = file_path.stem.replace("_", " ").replace("-", " ")

    # Remove old chunks for this file
    client.delete_by_query(
        index=INDEX_NAME,
        body={"query": {"term": {"file_id": file_id}}},
        ignore=[404],
    )

    chunks = chunk_text(text)
    if not chunks:
        return 0

    actions = [
        {
            "_index": INDEX_NAME,
            "_id": f"{file_id}_{i}",
            "_source": {
                "chunk_id": f"{file_id}_{i}",
                "file_id": file_id,
                "project_id": project_id,
                "title": title,
                "content": chunk,
                "category": category,
            },
        }
        for i, chunk in enumerate(chunks)
    ]
    helpers.bulk(client, actions)
    return len(chunks)


def index_directory(client: OpenSearch, project_id: str, directory: Path, category: str = "general") -> dict:
    """Index all .txt files in a directory. Returns stats."""
    files = sorted(directory.rglob("*.txt"))
    total_chunks = 0
    for f in files:
        total_chunks += index_file(client, project_id, f, category)
    return {"files": len(files), "chunks": total_chunks}
