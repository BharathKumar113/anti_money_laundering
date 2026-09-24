from abc import ABC, abstractmethod
from enum import Enum
from typing import Dict, Any, List, Optional
import time
from pydantic import BaseModel, Field


class ModelType(str, Enum):
    HEURISTIC = "HEURISTIC"
    SUPERVISED = "SUPERVISED"
    UNSUPERVISED_ANOMALY = "UNSUPERVISED_ANOMALY"
    GRAPH_ANALYTICS = "GRAPH_ANALYTICS"
    CUSTOM = "CUSTOM"


class PluginPrediction(BaseModel):
    model_name: str
    model_version: str
    model_type: ModelType
    risk_score: float = Field(..., ge=0.0, le=1.0, description="Normalized risk score from 0.0 to 1.0")
    is_suspicious: bool
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)
    reasons: List[str] = Field(default_factory=list)
    feature_importance: Dict[str, float] = Field(default_factory=dict, description="SHAP or feature contribution values")
    latency_ms: float = 0.0


class BaseAMLModelPlugin(ABC):
    """
    Abstract Base Class for all Anti-Money Laundering Model Plugins.
    New models (e.g. Chandana's XGBoost, Autoencoder, PyTorch GNN, or Graph link analysis)
    can simply subclass this and register with the ModelPluginRegistry.
    """

    def __init__(
        self,
        name: str,
        version: str,
        description: str,
        model_type: ModelType,
        is_enabled: bool = True,
        weight: float = 1.0,
        author: str = "AML Team",
    ):
        self.name = name
        self.version = version
        self.description = description
        self.model_type = model_type
        self.is_enabled = is_enabled
        self.weight = weight
        self.author = author
        
        # Telemetry
        self.execution_count: int = 0
        self.total_latency_ms: float = 0.0

    @abstractmethod
    def predict(self, transaction: Dict[str, Any]) -> PluginPrediction:
        """
        Execute prediction on a single transaction dictionary.
        Returns a PluginPrediction object.
        """
        pass

    def predict_batch(self, transactions: List[Dict[str, Any]]) -> List[PluginPrediction]:
        """
        Batch prediction default implementation. Can be overridden for vectorized batch inference.
        """
        return [self.predict(tx) for tx in transactions]

    def explain(self, transaction: Dict[str, Any]) -> Dict[str, float]:
        """
        Generate feature attribution / SHAP importance dictionary for this transaction.
        """
        pred = self.predict(transaction)
        return pred.feature_importance

    def get_metadata(self) -> Dict[str, Any]:
        avg_latency = (
            (self.total_latency_ms / self.execution_count)
            if self.execution_count > 0
            else 0.0
        )
        return {
            "name": self.name,
            "version": self.version,
            "description": self.description,
            "model_type": self.model_type.value,
            "is_enabled": self.is_enabled,
            "weight": self.weight,
            "author": self.author,
            "execution_count": self.execution_count,
            "avg_latency_ms": round(avg_latency, 2),
        }

    def _track_latency(self, start_time: float) -> float:
        latency = (time.perf_counter() - start_time) * 1000.0
        self.execution_count += 1
        self.total_latency_ms += latency
        return round(latency, 2)
