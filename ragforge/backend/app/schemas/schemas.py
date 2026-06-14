from pydantic import BaseModel, Field
from typing import Optional, Literal, Any
import datetime


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: Literal['bearer'] = 'bearer'


class User(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None


class UserMeResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None


class Collection(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    embedding_model: str
    chunk_size: int
    chunk_overlap: int

    document_count: int = 0
    total_chunks: int = 0
    total_embeddings: int = 0

    created_at: datetime.datetime
    updated_at: datetime.datetime


class CollectionCreate(BaseModel):
    name: str
    description: Optional[str] = None

    embedding_model: str = 'all-MiniLM-L6-v2'
    chunk_size: int = 512
    chunk_overlap: int = 50


class CollectionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class Document(BaseModel):
    id: str
    collection_id: str

    original_name: str
    file_type: str
    file_size: int

    chunk_count: int
    embedding_count: int

    status: str
    error_message: Optional[str] = None

    indexed_at: Optional[datetime.datetime] = None


class Chunk(BaseModel):
    id: str
    document_id: str
    document_name: str
    chunk_index: int
    char_count: int
    text: str
    similarity_score: Optional[float] = None
    rerank_score: Optional[float] = None


class AskRequest(BaseModel):
    question: str
    collection_id: str

    top_k: int = 15
    rerank_top_n: int = 5

    use_reranker: bool = True
    use_hybrid: bool = False

    stream: bool = True
    max_tokens: int = 2048


class GroundingChunk(BaseModel):
    chunk_id: str
    chunk_index: int
    document_id: str
    document_name: str
    text: str
    similarity_score: Optional[float] = None
    rerank_score: Optional[float] = None


class AskResponse(BaseModel):
    answer: str
    confidence_score: float

    retrieval_time_ms: int
    rerank_time_ms: int
    llm_time_ms: int
    total_time_ms: int

    reranked_chunks: list[GroundingChunk] = []


class QueryLog(BaseModel):
    id: str
    question: str
    created_at: datetime.datetime

    used_reranker: bool

    confidence_score: Optional[float] = None
    total_time_ms: Optional[int] = None

    # detail fields
    answer: Optional[str] = None
    retrieval_time_ms: Optional[int] = None
    rerank_time_ms: Optional[int] = None
    llm_time_ms: Optional[int] = None
    citations: list['Citation'] = []


class Citation(BaseModel):
    document_name: str
    chunk_index: int


class DashboardStats(BaseModel):
    total_documents: int
    collections_count: int
    total_chunks: int
    total_embeddings: int
    total_queries: int
    avg_retrieval_time_ms: int
    avg_confidence_score: float

    docs_by_type: dict[str, int] = {}
    recent_queries: list[QueryLog] = []


class ActivityPoint(BaseModel):
    date: str
    count: int

