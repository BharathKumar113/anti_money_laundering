from typing import List, Dict, Any, Set
import networkx as nx
from sqlalchemy.orm import Session
from sqlalchemy import or_
import logging
from app.models.transaction import Transaction
from app.schemas.graph import GraphNode, GraphEdge, GraphNetworkResponse, CycleDetail

logger = logging.getLogger("aml.services.graph")


class GraphService:
    @staticmethod
    def get_account_subgraph(
        db: Session,
        account_id: str,
        max_hops: int = 2,
        limit_edges: int = 150,
    ) -> GraphNetworkResponse:
        """
        Constructs an egocentric money-flow subgraph around a specific account ID
        up to `max_hops` deep using NetworkX.
        """
        visited_accounts: Set[str] = {account_id}
        frontier: Set[str] = {account_id}
        all_transactions: List[Transaction] = []

        for _ in range(max_hops):
            if not frontier:
                break
            
            # Fetch transactions involving current frontier accounts
            txs = (
                db.query(Transaction)
                .filter(
                    or_(
                        Transaction.name_orig.in_(frontier),
                        Transaction.name_dest.in_(frontier),
                    )
                )
                .limit(limit_edges)
                .all()
            )

            new_frontier: Set[str] = set()
            for tx in txs:
                if tx not in all_transactions:
                    all_transactions.append(tx)
                if tx.name_orig not in visited_accounts:
                    new_frontier.add(tx.name_orig)
                    visited_accounts.add(tx.name_orig)
                if tx.name_dest not in visited_accounts:
                    new_frontier.add(tx.name_dest)
                    visited_accounts.add(tx.name_dest)

            frontier = new_frontier

        # Build NetworkX Directed Graph
        G = nx.DiGraph()

        node_metrics: Dict[str, Dict[str, Any]] = {}
        for acc in visited_accounts:
            node_metrics[acc] = {
                "in_degree": 0,
                "out_degree": 0,
                "volume_in": 0.0,
                "volume_out": 0.0,
                "max_risk": 0.0,
            }

        edges_list: List[GraphEdge] = []
        for tx in all_transactions:
            G.add_edge(tx.name_orig, tx.name_dest, weight=tx.amount, type=tx.type)

            # Update metrics
            node_metrics[tx.name_orig]["out_degree"] += 1
            node_metrics[tx.name_orig]["volume_out"] += tx.amount
            node_metrics[tx.name_orig]["max_risk"] = max(node_metrics[tx.name_orig]["max_risk"], tx.risk_score)

            node_metrics[tx.name_dest]["in_degree"] += 1
            node_metrics[tx.name_dest]["volume_in"] += tx.amount
            node_metrics[tx.name_dest]["max_risk"] = max(node_metrics[tx.name_dest]["max_risk"], tx.risk_score)

            edges_list.append(
                GraphEdge(
                    source=tx.name_orig,
                    target=tx.name_dest,
                    amount=round(tx.amount, 2),
                    type=tx.type,
                    step=tx.step,
                    is_suspicious=tx.is_suspicious,
                    transaction_id=tx.id,
                )
            )

        # Build GraphNode list
        nodes_list: List[GraphNode] = []
        for acc_id, metrics in node_metrics.items():
            acc_type = "Merchant" if acc_id.startswith("M") else "Customer"
            risk_val = metrics["max_risk"]
            risk_level = "CRITICAL" if risk_val >= 0.85 else ("HIGH" if risk_val >= 0.70 else ("MEDIUM" if risk_val >= 0.40 else "LOW"))

            nodes_list.append(
                GraphNode(
                    id=acc_id,
                    label=f"{acc_type} {acc_id[:8]}",
                    account_type=acc_type,
                    in_degree=metrics["in_degree"],
                    out_degree=metrics["out_degree"],
                    total_volume_in=round(metrics["volume_in"], 2),
                    total_volume_out=round(metrics["volume_out"], 2),
                    risk_level=risk_level,
                )
            )

        # Check for simple cycles in this subgraph
        cycle_count = 0
        try:
            cycles = list(nx.simple_cycles(G))
            cycle_count = len(cycles)
        except Exception:
            cycle_count = 0

        return GraphNetworkResponse(
            nodes=nodes_list,
            edges=edges_list,
            total_nodes=len(nodes_list),
            total_edges=len(edges_list),
            suspicious_cycles_count=cycle_count,
        )

    @staticmethod
    def detect_global_cycles(
        db: Session,
        min_length: int = 2,
        max_length: int = 5,
        limit: int = 20,
    ) -> List[CycleDetail]:
        """
        Constructs transaction network graph across high-risk transactions
        and extracts cyclic fund flows (round-tripping loops).
        """
        # Load high-risk or transfer transactions
        txs = (
            db.query(Transaction)
            .filter(Transaction.type.in_(["TRANSFER", "CASH_OUT"]))
            .order_by(Transaction.created_at.desc())
            .limit(500)
            .all()
        )

        G = nx.DiGraph()
        edge_amounts: Dict[tuple, float] = {}

        for tx in txs:
            G.add_edge(tx.name_orig, tx.name_dest, weight=tx.amount)
            edge_amounts[(tx.name_orig, tx.name_dest)] = tx.amount

        detected_cycles: List[CycleDetail] = []
        try:
            for cycle in nx.simple_cycles(G):
                cycle_len = len(cycle)
                if min_length <= cycle_len <= max_length:
                    total_flow = 0.0
                    for i in range(cycle_len):
                        u = cycle[i]
                        v = cycle[(i + 1) % cycle_len]
                        total_flow += edge_amounts.get((u, v), 0.0)

                    # Round-tripping cyclic risk score
                    risk = min(1.0, 0.70 + (0.05 * cycle_len))
                    detected_cycles.append(
                        CycleDetail(
                            cycle_length=cycle_len,
                            accounts=cycle,
                            total_flow_amount=round(total_flow, 2),
                            risk_score=risk,
                            description=(
                                f"Circular fund routing (round-tripping) detected across {cycle_len} accounts: "
                                f"{' -> '.join(cycle[:3])} -> ... -> {cycle[0]}"
                            ),
                        )
                    )
                    if len(detected_cycles) >= limit:
                        break
        except Exception as e:
            logger.error(f"Error finding cycles with NetworkX: {e}")

        return detected_cycles
