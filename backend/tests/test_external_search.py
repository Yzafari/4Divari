import pytest

from app.search.engine import ExternalSearchEngine
from app.search.models import SearchQuery,SearchResult
from app.search.providers.base import SearchProvider


class FakeProvider(SearchProvider):

    async def search(
        self,
        query,
        domains
    ):

        return [
            SearchResult(
                title=f"Property {i}",
                url=f"https://example.com/property/{i}",
                source="example.com",
                country=query.country,
                snippet="test"
            )
            for i in range(20)
        ]


@pytest.mark.asyncio
async def test_limit_is_10():

    engine=ExternalSearchEngine(
        provider=FakeProvider()
    )

    result=await engine.search(
        SearchQuery(
            country="TR",
            query="apartment",
            limit=10
        )
    )

    assert len(result.results)==10
    assert result.total==10


@pytest.mark.asyncio
async def test_supported_country():

    engine=ExternalSearchEngine(
        provider=FakeProvider()
    )

    result=await engine.search(
        SearchQuery(
            country="AZ",
            query="house"
        )
    )

    assert result.country=="AZ"


@pytest.mark.asyncio
async def test_invalid_country():

    engine=ExternalSearchEngine(
        provider=FakeProvider()
    )

    with pytest.raises(LookupError):

        await engine.search(
            SearchQuery(
                country="XX",
                query="house"
            )
        )


@pytest.mark.asyncio
async def test_invalid_price_range():

    engine=ExternalSearchEngine(
        provider=FakeProvider()
    )

    with pytest.raises(ValueError):

        await engine.search(
            SearchQuery(
                country="TR",
                min_price=100,
                max_price=50
            )
        )
