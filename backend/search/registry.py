from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SearchSource:
    country: str
    name: str
    domains: tuple[str, ...]
    enabled: bool = True


SOURCES = {
    "TR": SearchSource(
        country="TR",
        name="Turkey property search",
        domains=("sahibinden.com", "hepsiemlak.com", "emlakjet.com"),
    ),
    "AZ": SearchSource(
        country="AZ",
        name="Azerbaijan property search",
        domains=("bina.az", "emlak.az"),
    ),
    "AM": SearchSource(
        country="AM",
        name="Armenia property search",
        domains=("list.am",),
    ),
    "GE": SearchSource(
        country="GE",
        name="Georgia property search",
        domains=("myhome.ge", "ss.ge"),
    ),
    "IQ": SearchSource(
        country="IQ",
        name="Iraq property search",
        domains=("opensooq.com",),
    ),
    "AE": SearchSource(
        country="AE",
        name="UAE property search",
        domains=("propertyfinder.ae", "bayut.com"),
    ),
    "QA": SearchSource(
        country="QA",
        name="Qatar property search",
        domains=("propertyfinder.qa",),
    ),
    "SA": SearchSource(
        country="SA",
        name="Saudi Arabia property search",
        domains=("propertyfinder.sa",),
    ),
    "KW": SearchSource(
        country="KW",
        name="Kuwait property search",
        domains=("propertyfinder.com.kw",),
    ),
    "BH": SearchSource(
        country="BH",
        name="Bahrain property search",
        domains=("propertyfinder.bh",),
    ),
    "OM": SearchSource(
        country="OM",
        name="Oman property search",
        domains=("propertyfinder.om",),
    ),
    "IT": SearchSource(
        country="IT",
        name="Italy property search",
        domains=("immobiliare.it", "idealista.it"),
    ),
    "DE": SearchSource(
        country="DE",
        name="Germany property search",
        domains=("immobilienscout24.de", "immowelt.de"),
    ),
    "CN": SearchSource(
        country="CN",
        name="China property search",
        domains=("fang.com",),
    ),
}


def get_source(country: str) -> SearchSource | None:
    return SOURCES.get(country.upper())


def supported_countries() -> list[str]:
    return [
        country
        for country, source in SOURCES.items()
        if source.enabled
    ]
