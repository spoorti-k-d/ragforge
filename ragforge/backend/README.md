# RAG Forge Backend (FastAPI)

This backend is generated to match the existing React frontend contract in `ragforge-frontend/`.

## What this backend provides
- Authentication (JWT access + refresh)
- OTP-based password reset
- Multi-tenant collections
- Document ingestion (parse -> clean -> chunk -> embed -> store in Chroma)
- RAG answering (vector retrieval + optional BM25/hybrid + cross-encoder rerank)
- Streaming answers via `POST /rag/ask/stream`
- Query logs and dashboard endpoints

## Expected endpoints (must match frontend)
- `POST /api/auth/register`
- `POST /api/auth/login/json`
- `GET /api/auth/me`
- `POST /api/auth/refresh` (expects `token` as query param)
- `POST /api/auth/forgot-password`
- `POST /api/auth/verify-otp`

- `GET /api/collections`
- `POST /api/collections`
- `GET /api/collections/{id}`
- `PATCH /api/collections/{id}`
- `DELETE /api/collections/{id}`

- `GET /api/documents?collection_id=...`
- `POST /api/documents/upload?collection_id=...` (multipart; field name `files`)
- `GET /api/documents/{id}`
- `GET /api/documents/{id}/chunks`
- `POST /api/documents/{id}/reindex`
- `DELETE /api/documents/{id}`

- `POST /api/rag/ask`
- `POST /api/rag/ask/stream` (streaming JSON lines prefixed with `data: `)
- `GET /api/rag/logs?collection_id=...&skip=...&limit=...`
- `GET /api/rag/logs/{id}`

- `GET /api/dashboard/stats`
- `GET /api/dashboard/activity?days=14`

## Run
1) Create venv
2) `pip install -r requirements.txt`
3) Create `.env` from `.env.example`
4) `uvicorn app.main:app --reload --port 8000`


