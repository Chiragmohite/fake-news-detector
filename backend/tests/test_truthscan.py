"""TruthScan backend API tests - auth, analyze, history, stats"""
import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s

@pytest.fixture(scope="module")
def auth_session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    resp = s.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@truthscan.ai", "password": "admin123"})
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return s

# Health / public endpoints
def test_public_stats(session):
    r = session.get(f"{BASE_URL}/api/public/stats")
    assert r.status_code == 200
    data = r.json()
    assert "total_analyses" in data
    assert "fake_detected" in data
    assert "authentic_detected" in data
    assert "accuracy_rate" in data
    assert data["total_analyses"] >= 0
    print(f"Public stats: {data}")

# Auth endpoints
def test_login_admin(session):
    r = session.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@truthscan.ai", "password": "admin123"})
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == "admin@truthscan.ai"
    assert "id" in data
    print(f"Admin login OK: {data}")

def test_login_invalid(session):
    r = session.post(f"{BASE_URL}/api/auth/login", json={"email": "bad@example.com", "password": "wrong"})
    assert r.status_code == 401

def test_register_new_user():
    import random
    s = requests.Session()
    email = f"test_user_{random.randint(10000,99999)}@truthscan.ai"
    r = s.post(f"{BASE_URL}/api/auth/register", json={"email": email, "name": "Test User", "password": "Test@123"})
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == email.lower()
    assert "id" in data
    print(f"Register OK: {data}")

def test_register_duplicate(session):
    r = session.post(f"{BASE_URL}/api/auth/register", json={"email": "admin@truthscan.ai", "name": "Dup", "password": "test"})
    assert r.status_code == 400

def test_get_me_authenticated(auth_session):
    r = auth_session.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 200
    data = r.json()
    assert "email" in data
    print(f"Me: {data}")

def test_get_me_unauthenticated():
    r = requests.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 401

# Analyze endpoint
def test_analyze_guest(session):
    r = session.post(f"{BASE_URL}/api/analyze", json={"text": "Scientists have confirmed that vaccines are safe and effective according to peer-reviewed studies published in Nature."})
    assert r.status_code == 200
    data = r.json()
    assert "credibility_score" in data
    assert "label" in data
    assert "confidence" in data
    assert "suspicious_phrases" in data
    assert "reasoning" in data
    assert "trusted_sources" in data
    assert isinstance(data["credibility_score"], int)
    print(f"Analyze result: label={data['label']}, score={data['credibility_score']}, confidence={data['confidence']}")

def test_analyze_fake_content(session):
    r = session.post(f"{BASE_URL}/api/analyze", json={"text": "SHOCKING BOMBSHELL: Deep state chemtrails false flag operation crisis actor wake up sheeple they don't want you to know!!! Share before they delete!!!"})
    assert r.status_code == 200
    data = r.json()
    assert data["credibility_score"] < 50
    assert data["label"] in ["Fake", "Likely Misleading", "Likely False", "Misleading / Missing Context", "Needs Verification"]
    print(f"Fake content: label={data['label']}, score={data['credibility_score']}")

def test_analyze_empty_text(session):
    r = session.post(f"{BASE_URL}/api/analyze", json={"text": "   "})
    assert r.status_code == 400

def test_analyze_with_title_and_url(session):
    r = session.post(f"{BASE_URL}/api/analyze", json={"text": "Reuters reports that global temperatures rose by 1.5 degrees.", "title": "Climate Report", "url": "https://reuters.com/test"})
    assert r.status_code == 200
    data = r.json()
    assert data["title"] == "Climate Report"

# History - auth required
def test_history_unauthenticated():
    r = requests.get(f"{BASE_URL}/api/history")
    assert r.status_code == 401

def test_history_authenticated(auth_session):
    # First do an analysis to ensure some history
    auth_session.post(f"{BASE_URL}/api/analyze", json={"text": "Test analysis for history endpoint verification."})
    r = auth_session.get(f"{BASE_URL}/api/history")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    print(f"History count: {len(data)}")

# Stats - auth required
def test_stats_unauthenticated():
    r = requests.get(f"{BASE_URL}/api/stats")
    assert r.status_code == 401

def test_stats_authenticated(auth_session):
    r = auth_session.get(f"{BASE_URL}/api/stats")
    assert r.status_code == 200
    data = r.json()
    assert "total" in data
    assert "label_distribution" in data
    assert "recent_scores" in data
    print(f"Stats: total={data['total']}")

def test_logout(auth_session):
    r = auth_session.post(f"{BASE_URL}/api/auth/logout")
    assert r.status_code == 200
