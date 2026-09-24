from typing import Dict, List, Any, Optional
import logging
from app.ml_plugins.base import BaseAMLModelPlugin, PluginPrediction
from app.core.exceptions import PluginNotFoundError, PluginExecutionError
from app.core.config import settings

logger = logging.getLogger("aml.plugins.registry")


class EnsembleResult:
    def __init__(
        self,
        ensemble_risk_score: float,
        is_suspicious: bool,
        risk_level: str,
        flag_reasons: List[str],
        shap_values: Dict[str, float],
        plugin_predictions: Dict[str, Dict[str, Any]],
    ):
        self.ensemble_risk_score = ensemble_risk_score
        self.is_suspicious = is_suspicious
        self.risk_level = risk_level
        self.flag_reasons = flag_reasons
        self.shap_values = shap_values
        self.plugin_predictions = plugin_predictions


class ModelPluginRegistry:
    """
    Central registry and orchestrator for all AML ML model plugins.
    Provides dynamic hot-loading, toggling, weight adjustment, and ensemble aggregation.
    """

    def __init__(self):
        self._plugins: Dict[str, BaseAMLModelPlugin] = {}

    def register(self, plugin: BaseAMLModelPlugin) -> None:
        """Register a new ML model plugin into the registry."""
        if plugin.name in self._plugins:
            logger.warning(f"Overwriting already registered plugin '{plugin.name}'")
        self._plugins[plugin.name] = plugin
        logger.info(
            f"Registered ML Plugin: [{plugin.name}] v{plugin.version} "
            f"({plugin.model_type.value}) - Enabled: {plugin.is_enabled}, Weight: {plugin.weight}"
        )

    def unregister(self, name: str) -> None:
        """Unregister a plugin by name."""
        if name not in self._plugins:
            raise PluginNotFoundError(name)
        del self._plugins[name]
        logger.info(f"Unregistered plugin '{name}'")

    def get_plugin(self, name: str) -> BaseAMLModelPlugin:
        """Fetch a plugin by its name."""
        if name not in self._plugins:
            raise PluginNotFoundError(name)
        return self._plugins[name]

    def list_plugins(self) -> List[Dict[str, Any]]:
        """Return metadata for all registered plugins."""
        return [plugin.get_metadata() for plugin in self._plugins.values()]

    def toggle_plugin(self, name: str, is_enabled: bool) -> BaseAMLModelPlugin:
        """Dynamically enable or disable a plugin at runtime."""
        plugin = self.get_plugin(name)
        plugin.is_enabled = is_enabled
        logger.info(f"Plugin '{name}' enabled status set to: {is_enabled}")
        return plugin

    def set_weight(self, name: str, weight: float) -> BaseAMLModelPlugin:
        """Update the voting weight of a plugin in ensemble calculation."""
        plugin = self.get_plugin(name)
        plugin.weight = max(0.0, min(1.0, weight))
        logger.info(f"Plugin '{name}' ensemble weight set to: {plugin.weight}")
        return plugin

    def execute_ensemble(self, transaction: Dict[str, Any]) -> EnsembleResult:
        """
        Executes all active plugins against a single transaction, then aggregates
        their scores and explanations into a unified Ensemble Risk Assessment.
        """
        active_plugins = [p for p in self._plugins.values() if p.is_enabled and p.weight > 0]

        if not active_plugins:
            logger.warning("No active plugins found in registry; defaulting to low risk fallback.")
            return EnsembleResult(
                ensemble_risk_score=0.0,
                is_suspicious=False,
                risk_level="LOW",
                flag_reasons=["No active AML model plugins enabled"],
                shap_values={},
                plugin_predictions={},
            )

        total_weight = 0.0
        weighted_score_sum = 0.0
        all_reasons: List[str] = []
        aggregated_shap: Dict[str, float] = {}
        predictions_map: Dict[str, Dict[str, Any]] = {}

        for plugin in active_plugins:
            try:
                pred: PluginPrediction = plugin.predict(transaction)
                predictions_map[plugin.name] = {
                    "risk_score": pred.risk_score,
                    "is_suspicious": pred.is_suspicious,
                    "confidence": pred.confidence,
                    "reasons": pred.reasons,
                    "model_type": pred.model_type.value,
                    "version": pred.model_version,
                    "latency_ms": pred.latency_ms,
                }

                # Weighted risk score
                weighted_score_sum += pred.risk_score * plugin.weight
                total_weight += plugin.weight

                # Aggregate reasons
                if pred.is_suspicious:
                    for r in pred.reasons:
                        reason_str = f"[{plugin.name}] {r}"
                        if reason_str not in all_reasons:
                            all_reasons.append(reason_str)

                # Aggregate feature importance / SHAP
                for feat, val in pred.feature_importance.items():
                    aggregated_shap[feat] = aggregated_shap.get(feat, 0.0) + (val * plugin.weight)

            except Exception as e:
                logger.error(f"Error executing plugin '{plugin.name}': {e}", exc_info=True)
                raise PluginExecutionError(plugin.name, str(e))

        # Calculate final weighted risk score
        final_score = weighted_score_sum / total_weight if total_weight > 0 else 0.0
        final_score = round(max(0.0, min(1.0, final_score)), 4)

        # Normalize aggregated SHAP values
        if total_weight > 0:
            aggregated_shap = {
                k: round(v / total_weight, 4) for k, v in aggregated_shap.items()
            }

        # Determine risk level
        if final_score >= settings.SUSPICIOUS_THRESHOLD_HIGH:
            risk_level = "CRITICAL" if final_score >= 0.90 else "HIGH"
        elif final_score >= settings.SUSPICIOUS_THRESHOLD_MEDIUM:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        is_suspicious = final_score >= settings.SUSPICIOUS_THRESHOLD_MEDIUM

        return EnsembleResult(
            ensemble_risk_score=final_score,
            is_suspicious=is_suspicious,
            risk_level=risk_level,
            flag_reasons=all_reasons,
            shap_values=aggregated_shap,
            plugin_predictions=predictions_map,
        )


# Global Singleton Plugin Registry
plugin_registry = ModelPluginRegistry()
