---
name: RAGForge blocked packages
description: ChromaDB and sentence-transformers are blocked by Replit package firewall; BM25 hybrid used
---
chromadb returns HTTP 403 from Replit's package firewall. sentence-transformers has huge torch dependencies.

**Why:** Replit's free tier blocks certain heavy ML packages.

**How to apply:** The backend uses pure Python BM25 hybrid retrieval (keyword + TF-IDF + proximity + cross-encoder simulation). All retrieval code is in ragforge/backend/app/api/rag.py. Do NOT attempt to install chromadb or add vector search — it will fail.
