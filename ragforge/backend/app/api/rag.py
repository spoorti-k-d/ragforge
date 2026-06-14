import os
import re
import time
import uuid
import json
import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from ..core.database import get_db
from ..models.models import QueryLog, Document, Chunk, Collection
from ..schemas.schemas import AskRequest, AskResponse, QueryLog as QueryLogSchema, GroundingChunk

router = APIRouter()

# ---------------------------------------------------------------------------
# Groq client (lazy init)
# ---------------------------------------------------------------------------
_groq_client = None

def _get_groq():
    global _groq_client
    if _groq_client is None:
        from groq import Groq
        api_key = os.environ.get('GROQ_API_KEY', '')
        if not api_key:
            raise HTTPException(status_code=503, detail='GROQ_API_KEY not configured')
        _groq_client = Groq(api_key=api_key)
    return _groq_client


# ---------------------------------------------------------------------------
# Hybrid BM25 + TF-IDF retrieval
# ---------------------------------------------------------------------------
def _tokenize(text: str) -> list[str]:
    return re.findall(r'\b[a-z]{2,}\b', text.lower())

def _idf(term: str, all_chunks: list[str], corpus_size: int) -> float:
    df = sum(1 for doc in all_chunks if term in doc.lower())
    if df == 0:
        return 0.0
    return math.log((corpus_size - df + 0.5) / (df + 0.5) + 1)

def _bm25_score(query_tokens: list[str], chunk_text: str, avg_dl: float, idf_cache: dict) -> float:
    """BM25 scoring with k1=1.5, b=0.75."""
    k1, b = 1.5, 0.75
    chunk_lower = chunk_text.lower()
    chunk_tokens = _tokenize(chunk_text)
    dl = len(chunk_tokens)
    if not dl:
        return 0.0

    score = 0.0
    for qt in query_tokens:
        tf = chunk_tokens.count(qt)
        if tf == 0:
            continue
        idf = idf_cache.get(qt, 1.0)
        tf_norm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * dl / max(avg_dl, 1)))
        score += idf * tf_norm

    # Proximity bonus: consecutive query terms appearing close together
    query_str = ' '.join(query_tokens)
    if len(query_tokens) >= 2:
        for i in range(len(query_tokens) - 1):
            bigram = query_tokens[i] + ' ' + query_tokens[i + 1]
            if bigram in chunk_lower:
                score += 2.0

    return score

def _rerank_score(query_tokens: list[str], chunk_text: str, bm25: float, rank: int) -> float:
    """
    Simulated cross-encoder re-ranking using:
    - BM25 base score
    - Query coverage ratio (what % of query terms appear)
    - Density bonus (query terms clustered together)
    - Position penalty (penalise very high-rank items slightly less)
    """
    chunk_lower = chunk_text.lower()
    chunk_words = _tokenize(chunk_text)

    # Term coverage
    covered = sum(1 for qt in query_tokens if qt in chunk_lower)
    coverage = covered / max(len(query_tokens), 1)

    # Term density in a 100-char window
    density = 0.0
    for i in range(0, len(chunk_lower) - 100, 50):
        window = chunk_lower[i:i + 100]
        hits = sum(1 for qt in query_tokens if qt in window)
        density = max(density, hits / max(len(query_tokens), 1))

    # Exact phrase match bonus
    phrase_bonus = 2.0 if ' '.join(query_tokens[:3]) in chunk_lower else 0.0

    rerank = bm25 * 0.4 + coverage * 8.0 + density * 6.0 + phrase_bonus
    return round(rerank, 3)


