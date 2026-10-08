from __future__ import annotations

import time


class MemoryCache:

    def __init__(self,ttl_seconds:int=900):
        self.ttl_seconds=ttl_seconds
        self.items={}

    def get(self,key):

        item=self.items.get(key)

        if not item:
            return None

        expires,value=item

        if expires<=time.time():
            self.items.pop(key,None)
            return None

        return value

    def set(self,key,value):

        self.items[key]=(
            time.time()+self.ttl_seconds,
            value
        )

    def clear(self):
        self.items.clear()
