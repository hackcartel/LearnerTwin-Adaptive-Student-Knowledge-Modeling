# LearnerTwin

LearnerTwin is an adaptive learning prototype with a React frontend and a FastAPI backend. The backend uses a fixed-parameter Bayesian Knowledge Tracing model and SQLite; no external AI model or API key is required for the learning flow.

## Run locally on Windows

Start the backend in one PowerShell terminal:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

In another terminal, install the frontend dependencies and start Vite:

```powershell
npm install
npm run dev
```

The frontend runs at http://127.0.0.1:3000 and the interactive API documentation is at http://127.0.0.1:8000/docs. Set `VITE_API_BASE_URL` in `.env.local` to override the backend URL; it defaults to `http://127.0.0.1:8000`.

## Tests and checks

```powershell
py -m pytest -q
npm run lint
npm run build
```

## Backend API

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Service health |
| GET | `/concepts` | Available concept IDs |
| GET | `/questions` | Questions without answer keys; accepts `concept_id` filter |
| GET | `/learners` | List learner profiles |
| POST | `/learners` | Create a learner |
| GET | `/learners/{learner_id}/profile` | Concept mastery estimates |
| POST | `/learners/{learner_id}/assessments` | Submit answers |
| GET | `/learners/{learner_id}/recommendation` | Next-practice recommendation |
| GET | `/learners/{learner_id}/history` | Assessment evidence history |
| GET | `/learners/{learner_id}/misconceptions` | Incorrect-response tags |

## Model limitations

`app/engine.py` implements an illustrative, fixed-parameter BKT rule. Its parameters are not trained or calibrated, so mastery estimates are provisional and should not be treated as validated probabilities. Misconception tags describe incorrect answers, not diagnoses. This prototype does not include authentication, rate limiting, or production access controls; do not use it with real student data.
