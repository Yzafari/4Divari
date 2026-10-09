from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SearchSource:
    country: str
    name: str
    domains: tuple[str, ...]
    enabled: bool = True


SOURCES={
    "TR": SearchSource(
        country="TR",
        name="Turkey",
        domains=(
            "sahibinden.com",
            "hepsiemlak.com",
        ),
    ),

    "AZ": SearchSource(
        country="AZ",
        name="Azerbaijan",
        domains=(
            "bina.az",
        ),
    ),

    "AM": SearchSource(
        country="AM",
        name="Armenia",
        domains=(
            "list.am",
        ),
    ),

    "GE": SearchSource(
        country="GE",
        name="Georgia",
        domains=(
            "myhome.ge",
            "ss.ge",
        ),
    ),
}


def get_source(country:str)->SearchSource|None:
    return SOURCES.get(country.upper())


def allowed_domains(country:str)->set[str]:
    source=get_source(country)

    if not source or not source.enabled:
        return set()

    return {
        d.lower()
        for d in source.domains
    }


def supported_countries()->list[str]:
    return [
        k
        for k,v in SOURCES.items()
        if v.enabled
    ]
ENABLED_COUNTRIES = supported_countries()
