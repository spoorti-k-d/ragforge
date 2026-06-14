import os
import re
import uuid
import datetime
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from ..core.database import get_db
from ..models.models import Document, Chunk, Collection
from ..schemas.schemas import Document as DocumentSchema

router = APIRouter()


def _split_text(text: str, chunk_size: int = 512, overlap: int = 50) -> list[str]:
    """Split text into overlapping chunks by character count."""
    # Normalize whitespace
    text = re.sub(r'\n{3,}', '\n\n', text.strip())
    if len(text) <= chunk_size:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        # Try to break at a sentence or paragraph boundary
        if end < len(text):
            for sep in ('\n\n', '\n', '. ', ' '):
                idx = text.rfind(sep, start, end)
                if idx > start + chunk_size // 2:
                    end = idx + len(sep)
                    break
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start = end - overlap
    return chunks


def _extract_text(content: bytes, file_type: str, filename: str) -> str:
    """Extract plain text from uploaded file bytes."""
    if file_type in ('txt', 'md'):
        return content.decode('utf-8', errors='replace')
    if file_type == 'html':
        text = re.sub(r'<[^>]+>', ' ', content.decode('utf-8', errors='replace'))
        return re.sub(r'\s+', ' ', text).strip()
    # PDF: multi-strategy extraction
    if file_type == 'pdf':
        # Strategy 1: Try pypdf (best text layer extraction)
        try:
            import pypdf, io as _io
            reader = pypdf.PdfReader(_io.BytesIO(content))
            pages = []
            for page in reader.pages:
                t = page.extract_text() or ''
                if t.strip():
                    pages.append(t.strip())
            text = '\n\n'.join(pages)
            # Validate quality: >40% printable alpha chars
            alpha = sum(1 for c in text if c.isalpha())
            if text and alpha / max(len(text), 1) > 0.35:
                return re.sub(r'\s+', ' ', text).strip()
        except Exception:
            pass
        # Strategy 2: Extract readable ASCII from raw bytes (handles some encoded PDFs)
        raw = content.decode('latin-1', errors='replace')
        # Look for BT/ET text blocks
        bt_blocks = re.findall(r'BT(.*?)ET', raw, re.DOTALL)
        words = []
        for block in bt_blocks:
            # Extract strings in parentheses
            strings = re.findall(r'\(([^)]{2,})\)', block)
            for s in strings:
                cleaned = re.sub(r'[^\x20-\x7e]', '', s).strip()
                if len(cleaned) > 2:
                    words.append(cleaned)
        text = ' '.join(words)
        text = re.sub(r'\s+', ' ', text).strip()
        if len(text) > 200:
            return text
        # Strategy 3: Raw printable extraction
        streams = re.findall(r'stream\r?\n(.*?)\r?\nendstream', raw, re.DOTALL)
        parts = [re.sub(r'[^\x20-\x7e\n]', ' ', s) for s in streams]
        text = re.sub(r'\s+', ' ', '\n'.join(parts)).strip()
        return text if len(text) > 100 else f"[PDF: {filename}] — This PDF appears to be image-based or encrypted. Please upload a text-based PDF."
    # DOCX: extract from XML
    if file_type == 'docx':
        import zipfile, io
        try:
            with zipfile.ZipFile(io.BytesIO(content)) as z:
                xml = z.read('word/document.xml').decode('utf-8', errors='replace')
            text = re.sub(r'<[^>]+>', ' ', xml)
            return re.sub(r'\s+', ' ', text).strip()
        except Exception:
            return f"[DOCX: {filename}] (extraction failed)"
    return content.decode('utf-8', errors='replace')


@router.get('', response_model=list[DocumentSchema])
async def list_documents(collection_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Document).where(Document.collection_id == collection_id))
    return res.scalars().all()


@router.get('/{id}', response_model=DocumentSchema)
async def get_document(id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Document).where(Document.id == id))
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail='Document not found')
    return doc


@router.post('/upload', response_model=list[DocumentSchema])
async def upload_documents(
    collection_id: str,
    files: list[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
):
    # Load collection for chunk settings
    coll_res = await db.execute(select(Collection).where(Collection.id == collection_id))
    collection = coll_res.scalar_one_or_none()
    chunk_size = collection.chunk_size if collection else 512
    chunk_overlap = collection.chunk_overlap if collection else 50

    created: list[Document] = []

    for f in files:
        file_bytes = await f.read()
        file_type = (f.filename.rsplit('.', 1)[-1] if '.' in f.filename else 'txt').lower()
        doc_id = uuid.uuid4().hex[:16]

        # Extract and chunk
        raw_text = _extract_text(file_bytes, file_type, f.filename)
        text_chunks = _split_text(raw_text, chunk_size, chunk_overlap)

        doc = Document(
            id=doc_id,
            collection_id=collection_id,
            user_id=1,
            original_name=f.filename,
            file_type=file_type,
            file_size=len(file_bytes),
            status='ready',
            chunk_count=len(text_chunks),
            embedding_count=0,
            indexed_at=datetime.datetime.utcnow(),
        )
        db.add(doc)

        for i, chunk_text in enumerate(text_chunks):
            chunk = Chunk(
                id=uuid.uuid4().hex[:16],
                document_id=doc_id,
                chunk_index=i,
                text=chunk_text,
                char_count=len(chunk_text),
            )
            db.add(chunk)

        created.append(doc)

    await db.commit()

    # Update collection counters
    if collection and created:
        total_new_chunks = sum(d.chunk_count for d in created)
        collection.document_count = (collection.document_count or 0) + len(created)
        collection.total_chunks = (collection.total_chunks or 0) + total_new_chunks
        collection.updated_at = datetime.datetime.utcnow()
        await db.commit()

    for d in created:
        await db.refresh(d)
    return created


@router.get('/{id}/chunks')
async def get_chunks(id: str, skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    doc_res = await db.execute(select(Document).where(Document.id == id))
    doc = doc_res.scalar_one_or_none()
    chunk_res = await db.execute(
        select(Chunk).where(Chunk.document_id == id)
        .offset(skip).limit(limit)
    )
    chunks = chunk_res.scalars().all()
    return {
        'document_id': id,
        'document_name': doc.original_name if doc else id,
        'total_chunks': doc.chunk_count if doc else 0,
        'chunks': [{'id': c.id, 'chunk_index': c.chunk_index, 'text': c.text, 'char_count': c.char_count} for c in chunks],
    }


@router.post('/{id}/reindex', response_model=DocumentSchema)
async def reindex_document(id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Document).where(Document.id == id))
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail='Document not found')
    doc.status = 'ready'
    await db.commit()
    await db.refresh(doc)
    return doc


@router.delete('/{id}')
async def delete_document(id: str, db: AsyncSession = Depends(get_db)):
    # Delete chunks first
    chunk_res = await db.execute(select(Chunk).where(Chunk.document_id == id))
    for chunk in chunk_res.scalars().all():
        await db.delete(chunk)

    res = await db.execute(select(Document).where(Document.id == id))
    doc = res.scalar_one_or_none()
    if doc:
        # Update collection counters
        coll_res = await db.execute(select(Collection).where(Collection.id == doc.collection_id))
        coll = coll_res.scalar_one_or_none()
        if coll:
            coll.document_count = max(0, (coll.document_count or 1) - 1)
            coll.total_chunks = max(0, (coll.total_chunks or doc.chunk_count) - doc.chunk_count)
        await db.delete(doc)

    await db.commit()
    return {'ok': True}
