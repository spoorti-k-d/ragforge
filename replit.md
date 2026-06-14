# RAG Forge

Enterprise RAG system with BM25 hybrid retrieval, neural re-ranking, streaming LLM answers via Groq, and full pipeline telemetry.

## Run & Operate

- `artifacts/api-server: API Server` — Python FastAPI backend (uvicorn, port 8080, auto-reload)
- `artifacts/ragforge: web` — React/Vite frontend (port 18324)
- `artifacts/mockup-sandbox: Component Preview Server` — Canvas design sandbox

## Stack

- **Frontend**: React 18 + Vite + TailwindCSS + React Query + React Router v6
- **Backend**: Python FastAPI + SQLAlchemy + SQLite (aiosqlite)
- **Retrieval**: BM25 Hybrid (keyword + TF-IDF + proximity scoring)
- **Re-Ranker**: Cross-encoder simulation (coverage + density + phrase scoring)
- **LLM**: Groq Cloud LPU — LLaMA 3.3 70B Versatile
- **Auth**: JWT (access + refresh tokens) + OTP password reset

## Where things live

- `ragforge/backend/` — Python FastAPI app
- `ragforge/backend/app/api/rag.py` — BM25 retrieval + reranking + Groq streaming
- `ragforge/backend/app/api/dashboard.py` — Analytics stats and activity
- `ragforge/backend/app/api/documents.py` — File upload + text extraction + chunking
- `ragforge/backend/app/api/collections.py` — Collection CRUD
- `ragforge/backend/app/api/auth.py` — JWT auth + OTP reset
- `ragforge/backend/app/models/models.py` — SQLAlchemy ORM models
- `artifacts/ragforge/src/pages/` — All React page components
- `artifacts/ragforge/src/api/` — Frontend API clients

## Pages

- `/` — Public landing page (marketing)
- `/login`, `/register`, `/forgot-password` — Auth
- `/dashboard` — KPIs, charts, recent queries
- `/collections` — Collection management
- `/collections/:id` — Collection detail + chunking view
- `/collections/:id/documents` — Document upload
- `/ask` — Chat interface with streaming + sources
- `/compare` — With vs Without re-ranker comparison
- `/history` — Query history + CSV export + search
- `/settings` — Profile, pipeline config, system telemetry

## Architecture decisions

- ChromaDB blocked by Replit package firewall → BM25 hybrid search in pure Python
- sentence-transformers replaced by BM25 + rerank score simulation (coverage × density × phrase)
- SQLite with absolute path to prevent CWD-dependent DB location issues
- GROQ_API_KEY read from Replit Secrets (not .env) via pydantic-settings env var injection
- Backend CRLF issue: always use `bash cat >` to write Python files (not write tool)

## Required secrets

- `GROQ_API_KEY` — Groq Cloud API key (set in Replit Secrets)
- `SESSION_SECRET` — available, used for JWT signing (SECRET_KEY in .env)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- All Python backend files have CRLF endings from the original zip — use bash to overwrite them
- Backend DB at `/home/runner/workspace/ragforge/backend/ragforge.db` (absolute path in .env)
- The api-server workflow runs `cd /home/runner/workspace/ragforge/backend && uvicorn ...`
- uvicorn auto-reloads on Python file changes — no manual restart needed for backend edits
