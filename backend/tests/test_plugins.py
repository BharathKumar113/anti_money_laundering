from app.ml_plugins.base import BaseAMLModelPlugin, ModelType, PluginPrediction
from app.ml_plugins import plugin_registry


def test_list_plugins(client):
    response = client.get("/api/v1/plugins/")
    assert response.status_code == 200
    plugins = response.json()
    assert len(plugins) >= 4
    plugin_names = [p["name"] for p in plugins]
    assert "heuristic_rules" in plugin_names
    assert "xgboost_classifier" in plugin_names
    assert "autoencoder_anomaly" in plugin_names
    assert "graph_ring_detector" in plugin_names


def test_toggle_plugin(client):
    # Disable heuristic_rules
    response = client.post(
        "/api/v1/plugins/heuristic_rules/toggle",
        json={"is_enabled": False}
    )
    assert response.status_code == 200
    assert response.json()["is_enabled"] is False

    # Re-enable
    response = client.post(
        "/api/v1/plugins/heuristic_rules/toggle",
        json={"is_enabled": True}
    )
    assert response.status_code == 200
    assert response.json()["is_enabled"] is True


def test_update_plugin_weight(client):
    response = client.post(
        "/api/v1/plugins/xgboost_classifier/weight",
        json={"weight": 0.75}
    )
    assert response.status_code == 200
    assert response.json()["weight"] == 0.75


def test_custom_dynamic_plugin_registration():
    """Verify that a brand-new model plugin can be created and registered at runtime."""
    class CustomTransformerPlugin(BaseAMLModelPlugin):
        def __init__(self):
            super().__init__(
                name="custom_transformer_nlp",
                version="0.1.0",
                description="Transformer-based memo text classifier",
                model_type=ModelType.CUSTOM,
                is_enabled=True,
                weight=0.9,
                author="Guest Researcher",
            )

        def predict(self, tx):
            return PluginPrediction(
                model_name=self.name,
                model_version=self.version,
                model_type=self.model_type,
                risk_score=0.95,
                is_suspicious=True,
                confidence=0.99,
                reasons=["Suspicious keyword detected in transaction metadata"],
                feature_importance={"keyword_risk": 0.95},
            )

    custom_plugin = CustomTransformerPlugin()
    plugin_registry.register(custom_plugin)

    # Verify registration
    retrieved = plugin_registry.get_plugin("custom_transformer_nlp")
    assert retrieved.name == "custom_transformer_nlp"

    # Verify ensemble execution includes this new plugin
    dummy_tx = {
        "amount": 100.0,
        "type": "PAYMENT",
        "old_balance_orig": 1000.0,
        "new_balance_orig": 900.0,
        "old_balance_dest": 0.0,
        "new_balance_dest": 100.0,
    }
    result = plugin_registry.execute_ensemble(dummy_tx)
    assert "custom_transformer_nlp" in result.plugin_predictions
    assert any("[custom_transformer_nlp]" in r for r in result.flag_reasons)

    # Clean up
    plugin_registry.unregister("custom_transformer_nlp")
