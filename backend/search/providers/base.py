from __future__ import annotations

from abc import ABC, abstractmethod

from ..models import SearchQuery, SearchResult


class SearchProvider(ABC):

    @abstractmethod
    async def search(
        self,
        query: SearchQuery,
        domains: tuple[str, ...],
    ) -> list[SearchResult]:
        raise NotImplementedError
