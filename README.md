# LearnerTwin — AI/ML FastAPI Starter

A first working backend for the three-concept Python fundamentals prototype. No external AI model or API key required.

## Run on Windows (PowerShell)

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Open http://127.0.0.1:8000/docs to try the API interactively.

## Core endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Service health |
| GET | `/concepts` | Three concept IDs |
| GET | `/questions` | Safe question list without answer keys |
| POST | `/learners` | Create fictional learner `{"nickname":"Demo"}` |
| GET | `/learners/{learner_id}/profile` | Concept knowledge estimates |
| POST | `/learners/{learner_id}/assessments` | Submit question IDs and option answers |
| GET | `/learners/{learner_id}/recommendation` | Next practice concept with reason |
| GET | `/learners/{learner_id}/history` | Full evidence history |
| GET | `/learners/{learner_id}/misconceptions` | Error tags, not definitive diagnoses |

Example assessment request:

```json
{"answers":[{"question_id":"v1","selected_answer":"int"},{"question_id":"l1","selected_answer":"2"}]}
```

## ML behavior and limitations

`app/engine.py` implements a fixed-parameter Bayesian Knowledge Tracing rule:
- Prior mastery: 0.25
- Learning probability per attempt: 0.12
- Guess probability: 0.20
- Slip probability: 0.10

These parameters are **illustrative assumptions**, not trained or calibrated. A correct answer updates the estimate upward; an incorrect answer generally updates it downward. The recommendation targets the lowest estimated mastery and explains why. The misconception endpoint shows tags tied to incorrectly answered questions, not a psychological diagnosis. Learning curves and retention predictions require repeated real observations and held-out evaluation. Quizzes and answer keys are coded server-side for the prototype.

## Tests

```powershell
python -m pytest -q
```

## Integration notes

- Another teammate can replace the SQLite access layer with their database implementation while maintaining these contracts.
- This MVP does not include authentication, rate limiting, or production access control. **Do not deploy with real student data.**
- Next: calibration dataset, per-question difficulty metadata, time-aware revision scheduling, learner identity/access controls, and benchmarking against static rule baselines.
