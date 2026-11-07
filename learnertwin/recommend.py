"""Deterministic practice recommendations from learner profiles."""

from datetime import datetime, timezone
from typing import Union

from .models import LearnerProfile
from .profile import _parse_timestamp, effective_mastery


def recommend_next(
    profile: LearnerProfile, now: Union[datetime, str, None] = None
) -> dict:
    """Rank concepts and return the highest-priority next learning activity.

    Priority combines effective mastery, staleness (capped at 14 days), and
    misconception pressure. Equal priorities are resolved by concept ID.
    """
    if not profile.concepts:
        return {
            "concept_id": None,
            "activity": "practice quiz",
            "priority": 0.0,
            "reason": "No data yet; complete a practice quiz to get a recommendation.",
            "ranking": [],
        }

    if now is None:
        current_time = datetime.now(timezone.utc)
    else:
        current_time = now

    ranking = []
    for concept_id, concept in profile.concepts.items():
        mastery = effective_mastery(concept, current_time)
        last_attempt = concept.last_attempt_at
        if last_attempt is None:
            staleness = 1.0
            days_since_last_attempt = 14.0
        else:
            parsed_last_attempt = _parse_timestamp(last_attempt)
            parsed_now = _parse_timestamp(current_time)
            if parsed_last_attempt is None:
                staleness = 1.0
                days_since_last_attempt = 14.0
            else:
                days_since_last_attempt = max(
                    0.0,
                    (parsed_now - parsed_last_attempt).total_seconds() / 86400,
                )
                staleness = min(days_since_last_attempt, 14.0) / 14.0
        misconception_total = sum(concept.misconceptions.values())
        misconception_pressure = min(1.0, misconception_total / 3)
        priority = (
            0.6 * (1.0 - mastery)
            + 0.2 * staleness
            + 0.2 * misconception_pressure
        )
        if mastery < 0.4:
            activity = "revision"
        elif mastery < 0.7:
            activity = "practice quiz"
        else:
            activity = "challenge question"
        reason = (
            f"{concept_id} is prioritized because its effective mastery is "
            f"{mastery:.2f}, it was last practiced {days_since_last_attempt:.1f} "
            f"days ago, and it has {misconception_total} tagged misconception(s)."
        )
        ranking.append(
            {
                "concept_id": concept_id,
                "activity": activity,
                "priority": priority,
                "reason": reason,
            }
        )

    ranking.sort(key=lambda item: (-item["priority"], item["concept_id"]))
    return dict(ranking[0], ranking=ranking)
