from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
import datetime
from app.schemas.transaction import TransactionResponse


class AlertStatusUpdate(BaseModel):
    status: str = Field(..., description="PENDING, UNDER_INVESTIGATION, CONFIRMED_FRAUD, FALSE_POSITIVE")
    investigator_notes: Optional[str] = Field(None, description="Notes on findings")
    assigned_to: Optional[str] = Field(None, description="Investigator username")


class AlertResponse(BaseModel):
    id: int
    transaction_id: str
    risk_score: float
    severity: str
    status: str
    assigned_to: Optional[str] = None
    investigator_notes: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    resolved_at: Optional[datetime.datetime] = None
    transaction: Optional[TransactionResponse] = None

    model_config = ConfigDict(from_attributes=True)
