from __future__ import annotations

import hashlib
import json

from .cache import MemoryCache
from .models import SearchQuery, SearchResponse
from .providers.web_search import WebSearchProvider
from .registry import get_source


class ExternalSearchEngine:

    def __init__(
        self,
        provider=None,
        cache=None,
    ):
        self.provider = provider or WebSearchProvider()
        self.cache = cache or MemoryCache(ttl_seconds=900)

    @staticmethod
    def _cache_key(query):
        payload = query.model_dump(mode="json")
        raw = json.dumps(
            payload,
            ensure_ascii=False,
            sort_keys=True,
        )
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    async def search(self, query) -> SearchResponse:

        query.country = query.country.upper()

        if query.min_price is not None and query.max_price is not None:
            if query.min_price > query.max_price:
                raise ValueError(
                    "min_price cannot be greater than max_price"
                )

        source = get_source(query.country)

        if source is None or not source.enabled:
            raise LookupError(
                f"Unsupported country: {query.country}"
            )

        key = self._cache_key(query)
        cached = self.cache.get(key)

        if cached is not None:
            return SearchResponse(
                **cached.model_dump(),
                cached=True,
            )

        results = await self.provider.search(
            query,
            source.domains,
        )

        results = results[:query.limit]

        response = SearchResponse(
            country=query.country,
            query=query.query,
            results=results,
            total=len(results),
            cached=False,
        )

        self.cache.set(key, response)

        return response
