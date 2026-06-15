<div align="center">

<img src="https://img.shields.io/badge/-%E2%9A%A1%20RAG%20Forge-7c3aed?style=for-the-badge&labelColor=0f0f0f" alt="RAG Forge" height="40"/>

# RAG Forge
### Enterprise Retrieval-Augmented Generation System

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Groq](https://img.shields.io/badge/Groq-LLaMA%203.3%2070B-F97316?style=flat-square)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

**OSC AI/ML Hackathon 2026 · RAG Forge Theme**

[Features](#features) · [Architecture](#architecture) · [Quick Start](#quick-start) · [API Reference](#api-reference) · [Team](#team)

---

</div>

## Overview

**RAG Forge** is a production-grade Retrieval-Augmented Generation platform that transforms static document libraries into an intelligent, queryable knowledge base. Unlike naive "chat over PDFs" approaches, RAG Forge implements a full enterprise pipeline — from document ingestion through BM25 hybrid retrieval, neural re-ranking, and streamed LLM synthesis — delivering grounded, cited answers with measurable confidence scores.

```
Ingestion → Chunking → BM25 Retrieval → Neural Re-Ranking → Groq LLM → Cited Answer
```

> Built on **Groq's LPU inference** (LLaMA 3.3 70B Versatile) for sub-second LLM response times averaging **~700ms**.

---

## Features

### Core RAG Pipeline

| Component | Implementation | Details |
|-----------|---------------|---------|
| **Document Ingestion** | `pypdf` multi-strategy extraction | PDF + TXT support, handles encoded/complex PDFs |
| **Semantic Chunking** | Word-level with configurable overlap | Preserves sentence context across chunk boundaries |
| **BM25 Hybrid Retrieval** | Keyword + TF-IDF + proximity scoring | No vector DB required — pure Python, zero external dependencies |
| **Neural Re-Ranker** | Coverage × Density × Phrase scoring | Cross-encoder simulation, reorders top-k for semantic fit |
| **LLM Synthesis** | Groq Cloud LPU — LLaMA 3.3 70B | Token-by-token streaming, ~700ms avg response time |
| **Answer Citation** | Source chunk attribution | Every answer grounded with exact document references |

### Bonus Features — All Implemented ✅

- **Hybrid Search** — Keyword + semantic BM25 scoring with configurable weights
- **Streaming Responses** — Real-time token streaming via Groq Cloud LPU
- **Large PDF Support** — Multi-strategy extraction handles 100+ page documents
- **Re-Ranker Comparison** — Side-by-side answer quality: with vs. without re-ranking
- **Confidence Scoring** — Per-query confidence metric based on retrieval + rerank signals

### Platform

- **JWT Authentication** — Access + refresh tokens, OTP password reset via email
- **Collections** — Organize documents into isolated named knowledge bases
- **Pipeline Telemetry** — Per-query timing breakdown: retrieval / rerank / LLM / total
- **Query History** — Searchable history with CSV export
- **Analytics Dashboard** — KPI cards, document type breakdown, query trends
- **Mobile-Responsive UI** — Fully adaptive across phone, tablet, and desktop

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        RAG Forge Pipeline                         │
│                                                                  │
│   User Query                                                     │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  BM25 Hybrid Retrieval                                   │    │
│  │  • Term frequency scoring (BM25 algorithm)               │    │
│  │  • TF-IDF inverse document frequency weighting          │    │
│  │  • Proximity boosting for co-located query terms        │    │
│  │  Output: top-k candidate chunks                         │    │
│  └───────────────────────────┬─────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Neural Re-Ranker                                        │    │
│  │  • Coverage score  — query terms present in chunk       │    │
│  │  • Density score   — term concentration within chunk    │    │
│  │  • Phrase score    — exact multi-word phrase matches    │    │
│  │  Output: reordered chunks by semantic relevance         │    │
│  └───────────────────────────┬─────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Context Builder                                         │    │
│  │  • Format citations with source references              │    │
│  │  • Trim to token budget                                 │    │
│  │  • Construct grounded prompt                            │    │
│  └───────────────────────────┬─────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Groq LLM — LLaMA 3.3 70B Versatile                     │    │
│  │  • Streaming token generation via Groq LPU              │    │
│  │  • Grounded answer with inline source citation          │    │
│  │  • Confidence score emitted alongside answer            │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

### System Design

```
┌─────────────────┐        HTTPS/REST        ┌──────────────────────┐
│   React 18      │ ◄───────────────────────► │   FastAPI Backend     │
│   + Vite        │                           │   uvicorn / Python   │
│   + TailwindCSS │                           │                      │
│   + React Query │                           │  ┌────────────────┐  │
└─────────────────┘                           │  │  BM25 Engine   │  │
                                              │  │  Re-Ranker     │  │
                                              │  │  Groq Client   │  │
                                              │  └───────┬────────┘  │
                                              │          │           │
                                              │  ┌───────▼────────┐  │
                                              │  │  SQLite DB     │  │
                                              │  │  (aiosqlite)   │  │
                                              │  └────────────────┘  │
                                              └──────────────────────┘
```

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11 | Runtime |
| FastAPI | 0.110 | REST API framework |
| SQLAlchemy | 2.0 | Async ORM |
| SQLite + aiosqlite | — | Persistent storage |
| pypdf | 4.x | PDF text extraction |
| python-jose | — | JWT token management |
| passlib + bcrypt | — | Password hashing |
| httpx | — | Async HTTP client (Groq) |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18 | UI framework |
| Vite | 5 | Build tool + dev server |
| TailwindCSS | 3 | Utility-first styling |
| React Query | 5 | Server state management |
| React Router | v6 | Client-side routing |
| Recharts | — | Dashboard charts |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Groq Cloud LPU | LLM inference — LLaMA 3.3 70B Versatile |
| Replit | Hosting + deployment |

---

## Performance

Measured on the OSC AI/ML spec document (4 pages, 9 semantic chunks):

| Metric | Value |
|--------|-------|
| BM25 Retrieval time | ~350ms |
| Re-ranking time | ~1ms |
| LLM response time (Groq) | ~700ms |
| End-to-end query time | ~1050ms |
| Confidence score (spec queries) | 48–62% |

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+ and [pnpm](https://pnpm.io/)
- Groq API key — free at [console.groq.com](https://console.groq.com)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/spoorti-k-d/rag-forge-osc.git
cd rag-forge-osc

# 2. Install Python dependencies
cd ragforge/backend
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Open .env and set GROQ_API_KEY and SECRET_KEY

# 4. Install frontend dependencies
cd ../..
pnpm install
```

### Running Locally

Open two terminals:

```bash
# Terminal 1 — Backend API (port 8080)
cd ragforge/backend
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

```bash
# Terminal 2 — Frontend (port 18324)
pnpm --filter @workspace/ragforge run dev
```

Open **http://localhost:18324** in your browser.

### First Steps

1. Register an account at `/register`
2. Create a collection at `/collections`
3. Upload a PDF or TXT document
4. Ask questions at `/ask` — watch the RAG pipeline in action

---

## Project Structure

```
rag-forge-osc/
│
├── ragforge/
│   └── backend/
│       ├── app/
│       │   ├── api/
│       │   │   ├── rag.py           # BM25 retrieval + re-ranker + Groq streaming
│       │   │   ├── documents.py     # File upload + pypdf extraction + chunking
│       │   │   ├── collections.py   # Collection CRUD operations
│       │   │   ├── auth.py          # JWT authentication + OTP password reset
│       │   │   └── dashboard.py     # Analytics stats + activity feed
│       │   ├── core/
│       │   │   ├── config.py        # Pydantic settings (env vars)
│       │   │   ├── database.py      # Async SQLAlchemy session
│       │   │   └── security.py      # JWT helpers + bcrypt hashing
│       │   ├── models/
│       │   │   └── models.py        # SQLAlchemy ORM: User, Collection, Document, Chunk, Query
│       │   └── schemas/
│       │       └── schemas.py       # Pydantic request / response schemas
│       ├── requirements.txt
│       └── .env.example
│
└── artifacts/
    └── ragforge/                    # React + Vite frontend
        └── src/
            ├── pages/
            │   ├── LandingPage.tsx      # Public marketing page
            │   ├── DashboardPage.tsx    # KPI cards + charts
            │   ├── AskPage.tsx          # Chat + streaming sources
            │   ├── ComparePage.tsx      # With/without re-ranker
            │   ├── CollectionsPage.tsx  # Collection management
            │   ├── DocumentsPage.tsx    # File upload interface
            │   ├── HistoryPage.tsx      # Query history + CSV export
            │   └── SettingsPage.tsx     # Profile + pipeline config
            ├── api/                     # Typed API clients
            └── components/             # Shared UI components
```

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create a new user account |
| `POST` | `/api/auth/login/json` | Authenticate and receive JWT tokens |
| `POST` | `/api/auth/refresh` | Refresh an access token |
| `GET` | `/api/auth/me` | Get the current authenticated user |
| `POST` | `/api/auth/forgot-password` | Initiate OTP password reset |
| `POST` | `/api/auth/verify-otp` | Verify OTP and set new password |

### Collections & Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/collections` | List all collections |
| `POST` | `/api/collections` | Create a new collection |
| `GET` | `/api/collections/{id}` | Get collection details + chunks |
| `DELETE` | `/api/collections/{id}` | Delete a collection |
| `POST` | `/api/documents/upload` | Upload and index a PDF or TXT file |
| `GET` | `/api/documents/{id}` | Get document metadata |

### RAG Pipeline

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/rag/ask` | Submit a query through the full RAG pipeline |
| `GET` | `/api/rag/history` | Paginated query history |
| `GET` | `/api/rag/history/{id}` | Get a single query result |

**`POST /api/rag/ask` — Request body:**
```json
{
  "question": "What are the main features of RAG Forge?",
  "collection_id": "fa7a97bc7df74064",
  "top_k": 5,
  "use_reranker": true,
  "stream": false,
  "max_tokens": 512
}
```

**Response includes:** `answer`, `confidence_score`, `reranked_chunks`, `retrieval_time_ms`, `rerank_time_ms`, `llm_time_ms`, `total_time_ms`

### Dashboard & Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard/stats` | KPI stats + recent queries |
| `GET` | `/api/settings/pipeline` | Get pipeline configuration |
| `PUT` | `/api/settings/pipeline` | Update pipeline configuration |
| `GET` | `/api/settings/telemetry` | System telemetry data |

---

## Hackathon Context

**Theme:** OSC AI/ML Hackathon 2026 — RAG Forge

> *"Build an advanced Retrieval-Augmented Generation (RAG) system that can ingest large, messy document collections and answer user questions with grounded, cited, and re-ranked results."*

### Evaluation Criteria — Addressed

| Criterion | Solution |
|-----------|----------|
| Retrieval quality | BM25 hybrid: keyword + TF-IDF + proximity scoring |
| Re-ranking effectiveness | Cross-encoder simulation: coverage × density × phrase |
| Answer quality | LLaMA 3.3 70B via Groq, grounded with source citations |
| Pipeline observability | Full ms-level telemetry per query stage |
| Production readiness | Auth, collections, history, mobile UI, deployment config |
| Bonus: Hybrid search | ✅ Implemented |
| Bonus: Streaming | ✅ Real-time token streaming |
| Bonus: Large PDFs | ✅ Multi-strategy pypdf extraction |
| Bonus: Re-ranker comparison | ✅ Dedicated compare page |
| Bonus: Confidence score | ✅ Per-query confidence metric |

---

## Team

| Name | Role | Contributions |
|------|------|---------------|
| **M. Shankar Reddy** | Backend Engineer | RAG pipeline architecture, BM25 hybrid retrieval engine, neural re-ranker algorithm, Groq LLM integration, pipeline telemetry system |
| **G. Mounika** | Backend Engineer | FastAPI route handlers, document ingestion pipeline, pypdf text extraction, JWT authentication, OTP password reset, SQLAlchemy models |
| **D. Spoorti** | Frontend Engineer | React UI architecture, dashboard with KPI charts, streaming chat interface, re-ranker comparison view, query history with CSV export, mobile-responsive design |

---

## License

MIT License — OSC AI/ML Hackathon 2026

---

<div align="center">

Built with ⚡ by Team Eagle Eye · OSC Hackathon 2026

</div>
