from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class GraphNode(BaseModel):
    id: str = Field(..., description="Account identifier (e.g. C123456)")
    label: str = Field(..., description="Account display label")
    account_type: str = Field(..., description="Customer (C) or Merchant (M)")
    in_degree: int = 0
    out_degree: int = 0
    total_volume_in: float = 0.0
    total_volume_out: float = 0.0
    risk_level: str = "LOW" # LOW, MEDIUM, HIGH


class GraphEdge(BaseModel):
    source: str = Field(..., description="Originator account ID")
    target: str = Field(..., description="Recipient account ID")
    amount: float
    type: str
    step: int
    is_suspicious: bool = False
    transaction_id: str


class GraphNetworkResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    total_nodes: int
    total_edges: int
    suspicious_cycles_count: int = 0


class CycleDetail(BaseModel):
    cycle_length: int
    accounts: List[str]
    total_flow_amount: float
    risk_score: float
    description: str
