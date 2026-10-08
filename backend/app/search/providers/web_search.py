from __future__ import annotations

import re
from html import unescape
from urllib.parse import (
    parse_qs,
    unquote,
    urlparse
)

import httpx

from ..models import SearchQuery,SearchResult
from .base import SearchProvider


class WebSearchProvider(SearchProvider):

    SEARCH_URL="https://html.duckduckgo.com/html/"

    def __init__(self,timeout:float=8.0):
        self.timeout=timeout

    async def search(
        self,
        query:SearchQuery,
        domains:tuple[str,...]
    )->list[SearchResult]:

        terms=[]

        if query.query.strip():
            terms.append(query.query.strip())

        if query.city.strip():
            terms.append(query.city.strip())

        if query.deal_type:
            terms.append(query.deal_type)

        if query.property_type:
            terms.append(query.property_type)

        text=" ".join(terms).strip()

        site_filter=" OR ".join(
            f"site:{domain}"
            for domain in domains
        )

        if site_filter:
            text=(
                f"{text} ({site_filter})"
                if text
                else site_filter
            )

        async with httpx.AsyncClient(
            timeout=self.timeout,
            follow_redirects=True,
            headers={
                "User-Agent":
                    "4DivariPropertySearch/1.0",
                "Accept-Language":
                    "fa,en;q=0.8"
            }
        ) as client:

            response=await client.get(
                self.SEARCH_URL,
                params={"q":text}
            )

            response.raise_for_status()

        return self._parse(
            response.text,
            query,
            set(d.lower() for d in domains)
        )

    def _parse(
        self,
        html:str,
        query:SearchQuery,
        allowed:set[str]
    )->list[SearchResult]:

        pattern=re.compile(
            r'<a[^>]+class="result__a"[^>]+'
            r'href="([^"]+)"[^>]*>'
            r'(.*?)</a>',
            re.I|re.S
        )

        snippet_pattern=re.compile(
            r'<a[^>]+class="result__snippet"[^>]*>'
            r'(.*?)</a>|'
            r'<div[^>]+class="result__snippet"[^>]*>'
            r'(.*?)</div>',
            re.I|re.S
        )

        snippets=[
            self._clean(a or b)
            for a,b in snippet_pattern.findall(html)
        ]

        results=[]
        seen=set()

        for index,match in enumerate(
            pattern.finditer(html)
        ):

            if len(results)>=query.limit:
                break

            raw_url=unescape(match.group(1))
            url=self._unwrap(raw_url)

            if not self._valid_url(url):
                continue

            host=urlparse(url).netloc.lower()

            if host.startswith("www."):
                host=host[4:]

            if not any(
                host==domain or
                host.endswith("."+domain)
                for domain in allowed
            ):
                continue

            canonical=self._canonical(url)

            if canonical in seen:
                continue

            seen.add(canonical)

            title=self._clean(match.group(2))

            snippet=(
                snippets[index]
                if index<len(snippets)
                else ""
            )

            results.append(
                SearchResult(
                    title=title,
                    url=url,
                    source=host,
                    country=query.country,
                    snippet=snippet
                )
            )

        return results

    @staticmethod
    def _unwrap(url:str)->str:

        parsed=urlparse(url)

        if "duckduckgo.com" in parsed.netloc:
            qs=parse_qs(parsed.query)

            if "uddg" in qs and qs["uddg"]:
                return unquote(qs["uddg"][0])

        return url

    @staticmethod
    def _valid_url(url:str)->bool:
        return urlparse(url).scheme in {
            "http",
            "https"
        }

    @staticmethod
    def _canonical(url:str)->str:

        p=urlparse(url)

        return (
            p.scheme.lower(),
            p.netloc.lower(),
            p.path.rstrip("/"),
            p.query
        ).__str__()

    @staticmethod
    def _clean(value:str)->str:

        value=re.sub(
            r"<[^>]+>",
            " ",
            value
        )

        value=unescape(value)

        return " ".join(value.split())
