from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.ml_plugins import plugin_registry
from app.schemas.plugin import (
    PluginMetadataResponse,
    PluginToggleRequest,
    PluginWeightRequest,
)
from app.models.audit import AuditLog

router = APIRouter()


@router.get("/", response_model=List[PluginMetadataResponse], summary="List all registered ML model plugins")
def list_plugins():
    """
    Returns all registered ML model plugins in the system along with their
    status (enabled/disabled), model type, ensemble weight, and performance metrics.
    """
    return plugin_registry.list_plugins()


@router.post("/{plugin_name}/toggle", response_model=PluginMetadataResponse, summary="Enable or disable an ML plugin dynamically")
def toggle_plugin(
    plugin_name: str,
    toggle_in: PluginToggleRequest,
    db: Session = Depends(get_db),
):
    """
    Dynamically toggles a model plugin on or off at runtime without restarting the server.
    """
    plugin = plugin_registry.toggle_plugin(plugin_name, toggle_in.is_enabled)

    # Compliance audit log
    audit_entry = AuditLog(
        entity_type="PLUGIN",
        entity_id=plugin_name,
        action="PLUGIN_TOGGLED",
        performed_by="admin_operator",
        details={"is_enabled": toggle_in.is_enabled},
    )
    db.add(audit_entry)
    db.commit()

    return plugin.get_metadata()


@router.post("/{plugin_name}/weight", response_model=PluginMetadataResponse, summary="Adjust plugin voting weight in ensemble")
def set_plugin_weight(
    plugin_name: str,
    weight_in: PluginWeightRequest,
    db: Session = Depends(get_db),
):
    """
    Adjusts the voting weight (0.0 to 1.0) of an ML plugin in the ensemble risk score calculation.
    """
    plugin = plugin_registry.set_weight(plugin_name, weight_in.weight)

    # Compliance audit log
    audit_entry = AuditLog(
        entity_type="PLUGIN",
        entity_id=plugin_name,
        action="WEIGHT_UPDATED",
        performed_by="admin_operator",
        details={"weight": weight_in.weight},
    )
    db.add(audit_entry)
    db.commit()

    return plugin.get_metadata()
