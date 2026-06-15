<div align="center">

<img src="https://img.shields.io/badge/-%E2%9A%A1%20RAG%20Forge-7c3aed?style=for-the-badge&labelColor=0f0f0f" alt="RAG Forge" height="40"/>

# RAG Forge

### Enterprise Retrieval-Augmented Generation System

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Groq](https://img.shields.io/badge/Groq-LLaMA%203.3%2070B-F97316?style=flat-square)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

**OSC AI/ML Hackathon 2026**

[Project Overview](#project-overview) •
[Problem Statement](#problem-statement) •
[Features](#features) •
[Architecture](#architecture) •
[Tech Stack](#tech-stack) •
[Setup Instructions](#setup-instructions) •
[Team Details](#team-details)

</div>

---

# Project Overview

RAG Forge is a production-grade Retrieval-Augmented Generation (RAG) platform that transforms static document libraries into intelligent, searchable knowledge bases.

Unlike conventional document-chat applications, RAG Forge implements a complete enterprise retrieval pipeline consisting of:

- Document Ingestion
- Semantic Chunking
- BM25 Hybrid Retrieval
- Neural Re-Ranking
- Context Construction
- Groq-Powered LLM Inference
- Confidence Scoring
- Source Citations

The platform enables users to upload large document collections, organize them into collections, and retrieve accurate, grounded answers through natural language conversations.

### End-to-End Workflow

```text
Document Upload
      ↓
Document Processing
      ↓
Semantic Chunking
      ↓
BM25 Hybrid Retrieval
      ↓
Neural Re-Ranking
      ↓
Context Builder
      ↓
Groq LLaMA 3.3 70B
      ↓
Grounded Answer + Citations + Confidence Score
```

---

# Problem Statement

Organizations store large amounts of valuable information across:

- PDFs
- Technical Documentation
- Reports
- Policies
- Manuals
- Knowledge Bases

Traditional search systems often fail to provide contextual answers and frequently return irrelevant results.

The challenge is to build an intelligent Retrieval-Augmented Generation (RAG) system capable of:

- Handling large document collections
- Retrieving relevant information efficiently
- Re-ranking retrieved content for improved accuracy
- Generating grounded answers with citations
- Providing confidence metrics
- Delivering fast response times

RAG Forge solves these challenges through a complete retrieval and generation architecture optimized for quality, speed, and transparency.

---

# Features

## Core RAG Pipeline

| Component | Description |
|------------|------------|
| Document Ingestion | PDF & TXT processing |
| Semantic Chunking | Context-preserving chunk generation |
| BM25 Hybrid Retrieval | Keyword + TF-IDF + Proximity scoring |
| Neural Re-Ranking | Coverage × Density × Phrase scoring |
| LLM Synthesis | Groq LLaMA 3.3 70B |
| Source Attribution | Grounded citations |
| Confidence Scoring | Reliability estimation |

## Platform Features

- JWT Authentication
- OTP-Based Password Reset
- Collection-Based Knowledge Management
- Query History Tracking
- CSV Export Functionality
- Analytics Dashboard
- Mobile Responsive Interface
- Multi-Collection Support

## Hackathon Bonus Features

✅ Hybrid Search

✅ Streaming Responses

✅ Large PDF Support

✅ Neural Re-Ranking

✅ Confidence Scoring

✅ Pipeline Telemetry

✅ Re-Ranker Comparison Mode

✅ Query History Export

✅ Analytics Dashboard

---

# Architecture

## RAG Pipeline

```text
┌─────────────────────────────────────────────────────────┐
│                      User Query                         │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                 BM25 Hybrid Retrieval                   │
│  • BM25 Scoring                                         │
│  • TF-IDF Weighting                                     │
│  • Proximity Boosting                                   │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Neural Re-Ranking                      │
│  • Coverage Score                                       │
│  • Density Score                                        │
│  • Phrase Match Score                                   │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   Context Builder                       │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Groq LLaMA 3.3 70B Inference               │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│      Grounded Answer + Citations + Confidence Score     │
└─────────────────────────────────────────────────────────┘
```

## System Design

```text
┌─────────────────────┐
│     React Frontend  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    FastAPI Backend  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   BM25 Retrieval    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Neural Re-Ranker   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Groq LLaMA 3.3 70B │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     SQLite DB       │
└─────────────────────┘
```

---

# Tech Stack

## Frontend

- React 18
- Vite
- Tailwind CSS
- React Query
- React Router
- Recharts

## Backend

- Python 3.11
- FastAPI
- SQLAlchemy
- SQLite
- aiosqlite
- pypdf
- passlib
- bcrypt
- python-jose
- httpx

## AI & Retrieval Layer

- BM25 Retrieval Algorithm
- TF-IDF Scoring
- Neural Re-Ranking
- Groq Cloud LPU
- LLaMA 3.3 70B Versatile

## Infrastructure

- Replit Deployment
- REST APIs
- JWT Authentication

---

# Performance Metrics

| Metric | Value |
|----------|----------|
| BM25 Retrieval Time | ~350ms |
| Re-Ranking Time | ~1ms |
| LLM Response Time | ~700ms |
| End-to-End Query Time | ~1050ms |
| Confidence Score | 48–62% |

---

# Project Structure

```text
rag-forge-osc/
│
├── ragforge/
│   └── backend/
│       ├── app/
│       │
│       ├── api/
│       │   ├── rag.py
│       │   ├── documents.py
│       │   ├── collections.py
│       │   ├── auth.py
│       │   └── dashboard.py
│       │
│       ├── core/
│       │   ├── config.py
│       │   ├── database.py
│       │   └── security.py
│       │
│       ├── models/
│       │   └── models.py
│       │
│       ├── schemas/
│       │   └── schemas.py
│       │
│       ├── uploads/
│       ├── requirements.txt
│       └── .env.example
│
└── artifacts/
    └── ragforge/
        ├── src/
        │
        ├── pages/
        │   ├── LandingPage.tsx
        │   ├── DashboardPage.tsx
        │   ├── AskPage.tsx
        │   ├── ComparePage.tsx
        │   ├── CollectionsPage.tsx
        │   ├── DocumentsPage.tsx
        │   ├── HistoryPage.tsx
        │   └── SettingsPage.tsx
        │
        ├── components/
        ├── api/
        ├── hooks/
        ├── utils/
        ├── App.tsx
        └── main.tsx
```

---

# Setup Instructions

## Prerequisites

- Python 3.11+
- Node.js 20+
- pnpm
- Groq API Key

## Clone Repository

```bash
git clone https://github.com/spoorti-k-d/rag-forge-osc.git
cd rag-forge-osc
```

## Backend Setup

```bash
cd ragforge/backend

pip install -r requirements.txt

cp .env.example .env
```

Update `.env`

```env
GROQ_API_KEY=your_api_key
SECRET_KEY=your_secret_key
```

Run Backend

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

## Frontend Setup

```bash
pnpm install
```

Run Frontend

```bash
pnpm --filter @workspace/ragforge run dev
```

Open:

```text
http://localhost:18324
```

---

# Hackathon Evaluation Criteria

| Evaluation Criteria | Implementation |
|---------------------|----------------|
| Retrieval Quality | BM25 Hybrid Retrieval |
| Re-Ranking Effectiveness | Neural Re-Ranking |
| Answer Quality | Groq LLaMA 3.3 70B |
| Pipeline Observability | Telemetry Dashboard |
| Production Readiness | Authentication, Collections, Analytics |
| Hybrid Search | ✅ |
| Streaming Responses | ✅ |
| Large PDF Support | ✅ |
| Confidence Scoring | ✅ |
| Re-Ranker Comparison | ✅ |

---

# Team Details

| Name | Role | Contributions |
|--------|--------|--------|
| M. Shankar Reddy | Backend Engineer | Retrieval Engine, Re-Ranking, Groq Integration |
| G. Mounika | Backend Engineer | Authentication, APIs, Document Processing |
| D. Spoorti | Frontend Engineer | UI Development, Dashboard, Analytics, Chat Interface |

---

# Demo Link

### Live Application

https://build-checker--cse3592.replit.app/

---

# License

MIT License

---

<div align="center">

### Built with ⚡ for OSC AI/ML Hackathon 2026

**Team Eagle Eye**

</div>
