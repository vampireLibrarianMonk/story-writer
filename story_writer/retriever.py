"""Retriever — searches the corpus index and returns ranked snippets."""

from __future__ import annotations

from opensearchpy import OpenSearch

from .corpus_indexer import INDEX_NAME, get_client


def search_corpus(
    query: str,
    project_id: str | None = None,
    category: str | None = None,
    page: int = 1,
    page_size: int = 10,
    client: OpenSearch | None = None,
) -> dict:
    """Full-text search over indexed corpus chunks."""
    client = client or get_client()

    must = [{"multi_match": {"query": query, "fields": ["content^3", "title"], "type": "best_fields"}}]
    filters = []
    if project_id:
        filters.append({"term": {"project_id": project_id}})
    if category:
        filters.append({"term": {"category": category}})

    body = {
        "query": {"bool": {"must": must, "filter": filters}},
        "from": (page - 1) * page_size,
        "size": page_size,
        "highlight": {"fields": {"content": {"fragment_size": 300, "number_of_fragments": 1}}},
    }

    resp = client.search(index=INDEX_NAME, body=body)

    results = []
    for hit in resp["hits"]["hits"]:
        src = hit["_source"]
        snippet = src["content"][:300]
        if "highlight" in hit and "content" in hit["highlight"]:
            snippet = hit["highlight"]["content"][0]
        results.append({
            "file_id": src["file_id"],
            "title": src["title"],
            "snippet": snippet,
            "score": round(hit["_score"], 4),
            "category": src["category"],
        })

    return {"results": results, "total": resp["hits"]["total"]["value"]}
