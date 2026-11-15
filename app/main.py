"""LearnerTwin MVP — FastAPI + SQLite with a small, server-graded question bank."""
import json
import os
import sqlite3
from contextlib import asynccontextmanager, contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from .engine import PRIOR, recommendation, update_mastery

DB_PATH = Path(os.environ.get('LEARNERTWIN_DB', str(Path(__file__).resolve().parents[1] / 'learnertwin.db')))
CONCEPTS = {
    'variables': 'Variables and data types',
    'conditionals': 'Conditionals',
    'loops': 'Loops',
}
# Correct answers are kept server-side, never returned from GET /questions.
QUESTIONS = {
    'v1': {'concept_id': 'variables', 'prompt': 'What is the type of 7 in Python?',
           'options': ['int', 'str', 'float'], 'answer': 'int', 'misconception': 'numeric_type_confusion'},
    'v2': {'concept_id': 'variables', 'prompt': 'Which statement assigns 4 to x?',
           'options': ['x == 4', 'x = 4', '4 == x'], 'answer': 'x = 4', 'misconception': 'assignment_vs_equality'},
    'c1': {'concept_id': 'conditionals', 'prompt': 'What keyword introduces an alternative branch?',
           'options': ['elif', 'repeat', 'def'], 'answer': 'elif', 'misconception': 'branch_syntax'},
    'c2': {'concept_id': 'conditionals', 'prompt': 'Which operator compares two values?',
           'options': ['=', '==', '+='], 'answer': '==', 'misconception': 'assignment_vs_equality'},
    'l1': {'concept_id': 'loops', 'prompt': 'How many values are produced by range(3)?',
           'options': ['2', '3', '4'], 'answer': '3', 'misconception': 'range_bounds'},
    'l2': {'concept_id': 'loops', 'prompt': 'Which keyword exits a loop immediately?',
           'options': ['break', 'pass', 'continue'], 'answer': 'break', 'misconception': 'loop_control'},
}

@contextmanager
def db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH, timeout=30)
    connection.row_factory = sqlite3.Row
    connection.execute('PRAGMA foreign_keys=ON')
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def initialize():
    with db() as conn:
        conn.executescript('''
        CREATE TABLE IF NOT EXISTS learners (
            id TEXT PRIMARY KEY, nickname TEXT NOT NULL, created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS mastery (
            learner_id TEXT NOT NULL REFERENCES learners(id),
            concept_id TEXT NOT NULL, estimate REAL NOT NULL,
            attempts INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (learner_id, concept_id)
        );
        CREATE TABLE IF NOT EXISTS attempts (
            id TEXT PRIMARY KEY, learner_id TEXT NOT NULL REFERENCES learners(id),
            question_id TEXT NOT NULL, concept_id TEXT NOT NULL,
            selected_answer TEXT NOT NULL, correct INTEGER NOT NULL,
            misconception_tag TEXT, mastery_before REAL NOT NULL,
            mastery_after REAL NOT NULL, created_at TEXT NOT NULL
        );
        ''')

@asynccontextmanager
async def lifespan(_app: FastAPI):
    initialize()
    yield

app = FastAPI(title='LearnerTwin Learning Intelligence API', version='0.1.0', lifespan=lifespan)

class LearnerCreate(BaseModel):
    nickname: str = Field(min_length=1, max_length=80)

class Answer(BaseModel):
    question_id: str
    selected_answer: str

class AssessmentSubmit(BaseModel):
    answers: list[Answer] = Field(min_length=1, max_length=30)


def assert_learner(conn, learner_id: str):
    record = conn.execute('SELECT id, nickname FROM learners WHERE id=?', (learner_id,)).fetchone()
    if not record:
        raise HTTPException(404, 'Learner not found')
    return dict(record)


def concept_profile(conn, learner_id: str):
    rows = conn.execute('SELECT concept_id, estimate, attempts FROM mastery WHERE learner_id=?', (learner_id,)).fetchall()
    return [{'concept_id': row['concept_id'], 'name': CONCEPTS[row['concept_id']],
             'mastery': row['estimate'], 'attempts': row['attempts'],
             'evidence_status': 'no_evidence' if not row['attempts'] else 'provisional'} for row in rows]

@app.get('/health')
def health():
    return {'status': 'ok', 'model': 'fixed_parameter_bkt_v1'}

@app.get('/concepts')
def concepts():
    return [{'id': identifier, 'name': name} for identifier, name in CONCEPTS.items()]

