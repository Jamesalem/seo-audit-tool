import os
import tempfile
import pytest
from app import create_app
from services.pdf_service import generate_pdf_report

@pytest.fixture
def client(tmp_path, monkeypatch):
    # Point results to a temp dir
    monkeypatch.setenv('FLASK_ENV', 'testing')
    app = create_app()
    app.config['TESTING'] = True
    app.config['JSONIFY_PRETTYPRINT_REGULAR'] = False

    # override results dir in current_app.root_path/results
    monkeypatch.chdir(tmp_path)  # so root_path/results is under tmp_path

    with app.test_client() as c:
        yield c

def test_healthz(client):
    resp = client.get('/healthz')
    assert resp.status_code == 200
    assert resp.json == {"status": "ok"}

def test_interpret_endpoint(client, monkeypatch):
    # stub OpenAI
    class Dummy:
        def __init__(self, **_): pass
        def chat(self): pass
    # ... you’d monkeypatch your OpenAI client here ...
    resp = client.post('/api/interpret', json={"categories": {}, "audits": {}})
    assert resp.status_code == 200
    assert "summary" in resp.json
