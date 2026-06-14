import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from ..core.database import get_db
from ..models.models import Collection, Document, QueryLog
from ..schemas.schemas import DashboardStats, ActivityPoint, QueryLog as QueryLogSchema

router = APIRouter()


@router.get('/stats', response_model=DashboardStats)
async def get_stats(db: AsyncSession = Depends(get_db)):
    total_documents = (await db.execute(select(func.count(Document.id)))).scalar_one()
    collections_count = (await db.execute(select(func.count(Collection.id)))).scalar_one()
    total_chunks = (await db.execute(select(func.sum(Document.chunk_count)))).scalar_one() or 0
    total_embeddings = (await db.execute(select(func.sum(Document.embedding_count)))).scalar_one() or 0
    total_queries = (await db.execute(select(func.count(QueryLog.id)))).scalar_one()
    avg_retrieval = (await db.execute(select(func.avg(QueryLog.retrieval_time_ms)))).scalar_one() or 0
    avg_conf = (await db.execute(select(func.avg(QueryLog.confidence_score)))).scalar_one() or 0

    type_rows = (await db.execute(
        select(Document.file_type, func.count(Document.id)).group_by(Document.file_type)
    )).all()
    docs_by_type = {row[0]: row[1] for row in type_rows if row[0]}

    recent_rows = (await db.execute(
        select(QueryLog).order_by(QueryLog.created_at.desc()).limit(10)
    )).scalars().all()
    recent_queries = [
        QueryLogSchema(
            id=q.id,
            question=q.question,
            created_at=q.created_at,
            used_reranker=q.used_reranker,
            confidence_score=q.confidence_score,
            total_time_ms=q.total_time_ms,
            answer=q.answer,
            retrieval_time_ms=q.retrieval_time_ms,
            rerank_time_ms=q.rerank_time_ms,
            llm_time_ms=q.llm_time_ms,
            citations=[],
        )
        for q in recent_rows
    ]

    return DashboardStats(
        total_documents=total_documents,
        collections_count=collections_count,
        total_chunks=int(total_chunks),
        total_embeddings=int(total_embeddings),
        total_queries=total_queries,
        avg_retrieval_time_ms=int(avg_retrieval),
        avg_confidence_score=float(avg_conf),
        docs_by_type=docs_by_type,
        recent_queries=recent_queries,
    )


@router.get('/activity', response_model=list[ActivityPoint])
async def get_activity(days: int = 14, db: AsyncSession = Depends(get_db)):
    since = datetime.datetime.utcnow() - datetime.timedelta(days=days)
    rows = (await db.execute(
        select(
            func.date(QueryLog.created_at).label('day'),
            func.count(QueryLog.id).label('cnt')
        )
        .where(QueryLog.created_at >= since)
        .group_by(func.date(QueryLog.created_at))
        .order_by(func.date(QueryLog.created_at))
    )).all()

    day_map = {str(row[0]): row[1] for row in rows}
    result = []
    for i in range(days):
        d = (since + datetime.timedelta(days=i)).strftime('%Y-%m-%d')
        result.append(ActivityPoint(date=d, count=day_map.get(d, 0)))
    return result
