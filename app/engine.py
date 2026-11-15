"""Transparent, fixed-parameter Bayesian Knowledge Tracing prototype.

Parameters are educational assumptions, not fitted or calibrated estimates.
"""
from datetime import datetime, timezone

PRIOR = 0.25
LEARN = 0.12
GUESS = 0.20
SLIP = 0.10


def update_mastery(prior: float, correct: bool) -> float:
    """Posterior after observation, followed by an opportunity to learn."""
    likelihood = (1 - SLIP) if correct else SLIP
    other_likelihood = GUESS if correct else (1 - GUESS)
    numerator = prior * likelihood
    posterior = numerator / (numerator + (1 - prior) * other_likelihood)
    return round(posterior + (1 - posterior) * LEARN, 6)


def recommendation(concepts: list[dict]) -> dict:
    """Recommend lowest-mastery concept, with evidence and honest uncertainty."""
    if not concepts:
        return {"concept_id": None, "reason": "No concepts available"}
    target = min(concepts, key=lambda item: (item['mastery'], item['attempts'], item['concept_id']))
    if target['attempts'] == 0:
        reason = f"Start with {target['name']}; no assessment evidence exists yet."
    else:
        reason = (f"Practice {target['name']} next: estimated mastery "
                  f"{target['mastery']:.0%} from {target['attempts']} recorded responses. "
                  "This is a provisional, model-based estimate.")
    return {"concept_id": target['concept_id'], "concept_name": target['name'],
            "reason": reason, "estimated_mastery": target['mastery'],
            "evidence_count": target['attempts']}
