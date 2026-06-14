from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from ..core.database import get_db
from ..models.models import Collection, Document, QueryLog
from ..schemas.schemas import DashboardStats, ActivityPoint

router = APIRouter()


@router.get('/stats', response_model=DashboardStats)
async def get_stats(db: AsyncSession = Depends(get_db)):
    # Dev stub with real queries for counts.
    total_documents = (await db.execute(select(func.count(Document.id)))).scalar_one()
    collections_count = (await db.execute(select(func.count(Collection.id)))).scalar_one()
    total_chunks = (await db.execute(select(func.sum(Document.chunk_count)))).scalar_one() or 0
    total_embeddings = (await db.execute(select(func.sum(Document.embedding_count)))).scalar_one() or 0
    total_queries = (await db.execute(select(func.count(QueryLog.id)))).scalar_one()

    # avg retrieval
    avg_retrieval = (await db.execute(select(func.avg(QueryLog.retrieval_time_ms)))).scalar_one() or 0
    avg_conf = (await db.execute(select(func.avg(QueryLog.confidence_score)))).scalar_one() or 0

    return DashboardStats(
        total_documents=total_documents,
        collections_count=collections_count,
        total_chunks=int(total_chunks),
        total_embeddings=int(total_embeddings),
        total_queries=total_queries,
        avg_retrieval_time_ms=int(avg_retrieval),
        avg_confidence_score=float(avg_conf),
        docs_by_type={},
        recent_queries=[],
    )


@router.get('/activity', response_model=list[ActivityPoint])
async def get_activity(days: int = 14, db: AsyncSession = Depends(get_db)):
    # Dev stub
    return []

