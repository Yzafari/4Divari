from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator
from .registry import ENABLED_COUNTRIES


class SearchQuery(BaseModel):
    country: str = Field(min_length=2, max_length=2)
    query: str = Field(default="", max_length=200)
    city: str = Field(default="", max_length=100)
    deal_type: Optional[str] = Field(default=None, max_length=30)
    property_type: Optional[str] = Field(default=None, max_length=50)
    min_price: Optional[int] = Field(default=None, ge=0)
    max_price: Optional[int] = Field(default=None, ge=0)
    limit: int = Field(default=10, ge=1, le=10)

    @field_validator("country")
    @classmethod
    def validate_country(cls, value: str) -> str:
        country = value.strip().upper()

        if country not in ENABLED_COUNTRIES:
            raise ValueError("کشور پشتیبانی نمی‌شود")

        return country


class SearchResult(BaseModel):
    title: str
    url: str
    source: str
    country: str
    snippet: str = ""
    thumbnail_url: Optional[str] = None
    price: Optional[str] = None
    city: Optional[str] = None
    posted_at: Optional[datetime] = None


class SearchResponse(BaseModel):
    country: str
    query: str
    results: list[SearchResult]
    total: int
    cached: bool = False
