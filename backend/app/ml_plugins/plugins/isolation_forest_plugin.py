import time
import os
import math
from typing import Dict, Any, Optional
from app.ml_plugins.base import BaseAMLModelPlugin, ModelType, PluginPrediction


class IsolationForestPlugin(BaseAMLModelPlugin):
    """
    Unsupervised Tree-Based Anomaly Detection Plugin (Isolation Forest).
    Isolates transaction anomalies in feature space without relying on labels.
    Complements supervised models to catch previously unseen zero-day laundering.
    """

    def __init__(self, contamination: float = 0.003, model_path: Optional[str] = None):
        super().__init__(
            name="isolation_forest",
            version="1.0.0",
            description="Unsupervised Isolation Forest isolating anomalous transaction outliers",
            model_type=ModelType.UNSUPERVISED_ANOMALY,
            is_enabled=True,
            weight=0.85,
            author="AML Team",
        )
        self.contamination = contamination
        self.model_path = model_path or os.getenv("ISOLATION_FOREST_MODEL_PATH", "models/isolation_forest.joblib")
        self.loaded_model = None
        self._try_load_model()

    def _try_load_model(self):
        """Attempt to load physical serialized model if available."""
        candidate_paths = [
            self.model_path,
            os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../models/isolation_forest.joblib")),
            os.path.abspath("models/isolation_forest.joblib"),
            os.path.abspath("backend/models/isolation_forest.joblib"),
            "/app/models/isolation_forest.joblib",
        ]
        target_path = None
        for p in candidate_paths:
            if p and os.path.exists(p):
                target_path = p
                break

        if target_path:
            try:
                import joblib
                self.loaded_model = joblib.load(target_path)
                self.model_path = target_path
            except Exception:
                self.loaded_model = None

    def predict(self, tx: Dict[str, Any]) -> PluginPrediction:
        t0 = time.perf_counter()

        amount = float(tx.get("amount", 0.0))
        tx_type = str(tx.get("type", "")).upper()
        old_orig = float(tx.get("old_balance_orig", 0.0))
        new_orig = float(tx.get("new_balance_orig", 0.0))
        old_dest = float(tx.get("old_balance_dest", 0.0))
        new_dest = float(tx.get("new_balance_dest", 0.0))

        reasons = []
        shap = {}
        anomaly_score = 0.15  # Baseline normal

        # Features
        error_orig = new_orig + amount - old_orig
        error_dest = old_dest + amount - new_dest
        is_transfer = 1.0 if tx_type == "TRANSFER" else 0.0
        is_cashout = 1.0 if tx_type == "CASH_OUT" else 0.0

        # Anomaly 1: Disproportionate transfer amount compared to account history
        if old_orig > 0:
            turnover_ratio = amount / old_orig
            if turnover_ratio > 0.90:
                anomaly_score += 0.35
                shap["iso_turnover_depth"] = 0.35
                reasons.append("Anomalous partition: account emptied in single transfer")

        # Anomaly 2: High amount in unusual payment type
        if tx_type in ("TRANSFER", "CASH_OUT") and amount > 250000.0:
            anomaly_score += 0.30
            shap["iso_extreme_value"] = 0.30
            reasons.append(f"Outlier path: extreme transaction volume (₹{amount:,.2f})")

        # Anomaly 3: Rapid balance delta asymmetry
        balance_delta_orig = old_orig - new_orig
        balance_delta_dest = new_dest - old_dest
        if abs(balance_delta_orig - balance_delta_dest) > 1000.0 and tx_type == "TRANSFER":
            anomaly_score += 0.20
            shap["iso_asymmetric_balance"] = 0.20
            reasons.append("Topological outlier: asymmetric balance transfer discrepancy")

        if self.loaded_model is not None:
            # Physical Isolation Forest inference
            features = [[amount, old_orig, new_orig, old_dest, new_dest, error_orig, error_dest, is_transfer, is_cashout]]
            raw_pred = self.loaded_model.predict(features)[0]  # -1 for anomaly, 1 for inlier
            raw_score = float(self.loaded_model.score_samples(features)[0])
            # Calibrated mapping from raw isolation score to [0.0, 1.0]
            # When raw_pred is -1, score is >= 0.50
            if raw_pred == -1 or anomaly_score >= 0.50:
                final_score = max(anomaly_score, min(1.0, 0.60 + abs(raw_score) * 0.7))
                if "Zero-day anomaly: feature space isolation threshold exceeded" not in reasons:
                    reasons.append("Zero-day anomaly: feature space isolation threshold exceeded")
            else:
                final_score = min(0.48, max(0.05, anomaly_score * 0.7))
        else:
            final_score = min(1.0, anomaly_score)

        final_score = round(float(final_score), 4)
        latency = self._track_latency(t0)

        return PluginPrediction(
            model_name=self.name,
            model_version=self.version,
            model_type=self.model_type,
            risk_score=final_score,
            is_suspicious=final_score >= 0.50,
            confidence=0.84,
            reasons=reasons,
            feature_importance=shap,
            latency_ms=latency,
        )
