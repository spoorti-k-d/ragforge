from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.auth import router as auth_router
from .api.collections import router as collections_router
from .api.documents import router as documents_router
from .api.rag import router as rag_router
from .api.dashboard import router as dashboard_router

from .core.config import settings
from .core.database import engine
from .models.models import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


def create_app() -> FastAPI:
    app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

    allow_origins = settings.CORS_ALLOW_ORIGINS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*'],
    )

    @app.get('/api/healthz')
    async def healthz():
        return {'status': 'ok', 'app': settings.APP_NAME}

    app.include_router(auth_router, prefix='/api/auth', tags=['auth'])
    app.include_router(collections_router, prefix='/api/collections', tags=['collections'])
    app.include_router(documents_router, prefix='/api/documents', tags=['documents'])
    app.include_router(rag_router, prefix='/api/rag', tags=['rag'])
    app.include_router(dashboard_router, prefix='/api/dashboard', tags=['dashboard'])

    return app


app = create_app()
