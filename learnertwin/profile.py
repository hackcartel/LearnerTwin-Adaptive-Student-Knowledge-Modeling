"""Immutable learner profile updates and retention calculations."""

import logging
from copy import deepcopy
from datetime import datetime, timezone
from typing import Iterable, Optional, Union

from .models import Attempt, ConceptState, LearnerProfile, Timestamp

logger = logging.getLogger(__name__)


def _parse_timestamp(value: Optional[Timestamp]) -> Optional[datetime]:
    if isinstance(value, datetime):
        parsed = value
    elif isinstance(value, str):
        try:
            parsed = datetime.fromisoformat(value)
        except ValueError:
            return None
    else:
        return None

    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _as_timestamp(value: Union[datetime, str]) -> datetime:
    parsed = _parse_timestamp(value)
    if parsed is None:
        raise ValueError("now must be a valid datetime or ISO timestamp")
    return parsed


def _snapshot(profile: LearnerProfile) -> dict:
    return {
        "learner_id": profile.learner_id,
        "concepts": {
            concept_id: state.to_dict()
            for concept_id, state in profile.concepts.items()
        },
        "updated_at": (
            profile.updated_at.isoformat()
            if isinstance(profile.updated_at, datetime)
            else profile.updated_at
        ),
    }


def effective_mastery(concept: ConceptState, now: Union[datetime, str]) -> float:
    """Return ``0.3 + (mastery - 0.3) * 0.5 ** (days_since_last_attempt / 7)``.

    A state without a valid last-attempt timestamp has no measurable decay and
    retains its stored mastery. Naive datetimes are interpreted as UTC.
    """
    last_attempt = _parse_timestamp(concept.last_attempt_at)
    current_time = _as_timestamp(now)
    if last_attempt is None:
        return concept.mastery
    days_since_last_attempt = max(
        0.0, (current_time - last_attempt).total_seconds() / 86400
    )
    return 0.3 + (concept.mastery - 0.3) * 0.5 ** (
        days_since_last_attempt / 7
    )


def update_profile(
    profile: LearnerProfile,
    attempts: Iterable[Attempt],
    now: Optional[Union[datetime, str]] = None,
) -> LearnerProfile:
    """Return a new profile updated from valid, chronologically ordered attempts.

    The input profile and its nested state are never mutated. A snapshot of its
    previous learner ID, concept states, and update timestamp is appended to
    history, preserving the prior evidence without recursively copying older
    snapshots. Attempts for other learners are ignored. Unknown concepts start
    at mastery 0.3. Missing or invalid timestamps are skipped and counted in a
    warning log entry. Mastery uses the specified attempts-so-far learning rate,
    difficulty multiplier (1/2/3 => 0.8/1.0/1.2), and 0-to-1 clamping.
    Confidence is recalculated as min(1, attempts / 5), and wrong tagged
    attempts increment misconception counts. Retention decay is calculated
    separately by :func:`effective_mastery` and does not overwrite stored
    mastery.
    """
    current_time = _as_timestamp(now) if now is not None else datetime.now(timezone.utc)
    updated_concepts = {
        concept_id: ConceptState.from_dict(state.to_dict())
        for concept_id, state in profile.concepts.items()
    }
    history = deepcopy(profile.history)
    history.append(_snapshot(profile))

    ordered_attempts = []
    skipped_timestamps = 0
    for attempt in attempts:
        if attempt.learner_id != profile.learner_id:
            continue
        timestamp = _parse_timestamp(attempt.timestamp)
        if timestamp is None:
            skipped_timestamps += 1
            continue
        ordered_attempts.append((timestamp, attempt))
    ordered_attempts.sort(key=lambda item: item[0])

    difficulty_scale = {1: 0.8, 2: 1.0, 3: 1.2}
    for timestamp, attempt in ordered_attempts:
        state = updated_concepts.get(attempt.concept_id)
        if state is None:
            state = ConceptState(concept_id=attempt.concept_id, mastery=0.3)
            updated_concepts[attempt.concept_id] = state

        outcome = 1.0 if attempt.correct else 0.0
        alpha = max(0.1, 0.5 / (1 + state.attempts))
        alpha *= difficulty_scale.get(attempt.difficulty, 1.0)
        state.mastery = min(1.0, max(0.0, state.mastery + alpha * (outcome - state.mastery)))
        state.attempts += 1
        if attempt.correct:
            state.correct += 1
        elif attempt.misconception_tag:
            state.misconceptions[attempt.misconception_tag] = (
                state.misconceptions.get(attempt.misconception_tag, 0) + 1
            )
        state.confidence = min(1.0, state.attempts / 5)
        state.last_attempt_at = timestamp

    if skipped_timestamps:
        logger.warning(
            "Skipped %d attempt(s) with missing or invalid timestamps for learner %s",
            skipped_timestamps,
            profile.learner_id,
        )

    return LearnerProfile(
        learner_id=profile.learner_id,
        concepts=updated_concepts,
        updated_at=current_time,
        history=history,
    )
