from __future__ import annotations

import re
from html import unescape
from urllib.parse import quote_plus, urlparse

import httpx

from ..models import SearchQuery, SearchResult
from .base import SearchProvider


class WebSearchProvider(SearchProvider):
    """
    Search-engine provider.

    This provider retrieves indexed search results rather than copying
    third-party property records into the 4Divari database.
    """

    SEARCH_URL = "https://html.duckduckgo.com/html/"

    def __init__(self, timeout: float = 8.0):
        self.timeout = timeout

    async def search(
        self,
        query: SearchQuery,
        domains: tuple[str, ...],
    ) -> list[SearchResult]:

        terms = [query.query.strip()]

        if query.city:
            terms.append(query.city.strip())

        if query.deal_type:
            terms.append(query.deal_type)

        if query.property_type:
            terms.append(query.property_type)

        terms = [x for x in terms if x]

        site_filter = " OR ".join(
            f"site:{domain}" for domain in domains
        )

        search_text = " ".join(terms)

        if site_filter:
            search_text = f"{search_text} ({site_filter})"

        params = {
            "q": search_text,
        }

        headers = {
            "User-Agent": (
                "Mozilla/5.0 (compatible; 4DivariPropertySearch/1.0)"
            ),
            "Accept-Language": "fa,en;q=0.8",
        }

        async with httpx.AsyncClient(
            timeout=self.timeout,
            follow_redirects=True,
            headers=headers,
        ) as client:

            response = await client.get(
                self.SEARCH_URL,
                params=params,
            )

            response.raise_for_status()

        return self._parse(
            response.text,
            country=query.country,
            limit=query.limit,
        )

    def _parse(
        self,
        html: str,
        country: str,
        limit: int,
    ) -> list[SearchResult]:

        pattern = re.compile(
            r'<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>'
            r'(.*?)</a>',
            re.I | re.S,
        )

        snippet_pattern = re.compile(
            r'<a[^>]+class="result__snippet"[^>]*>'
            r'(.*?)</a>|'
            r'<div[^>]+class="result__snippet"[^>]*>'
            r'(.*?)</div>',
            re.I | re.S,
        )

        snippets = [
            self._clean(x or y)
            for x, y in snippet_pattern.findall(html)
        ]

        results: list[SearchResult] = []

        for index, match in enumerate(
            pattern.finditer(html),
            start=0,
        ):
            if len(results) >= limit:
                break

            url = unescape(match.group(1))
            title = self._clean(match.group(2))

            if not self._is_http_url(url):
                continue

            snippet = snippets[index] if index < len(snippets) else ""

            results.append(
                SearchResult(
                    title=title,
                    url=url,
                    source=self._domain(url),
                    country=country,
                    snippet=snippet,
                )
            )

        return results

    @staticmethod
    def _clean(value: str) -> str:
        value = re.sub(r"<[^>]+>", " ", value)
        value = unescape(value)
        return " ".join(value.split())

    @staticmethod
    def _is_http_url(url: str) -> bool:
        return urlparse(url).scheme in {"http", "https"}

    @staticmethod
    def _domain(url: str) -> str:
        return urlparse(url).netloc.lower()
