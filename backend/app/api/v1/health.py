from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.core.config import settings
from app.ml_plugins import plugin_registry

router = APIRouter()


@router.get("/health", summary="Basic service health check")
def health():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


@router.get("/ready", summary="Readiness check verifying database and ML plugins")
def readiness(db: Session = Depends(get_db)):
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception as e:
        db_ok = False

    active_plugins = [p["name"] for p in plugin_registry.list_plugins() if p["is_enabled"]]

    return {
        "status": "ready" if db_ok else "degraded",
        "database_connected": db_ok,
        "active_plugins_count": len(active_plugins),
        "active_plugins": active_plugins,
    }
