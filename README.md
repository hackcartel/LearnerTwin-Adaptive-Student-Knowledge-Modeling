<div align="center">

# LearnerTwin
### Adaptive Student Knowledge Modeling

**HackCartel · Education · Group 2 · 5 Members**

*Research ambition. Focused prototype. Evidence-based learning.*

</div>

---

## Overview

LearnerTwin is a HackCartel education research prototype that maintains an evolving, topic-wise learning profile. Each assessment adds evidence that helps the system update concept estimates and suggest the next practice activity.

**Status:** Initial project documentation. Application code, model implementation, and deployment are not included yet. Features below describe the planned prototype.

## Problem statement

> Develop a learning system that continuously updates a model of a student's knowledge, misconceptions, and retention to identify difficulties and recommend personalized learning activities.

Selected research challenge: **Continuously Updated Learner Digital Twins**.

## Initial prototype scope

Focus on **one subject and three concepts**. Start with Python fundamentals: variables and data types, conditionals, and loops. The team can agree on a different subject before implementation.

| Planned capability | Scope |
| --- | --- |
| Learner profile | Create a fictional learner profile with three concepts in one subject. |
| Topic-wise assessment | Record responses, scores, attempt timestamps, and concept associations. |
| Profile updates | Update concept-level estimates after every quiz using documented rules. |
| Learning dashboard | Show strengths, weak concepts, assessment history, and evidence behind updates. |
| Practice recommendations | Recommend the next concept or revision activity from the current profile. |

## User workflow

Create a profile → Take a quiz → Record evidence → Update concept estimates → Recommend practice → Reassess

## Five-member ownership

Replace the member labels with names and GitHub handles once responsibilities are assigned. Each owner should document interfaces needed by the other members.

| Owner | Responsibility | Initial deliverable |
| --- | --- | --- |
| Member 1 | Frontend and dashboard | Learner screens, quiz flow, concept summaries, and history views. |
| Member 2 | Backend and APIs | Profile retrieval, assessment submission, and recommendation endpoints. |
| Member 3 | Database and data design | Learners, concepts, attempts, profile snapshots, and sample records. |
| Member 4 | Modeling and recommendations | Explainable update rules, revision priorities, and recommendation reasons. |
| Member 5 | Integration and quality | Profile-update checks, end-to-end demonstrations, and documentation. |

## Proposed technical direction

- **UI:** Streamlit for the first working demonstration.
- **Logic:** Python modules with clear inputs and outputs.
- **Data:** SQLite for prototype persistence; JSON or CSV for authored sample records.
- **Evaluation:** Transparent rules first; add ML or LLM assistance only with a defined evaluation method.
- **Optional later architecture:** React frontend and FastAPI backend if the team needs separate services.

These are proposed choices, not installed dependencies. Record the final stack before adding application setup commands.

## Data plan

Store fictional learner IDs, concept IDs, question results, timestamps, concept estimates, and recommendation reasons. Preserve attempt history rather than overwriting the evidence behind a profile.

Use synthetic or consented data. Do not commit real student identities, private records, API keys, or credentials.

## Demonstration target

Run multiple quiz attempts for one fictional learner. Show how evidence changes the concept profile and practice recommendation. Keep the history visible so every update can be explained.

## Evaluation and limitations

Check that profile updates are reproducible, isolated to the correct learner, and responsive to new evidence. Review whether recommendations match the documented rules. Evaluate future-performance prediction only when suitable held-out longitudinal data exists.

A learner digital twin is an approximate knowledge model, not a complete representation of cognition. Quiz results alone do not establish long-term retention. Present early estimates as provisional and avoid unsupported psychological labels.

## Initial milestones

- [ ] Assign five owners and agree on the three concepts.
- [ ] Define the data schema and interfaces.
- [ ] Prepare sample records and expected outcomes.
- [ ] Implement the core workflow and persistence.
- [ ] Connect the interface to the core logic.
- [ ] Review outputs against expected outcomes.
- [ ] Record a short demo and document remaining limitations.

## Repository contents

| File | Purpose |
| --- | --- |
| `README.md` | Project brief, scope, responsibilities, and milestones |
| `CONTRIBUTING.md` | Branching, review, and contribution conventions |
| `GITHUB_SETUP.md` | Windows PowerShell instructions for the first upload |
| `.gitignore` | Excludes credentials, local environments, and generated files |

There is no runnable application yet. Add installation and run instructions when the first implementation is merged.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md), choose a scoped task, and open a pull request describing the change and how it was checked. Coordinate shared interfaces before implementation.

## About HackCartel

HackCartel is a community building products around problem statements and real-world problems. Members share ownership across research, development, testing, and documentation.

## License

No license has been selected yet. Add a `LICENSE` file after the repository owners agree on reuse terms.
