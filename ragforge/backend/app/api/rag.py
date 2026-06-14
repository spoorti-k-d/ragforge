import os
import re
import time
import uuid
import json
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
# Retrieval: keyword/BM25-style scoring against stored chunks
# ---------------------------------------------------------------------------
def _tokenize(text: str) -> list[str]:
    return re.findall(r'\b[a-z]{2,}\b', text.lower())

def _score_chunk(query_tokens: list[str], chunk_text: str) -> float:
    chunk_lower = chunk_text.lower()
    chunk_tokens = _tokenize(chunk_text)
    if not chunk_tokens:
        return 0.0
    score = 0.0
    for qt in query_tokens:
        tf = chunk_tokens.count(qt) / len(chunk_tokens)
        if tf > 0:
            score += 1 + tf * 10
        # Bonus for phrase-level match
        if qt in chunk_lower:
            score += 0.5
    return score

async def _retrieve_chunks(
    question: str,
    collection_id: str,
    top_k: int,
    db: AsyncSession,
) -> list[tuple[Chunk, Document, float]]:
    """Retrieve the top-k chunks from the collection using keyword scoring."""
    # Load all chunks for this collection
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
    scored = []
    for chunk, doc in rows:
        score = _score_chunk(query_tokens, chunk.text)
        scored.append((chunk, doc, score))

    scored.sort(key=lambda x: x[2], reverse=True)
    return scored[:top_k]


# ---------------------------------------------------------------------------
# LLM call via Groq
# ---------------------------------------------------------------------------
def _build_prompt(question: str, chunks: list[tuple[Chunk, Document, float]]) -> list[dict]:
    context_parts = []
    for i, (chunk, doc, score) in enumerate(chunks, 1):
        context_parts.append(f"[Source {i}: {doc.original_name}, chunk {chunk.chunk_index}]\n{chunk.text}")
    context = "\n\n---\n\n".join(context_parts)

    system = (
        "You are RAG Forge, an enterprise knowledge assistant. "
        "Answer the user's question using ONLY the provided document context below. "
        "Be concise, accurate, and cite which source(s) you used (e.g. 'According to Source 2...'). "
        "If the context does not contain enough information to answer, say so clearly."
    )
    user = f"DOCUMENT CONTEXT:\n{context}\n\nQUESTION: {question}"
    return [{"role": "system", "content": system}, {"role": "user", "content": user}]


def _confidence(chunks: list[tuple]) -> float:
    if not chunks:
        return 0.0
    top_score = chunks[0][2]
    # Normalise to 0-100 range roughly
    return min(round(top_score * 4, 1), 99.0)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@router.post('/ask', response_model=AskResponse)
async def ask(payload: AskRequest, db: AsyncSession = Depends(get_db)):
    t_start = time.time()

    # 1. Retrieve relevant chunks
    top_chunks = await _retrieve_chunks(payload.question, payload.collection_id, payload.top_k, db)
    retrieval_ms = int((time.time() - t_start) * 1000)

    if not top_chunks:
        answer_text = (
            "I couldn't find any relevant documents in this collection. "
            "Please upload some documents first, then ask your question."
        )
        conf = 0.0
        llm_ms = 0
    else:
        # 2. Call Groq LLM
        messages = _build_prompt(payload.question, top_chunks[:payload.rerank_top_n])
        t_llm = time.time()
        try:
            groq = _get_groq()
            completion = groq.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                max_tokens=payload.max_tokens,
                temperature=0.2,
            )
            answer_text = completion.choices[0].message.content
        except Exception as e:
            answer_text = f"LLM error: {str(e)}"
        llm_ms = int((time.time() - t_llm) * 1000)
        conf = _confidence(top_chunks)

    total_ms = int((time.time() - t_start) * 1000)

    # 3. Save to query log
    qlog = QueryLog(
        id=uuid.uuid4().hex[:16],
        user_id=1,
        collection_id=payload.collection_id,
        question=payload.question,
        answer=answer_text,
        used_reranker=payload.use_reranker,
        confidence_score=conf,
        retrieval_time_ms=retrieval_ms,
        rerank_time_ms=0,
        llm_time_ms=llm_ms,
        total_time_ms=total_ms,
    )
    db.add(qlog)
    await db.commit()

    grounding = [
        GroundingChunk(
            chunk_id=c.id,
            chunk_index=c.chunk_index,
            document_id=c.document_id,
            document_name=d.original_name,
            text=c.text[:300],
            similarity_score=round(s, 3),
        )
        for c, d, s in top_chunks[:payload.rerank_top_n]
    ]

    return AskResponse(
        answer=answer_text,
        confidence_score=conf,
        retrieval_time_ms=retrieval_ms,
        rerank_time_ms=0,
        llm_time_ms=llm_ms,
        total_time_ms=total_ms,
        reranked_chunks=grounding,
    )


@router.post('/ask/stream')
async def ask_stream(payload: AskRequest, db: AsyncSession = Depends(get_db)):
    t_start = time.time()
    top_chunks = await _retrieve_chunks(payload.question, payload.collection_id, payload.top_k, db)
    retrieval_ms = int((time.time() - t_start) * 1000)

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
                model="llama-3.3-70b-versatile",
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
        conf = _confidence(top_chunks)

        # Save log
        qlog = QueryLog(
            id=uuid.uuid4().hex[:16],
            user_id=1,
            collection_id=payload.collection_id,
            question=payload.question,
            answer=full_answer,
            used_reranker=payload.use_reranker,
            confidence_score=conf,
            retrieval_time_ms=retrieval_ms,
            rerank_time_ms=0,
            llm_time_ms=llm_ms,
            total_time_ms=total_ms,
        )
        db.add(qlog)
        await db.commit()

        grounding = [
            {"chunk_id": c.id, "chunk_index": c.chunk_index, "document_id": c.document_id,
             "document_name": d.original_name, "text": c.text[:300], "similarity_score": round(s, 3)}
            for c, d, s in top_chunks[:payload.rerank_top_n]
        ]
        yield f"data: {json.dumps({'done': True, 'confidence_score': conf, 'retrieval_time_ms': retrieval_ms, 'llm_time_ms': llm_ms, 'total_time_ms': total_ms, 'reranked_chunks': grounding})}\n\n"

    return StreamingResponse(gen(), media_type='text/event-stream')


@router.get('/logs', response_model=list[QueryLogSchema])
async def get_logs(collection_id: Optional[str] = None, skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
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
