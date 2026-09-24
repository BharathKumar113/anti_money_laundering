from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class PluginMetadataResponse(BaseModel):
    name: str
    version: str
    description: str
    model_type: str  # SUPERVISED, UNSUPERVISED_ANOMALY, GRAPH_ANALYTICS, HEURISTIC
    is_enabled: bool
    weight: float
    author: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    execution_count: int = 0
    avg_latency_ms: float = 0.0


class PluginToggleRequest(BaseModel):
    is_enabled: bool = Field(..., description="Enable or disable this ML model plugin")


class PluginWeightRequest(BaseModel):
    weight: float = Field(..., ge=0.0, le=1.0, description="Voting weight of this model in the ensemble (0.0 to 1.0)")
