import datetime
from sqlalchemy import Column, String, Integer, DateTime, JSON, Text
from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    entity_type = Column(String(32), nullable=False, index=True) # ALERT, TRANSACTION, PLUGIN
    entity_id = Column(String(64), nullable=False, index=True)
    action = Column(String(64), nullable=False, index=True)      # STATUS_UPDATED, PLUGIN_TOGGLED, etc.
    performed_by = Column(String(64), nullable=False, default="investigator_default")
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False, index=True)
