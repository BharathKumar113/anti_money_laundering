from contextlib import asynccontextmanager
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.core.logging import setup_logging
from app.core.exceptions import AMLBaseException, aml_exception_handler
from app.api.router import api_router
import logging

setup_logging()
logger = logging.getLogger("aml.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION} [{settings.ENVIRONMENT}]")
    init_db()
    yield
    # Shutdown actions
    logger.info(f"Shutting down {settings.PROJECT_NAME}")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Production-Grade Backend API for Anti-Money Laundering (AML) Detection & Graph Analytics. "
        "Supports pluggable ML models, NetworkX network analysis, PaySim ingestion, and compliance case management."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request timing & tracing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = (time.perf_counter() - start_time) * 1000.0
    response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
    return response


# Register exception handlers
app.add_exception_handler(AMLBaseException, aml_exception_handler)

# Mount API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

# Serve Frontend SPA build if present
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

candidate_dirs = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist")),
    os.path.abspath("/app/frontend/dist"),
    os.path.abspath("./frontend/dist"),
    os.path.abspath("./dist"),
]

frontend_dist = None
for c in candidate_dirs:
    if os.path.exists(os.path.join(c, "index.html")):
        frontend_dist = c
        break

if frontend_dist:
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/dashboard", tags=["Frontend Dashboard"])
    @app.get("/dashboard/{full_path:path}", tags=["Frontend Dashboard"])
    def serve_dashboard():
        return FileResponse(os.path.join(frontend_dist, "index.html"))

    @app.get("/", tags=["Root"])
    def root():
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/", tags=["Root"])
    def root():
        return {
            "message": f"Welcome to {settings.PROJECT_NAME}",
            "version": settings.VERSION,
            "environment": settings.ENVIRONMENT,
            "docs_url": "/docs",
            "redoc_url": "/redoc",
            "dashboard_url": "/dashboard",
            "api_v1_prefix": settings.API_V1_STR,
        }
