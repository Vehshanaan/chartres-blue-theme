"""
Chartres Blue Theme Demo — Python 3.12+
A comprehensive Python sample with type hints, async, dataclasses, and patterns.
"""

from __future__ import annotations

import asyncio
import json
import re
from dataclasses import dataclass, field
from enum import Enum, auto
from functools import cached_property, lru_cache
from pathlib import Path
from typing import Any, Generic, Self, TypeAlias, TypeVar

T = TypeVar("T")
JSON: TypeAlias = dict[str, Any] | list[Any] | str | int | float | bool | None


class CathedralColor(Enum):
    CHARTRES_BLUE = "#1A2A6C"
    ROSE = "#9B1B30"
    GOLD = "#C9A84C"
    STONE = "#8E8B82"


@dataclass(slots=True, frozen=True)
class RGBA:
    """Represents a color with alpha channel."""

    r: int
    g: int
    b: int
    a: float = 1.0

    @classmethod
    def from_hex(cls, hex_color: str) -> Self | None:
        match = re.fullmatch(r"#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})", hex_color, re.IGNORECASE)
        if match is None:
            return None
        return cls(
            r=int(match[1], 16),
            g=int(match[2], 16),
            b=int(match[3], 16),
        )

    def __str__(self) -> str:
        return f"rgba({self.r}, {self.g}, {self.b}, {self.a})"


@dataclass
class StainedGlass(Generic[T]):
    """A stained glass panel with generic pigment type."""

    id: str
    name: str
    year: int
    color: CathedralColor
    pigments: list[str] = field(default_factory=list)

    @cached_property
    def age(self) -> int:
        from datetime import date
        return date.today().year - self.year

    def to_json(self) -> str:
        return json.dumps(
            {
                "id": self.id,
                "name": self.name,
                "year": self.year,
                "age": self.age,
                "color": self.color.value,
            },
            indent=2,
        )


class GlassCatalogue:
    """Manages a collection of stained glass panels."""

    def __init__(self) -> None:
        self._panels: dict[str, StainedGlass] = {}

    def add(self, panel: StainedGlass) -> None:
        self._panels[panel.id] = panel

    def __getitem__(self, panel_id: str) -> StainedGlass:
        try:
            return self._panels[panel_id]
        except KeyError:
            raise LookupError(f"Panel not found: {panel_id}")

    def __contains__(self, panel_id: str) -> bool:
        return panel_id in self._panels

    def filter_by_color(self, color: CathedralColor) -> list[StainedGlass]:
        return [p for p in self._panels.values() if p.color is color]

    @lru_cache(maxsize=128)
    def count_by(self, color: CathedralColor) -> int:
        return sum(1 for p in self._panels.values() if p.color == color)

    # Context manager
    def __enter__(self) -> Self:
        return self

    def __exit__(self, *args: object) -> None:
        self._panels.clear()


# === Async functions ===

async def fetch_panels(url: str) -> list[dict[str, Any]]:
    import aiohttp
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            response.raise_for_status()
            data: JSON = await response.json()
            return data if isinstance(data, list) else []


async def main() -> None:
    """Entry point — demonstrates async patterns."""
    blue = CathedralColor.CHARTRES_BLUE
    rgba = RGBA.from_hex(blue.value)

    panel = StainedGlass(
        id="notre-dame-belle-verriere",
        name="Notre-Dame de la Belle-Verrière",
        year=1194,
        color=blue,
        pigments=["cobalt oxide", "copper sulfate"],
    )

    with GlassCatalogue() as catalogue:
        catalogue.add(panel)

        # Match statement (Python 3.10+)
        match panel.color:
            case CathedralColor.CHARTRES_BLUE:
                feeling = "mystical"
            case CathedralColor.ROSE:
                feeling = "passionate"
            case _:
                feeling = "serene"

    print(f"{panel.name} ({panel.age} years): {feeling} — {rgba}")
    print(panel.to_json())


if __name__ == "__main__":
    asyncio.run(main())
