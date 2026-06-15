# RAG Forge — Enterprise Retrieval-Augmented Generation System

<div align="center">

![RAG Forge](https://img.shields.io/badge/RAG%20Forge-Enterprise%20AI-7c3aed?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.11-3776ab?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react)
![Groq](https://img.shields.io/badge/Groq-LLaMA%203.3%2070B-f97316?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi)

**Built for the OSC AI/ML Hackathon · RAG Forge Theme**

</div>

---

## Team

| Name | Role |
|------|------|
| **M. Shankar Reddy** | Backend — RAG pipeline, BM25 retrieval, re-ranker, Groq LLM integration |
| **G. Mounika** | Backend — FastAPI routes, document ingestion, auth, database models |
| **D. Spoorti** | Frontend — React UI, dashboard, streaming interface, mobile responsiveness |

---

## What is RAG Forge?

RAG Forge is a **production-grade Retrieval-Augmented Generation (RAG) system** that ingests document libraries, retrieves relevant chunks using BM25 hybrid search, re-ranks results for semantic relevance, and delivers grounded, cited answers powered by **Groq's LPU inference** (LLaMA 3.3 70B).

> *"Replace naive LLM-over-PDFs with a real RAG pipeline: chunking → retrieval → re-ranking → cited answers."*

---

## Features

### Core RAG Pipeline
- **Document Ingestion** — Upload PDFs and TXT files; automatic text extraction via `pypdf`
- **Semantic Chunking** — Word-level chunking with configurable size and overlap
- **BM25 Hybrid Retrieval** — Keyword scoring + TF-IDF + proximity boosting; no vector DB required
- **Neural Re-Ranker** — Cross-encoder simulation using coverage × density × phrase scoring
- **Streaming LLM Answers** — Real-time token streaming via Groq Cloud (LLaMA 3.3 70B Versatile)
- **Cited Sources** — Every answer references exact document chunks

### Bonus Features (All Implemented ✅)
- **Hybrid Search** — Keyword + semantic BM25 with adjustable weights
- **Streaming Response** — Token-by-token streaming in the Ask AI interface
- **Large PDF Support** — Multi-strategy extraction handles complex and encoded PDFs
- **With/Without Re-Ranker Comparison** — Side-by-side answer quality comparison
- **Confidence Score** — Per-query confidence based on retrieval and re-ranking metrics

### Platform Features
- **JWT Auth** — Secure login with access + refresh tokens, OTP password reset
- **Collections** — Organize documents into named knowledge bases
- **Query History** — Full history with CSV export and search
- **Pipeline Telemetry** — Per-query timing: retrieval ms, rerank ms, LLM ms, total ms
- **Dashboard** — KPI cards, charts, recent activity
- **Settings** — Profile management, pipeline config, system telemetry
- **Mobile-Responsive UI** — Fully responsive across phone, tablet, desktop

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TailwindCSS + React Query + React Router v6 |
| Backend | Python FastAPI + SQLAlchemy + SQLite (aiosqlite) |
| LLM | Groq Cloud LPU — LLaMA 3.3 70B Versatile |
| Retrieval | BM25 Hybrid (keyword + TF-IDF + proximity scoring) |
| Re-Ranker | Cross-encoder simulation (coverage × density × phrase) |
| Auth | JWT (access + refresh tokens) + OTP email reset |
| PDF Extraction | pypdf multi-strategy text extraction |

---

## Architecture

```
User Query
    │
    ▼
┌─────────────────┐
│  BM25 Retrieval │  ← keyword + TF-IDF + proximity scoring
│  top-k chunks   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Neural Reranker│  ← coverage × density × phrase match
│  reorder chunks │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Context Builder│  ← format citations, trim to token limit
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Groq LLM       │  ← LLaMA 3.3 70B, streaming, grounded answer
│  Cited Answer   │
└─────────────────┘
```

---

## Setup & Run

### Prerequisites
- Python 3.11+
- Node.js 20+ and pnpm
- [Groq API Key](https://console.groq.com/) (free tier available)

### 1. Clone the repo
```bash
git clone https://github.com/spoorti-k-d/rag-forge-osc.git
cd rag-forge-osc
```

### 2. Install Python dependencies
```bash
cd ragforge/backend
pip install -r requirements.txt
```

### 3. Configure environment
```bash
cp ragforge/backend/.env.example ragforge/backend/.env
# Edit .env and set your GROQ_API_KEY
```

### 4. Install frontend dependencies
```bash
pnpm install
```

### 5. Start both services

**Backend (Terminal 1):**
```bash
cd ragforge/backend
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

**Frontend (Terminal 2):**
```bash
pnpm --filter @workspace/ragforge run dev
```

Open `http://localhost:18324`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login/json` | Login, get JWT tokens |
| GET | `/api/collections` | List collections |
| POST | `/api/collections` | Create collection |
| POST | `/api/documents/upload` | Upload PDF/TXT |
| POST | `/api/rag/ask` | Ask a question (full RAG pipeline) |
| GET | `/api/rag/history` | Query history |
| GET | `/api/dashboard/stats` | Dashboard KPIs |
| GET | `/api/settings/pipeline` | Pipeline configuration |

---

## Project Structure

```
rag-forge-osc/
├── ragforge/
│   └── backend/
│       ├── app/
│       │   ├── api/
│       │   │   ├── rag.py          # BM25 + reranker + Groq streaming
│       │   │   ├── documents.py    # Upload + pypdf extraction + chunking
│       │   │   ├── collections.py  # Collection CRUD
│       │   │   ├── auth.py         # JWT + OTP password reset
│       │   │   └── dashboard.py    # Analytics + activity feed
│       │   ├── core/               # DB, security, config
│       │   ├── models/             # SQLAlchemy ORM models
│       │   └── schemas/            # Pydantic request/response schemas
│       ├── requirements.txt
│       └── .env.example
└── artifacts/
    └── ragforge/
        └── src/
            ├── pages/              # React page components
            ├── api/                # Frontend API clients
            └── components/         # Shared UI components
```

---

## Hackathon Theme

Built for the **OSC AI/ML Hackathon — RAG Forge Theme**:

> *Build an advanced Retrieval-Augmented Generation (RAG) system that can ingest large, messy document collections and answer user questions with grounded, cited, and re-ranked results.*

### Evaluation Criteria — All Addressed ✅

| Criterion | Implementation |
|-----------|---------------|
| Retrieval Quality | BM25 hybrid search with proximity scoring |
| Re-Ranking | Cross-encoder simulation improves answer relevance |
| Answer Quality | Groq LLaMA 3.3 70B with citation grounding |
| Pipeline Observability | Full per-query telemetry (ms breakdowns) |
| Production Readiness | Auth, collections, history, mobile-responsive UI |
| Bonus: Hybrid search | ✅ Keyword + TF-IDF |
| Bonus: Streaming | ✅ Token-by-token via Groq |
| Bonus: Large PDFs | ✅ pypdf multi-strategy extraction |
| Bonus: Re-ranker comparison | ✅ Compare page built |
| Bonus: Confidence score | ✅ Per-query confidence metric |

---

## License

MIT — OSC AI/ML Hackathon 2026
