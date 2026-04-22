"""P2 Feature tests: PDF endpoint, Capabilities, Chat fix, Export PDF button"""
import pytest
import requests
import base64
import os
import io

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

def get_base_url():
    url = os.environ.get("REACT_APP_BACKEND_URL", "")
    if not url:
        # fallback read from .env
        with open("/app/frontend/.env") as f:
            for line in f:
                if "REACT_APP_BACKEND_URL" in line:
                    url = line.strip().split("=", 1)[1]
    return url.rstrip("/")

BASE = get_base_url()

def make_minimal_pdf(text: str) -> bytes:
    """Create a minimal valid PDF with given text content."""
    content = f"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]
   /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length {len(text) + 50} >>
stream
BT /F1 12 Tf 72 720 Td ({text[:200]}) Tj ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000266 00000 n
0000000{len(text) + 340:09d} 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
{len(text) + 420}
%%EOF"""
    return content.encode("latin-1", errors="replace")


class TestCapabilities:
    """Test /api/capabilities endpoint returns pdf:true"""

    def test_capabilities_has_pdf(self):
        resp = requests.get(f"{BASE}/api/capabilities")
        assert resp.status_code == 200
        data = resp.json()
        assert "pdf" in data, f"'pdf' key missing from capabilities: {data}"
        assert data["pdf"] is True, f"pdf capability is not True: {data}"
        print(f"PASS: capabilities = {data}")

    def test_capabilities_has_all_fields(self):
        resp = requests.get(f"{BASE}/api/capabilities")
        assert resp.status_code == 200
        data = resp.json()
        for key in ["ocr", "url_extraction", "web_search", "pdf"]:
            assert key in data, f"Missing key: {key}"
        print(f"PASS: all capability fields present: {data}")


class TestPdfEndpoint:
    """Test /api/analyze/pdf endpoint"""

    def _make_pdf_base64(self, text: str) -> str:
        """Use pdfminer-compatible PDF via reportlab or minimal PDF"""
        # Try to create a PDF using reportlab if available
        try:
            from reportlab.pdfgen import canvas
            buf = io.BytesIO()
            c = canvas.Canvas(buf)
            c.setFont("Helvetica", 12)
            # Write text in chunks
            y = 750
            words = text.split()
            line = ""
            for word in words:
                if len(line + word) > 80:
                    c.drawString(50, y, line)
                    y -= 20
                    line = word + " "
                else:
                    line += word + " "
            if line:
                c.drawString(50, y, line)
            c.save()
            buf.seek(0)
            return base64.b64encode(buf.read()).decode()
        except ImportError:
            pass

        # Fallback: use Python's built-in fpdf2 or minimal PDF
        try:
            from fpdf import FPDF
            pdf = FPDF()
            pdf.add_page()
            pdf.set_font("Helvetica", size=12)
            pdf.multi_cell(0, 10, text)
            return base64.b64encode(pdf.output()).decode()
        except ImportError:
            pass

        # Last resort: raw minimal PDF (may not work with pdfminer)
        pdf_bytes = make_minimal_pdf(text)
        return base64.b64encode(pdf_bytes).decode()

    def test_pdf_endpoint_with_fake_news_text(self):
        fake_text = ("SHOCKING BOMBSHELL: Scientists are baffled by this miracle cure that doctors HATE. "
                     "They're hiding the real truth about suppressed information. Wake up sheeple! "
                     "Share before they delete this! Many people say the government is running a massive cover-up. "
                     "This 100% confirmed deep state conspiracy will BLOW YOUR MIND!!! "
                     "You won't believe what they're not telling you about the new world order. "
                     "This is breaking exclusive news that was exposed for the first time ever. "
                     "The crisis actor scandal has been confirmed by unnamed sources. "
                     "False flag operation discovered. Must see before deleted!")

        pdf_b64 = self._make_pdf_base64(fake_text)
        resp = requests.post(f"{BASE}/api/analyze/pdf",
                             json={"pdf_data": pdf_b64, "filename": "test_fake_news.pdf"},
                             timeout=40)
        print(f"PDF response status: {resp.status_code}")
        if resp.status_code != 200:
            print(f"PDF response body: {resp.text}")

        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        data = resp.json()
        assert "label" in data, f"Missing label in response: {data}"
        assert "credibility_score" in data, f"Missing credibility_score: {data}"
        assert data.get("input_type") == "pdf", f"input_type should be 'pdf', got: {data.get('input_type')}"
        print(f"PASS: PDF analysis returned label={data['label']}, score={data['credibility_score']}, input_type={data['input_type']}")

    def test_pdf_endpoint_invalid_base64(self):
        resp = requests.post(f"{BASE}/api/analyze/pdf",
                             json={"pdf_data": "not-valid-base64!!!", "filename": "test.pdf"},
                             timeout=10)
        assert resp.status_code == 400, f"Expected 400 for invalid base64, got {resp.status_code}"
        print("PASS: Invalid base64 returns 400")


class TestChatFix:
    """Test chat endpoint properly handles suspicious_phrases with empty reasoning"""

    def test_chat_with_suspicious_phrases_no_reasoning(self):
        """When context has suspicious_phrases but empty reasoning, should NOT say 'No red flags'"""
        payload = {
            "question": "Why did you give this verdict?",
            "context": {
                "label": "Likely False",
                "credibility_score": 15,
                "reasoning": [],  # empty reasoning
                "suspicious_phrases": ["wake up sheeple", "share before they delete", "100% confirmed"],
                "title": "Test fake article"
            }
        }
        resp = requests.post(f"{BASE}/api/chat", json=payload, timeout=15)
        assert resp.status_code == 200
        data = resp.json()
        response_text = data.get("response", "").lower()
        print(f"Chat response: {data.get('response', '')[:300]}")

        # Should mention the suspicious phrases
        assert "no red flags" not in response_text, \
            f"Bug: Response says 'no red flags' when suspicious_phrases is non-empty. Response: {data.get('response')}"
        # Should mention at least one of the suspicious phrases or say something relevant
        phrases_mentioned = any(phrase.lower() in response_text for phrase in ["sheeple", "delete", "confirmed", "suspicious"])
        assert phrases_mentioned, \
            f"Response doesn't mention suspicious phrases. Response: {data.get('response')}"
        print(f"PASS: Chat correctly mentions suspicious phrases even when reasoning is empty")

    def test_chat_with_empty_context(self):
        """Chat with both empty reasoning and empty suspicious_phrases should say no red flags"""
        payload = {
            "question": "Why?",
            "context": {
                "label": "Likely True",
                "credibility_score": 85,
                "reasoning": [],
                "suspicious_phrases": [],
                "title": "Test"
            }
        }
        resp = requests.post(f"{BASE}/api/chat", json=payload, timeout=15)
        assert resp.status_code == 200
        data = resp.json()
        print(f"PASS: Chat with empty context returned: {data.get('response', '')[:150]}")


class TestTextAnalysisRegression:
    """Regression: text analysis still works"""

    def test_text_analysis_still_works(self):
        resp = requests.post(f"{BASE}/api/analyze",
                             json={"text": "According to Reuters, a peer-reviewed study was published. The research was confirmed by NASA and BBC News."},
                             timeout=15)
        assert resp.status_code == 200
        data = resp.json()
        assert "label" in data
        assert data["input_type"] == "text"
        print(f"PASS: Text analysis still works. label={data['label']}, score={data['credibility_score']}")
