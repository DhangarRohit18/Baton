from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
import app.models # registers models with Base

# Auto-create tables for seamless development & deployment
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    description="BATON: Production-Oriented AI-Powered Knowledge Continuity Platform"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API v1 Routers
from app.api.v1.auth import router as auth_router
from app.api.v1.projects import router as projects_router
from app.api.v1.documents import router as documents_router
from app.api.v1.claims import router as claims_router
from app.api.v1.gaps import router as gaps_router
from app.api.v1.radar import router as radar_router
from app.api.v1.interviews import router as interviews_router
from app.api.v1.handovers import router as handovers_router
from app.api.v1.qr_bridge import router as qr_bridge_router
from app.api.v1.audit import router as audit_router
from app.api.v1.captures import router as captures_router
from app.api.v1.users import router as users_router

app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(projects_router, prefix=settings.API_V1_STR)
app.include_router(documents_router, prefix=settings.API_V1_STR)
app.include_router(captures_router, prefix=settings.API_V1_STR)
app.include_router(claims_router, prefix=settings.API_V1_STR)
app.include_router(gaps_router, prefix=settings.API_V1_STR)
app.include_router(radar_router, prefix=settings.API_V1_STR)
app.include_router(interviews_router, prefix=settings.API_V1_STR)
app.include_router(handovers_router, prefix=settings.API_V1_STR)
app.include_router(qr_bridge_router, prefix=settings.API_V1_STR)
app.include_router(audit_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "BATON Knowledge Continuity Platform",
        "version": "1.0.0"
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to BATON: AI Knowledge Continuity SaaS Platform",
        "docs": f"{settings.API_V1_STR}/docs"
    }
