from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from ..core.database import get_db
from ..models.models import Collection, User
from ..schemas.schemas import Collection as CollectionSchema, CollectionCreate


router = APIRouter()


from fastapi import Header

from .auth import get_current_user_from_header


def _get_user(user: User = Depends(get_current_user_from_header)):
    return user



class CollectionUpdatePayload(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


@router.get('', response_model=list[CollectionSchema])
async def list_collections(user: User = Depends(get_current_user_from_header), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Collection).where(Collection.user_id == user.id))
    return res.scalars().all()



@router.post('', response_model=CollectionSchema)
async def create_collection(payload: CollectionCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user_from_header)):
    user_id = user.id

    col_id = __import__('uuid').uuid4().hex[:16]

    col = Collection(
        id=col_id,
        user_id=user_id,
        name=payload.name,
        description=payload.description,
        embedding_model=payload.embedding_model,
        chunk_size=payload.chunk_size,
        chunk_overlap=payload.chunk_overlap,
        document_count=0,
        total_chunks=0,
        total_embeddings=0,
    )
    db.add(col)
    await db.commit()
    await db.refresh(col)
    return col


@router.get('/{id}', response_model=CollectionSchema)
async def get_collection(id: str, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user_from_header)):
    res = await db.execute(select(Collection).where(Collection.id == id, Collection.user_id == user.id))
    col = res.scalar_one_or_none()
    if not col:
        raise HTTPException(status_code=404, detail='Collection not found')
    return col



@router.patch('/{id}', response_model=CollectionSchema)
async def update_collection(id: str, payload: CollectionUpdatePayload, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Collection).where(Collection.id == id))
    col = res.scalar_one_or_none()
    if not col:
        raise HTTPException(status_code=404, detail='Collection not found')

    if payload.name is not None:
        col.name = payload.name
    if payload.description is not None:
        col.description = payload.description

    await db.commit()
    await db.refresh(col)
    return col


@router.delete('/{id}')
async def delete_collection(id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Collection).where(Collection.id == id))
    col = res.scalar_one_or_none()
    if not col:
        raise HTTPException(status_code=404, detail='Collection not found')

    await db.delete(col)
    await db.commit()
    return {'ok': True}

