from app.ml_plugins.base import BaseAMLModelPlugin, ModelType, PluginPrediction
from app.ml_plugins.registry import ModelPluginRegistry, plugin_registry, EnsembleResult
from app.ml_plugins.plugins.rule_based_plugin import HeuristicRulePlugin
from app.ml_plugins.plugins.xgboost_plugin import XGBoostClassifierPlugin
from app.ml_plugins.plugins.autoencoder_plugin import AutoencoderAnomalyPlugin
from app.ml_plugins.plugins.isolation_forest_plugin import IsolationForestPlugin
from app.ml_plugins.plugins.graph_ring_plugin import GraphRingDetectorPlugin

# Register default plugins upon package load
plugin_registry.register(HeuristicRulePlugin())
plugin_registry.register(XGBoostClassifierPlugin())
plugin_registry.register(AutoencoderAnomalyPlugin())
plugin_registry.register(IsolationForestPlugin())
plugin_registry.register(GraphRingDetectorPlugin())

__all__ = [
    "BaseAMLModelPlugin",
    "ModelType",
    "PluginPrediction",
    "ModelPluginRegistry",
    "plugin_registry",
    "EnsembleResult",
    "HeuristicRulePlugin",
    "XGBoostClassifierPlugin",
    "AutoencoderAnomalyPlugin",
    "IsolationForestPlugin",
    "GraphRingDetectorPlugin",
]
