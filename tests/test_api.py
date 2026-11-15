import os
import tempfile
from pathlib import Path

from fastapi.testclient import TestClient
from app import main
from app.engine import PRIOR, update_mastery


def test_bkt_direction():
    assert update_mastery(PRIOR, True) > PRIOR
    assert update_mastery(PRIOR, False) < PRIOR


def test_end_to_end(tmp_path, monkeypatch):
    monkeypatch.setattr(main, 'DB_PATH', tmp_path / 'test.db')
    with TestClient(main.app) as client:
        learner = client.post('/learners', json={'nickname': 'Synthetic learner'}).json()['learner_id']
        baseline = client.get(f'/learners/{learner}/profile').json()
        assert all(c['attempts'] == 0 for c in baseline['concepts'])
        questions = client.get('/questions').json()
        assert 'answer' not in questions[0]
        result = client.post(f'/learners/{learner}/assessments', json={'answers': [
            {'question_id': 'v1', 'selected_answer': 'int'},
            {'question_id': 'l1', 'selected_answer': '2'}]}).json()
        assert result['results'][0]['correct'] is True
        assert result['results'][1]['misconception_tag'] == 'range_bounds'
        assert len(client.get(f'/learners/{learner}/history').json()) == 2
        assert client.get(f'/learners/{learner}/misconceptions').json()['signals'][0]['occurrences'] == 1
        wrong = client.post(f'/learners/{learner}/assessments', json={'answers': [
            {'question_id': 'not-a-question', 'selected_answer': 'int'}]})
        assert wrong.status_code == 422
        assert len(client.get(f'/learners/{learner}/history').json()) == 2
        other = client.post('/learners', json={'nickname': 'Another synthetic learner'}).json()['learner_id']
        assert client.get(f'/learners/{other}/history').json() == []
