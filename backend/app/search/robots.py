from __future__ import annotations

from urllib.parse import urljoin, urlparse
from urllib import robotparser

import httpx


USER_AGENT="4DivariPropertySearch/1.0"


async def robots_allowed(
    url:str,
    timeout:float=5.0
)->bool:

    parsed=urlparse(url)

    if parsed.scheme not in {"http","https"}:
        return False

    robots_url=urljoin(
        f"{parsed.scheme}://{parsed.netloc}",
        "/robots.txt"
    )

    try:

        async with httpx.AsyncClient(
            timeout=timeout,
            follow_redirects=True,
            headers={
                "User-Agent":USER_AGENT
            }
        ) as client:

            response=await client.get(robots_url)

        if response.status_code>=500:
            return False

        if response.status_code in {401,403}:
            return False

        if response.status_code==404:
            return True

        parser=robotparser.RobotFileParser()

        parser.set_url(robots_url)
        parser.parse(
            response.text.splitlines()
        )

        return parser.can_fetch(
            USER_AGENT,
            url
        )

    except Exception:
        return False
