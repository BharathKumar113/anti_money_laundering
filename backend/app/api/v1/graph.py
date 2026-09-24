from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.graph import GraphNetworkResponse, CycleDetail
from app.services.graph_service import GraphService

router = APIRouter()


@router.get("/account/{account_id}", response_model=GraphNetworkResponse, summary="Get transaction flow graph for an account")
def get_account_graph(
    account_id: str,
    hops: int = Query(2, ge=1, le=4, description="Depth of transaction hops around account"),
    db: Session = Depends(get_db),
):
    """
    Returns nodes and edges representing money flow around an account for interactive
    visualizations (D3.js, Cytoscape, or Streamlit agraph).
    """
    return GraphService.get_account_subgraph(db=db, account_id=account_id, max_hops=hops)


@router.get("/cycles", response_model=List[CycleDetail], summary="Detect money laundering cycles (round-tripping loops)")
def detect_cycles(
    min_length: int = Query(2, ge=2, le=5),
    max_length: int = Query(5, ge=2, le=8),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """
    Executes cycle detection across transactions to identify circular laundering rings.
    """
    return GraphService.detect_global_cycles(
        db=db,
        min_length=min_length,
        max_length=max_length,
        limit=limit,
    )
