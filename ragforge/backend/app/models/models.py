from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, DateTime, ForeignKey, Boolean, Text
import datetime


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))

    hashed_password: Mapped[str] = mapped_column(String(255))

    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    collections: Mapped[list['Collection']] = relationship(back_populates='user')


class Collection(Base):
    __tablename__ = 'collections'

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), index=True)

    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    embedding_model: Mapped[str] = mapped_column(String(255), default='all-MiniLM-L6-v2')
    chunk_size: Mapped[int] = mapped_column(Integer, default=512)
    chunk_overlap: Mapped[int] = mapped_column(Integer, default=50)

    document_count: Mapped[int] = mapped_column(Integer, default=0)
    total_chunks: Mapped[int] = mapped_column(Integer, default=0)
    total_embeddings: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    user: Mapped['User'] = relationship(back_populates='collections')


class Document(Base):
    __tablename__ = 'documents'

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    collection_id: Mapped[str] = mapped_column(String(64), ForeignKey('collections.id'), index=True)

    user_id: Mapped[int] = mapped_column(Integer, index=True)

    original_name: Mapped[str] = mapped_column(String(255))
    file_type: Mapped[str] = mapped_column(String(32))
    file_size: Mapped[int] = mapped_column(Integer)

    chunk_count: Mapped[int] = mapped_column(Integer, default=0)
    embedding_count: Mapped[int] = mapped_column(Integer, default=0)

    status: Mapped[str] = mapped_column(String(32), default='uploaded')
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    indexed_at: Mapped[datetime.datetime | None] = mapped_column(DateTime, nullable=True)

    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)


class Chunk(Base):
    __tablename__ = 'chunks'

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    document_id: Mapped[str] = mapped_column(String(64), ForeignKey('documents.id'), index=True)

    chunk_index: Mapped[int] = mapped_column(Integer)
    char_count: Mapped[int] = mapped_column(Integer, default=0)

    text: Mapped[str] = mapped_column(Text)


class QueryLog(Base):
    __tablename__ = 'query_logs'

    id: Mapped[str] = mapped_column(String(64), primary_key=True)

    user_id: Mapped[int] = mapped_column(Integer, index=True)
    collection_id: Mapped[str | None] = mapped_column(String(64), index=True, nullable=True)

    question: Mapped[str] = mapped_column(Text)
    answer: Mapped[str] = mapped_column(Text, nullable=True)

    used_reranker: Mapped[bool] = mapped_column(Boolean, default=True)

    confidence_score: Mapped[float | None] = mapped_column(Integer, nullable=True)

    retrieval_time_ms: Mapped[int] = mapped_column(Integer, default=0)
    rerank_time_ms: Mapped[int] = mapped_column(Integer, default=0)
    llm_time_ms: Mapped[int] = mapped_column(Integer, default=0)

    total_time_ms: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)


class OTPRecord(Base):
    __tablename__ = 'otp_records'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)

    otp_code: Mapped[str] = mapped_column(String(16))
    expires_at: Mapped[datetime.datetime] = mapped_column(DateTime)

