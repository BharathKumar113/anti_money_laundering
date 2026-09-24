import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from app.core.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    transaction_id = Column(String(36), ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    risk_score = Column(Float, nullable=False, index=True)
    severity = Column(String(16), nullable=False, default="MEDIUM", index=True) # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(32), nullable=False, default="PENDING", index=True)  # PENDING, UNDER_INVESTIGATION, CONFIRMED_FRAUD, FALSE_POSITIVE
    
    assigned_to = Column(String(64), nullable=True) # Investigator name/ID
    investigator_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False, index=True)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    transaction = relationship("Transaction", back_populates="alerts")

    __table_args__ = (
        Index("ix_alerts_status_severity", "status", "severity"),
    )