async def _retrieve_chunks(
    question: str,
    collection_id: str,
    top_k: int,
    use_reranker: bool,
    db: AsyncSession,
) -> list[tuple[Chunk, Document, float, float]]:
    """
    Returns list of (Chunk, Document, bm25_score, rerank_score).
    """
    stmt = (
        select(Chunk, Document)
        .join(Document, Chunk.document_id == Document.id)
        .where(Document.collection_id == collection_id)
    )
    res = await db.execute(stmt)
    rows = res.all()

    if not rows:
        return []

    query_tokens = _tokenize(question)
    all_texts = [chunk.text for chunk, _ in rows]
    corpus_size = len(all_texts)
    avg_dl = sum(len(_tokenize(t)) for t in all_texts) / max(corpus_size, 1)

    # Pre-compute IDF for all query terms
    idf_cache = {qt: _idf(qt, all_texts, corpus_size) for qt in query_tokens}

    # BM25 pass
    scored = []
    for chunk, doc in rows:
        bm25 = _bm25_score(query_tokens, chunk.text, avg_dl, idf_cache)
        scored.append((chunk, doc, bm25))

    scored.sort(key=lambda x: x[2], reverse=True)
    candidates = scored[:top_k]

    if not use_reranker:
        return [(c, d, s, s) for c, d, s in candidates]

    # Re-rank pass
    reranked = []
    for rank, (chunk, doc, bm25) in enumerate(candidates):
        rs = _rerank_score(query_tokens, chunk.text, bm25, rank)
        reranked.append((chunk, doc, bm25, rs))

    reranked.sort(key=lambda x: x[3], reverse=True)
    return reranked


# ---------------------------------------------------------------------------
# LLM call via Groq
# ---------------------------------------------------------------------------
def _build_prompt(question: str, chunks: list[tuple]) -> list[dict]:
    context_parts = []
    for i, item in enumerate(chunks, 1):
        chunk, doc = item[0], item[1]
        context_parts.append(f"[Source {i}: {doc.original_name}, chunk {chunk.chunk_index}]\n{chunk.text}")
    context = "\n\n---\n\n".join(context_parts)

    system = (
        "You are RAG Forge, an enterprise knowledge assistant. "
        "Answer the user's question using ONLY the provided document context below. "
        "Be concise, accurate, and cite which source(s) you used (e.g. 'According to Source 2...'). "
        "If the context does not contain enough information to answer, say: "
        "'I could not find sufficient information in the knowledge base to answer this question.'"
    )
    user = f"DOCUMENT CONTEXT:\n{context}\n\nQUESTION: {question}"
    return [{"role": "system", "content": system}, {"role": "user", "content": user}]


def _confidence(chunks: list[tuple]) -> float:
    if not chunks:
        return 0.0
    # Use rerank score (index 3) if available
    top_score = chunks[0][3] if len(chunks[0]) > 3 else chunks[0][2]
    # Normalize to 0-100
    return min(round(top_score * 3.5, 1), 99.0)


def _to_grounding(chunks: list[tuple], use_reranker: bool) -> list[GroundingChunk]:
    result = []
    for item in chunks:
        c, d = item[0], item[1]
        bm25 = item[2]
        rs = item[3] if len(item) > 3 else bm25
        result.append(GroundingChunk(
            chunk_id=c.id,
            chunk_index=c.chunk_index,
            document_id=c.document_id,
            document_name=d.original_name,
            text=c.text[:400],
            similarity_score=round(bm25, 3),
            rerank_score=round(rs, 3) if use_reranker else None,
        ))
    return result


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@router.post('/ask', response_model=AskResponse)
async def ask(payload: AskRequest, db: AsyncSession = Depends(get_db)):
    t_start = time.time()

    top_chunks = await _retrieve_chunks(payload.question, payload.collection_id, payload.top_k, payload.use_reranker, db)
    retrieval_ms = int((time.time() - t_start) * 1000)

    t_rerank = time.time()
    rerank_ms = int((time.time() - t_rerank) * 1000)

    if not top_chunks:
        answer_text = (
            "I couldn't find any relevant documents in this collection. "
            "Please upload some documents first, then ask your question."
        )
        conf = 0.0
        llm_ms = 0
    else:
        messages = _build_prompt(payload.question, top_chunks[:payload.rerank_top_n])
        t_llm = time.time()
        try:
            groq = _get_groq()
            completion = groq.chat.completions.create(
                model=os.environ.get('GROQ_MODEL', 'llama-3.3-70b-versatile'),
                messages=messages,
                max_tokens=payload.max_tokens,
                temperature=0.2,
            )
            answer_text = completion.choices[0].message.content
        except Exception as e:
            answer_text = f"LLM error: {str(e)}"
        llm_ms = int((time.time() - t_llm) * 1000)
        conf = _confidence(top_chunks[:payload.rerank_top_n])

    total_ms = int((time.time() - t_start) * 1000)

    qlog = QueryLog(
        id=uuid.uuid4().hex[:16],
        user_id=1,
        collection_id=payload.collection_id,
        question=payload.question,
        answer=answer_text,
        used_reranker=payload.use_reranker,
        confidence_score=conf,
        retrieval_time_ms=retrieval_ms,
        rerank_time_ms=rerank_ms,
        llm_time_ms=llm_ms,
        total_time_ms=total_ms,
    )
    db.add(qlog)
    await db.commit()

    grounding = _to_grounding(top_chunks[:payload.rerank_top_n], payload.use_reranker)

    return AskResponse(
        answer=answer_text,
        confidence_score=conf,
        retrieval_time_ms=retrieval_ms,
        rerank_time_ms=rerank_ms,
        llm_time_ms=llm_ms,
        total_time_ms=total_ms,
        reranked_chunks=grounding,
    )


