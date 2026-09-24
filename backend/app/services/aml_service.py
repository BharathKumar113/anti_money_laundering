from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
import logging
from app.models.transaction import Transaction
from app.models.alert import Alert
from app.models.audit import AuditLog
from app.schemas.transaction import TransactionCreate, PaginatedTransactionsResponse, TransactionResponse
from app.ml_plugins import plugin_registry, EnsembleResult
from app.core.exceptions import TransactionNotFoundError

logger = logging.getLogger("aml.services.aml")


class AMLService:
    @staticmethod
    def process_and_save_transaction(db: Session, tx_in: TransactionCreate) -> Transaction:
        """
        Runs the full AML ingestion pipeline:
        1. Executes all active ML model plugins in ensemble.
        2. Persists enriched transaction record to database.
        3. Spawns an Alert case if transaction is deemed suspicious.
        """
        tx_dict = tx_in.model_dump()

        # Run multi-model ensemble detection
        ensemble: EnsembleResult = plugin_registry.execute_ensemble(tx_dict)

        # Create Transaction ORM instance
        db_tx = Transaction(
            step=tx_in.step,
            type=tx_in.type.upper(),
            amount=tx_in.amount,
            name_orig=tx_in.name_orig,
            old_balance_orig=tx_in.old_balance_orig,
            new_balance_orig=tx_in.new_balance_orig,
            name_dest=tx_in.name_dest,
            old_balance_dest=tx_in.old_balance_dest,
            new_balance_dest=tx_in.new_balance_dest,
            is_fraud_ground_truth=tx_in.is_fraud_ground_truth or 0,
            is_flagged_fraud_ground_truth=tx_in.is_flagged_fraud_ground_truth or 0,
            risk_score=ensemble.ensemble_risk_score,
            is_suspicious=ensemble.is_suspicious,
            risk_level=ensemble.risk_level,
            flag_reasons=ensemble.flag_reasons,
            shap_values=ensemble.shap_values,
            plugin_scores=ensemble.plugin_predictions,
        )
        db.add(db_tx)
        db.flush()  # Generate db_tx.id

        # Trigger automatic compliance alert case if suspicious
        if ensemble.is_suspicious:
            alert = Alert(
                transaction_id=db_tx.id,
                risk_score=ensemble.ensemble_risk_score,
                severity=ensemble.risk_level,
                status="PENDING",
            )
            db.add(alert)
            logger.info(
                f"Generated AML Alert: Tx={db_tx.id}, Score={ensemble.ensemble_risk_score}, "
                f"Severity={ensemble.risk_level}, Reasons={len(ensemble.flag_reasons)}"
            )

        db.commit()
        db.refresh(db_tx)
        return db_tx

    @staticmethod
    def process_bulk(db: Session, transactions: List[TransactionCreate]) -> List[Transaction]:
        """Process batch of transactions."""
        results = []
        for tx_in in transactions:
            results.append(AMLService.process_and_save_transaction(db, tx_in))
        return results

    @staticmethod
    def get_by_id(db: Session, tx_id: str) -> Transaction:
        tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
        if not tx:
            raise TransactionNotFoundError(tx_id)
        return tx

    @staticmethod
    def list_transactions(
        db: Session,
        page: int = 1,
        page_size: int = 20,
        tx_type: Optional[str] = None,
        is_suspicious: Optional[bool] = None,
        risk_level: Optional[str] = None,
        account_id: Optional[str] = None,
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None,
    ) -> PaginatedTransactionsResponse:
        query = db.query(Transaction)

        if tx_type:
            query = query.filter(Transaction.type == tx_type.upper())
        if is_suspicious is not None:
            query = query.filter(Transaction.is_suspicious == is_suspicious)
        if risk_level:
            query = query.filter(Transaction.risk_level == risk_level.upper())
        if account_id:
            query = query.filter(
                (Transaction.name_orig == account_id) | (Transaction.name_dest == account_id)
            )
        if min_amount is not None:
            query = query.filter(Transaction.amount >= min_amount)
        if max_amount is not None:
            query = query.filter(Transaction.amount <= max_amount)

        total = query.count()
        pages = (total + page_size - 1) // page_size if total > 0 else 1

        items = (
            query.order_by(desc(Transaction.created_at), desc(Transaction.risk_score))
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        return PaginatedTransactionsResponse(
            total=total,
            page=page,
            page_size=page_size,
            pages=pages,
            items=[TransactionResponse.model_validate(it) for it in items],
        )
