import time
from typing import Dict, Any
from app.ml_plugins.base import BaseAMLModelPlugin, ModelType, PluginPrediction


class HeuristicRulePlugin(BaseAMLModelPlugin):
    """
    Baseline Rule-Based AML Plugin.
    Emulates traditional financial compliance rules (static thresholds).
    """

    def __init__(self):
        super().__init__(
            name="heuristic_rules",
            version="1.0.0",
            description="Traditional AML rule engine with threshold heuristics",
            model_type=ModelType.HEURISTIC,
            is_enabled=True,
            weight=0.5, # Lower weight compared to ML models
            author="AML Team",
        )

    def predict(self, tx: Dict[str, Any]) -> PluginPrediction:
        t0 = time.perf_counter()
        reasons = []
        rule_score = 0.0
        shap = {}

        amount = float(tx.get("amount", 0.0))
        tx_type = str(tx.get("type", "")).upper()
        old_orig = float(tx.get("old_balance_orig", 0.0))
        new_orig = float(tx.get("new_balance_orig", 0.0))
        old_dest = float(tx.get("old_balance_dest", 0.0))
        new_dest = float(tx.get("new_balance_dest", 0.0))

        # Rule 1: High Dollar Value Threshold (> ₹2,00,000)
        if amount >= 200000.0:
            rule_score += 0.35
            reasons.append(f"High-value threshold breached: ₹{amount:,.2f} >= ₹200,000")
            shap["high_amount_rule"] = 0.35

        # Rule 2: High Risk Transaction Type (In PaySim, fraud only occurs in TRANSFER and CASH_OUT)
        if tx_type in ("TRANSFER", "CASH_OUT"):
            rule_score += 0.25
            shap["high_risk_type"] = 0.25
            if tx_type == "TRANSFER":
                reasons.append("High-risk transfer type: TRANSFER")
            else:
                reasons.append("High-risk transfer type: CASH_OUT")

        # Rule 3: Complete Account Balance Emptying
        if old_orig > 10000.0 and new_orig == 0.0 and abs(old_orig - amount) < 1.0:
            rule_score += 0.30
            reasons.append("Originator balance completely emptied to 0.00")
            shap["balance_emptied"] = 0.30

        # Rule 4: Zero initial recipient balance with massive transfer
        if old_dest == 0.0 and amount >= 100000.0 and tx_type == "TRANSFER":
            rule_score += 0.15
            reasons.append("Mule recipient indicator: zero initial balance with high transfer")
            shap["mule_dest_zero_balance"] = 0.15

        final_score = min(1.0, rule_score)
        latency = self._track_latency(t0)

        return PluginPrediction(
            model_name=self.name,
            model_version=self.version,
            model_type=self.model_type,
            risk_score=round(final_score, 4),
            is_suspicious=final_score >= 0.50,
            confidence=0.75,
            reasons=reasons,
            feature_importance=shap,
            latency_ms=latency,
        )
