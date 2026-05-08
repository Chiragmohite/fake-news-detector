# TruthScan — AI-Powered Fact Verification Platform

![TruthScan](https://img.shields.io/badge/TruthScan-v4.5-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-Python-green) ![React](https://img.shields.io/badge/React-18-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green) ![Deployed](https://img.shields.io/badge/Deployed-Render-purple)

> **Live Demo:** https://truthscan-frontend.onrender.com

---

## What is TruthScan?

TruthScan is a full-stack AI-powered fact-checking web application that analyzes text, URLs, images, and PDFs to determine how credible a claim is. It searches the live internet, reasons about the evidence using Groq's AI, and returns a credibility score from 0 to 100 with detailed reasoning.

Built to fight misinformation — TruthScan gives users the tools to verify news before sharing it.

---

## Live Demo

| Feature | Link |
|--------|------|
| 🌐 Frontend | https://truthscan-frontend.onrender.com |
| ⚙️ Backend API | https://truthscan-backend.onrender.com |

> **Note:** Free tier — backend may take ~30 seconds to wake up on first visit.

---

## Key Features

- **Multi-modal input** — analyze text, URLs, images (OCR), and PDF documents
- **Real-time internet search** — uses Google Custom Search API to find live evidence
- **AI reasoning** — Groq AI reads the evidence and decides if the claim is true or false
- **Smart death claim detection** — automatically detects and correctly scores false death claims about living people
- **Credibility score** — 0-100 score with label (Likely True / Likely False / Needs Verification etc.)
- **Evidence links** — shows supporting and debunking sources with direct links
- **AI chatbot** — ask follow-up questions about any fact-check result
- **User accounts** — register, login, view history and analytics dashboard
- **Consistent scoring** — results are cached so the same claim always gets the same score

---

## Tech Stack

### Frontend
- **React 18** — component-based UI
- **Tailwind CSS** — modern responsive styling
- **Recharts** — analytics dashboard charts
- **Axios** — API communication

### Backend
- **FastAPI** (Python) — high-performance REST API
- **Google Custom Search API** — real-time web search
- **Groq AI** — LLM reasoning engine (LLaMA 3.3 70B)
- **MongoDB Atlas** — cloud database for users, analyses, and cache
- **Motor** — async MongoDB driver
- **Trafilatura** — web article extraction
- **OCR.Space API** — cloud OCR for image text extraction
- **PDFMiner** — PDF text extraction
- **spaCy** — Named Entity Recognition
- **JWT** — secure authentication with access/refresh tokens

### Deployment
- **Render** — backend (Web Service) + frontend (Static Site)
- **MongoDB Atlas** — M0 free tier cloud database
- **GitHub** — CI/CD via auto-deploy on push

---

## How It Works

```
User inputs claim
       ↓
NLP analysis (suspicious language, clickbait detection)
       ↓
Named Entity Recognition (extract people, places, dates)
       ↓
Google Search (3 queries → real-time results)
       ↓
Evidence scoring (credible domains, fact-checkers, denial/confirm signals)
       ↓
Groq AI reasons about the evidence
       ↓
Python hardcap layer (death claims, negation claims, temporal claims)
       ↓
Credibility score + label + reasoning + evidence links
       ↓
Cached in MongoDB (consistent scores on repeat queries)
```

---

## Scoring System

| Score | Label |
|-------|-------|
| 80–100 | ✅ Likely True |
| 65–79 | 🟡 Partially True |
| 45–64 | ⚠️ Needs Verification |
| 25–44 | 🟠 Misleading / Missing Context |
| 0–24 | ❌ Likely False |

---

## Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Create .env file with these values:
MONGO_URL=mongodb://localhost:27017
DB_NAME=truthscan_db
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_groq_key
GOOGLE_SEARCH_API_KEY=your_google_key
GOOGLE_SEARCH_CX=your_search_engine_id
OCR_SPACE_API_KEY=your_ocr_space_key
FRONTEND_URL=http://localhost:3000

# Start server
uvicorn server:app --reload --port 8001
```

### Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps

# Create .env file with:
REACT_APP_BACKEND_URL=http://localhost:8001

# Start app
npm start
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Analyze text claim |
| POST | `/api/analyze/url` | Analyze article from URL |
| POST | `/api/analyze/image` | Analyze image via OCR |
| POST | `/api/analyze/pdf` | Analyze PDF document |
| POST | `/api/chat` | AI chatbot for follow-up questions |
| GET | `/api/history` | User's analysis history |
| GET | `/api/stats` | User analytics |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/cache/clear` | Clear result cache |

---

## Project Structure

```
fake-news-detector/
├── backend/
│   ├── server.py          # Main FastAPI application (1700+ lines)
│   ├── requirements.txt   # Python dependencies
│   └── runtime.txt        # Python version for Render
├── frontend/
│   ├── src/
│   │   ├── pages/         # LandingPage, AnalyzerPage, DashboardPage, etc.
│   │   ├── components/    # Navbar, ResultCard, ChatBot, GaugeMeter
│   │   ├── contexts/      # AuthContext (JWT auth)
│   │   └── lib/           # Utilities
│   └── public/
│       └── index.html
└── README.md
```

---

## Author

**Chirag Mohite**
- GitHub: [@Chiragmohite](https://github.com/Chiragmohite)

---

## License

MIT License — free to use and modify.
