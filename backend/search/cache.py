from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Any


@dataclass
class CacheEntry:
    expires_at: float
    value: Any


class MemoryCache:
    def __init__(self, ttl_seconds: int = 900):
        self.ttl_seconds = ttl_seconds
        self._items: dict[str, CacheEntry] = {}

    def get(self, key: str):
        item = self._items.get(key)

        if not item:
            return None

        if item.expires_at <= time.time():
            self._items.pop(key, None)
            return None

        return item.value

    def set(self, key: str, value):
        self._items[key] = CacheEntry(
            expires_at=time.time() + self.ttl_seconds,
            value=value,
        )

    def clear(self):
        self._items.clear()
