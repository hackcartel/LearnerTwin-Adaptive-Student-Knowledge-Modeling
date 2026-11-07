"""Data models for LearnerTwin's framework-independent core."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional, Union

Timestamp = Union[str, datetime]


def _timestamp_to_dict(value: Optional[Timestamp]) -> Optional[str]:
    if isinstance(value, datetime):
        return value.isoformat()
    return value


def _timestamp_from_dict(value: Optional[Union[str, datetime]]) -> Optional[Timestamp]:
    if value is None or isinstance(value, datetime):
        return value
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return value


@dataclass
class Attempt:
    learner_id: str
    question_id: str
    concept_id: str
    correct: bool
    timestamp: Optional[Timestamp]
    difficulty: int = 2
    misconception_tag: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Return a JSON-serializable representation of this attempt."""
        return {
            "learner_id": self.learner_id,
            "question_id": self.question_id,
            "concept_id": self.concept_id,
            "correct": self.correct,
            "timestamp": _timestamp_to_dict(self.timestamp),
            "difficulty": self.difficulty,
            "misconception_tag": self.misconception_tag,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Attempt":
        """Create an attempt from the dictionary produced by ``to_dict``."""
        return cls(
            learner_id=data["learner_id"],
            question_id=data["question_id"],
            concept_id=data["concept_id"],
            correct=data["correct"],
            timestamp=_timestamp_from_dict(data.get("timestamp")),
            difficulty=data.get("difficulty", 2),
            misconception_tag=data.get("misconception_tag"),
        )


@dataclass
class ConceptState:
    concept_id: str
    mastery: float = 0.3
    confidence: float = 0.0
    attempts: int = 0
    correct: int = 0
    last_attempt_at: Optional[Timestamp] = None
    misconceptions: Dict[str, int] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Return a JSON-serializable representation of this concept state."""
        return {
            "concept_id": self.concept_id,
            "mastery": self.mastery,
            "confidence": self.confidence,
            "attempts": self.attempts,
            "correct": self.correct,
            "last_attempt_at": _timestamp_to_dict(self.last_attempt_at),
            "misconceptions": dict(self.misconceptions),
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ConceptState":
        """Create a concept state from the dictionary produced by ``to_dict``."""
        return cls(
            concept_id=data["concept_id"],
            mastery=data.get("mastery", 0.3),
            confidence=data.get("confidence", 0.0),
            attempts=data.get("attempts", 0),
            correct=data.get("correct", 0),
            last_attempt_at=_timestamp_from_dict(data.get("last_attempt_at")),
            misconceptions=dict(data.get("misconceptions", {})),
        )


@dataclass
class LearnerProfile:
    learner_id: str
    concepts: Dict[str, ConceptState] = field(default_factory=dict)
    updated_at: Optional[Timestamp] = None
    history: List[Dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        """Return a JSON-serializable representation of this profile."""
        return {
            "learner_id": self.learner_id,
            "concepts": {
                concept_id: state.to_dict()
                for concept_id, state in self.concepts.items()
            },
            "updated_at": _timestamp_to_dict(self.updated_at),
            "history": list(self.history),
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "LearnerProfile":
        """Create a profile from the dictionary produced by ``to_dict``."""
        concepts = {
            concept_id: (
                state
                if isinstance(state, ConceptState)
                else ConceptState.from_dict(state)
            )
            for concept_id, state in data.get("concepts", {}).items()
        }
        return cls(
            learner_id=data["learner_id"],
            concepts=concepts,
            updated_at=_timestamp_from_dict(data.get("updated_at")),
            history=list(data.get("history", [])),
        )