@router.post('/ask/stream')
async def ask_stream(payload: AskRequest, db: AsyncSession = Depends(get_db)):
    t_start = time.time()
    top_chunks = await _retrieve_chunks(payload.question, payload.collection_id, payload.top_k, payload.use_reranker, db)
    retrieval_ms = int((time.time() - t_start) * 1000)
    rerank_ms = 0

    async def gen():
        if not top_chunks:
            msg = "I couldn't find any relevant documents in this collection. Please upload some documents first."
            yield f"data: {json.dumps({'token': msg})}\n\n"
            yield f"data: {json.dumps({'done': True, 'retrieval_time_ms': retrieval_ms})}\n\n"
            return

        messages = _build_prompt(payload.question, top_chunks[:payload.rerank_top_n])
        full_answer = ""
        t_llm = time.time()
        try:
            groq = _get_groq()
            stream = groq.chat.completions.create(
                model=os.environ.get('GROQ_MODEL', 'llama-3.3-70b-versatile'),
                messages=messages,
                max_tokens=payload.max_tokens,
                temperature=0.2,
                stream=True,
            )
            for chunk in stream:
                token = chunk.choices[0].delta.content or ""
                if token:
                    full_answer += token
                    yield f"data: {json.dumps({'token': token})}\n\n"
        except Exception as e:
            err = f"LLM error: {str(e)}"
            yield f"data: {json.dumps({'token': err})}\n\n"
            full_answer = err

        llm_ms = int((time.time() - t_llm) * 1000)
        total_ms = int((time.time() - t_start) * 1000)
        conf = _confidence(top_chunks[:payload.rerank_top_n])

        qlog = QueryLog(
            id=uuid.uuid4().hex[:16],
            user_id=1,
            collection_id=payload.collection_id,
            question=payload.question,
            answer=full_answer,
            used_reranker=payload.use_reranker,
            confidence_score=conf,
            retrieval_time_ms=retrieval_ms,
            rerank_time_ms=rerank_ms,
            llm_time_ms=llm_ms,
            total_time_ms=total_ms,
        )
        db.add(qlog)
        await db.commit()

        grounding = [
            {
                "chunk_id": item[0].id,
                "chunk_index": item[0].chunk_index,
                "document_id": item[0].document_id,
                "document_name": item[1].original_name,
                "text": item[0].text[:400],
                "similarity_score": round(item[2], 3),
                "rerank_score": round(item[3], 3) if payload.use_reranker else None,
            }
            for item in top_chunks[:payload.rerank_top_n]
        ]
        yield f"data: {json.dumps({'done': True, 'confidence_score': conf, 'retrieval_time_ms': retrieval_ms, 'rerank_time_ms': rerank_ms, 'llm_time_ms': llm_ms, 'total_time_ms': total_ms, 'reranked_chunks': grounding})}\n\n"

    return StreamingResponse(gen(), media_type='text/event-stream')


@router.get('/logs', response_model=list[QueryLogSchema])
async def get_logs(collection_id: Optional[str] = None, skip: int = 0, limit: int = 200, db: AsyncSession = Depends(get_db)):
    stmt = select(QueryLog).order_by(QueryLog.created_at.desc()).offset(skip).limit(limit)
    if collection_id:
        stmt = stmt.where(QueryLog.collection_id == collection_id)
    res = await db.execute(stmt)
    return res.scalars().all()


@router.get('/logs/{id}', response_model=QueryLogSchema)
async def get_log_detail(id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(QueryLog).where(QueryLog.id == id))
    log = res.scalar_one_or_none()
    if not log:
        raise HTTPException(status_code=404, detail='Not found')
    return log
