import json
import unittest
from datetime import datetime, timezone

from learnertwin.models import Attempt, ConceptState, LearnerProfile
from learnertwin.profile import effective_mastery, update_profile


class ProfileUpdateTests(unittest.TestCase):
    def setUp(self):
        self.profile = LearnerProfile(
            "learner-1",
            concepts={"loops": ConceptState("loops")},
        )

    def attempt(self, correct, timestamp, **kwargs):
        return Attempt(
            learner_id="learner-1",
            question_id="q1",
            concept_id=kwargs.pop("concept_id", "loops"),
            correct=correct,
            timestamp=timestamp,
            **kwargs,
        )

    def test_mastery_rises_on_correct_and_falls_on_wrong(self):
        raised = update_profile(
            self.profile, [self.attempt(True, "2026-01-01T00:00:00Z")]
        )
        lowered = update_profile(
            raised, [self.attempt(False, "2026-01-02T00:00:00Z")]
        )
        self.assertGreater(raised.concepts["loops"].mastery, 0.3)
        self.assertLess(lowered.concepts["loops"].mastery, raised.concepts["loops"].mastery)

    def test_input_is_not_mutated_and_history_snapshot_is_appended(self):
        before = self.profile.to_dict()
        updated = update_profile(
            self.profile, [self.attempt(True, "2026-01-01T00:00:00Z")]
        )
        self.assertEqual(self.profile.to_dict(), before)
        self.assertEqual(len(updated.history), 1)
        self.assertEqual(updated.history[0]["concepts"]["loops"]["attempts"], 0)

    def test_learner_isolation(self):
        other = Attempt("learner-2", "q2", "loops", True, "2026-01-01T00:00:00Z")
        updated = update_profile(self.profile, [other])
        self.assertEqual(updated.concepts["loops"].attempts, 0)

    def test_unknown_concept_starts_at_baseline(self):
        updated = update_profile(
            self.profile,
            [self.attempt(True, "2026-01-01T00:00:00Z", concept_id="new-topic")],
        )
        self.assertGreater(updated.concepts["new-topic"].mastery, 0.3)
        self.assertEqual(updated.concepts["new-topic"].attempts, 1)

    def test_attempts_are_sorted_and_invalid_timestamps_skipped(self):
        attempts = [
            self.attempt(False, "2026-01-02T00:00:00Z"),
            self.attempt(True, "2026-01-01T00:00:00Z"),
            self.attempt(True, "not-a-timestamp"),
            self.attempt(True, None),
        ]
        with self.assertLogs("learnertwin.profile", level="WARNING") as logs:
            updated = update_profile(self.profile, attempts)
        self.assertEqual(updated.concepts["loops"].attempts, 2)
        self.assertEqual(updated.concepts["loops"].correct, 1)
        self.assertEqual(updated.concepts["loops"].last_attempt_at.isoformat(), "2026-01-02T00:00:00+00:00")
        self.assertIn("Skipped 2 attempt(s)", logs.output[0])

    def test_retention_decay_lowers_effective_mastery_over_time(self):
        concept = ConceptState(
            "loops", mastery=0.9, last_attempt_at="2026-01-01T00:00:00Z"
        )
        effective = effective_mastery(concept, datetime(2026, 1, 8, tzinfo=timezone.utc))
        self.assertAlmostEqual(effective, 0.6)
        self.assertLess(effective, concept.mastery)

    def test_confidence_grows_with_attempts(self):
        updated = update_profile(
            self.profile,
            [
                self.attempt(True, f"2026-01-0{day}T00:00:00Z")
                for day in range(1, 4)
            ],
        )
        self.assertEqual(updated.concepts["loops"].confidence, 0.6)

    def test_json_round_trip(self):
        updated = update_profile(
            self.profile,
            [self.attempt(True, "2026-01-01T00:00:00Z")],
        )
        encoded = json.dumps(updated.to_dict())
        restored = LearnerProfile.from_dict(json.loads(encoded))
        self.assertEqual(restored.to_dict(), updated.to_dict())


if __name__ == "__main__":
    unittest.main()
