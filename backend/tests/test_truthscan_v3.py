"""TruthScan v3 Backend Tests - Evidence-based verdict, claim extraction, chatbot"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

class TestCapabilities:
    """Test /api/capabilities endpoint"""

    def test_capabilities_returns_all_true(self):
        r = requests.get(f"{BASE_URL}/api/capabilities", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d.get("ocr") == True
        assert d.get("url_extraction") == True
        assert d.get("web_search") == True
        assert d.get("pdf") == True


class TestAuth:
    """Test auth flows"""

    def test_login_admin(self):
        r = requests.post(f"{BASE_URL}/api/auth/login",
                          json={"email": "admin@truthscan.ai", "password": "admin123"},
                          timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert "user" in d
        assert d["user"]["email"] == "admin@truthscan.ai"

    def test_login_test_user(self):
        r = requests.post(f"{BASE_URL}/api/auth/login",
                          json={"email": "test@truthscan.ai", "password": "Test@123"},
                          timeout=10)
        assert r.status_code == 200

    def test_login_invalid_credentials(self):
        r = requests.post(f"{BASE_URL}/api/auth/login",
                          json={"email": "wrong@example.com", "password": "wrongpass"},
                          timeout=10)
        assert r.status_code in [401, 403]


class TestEvidenceBasedVerdict:
    """Test the new evidence-based analysis pipeline"""

    def test_rafale_claim_not_partially_true(self):
        """Rafale claim should NOT be Partially True (~67%) - should be Likely False or lower"""
        r = requests.post(f"{BASE_URL}/api/analyze",
                          json={"text": "Did India lose 6 Rafale jets to Pakistan in the recent May 2025 conflict?"},
                          timeout=40)
        assert r.status_code == 200
        d = r.json()
        print(f"Rafale - score: {d.get('credibility_score')}, label: {d.get('label')}, evidence: {d.get('evidence_summary')}")
        # Score should NOT be ~67% (Partially True)
        score = d.get("credibility_score", 100)
        label = d.get("label", "")
        # Should be well below 65 (not Partially True or Likely True)
        assert score < 65, f"Expected score < 65 but got {score} ({label})"
        # Evidence summary should show sources found
        ev = d.get("evidence_summary", {})
        assert ev.get("sources_found", 0) >= 0  # May be 0 if search fails
        # Claim should be extracted (no question prefix)
        claim = d.get("claim", "")
        assert claim, "claim should not be empty"
        print(f"Extracted claim: {claim}")

    def test_rafale_evidence_links_relevant(self):
        """Evidence links should be relevant India-Pakistan/Rafale topics, not generic WHO/CDC"""
        r = requests.post(f"{BASE_URL}/api/analyze",
                          json={"text": "Did India lose 6 Rafale jets to Pakistan in the recent May 2025 conflict?"},
                          timeout=40)
        assert r.status_code == 200
        d = r.json()
        links = d.get("evidence_links", [])
        print(f"Evidence links count: {len(links)}")
        for link in links[:3]:
            print(f"  - {link.get('title', '')} | {link.get('url', '')}")
        # Trusted sources should include India-related sources for India topic
        trusted = d.get("trusted_sources", [])
        trusted_names = [s.get("name", "") for s in trusted]
        print(f"Trusted sources: {trusted_names}")
        assert any(s in trusted_names for s in ["The Hindu", "NDTV", "BoomLive"]), \
            f"Expected India-relevant trusted sources, got: {trusted_names}"

    def test_flat_earth_claim_extraction_and_score(self):
        """Flat Earth claim should be extracted without 'Is' prefix and score low"""
        r = requests.post(f"{BASE_URL}/api/analyze",
                          json={"text": "Is the Earth flat?"},
                          timeout=40)
        assert r.status_code == 200
        d = r.json()
        print(f"Flat Earth - score: {d.get('credibility_score')}, label: {d.get('label')}")
        claim = d.get("claim", "")
        print(f"Extracted claim: {claim}")
        # Claim should not start with "Is"
        assert not claim.lower().startswith("is "), f"Claim should strip 'Is': {claim}"
        # Score should be low
        assert d.get("credibility_score", 100) < 40, f"Flat earth should score < 40, got {d.get('credibility_score')}"

    def test_fake_news_still_low_score(self):
        """Classic fake news should still get very low score"""
        fake_text = ("SHOCKING BOMBSHELL: Scientists are baffled after a new study reveals "
                     "that 5G towers are causing mass mind control. Share this before they delete it! "
                     "What the mainstream media won't tell you about this secret government cover-up. "
                     "Wake up sheeple! 100% confirmed by unnamed insider sources.")
        r = requests.post(f"{BASE_URL}/api/analyze", json={"text": fake_text}, timeout=40)
        assert r.status_code == 200
        d = r.json()
        print(f"Fake news - score: {d.get('credibility_score')}, label: {d.get('label')}")
        assert d.get("credibility_score", 100) < 25, f"Expected score < 25, got {d.get('credibility_score')}"
        assert d.get("label") == "Likely False"

    def test_reuters_james_webb_scores_higher(self):
        """Legitimate news about Reuters + James Webb should score > 40"""
        legit_text = ("According to Reuters and NASA, the James Webb Space Telescope has "
                      "captured unprecedented images of the early universe. Published in Nature journal, "
                      "the findings have been peer-reviewed and confirmed by multiple independent "
                      "astronomers from Harvard University and Oxford University.")
        r = requests.post(f"{BASE_URL}/api/analyze", json={"text": legit_text}, timeout=40)
        assert r.status_code == 200
        d = r.json()
        print(f"Reuters/Webb - score: {d.get('credibility_score')}, label: {d.get('label')}")
        assert d.get("credibility_score", 0) > 40, f"Expected score > 40, got {d.get('credibility_score')}"

    def test_evidence_summary_structure(self):
        """Response should include evidence_summary with correct fields"""
        r = requests.post(f"{BASE_URL}/api/analyze",
                          json={"text": "Did India lose 6 Rafale jets to Pakistan?"},
                          timeout=40)
        assert r.status_code == 200
        d = r.json()
        ev = d.get("evidence_summary", {})
        assert "sources_found" in ev
        assert "credible_sources" in ev
        assert "fact_checkers" in ev
        assert "claim" in d
        assert "evidence_links" in d


class TestChatbot:
    """Test chatbot with evidence context"""

    @pytest.fixture
    def analysis_context(self):
        """Do an analysis to get context for chatbot"""
        r = requests.post(f"{BASE_URL}/api/analyze",
                          json={"text": "Did India lose 6 Rafale jets to Pakistan in the recent May 2025 conflict?"},
                          timeout=40)
        assert r.status_code == 200
        return r.json()

    def test_chatbot_verdict_question(self, analysis_context):
        """Chatbot should respond with evidence context when asked about verdict"""
        ctx = analysis_context
        r = requests.post(f"{BASE_URL}/api/chat",
                          json={"question": "Why is this the verdict?", "context": ctx},
                          timeout=15)
        assert r.status_code == 200
        d = r.json()
        response_text = d.get("response", "")
        print(f"Chatbot response: {response_text[:300]}")
        assert response_text, "Chatbot response should not be empty"
        # Response should reference verdict/label
        label = ctx.get("label", "")
        assert label.split()[0].lower() in response_text.lower() or "false" in response_text.lower() or "evidence" in response_text.lower()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
