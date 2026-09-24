from typing import Dict, List, Any
from pydantic import BaseModel


class DashboardKPIsResponse(BaseModel):
    total_transactions: int
    total_volume_amount: float
    flagged_transactions_count: int
    flagged_volume_amount: float
    fraud_rate_percentage: float
    pending_alerts_count: int
    under_investigation_count: int
    confirmed_fraud_count: int
    false_positives_count: int
    precision_rate_percentage: float
    recall_rate_percentage: float
    f1_score_percentage: float
    auc_roc: float
    transactions_by_type: Dict[str, int]
    risk_level_distribution: Dict[str, int]
