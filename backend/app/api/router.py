from fastapi import APIRouter
from app.api.v1 import (
    health,
    transactions,
    alerts,
    graph,
    plugins,
    analytics,
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health & Status"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["Transactions Ingestion & Query"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Investigator Alerts & Triage"])
api_router.include_router(graph.router, prefix="/graph", tags=["NetworkX Graph Analytics"])
api_router.include_router(plugins.router, prefix="/plugins", tags=["ML Model Plugins"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Dashboard KPIs & Analytics"])
