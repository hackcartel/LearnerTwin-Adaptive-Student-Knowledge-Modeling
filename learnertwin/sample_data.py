"""Fictional sample learner and a scripted multi-day attempt sequence."""

from datetime import datetime, timezone

from .models import Attempt, ConceptState, LearnerProfile
from .profile import update_profile
from .recommend import recommend_next

DEMO_LEARNER_ID = "demo-learner"

DEMO_PROFILE = LearnerProfile(
    learner_id=DEMO_LEARNER_ID,
    concepts={
        "variables_data_types": ConceptState("variables_data_types"),
        "conditionals": ConceptState("conditionals"),
        "loops": ConceptState("loops"),
    },
)

DEMO_ATTEMPTS = [
    Attempt(DEMO_LEARNER_ID, "q-vars-1", "variables_data_types", True, "2026-10-28T09:00:00+00:00"),
    Attempt(DEMO_LEARNER_ID, "q-if-1", "conditionals", True, "2026-10-28T09:15:00+00:00"),
    Attempt(DEMO_LEARNER_ID, "q-loop-1", "loops", False, "2026-10-28T09:30:00+00:00", misconception_tag="off_by_one_loop"),
    Attempt(DEMO_LEARNER_ID, "q-vars-2", "variables_data_types", True, "2026-10-30T09:00:00+00:00"),
    Attempt(DEMO_LEARNER_ID, "q-if-2", "conditionals", True, "2026-10-30T09:15:00+00:00"),
    Attempt(DEMO_LEARNER_ID, "q-loop-2", "loops", False, "2026-10-30T09:30:00+00:00", misconception_tag="off_by_one_loop"),
    Attempt(DEMO_LEARNER_ID, "q-loop-3", "loops", False, "2026-11-01T09:30:00+00:00", misconception_tag="off_by_one_loop"),
]


def demo_result():
    """Return the updated fictional profile and its next recommendation."""
    updated = update_profile(
        DEMO_PROFILE,
        DEMO_ATTEMPTS,
        now=datetime(2026, 11, 2, tzinfo=timezone.utc),
    )
    return updated, recommend_next(updated, now="2026-11-02T00:00:00+00:00")