@app.get('/questions')
def questions(concept_id: str | None = None):
    if concept_id is not None and concept_id not in CONCEPTS:
        raise HTTPException(404, 'Unknown concept')
    return [{'id': key, 'concept_id': item['concept_id'], 'prompt': item['prompt'],
             'options': item['options']} for key, item in QUESTIONS.items()
            if concept_id is None or item['concept_id'] == concept_id]

@app.post('/learners', status_code=201)
def create_learner(payload: LearnerCreate):
    learner_id = str(uuid4())
    with db() as conn:
        conn.execute('INSERT INTO learners VALUES (?, ?, ?)', (learner_id, payload.nickname, datetime.now(timezone.utc).isoformat()))
        conn.executemany('INSERT INTO mastery VALUES (?, ?, ?, ?)',
                         [(learner_id, concept_id, PRIOR, 0) for concept_id in CONCEPTS])
    return {'learner_id': learner_id, 'nickname': payload.nickname}

@app.get('/learners/{learner_id}/profile')
def profile(learner_id: str):
    with db() as conn:
        learner = assert_learner(conn, learner_id)
        return {'learner': learner, 'concepts': concept_profile(conn, learner_id),
                'model': 'fixed_parameter_bkt_v1',
                'disclaimer': 'Estimates are provisional, not validated probabilities of student knowledge.'}

@app.post('/learners/{learner_id}/assessments')
def submit_assessment(learner_id: str, payload: AssessmentSubmit):
    # Pre-validate the full batch, avoiding partial changes on an invalid answer.
    for answer in payload.answers:
        question = QUESTIONS.get(answer.question_id)
        if question is None:
            raise HTTPException(422, f'Unknown question: {answer.question_id}')
        if answer.selected_answer not in question['options']:
            raise HTTPException(422, f'Invalid answer option for {answer.question_id}')
    results = []
    with db() as conn:
        assert_learner(conn, learner_id)
        for answer in payload.answers:
            question = QUESTIONS[answer.question_id]
            concept_id = question['concept_id']
            row = conn.execute('SELECT estimate, attempts FROM mastery WHERE learner_id=? AND concept_id=?',
                               (learner_id, concept_id)).fetchone()
            before = float(row['estimate'])
            correct = answer.selected_answer == question['answer']
            after = update_mastery(before, correct)
            tag = None if correct else question['misconception']
            now = datetime.now(timezone.utc).isoformat()
            conn.execute('UPDATE mastery SET estimate=?, attempts=? WHERE learner_id=? AND concept_id=?',
                         (after, row['attempts'] + 1, learner_id, concept_id))
            conn.execute('INSERT INTO attempts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                         (str(uuid4()), learner_id, answer.question_id, concept_id,
                          answer.selected_answer, int(correct), tag, before, after, now))
            results.append({'question_id': answer.question_id, 'concept_id': concept_id,
                            'correct': correct, 'misconception_tag': tag,
                            'mastery_before': before, 'mastery_after': after})
        snapshot = concept_profile(conn, learner_id)
    return {'results': results, 'profile': snapshot, 'recommendation': recommendation(snapshot)}

@app.get('/learners/{learner_id}/recommendation')
def get_recommendation(learner_id: str):
    with db() as conn:
        assert_learner(conn, learner_id)
        return recommendation(concept_profile(conn, learner_id))

@app.get('/learners/{learner_id}/history')
def history(learner_id: str):
    with db() as conn:
        assert_learner(conn, learner_id)
        rows = conn.execute('''SELECT id, question_id, concept_id, correct,
            misconception_tag, mastery_before, mastery_after, created_at
            FROM attempts WHERE learner_id=? ORDER BY created_at, rowid''', (learner_id,)).fetchall()
        return [dict(row) for row in rows]

@app.get('/learners/{learner_id}/misconceptions')
def misconceptions(learner_id: str):
    with db() as conn:
        assert_learner(conn, learner_id)
        rows = conn.execute('''SELECT misconception_tag, COUNT(*) AS occurrences
            FROM attempts WHERE learner_id=? AND misconception_tag IS NOT NULL
            GROUP BY misconception_tag ORDER BY occurrences DESC, misconception_tag''', (learner_id,)).fetchall()
        return {'signals': [dict(row) for row in rows],
                'disclaimer': 'Tags describe incorrect responses, not proven misconceptions.'}
