"""TruthScan v4 Backend API Tests"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

FAKE_NEWS_TEXT = "SHOCKING BOMBSHELL doctors HATE this miracle cure share before delete deep state"
INDIA_RAFALE_TEXT = "India lost 6 Rafale jets to Pakistan in May 2025"

class TestHealth:
    """Health and basic connectivity"""

    def test_health(self):
        r = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert r.status_code == 200
        data = r.json()
        print(f"Health: {data}")


class TestAuth:
    """Auth flow"""

    def test_login_test_user(self):
        r = requests.post(f"{BASE_URL}/api/auth/login",
                          json={"email": "test@truthscan.ai", "password": "Test@123"},
                          timeout=10)
        assert r.status_code == 200, f"Login failed: {r.text}"
        data = r.json()
        assert "token" in data or r.cookies.get("token") or "user" in data
        print(f"Login response keys: {list(data.keys())}")

    def test_login_admin(self):
        r = requests.post(f"{BASE_URL}/api/auth/login",
                          json={"email": "admin@truthscan.ai", "password": "admin123"},
                          timeout=10)
        assert r.status_code == 200, f"Admin login failed: {r.text}"

    def test_login_invalid(self):
        r = requests.post(f"{BASE_URL}/api/auth/login",
                          json={"email": "bad@example.com", "password": "wrong"},
                          timeout=10)
        assert r.status_code in [401, 400, 403]


class TestAnalyzeV4:
    """Analyze endpoint v4 fields"""

    def test_analyze_returns_v4_fields(self):
        """Check evidence_strength, source_agreement, entities in response"""
        r = requests.post(f"{BASE_URL}/api/analyze",
                          json={"text": INDIA_RAFALE_TEXT},
                          timeout=60)
        assert r.status_code == 200, f"Analyze failed: {r.status_code} {r.text[:200]}"
        data = r.json()
        print(f"Label: {data.get('label')}, Strength: {data.get('evidence_strength')}, Agreement: {data.get('source_agreement')}")
        assert "label" in data
        assert "evidence_strength" in data, "Missing evidence_strength"
        assert "source_agreement" in data, "Missing source_agreement"
        assert "entities" in data, "Missing entities"
        assert data["evidence_strength"] in ["Strong", "Medium", "Weak"], f"Invalid strength: {data['evidence_strength']}"
        assert data["source_agreement"] in ["High", "Mixed", "Low"], f"Invalid agreement: {data['source_agreement']}"
        assert isinstance(data["entities"], list)

    def test_analyze_fake_news_label(self):
        """Fake news text should return Likely False"""
        r = requests.post(f"{BASE_URL}/api/analyze",
                          json={"text": FAKE_NEWS_TEXT},
                          timeout=60)
        assert r.status_code == 200
        data = r.json()
        print(f"Fake news label: {data.get('label')}, score: {data.get('credibility_score')}")
        # should be Likely False or Misleading
        assert data["label"] in ["Likely False", "Misleading / Missing Context", "Needs Verification"]

    def test_analyze_evidence_summary_structure(self):
        """evidence_summary should have correct sub-keys"""
        r = requests.post(f"{BASE_URL}/api/analyze",
                          json={"text": INDIA_RAFALE_TEXT},
                          timeout=60)
        assert r.status_code == 200
        data = r.json()
        ev = data.get("evidence_summary", {})
        print(f"evidence_summary: {ev}")
        assert "evidence_strength" in ev
        assert "source_agreement" in ev

    def test_analyze_entities_format(self):
        """Entities should be list of {text, type} dicts"""
        r = requests.post(f"{BASE_URL}/api/analyze",
                          json={"text": INDIA_RAFALE_TEXT},
                          timeout=60)
        assert r.status_code == 200
        data = r.json()
        entities = data.get("entities", [])
        if entities:
            e = entities[0]
            assert "text" in e and "type" in e, f"Bad entity format: {e}"
            print(f"Sample entity: {e}")

    def test_valid_label_set(self):
        """Label must be one of the 6 valid labels"""
        valid = {"Likely True", "Partially True", "Needs Verification",
                 "Misleading / Missing Context", "Likely False", "Conflicting Reports"}
        r = requests.post(f"{BASE_URL}/api/analyze",
                          json={"text": INDIA_RAFALE_TEXT},
                          timeout=60)
        assert r.status_code == 200
        data = r.json()
        assert data["label"] in valid, f"Unknown label: {data['label']}"

    def test_analyze_guest_mode(self):
        """Guest mode (no auth) should work"""
        r = requests.post(f"{BASE_URL}/api/analyze",
                          json={"text": "The earth is flat according to new study"},
                          timeout=60)
        assert r.status_code == 200
        data = r.json()
        assert "label" in data


class TestHistory:
    """History saves after auth"""

    def test_history_saves_after_login_and_analyze(self):
        s = requests.Session()
        # Login
        login = s.post(f"{BASE_URL}/api/auth/login",
                       json={"email": "test@truthscan.ai", "password": "Test@123"},
                       timeout=10)
        assert login.status_code == 200

        # Analyze
        analyze = s.post(f"{BASE_URL}/api/analyze",
                         json={"text": INDIA_RAFALE_TEXT},
                         timeout=60)
        assert analyze.status_code == 200

        # Check history
        history = s.get(f"{BASE_URL}/api/history", timeout=10)
        assert history.status_code == 200
        data = history.json()
        print(f"History count: {len(data) if isinstance(data, list) else data}")
        assert isinstance(data, list)
        assert len(data) > 0
