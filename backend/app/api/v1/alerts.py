from typing import List, Optional
import datetime
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models.alert import Alert
from app.models.audit import AuditLog
from app.schemas.alert import AlertResponse, AlertStatusUpdate
from app.core.exceptions import AlertNotFoundError

router = APIRouter()


@router.get("/", response_model=List[AlertResponse], summary="List suspicious transaction alerts for compliance review")
def list_alerts(
    status: Optional[str] = Query(None, description="Filter: PENDING, UNDER_INVESTIGATION, CONFIRMED_FRAUD, FALSE_POSITIVE"),
    severity: Optional[str] = Query(None, description="Filter: LOW, MEDIUM, HIGH, CRITICAL"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    query = db.query(Alert)
    if status:
        query = query.filter(Alert.status == status.upper())
    if severity:
        query = query.filter(Alert.severity == severity.upper())

    alerts = query.order_by(desc(Alert.created_at)).limit(limit).all()
    return alerts


@router.get("/{alert_id}", response_model=AlertResponse, summary="Get alert details with transaction data")
def get_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise AlertNotFoundError(alert_id)
    return alert


@router.patch("/{alert_id}", response_model=AlertResponse, summary="Update alert investigation status and notes")
def update_alert_status(
    alert_id: int,
    update_in: AlertStatusUpdate,
    db: Session = Depends(get_db),
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise AlertNotFoundError(alert_id)

    old_status = alert.status
    alert.status = update_in.status.upper()
    if update_in.investigator_notes is not None:
        alert.investigator_notes = update_in.investigator_notes
    if update_in.assigned_to is not None:
        alert.assigned_to = update_in.assigned_to

    if alert.status in ("CONFIRMED_FRAUD", "FALSE_POSITIVE"):
        alert.resolved_at = datetime.datetime.now(datetime.timezone.utc)

    # Create immutable compliance audit record
    audit_entry = AuditLog(
        entity_type="ALERT",
        entity_id=str(alert.id),
        action="STATUS_UPDATED",
        performed_by=alert.assigned_to or "investigator",
        details={
            "old_status": old_status,
            "new_status": alert.status,
            "notes": update_in.investigator_notes,
        },
    )
    db.add(audit_entry)

    db.commit()
    db.refresh(alert)
    return alert
