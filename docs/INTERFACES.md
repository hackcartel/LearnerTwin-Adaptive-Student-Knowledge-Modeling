# LearnerTwin Core Interfaces

**Proposal for review**

This document defines a framework-independent contract for profile updates and
practice recommendations. It does not prescribe a UI, API, or persistence
implementation.

## Attempt record

The frontend and quiz flow produce one `Attempt` per answered question:

```json
{
  "learner_id": "demo-learner",
  "question_id": "q-loop-1",
  "concept_id": "loops",
  "correct": false,
  "timestamp": "2026-10-28T09:30:00+00:00",
  "difficulty": 2,
  "misconception_tag": "off_by_one_loop"
}
```

`timestamp` is an ISO 8601 string or a Python `datetime`; difficulty is 1, 2,
or 3 (default 2); `misconception_tag` is optional. Invalid timestamps are
skipped by profile updates. Attempts belong to exactly one `learner_id`.

## Core functions

### `update_profile(profile, attempts, now=None) -> LearnerProfile`

Takes a learner's current profile and attempt records; returns a new profile
without mutating the input. Valid attempts are applied in timestamp order,
other learners' attempts are ignored, and unknown concepts start at mastery
0.3. The previous profile state is retained as a history snapshot.

Example input (abbreviated):

```json
{
  "profile": {"learner_id": "demo-learner", "concepts": {"loops": {"mastery": 0.3}}},
  "attempts": [{"learner_id": "demo-learner", "question_id": "q1", "concept_id": "loops", "correct": true, "timestamp": "2026-10-28T09:30:00+00:00"}],
  "now": "2026-10-28T10:00:00+00:00"
}
```

Example output (abbreviated):

```json
{
  "learner_id": "demo-learner",
  "concepts": {"loops": {"concept_id": "loops", "mastery": 0.65, "confidence": 0.2, "attempts": 1, "correct": 1, "last_attempt_at": "2026-10-28T09:30:00+00:00", "misconceptions": {}}},
  "updated_at": "2026-10-28T10:00:00+00:00",
  "history": [{"learner_id": "demo-learner", "concepts": {"loops": {"mastery": 0.3}}, "updated_at": null}]
}
```

The example shows the default difficulty 2 learning rate; actual serialized
states include all `ConceptState` fields.

### `recommend_next(profile, now=None) -> dict`

Returns the selected concept, activity, numeric priority, plain-language reason,
and a full priority-ordered ranking. Equal priorities use ascending
`concept_id`. Activities are `revision`, `practice quiz`, or `challenge
question`. Empty profiles return `concept_id: null`, an explanatory "No data
yet" reason, and an empty ranking.

Example output:

```json
{
  "concept_id": "loops",
  "activity": "revision",
  "priority": 0.6233333333333333,
  "reason": "loops is prioritized because its effective mastery is 0.35, it was last practiced 7.0 days ago, and it has 2 tagged misconception(s).",
  "ranking": [{"concept_id": "loops", "activity": "revision", "priority": 0.6233333333333333, "reason": "loops is prioritized because its effective mastery is 0.35, it was last practiced 7.0 days ago, and it has 2 tagged misconception(s)."}]
}
```

## Persistence responsibilities

The database implementation should store:

- **learners:** `learner_id` (primary key), creation/update timestamps.
- **concepts:** `concept_id` (primary key), name/subject metadata.
- **attempts:** `attempt_id` (primary key), `learner_id`, `question_id`,
  `concept_id`, `correct`, `timestamp`, `difficulty`, `misconception_tag`.
- **profile snapshots:** `snapshot_id` (primary key), `learner_id`,
  `updated_at`, serialized concept states (mastery, confidence, attempts,
  correct, last attempt, misconception counts). Keep prior snapshots; do not
  overwrite historical evidence.

Enforce learner ownership for attempts and profiles; preserve attempt records
as the source evidence used to rebuild or audit estimates.

## Ownership

- **Frontend and quiz flow:** create well-formed `Attempt` records and display
  recommendation reasons.
- **Modeling:** own update and recommendation rules, deterministic behavior,
  and explanatory outputs.
- **Database/data design:** own persistence, schema, integrity, and snapshot
  retention; do not move modeling rules into storage.
- **Integration and quality:** validate serialized contracts, wire callers to
  core functions, and maintain representative tests.
