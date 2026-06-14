from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

    APP_NAME: str = 'RAG Forge'
    DEBUG: bool = True

    SECRET_KEY: str
    ALGORITHM: str = 'HS256'

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    FRONTEND_URL: str = 'http://localhost:3000'
    CORS_ALLOW_ORIGINS: list[str] = ['http://localhost:3000']

    # Database — use RAGFORGE_DB_URL to avoid conflict with Replit's DATABASE_URL (PostgreSQL)
    RAGFORGE_DB_URL: str = 'sqlite+aiosqlite:///./ragforge.db'

    # Chroma
    CHROMA_PERSIST_DIR: str = './chroma_db'
    CHROMA_COLLECTION_PREFIX: str = 'ragforge'

    # Embeddings / rerank
    EMBEDDING_MODEL: str = 'all-MiniLM-L6-v2'
    RERANKER_MODEL: str = 'cross-encoder/ms-marco-MiniLM-L-6-v2'
    EMBEDDING_DIMENSION: int = 384

    # LLM
    LLM_PROVIDER: str = 'ollama'
    OLLAMA_BASE_URL: str = 'http://localhost:11434'
    OLLAMA_MODEL: str = 'llama3.2'

    GROQ_API_KEY: str = ''
    GROQ_MODEL: str = 'llama3-8b-8192'

    # Uploads
    UPLOAD_DIR: str = './uploads'
    MAX_FILE_SIZE_MB: int = 100
    ALLOWED_EXTENSIONS: str = '.pdf,.docx,.txt,.html'

    # RAG defaults
    DEFAULT_CHUNK_SIZE: int = 512
    DEFAULT_CHUNK_OVERLAP: int = 50
    DEFAULT_TOP_K: int = 15
    DEFAULT_RERANK_TOP_N: int = 5
    DEFAULT_MAX_TOKENS: int = 2048

    # OTP
    OTP_EXPIRE_MINUTES: int = 10
    SMTP_HOST: str = ''
    SMTP_PORT: int = 587
    SMTP_USER: str = ''
    SMTP_PASS: str = ''


settings = Settings()
