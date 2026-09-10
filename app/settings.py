"""Explicit runtime settings for the optional daily FUSSBALL.DE schedule sync."""

from __future__ import annotations

import os
from dataclasses import dataclass

DEFAULT_HIGHER_TEAM_FUSSBALLDE_ID = "023MIO3TLO000000VS548984VVA56K3S"
DEFAULT_LOWER_TEAM_FUSSBALLDE_ID = "03128P9OQC000000VS5489BRVV9R0K3A"


@dataclass(frozen=True, slots=True)
class MatchplanSyncSettings:
    """Settings intentionally read once when the FastAPI app starts."""

    enabled: bool
    team_fussballde_id: str
    lower_team_fussballde_id: str
    hour: int
    minute: int

    @property
    def team_fussballde_ids(self) -> tuple[str, str]:
        """Return the higher and lower monitored teams in update order."""
        return (self.team_fussballde_id, self.lower_team_fussballde_id)

    @classmethod
    def from_environment(cls) -> MatchplanSyncSettings:
        """Read environment settings and reject invalid daily-run times early."""
        hour = int(os.getenv("FUSSBALLDE_MATCHPLAN_SYNC_HOUR", "4"))
        minute = int(os.getenv("FUSSBALLDE_MATCHPLAN_SYNC_MINUTE", "0"))
        if not 0 <= hour <= 23 or not 0 <= minute <= 59:
            raise ValueError("FUSSBALL.DE matchplan sync time must be a valid hour and minute")

        return cls(
            enabled=os.getenv("FUSSBALLDE_MATCHPLAN_SYNC_ENABLED", "false").casefold()
            in {"1", "true", "yes", "on"},
            team_fussballde_id=os.getenv(
                "FUSSBALLDE_HIGHER_TEAM_ID", DEFAULT_HIGHER_TEAM_FUSSBALLDE_ID
            ),
            lower_team_fussballde_id=os.getenv(
                "FUSSBALLDE_LOWER_TEAM_ID", DEFAULT_LOWER_TEAM_FUSSBALLDE_ID
            ),
            hour=hour,
            minute=minute,
        )
