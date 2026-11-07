import unittest
from datetime import datetime, timezone

from learnertwin.models import Attempt, ConceptState, LearnerProfile
from learnertwin.profile import update_profile
from learnertwin.recommend import recommend_next
from learnertwin.sample_data import DEMO_ATTEMPTS, DEMO_PROFILE, demo_result


class RecommendationTests(unittest.TestCase):
    def test_recommendation_selects_weakest_concept(self):
        profile = LearnerProfile(
            "learner",
            concepts={
                "strong": ConceptState("strong", mastery=0.9, last_attempt_at="2026-01-01T00:00:00Z"),
                "weak": ConceptState("weak", mastery=0.2, last_attempt_at="2026-01-01T00:00:00Z"),
            },
        )
        result = recommend_next(profile, now="2026-01-01T00:00:00Z")
        self.assertEqual(result["concept_id"], "weak")
        self.assertIn("weak", result["reason"])

    def test_recommendation_accounts_for_staleness(self):
        profile = LearnerProfile(
            "learner",
            concepts={
                "recent": ConceptState("recent", mastery=0.6, last_attempt_at="2026-01-09T00:00:00Z"),
                "stale": ConceptState("stale", mastery=0.6, last_attempt_at="2026-01-01T00:00:00Z"),
            },
        )
        result = recommend_next(profile, now="2026-01-10T00:00:00Z")
        self.assertEqual(result["concept_id"], "stale")

    def test_activity_thresholds(self):
        profile = LearnerProfile(
            "learner",
            concepts={
                "revision-topic": ConceptState("revision-topic", mastery=0.2, last_attempt_at="2026-01-01T00:00:00Z"),
                "practice-topic": ConceptState("practice-topic", mastery=0.5, last_attempt_at="2026-01-01T00:00:00Z"),
                "challenge-topic": ConceptState("challenge-topic", mastery=0.8, last_attempt_at="2026-01-01T00:00:00Z"),
            },
        )
        ranked = recommend_next(profile, now="2026-01-01T00:00:00Z")["ranking"]
        activities = {item["concept_id"]: item["activity"] for item in ranked}
        self.assertEqual(activities["revision-topic"], "revision")
        self.assertEqual(activities["practice-topic"], "practice quiz")
        self.assertEqual(activities["challenge-topic"], "challenge question")

    def test_empty_profile_has_clear_no_data_recommendation(self):
        result = recommend_next(LearnerProfile("learner"), now="2026-01-01T00:00:00Z")
        self.assertIsNone(result["concept_id"])
        self.assertIn("no data yet", result["reason"].lower())
        self.assertEqual(result["ranking"], [])

    def test_ties_are_deterministic_by_concept_id(self):
        profile = LearnerProfile(
            "learner",
            concepts={
                "zeta": ConceptState("zeta", mastery=0.3, last_attempt_at="2026-01-01T00:00:00Z"),
                "alpha": ConceptState("alpha", mastery=0.3, last_attempt_at="2026-01-01T00:00:00Z"),
            },
        )
        result = recommend_next(profile, now="2026-01-01T00:00:00Z")
        self.assertEqual(result["concept_id"], "alpha")

    def test_demo_repeated_wrong_loop_attempts_rank_loops_first(self):
        profile, recommendation = demo_result()
        self.assertEqual(profile.concepts["loops"].misconceptions["off_by_one_loop"], 3)
        self.assertEqual(recommendation["concept_id"], "loops")
        self.assertEqual(recommendation["ranking"][0]["concept_id"], "loops")

    def test_ranking_contains_every_concept(self):
        profile = update_profile(
            DEMO_PROFILE,
            DEMO_ATTEMPTS,
            now=datetime(2026, 11, 2, tzinfo=timezone.utc),
        )
        result = recommend_next(profile, now="2026-11-02T00:00:00Z")
        self.assertEqual(
            {item["concept_id"] for item in result["ranking"]},
            set(profile.concepts),
        )


if __name__ == "__main__":
    unittest.main()
