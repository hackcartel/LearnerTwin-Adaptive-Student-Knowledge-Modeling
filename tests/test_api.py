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
        preflight = client.options('/learners', headers={
            'Origin': 'http://localhost:3000',
            'Access-Control-Request-Method': 'POST',
        })
        assert preflight.status_code == 200
        assert preflight.headers['access-control-allow-origin'] == 'http://localhost:3000'
        created = client.post('/learners', json={
            'nickname': 'Synthetic learner',
            'learning_track': 'Python Foundations',
            'goal': 'Practice loops',
        }).json()
        learner = created['learner_id']
        assert created['learning_track'] == 'Python Foundations'
        assert created['goal'] == 'Practice loops'
        listed = client.get('/learners').json()
        assert any(
            item['id'] == learner
            and item['nickname'] == 'Synthetic learner'
            and item['learning_track'] == 'Python Foundations'
            and item['goal'] == 'Practice loops'
            for item in listed
        )
        baseline = client.get(f'/learners/{learner}/profile').json()
        assert all(c['attempts'] == 0 for c in baseline['concepts'])
        assert baseline['assessments_completed'] == 0
        questions = client.get('/questions').json()
        assert 'answer' not in questions[0]
        assert [q['id'] for q in client.get('/questions', params={'concept_id': 'variables'}).json()] == ['v1', 'v2']
        result = client.post(f'/learners/{learner}/assessments', json={'answers': [
            {'question_id': 'v1', 'selected_answer': 'int'},
            {'question_id': 'l1', 'selected_answer': '2'}]}).json()
        assert result['results'][0]['correct'] is True
        assert result['results'][0]['correct_answer'] == 'int'
        assert result['results'][0]['prompt']
        assert result['results'][1]['misconception_tag'] == 'range_bounds'
        variables = next(c for c in result['profile'] if c['concept_id'] == 'variables')
        assert variables['attempts'] == 1
        assert variables['correct_count'] == 1
        history = client.get(f'/learners/{learner}/history').json()
        assert len(history) == 2
        assert history[0]['prompt']
        assert history[0]['selected_answer']
        updated_profile = client.get(f'/learners/{learner}/profile').json()
        assert updated_profile['assessments_completed'] == 1
        assert updated_profile['concepts_assessed'] == 2
        assert updated_profile['overall_mastery'] is not None
        assert client.get(f'/learners/{learner}/recommendation').json()['concept_id']
        signal = client.get(f'/learners/{learner}/misconceptions').json()['signals'][0]
        assert signal['occurrences'] == 1
        assert signal['concept_id'] == 'loops'
        assert signal['last_observed_at']
        wrong = client.post(f'/learners/{learner}/assessments', json={'answers': [
            {'question_id': 'not-a-question', 'selected_answer': 'int'}]})
        assert wrong.status_code == 422
        assert len(client.get(f'/learners/{learner}/history').json()) == 2
        other = client.post('/learners', json={'nickname': 'Another synthetic learner'}).json()['learner_id']
        assert client.get(f'/learners/{other}/history').json() == []
