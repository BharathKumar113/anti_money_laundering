import datetime
import uuid
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, JSON, Index, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    step = Column(Integer, nullable=False, default=1, index=True)
    type = Column(String(20), nullable=False, index=True)
    amount = Column(Float, nullable=False, index=True)
    
    # Originator / Sender
    name_orig = Column(String(64), nullable=False, index=True)
    old_balance_orig = Column(Float, nullable=False)
    new_balance_orig = Column(Float, nullable=False)
    
    # Destination / Recipient
    name_dest = Column(String(64), nullable=False, index=True)
    old_balance_dest = Column(Float, nullable=False)
    new_balance_dest = Column(Float, nullable=False)
    
    # PaySim Ground Truth (optional, for benchmarking)
    is_fraud_ground_truth = Column(Integer, nullable=True, default=0)
    is_flagged_fraud_ground_truth = Column(Integer, nullable=True, default=0)
    
    # ML Scoring & Detection Output
    risk_score = Column(Float, nullable=False, default=0.0, index=True)
    is_suspicious = Column(Boolean, nullable=False, default=False, index=True)
    risk_level = Column(String(16), nullable=False, default="LOW", index=True)
    flag_reasons = Column(JSON, nullable=True)  # List of textual explanations
    shap_values = Column(JSON, nullable=True)   # Feature importance dict
    plugin_scores = Column(JSON, nullable=True) # Per-plugin score breakdown

    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False, index=True)

    # Relationships
    alerts = relationship("Alert", back_populates="transaction", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_tx_orig_dest", "name_orig", "name_dest"),
        Index("ix_tx_risk_status", "risk_level", "is_suspicious"),
    )
