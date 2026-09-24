from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
import datetime


class TransactionBase(BaseModel):
    step: int = Field(default=1, description="Hour timestep of transaction", ge=1)
    type: str = Field(..., description="Transaction type: PAYMENT, TRANSFER, CASH_OUT, DEBIT, CASH_IN")
    amount: float = Field(..., description="Transaction monetary amount", gt=0)
    name_orig: str = Field(..., description="ID of originator account, e.g. C123456789")
    old_balance_orig: float = Field(..., description="Originator initial balance before transaction", ge=0)
    new_balance_orig: float = Field(..., description="Originator balance after transaction", ge=0)
    name_dest: str = Field(..., description="ID of recipient account, e.g. M123456789 or C987654321")
    old_balance_dest: float = Field(..., description="Recipient initial balance before transaction", ge=0)
    new_balance_dest: float = Field(..., description="Recipient balance after transaction", ge=0)
    is_fraud_ground_truth: Optional[int] = Field(default=0, description="Optional ground truth fraud label for benchmarking")
    is_flagged_fraud_ground_truth: Optional[int] = Field(default=0, description="Optional baseline rule flag")


class TransactionCreate(TransactionBase):
    pass


class TransactionBulkCreate(BaseModel):
    transactions: List[TransactionCreate] = Field(..., max_length=1000)


class TransactionResponse(TransactionBase):
    id: str
    risk_score: float
    is_suspicious: bool
    risk_level: str
    flag_reasons: Optional[List[str]] = None
    shap_values: Optional[Dict[str, float]] = None
    plugin_scores: Optional[Dict[str, Any]] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedTransactionsResponse(BaseModel):
    total: int
    page: int
    page_size: int
    pages: int
    items: List[TransactionResponse]
