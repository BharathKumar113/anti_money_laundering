from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.analytics import DashboardKPIsResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/dashboard-kpis", response_model=DashboardKPIsResponse, summary="Get summary KPIs for investigator dashboard")
def get_kpis(db: Session = Depends(get_db)):
    """
    Returns aggregated KPIs including total transaction volume, flagged fraud rate,
    precision & recall metrics, and distribution breakdown.
    """
    return AnalyticsService.get_dashboard_kpis(db)
