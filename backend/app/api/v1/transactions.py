from typing import Optional, List
import io
import csv
from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.transaction import (
    TransactionCreate,
    TransactionBulkCreate,
    TransactionResponse,
    PaginatedTransactionsResponse,
)
from app.services.aml_service import AMLService

router = APIRouter()


@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED, summary="Ingest & evaluate a single transaction")
def ingest_transaction(tx_in: TransactionCreate, db: Session = Depends(get_db)):
    """
    Submits a transaction to the AML detection engine.
    Executes the multi-model plugin ensemble (Rule-based, XGBoost, Autoencoder, Graph Ring detector),
    calculates risk score & SHAP values, and spawns an alert if suspicious.
    """
    tx = AMLService.process_and_save_transaction(db, tx_in)
    return tx


@router.post("/bulk", response_model=List[TransactionResponse], status_code=status.HTTP_201_CREATED, summary="Bulk ingest transactions")
def ingest_bulk(bulk_in: TransactionBulkCreate, db: Session = Depends(get_db)):
    """Ingests a batch of transactions and processes them through the AML ensemble."""
    results = AMLService.process_bulk(db, bulk_in.transactions)
    return results


@router.post("/upload-csv", summary="Upload PaySim CSV dataset")
async def upload_paysim_csv(
    file: UploadFile = File(...),
    max_rows: int = Query(500, description="Max rows to parse and ingest (prevents timeout on huge CSVs)", ge=1, le=5000),
    db: Session = Depends(get_db)
):
    """
    Directly uploads a PaySim CSV file, parses rows into transactions, runs AML scoring,
    and stores them in the database.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a CSV format."
        )

    content = await file.read()
    decoded = content.decode("utf-8", errors="replace")
    reader = csv.DictReader(io.StringIO(decoded))

    ingested = []
    count = 0

    for row in reader:
        if count >= max_rows:
            break
        try:
            # Map standard PaySim CSV columns
            tx_data = TransactionCreate(
                step=int(row.get("step", 1)),
                type=str(row.get("type", "PAYMENT")).strip().upper(),
                amount=float(row.get("amount", 0.0)),
                name_orig=str(row.get("nameOrig", "UNKNOWN")).strip(),
                old_balance_orig=float(row.get("oldbalanceOrg", 0.0)),
                new_balance_orig=float(row.get("newbalanceOrig", 0.0)),
                name_dest=str(row.get("nameDest", "UNKNOWN")).strip(),
                old_balance_dest=float(row.get("oldbalanceDest", 0.0)),
                new_balance_dest=float(row.get("newbalanceDest", 0.0)),
                is_fraud_ground_truth=int(row.get("isFraud", 0)),
                is_flagged_fraud_ground_truth=int(row.get("isFlaggedFraud", 0)),
            )
            saved = AMLService.process_and_save_transaction(db, tx_data)
            ingested.append(saved.id)
            count += 1
        except Exception as e:
            continue

    return {
        "success": True,
        "filename": file.filename,
        "processed_rows": count,
        "ingested_ids": ingested[:10], # return sample IDs
    }


@router.get("/", response_model=PaginatedTransactionsResponse, summary="Query and filter processed transactions")
def list_transactions(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    tx_type: Optional[str] = Query(None, description="Filter by type: TRANSFER, CASH_OUT, PAYMENT, etc."),
    is_suspicious: Optional[bool] = Query(None, description="Filter by suspicion flag"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level: LOW, MEDIUM, HIGH, CRITICAL"),
    account_id: Optional[str] = Query(None, description="Filter by sender or receiver account ID"),
    min_amount: Optional[float] = Query(None, ge=0, description="Minimum amount threshold"),
    max_amount: Optional[float] = Query(None, ge=0, description="Maximum amount threshold"),
    db: Session = Depends(get_db),
):
    """Retrieve paginated transactions with multi-dimensional filtering."""
    return AMLService.list_transactions(
        db=db,
        page=page,
        page_size=page_size,
        tx_type=tx_type,
        is_suspicious=is_suspicious,
        risk_level=risk_level,
        account_id=account_id,
        min_amount=min_amount,
        max_amount=max_amount,
    )


@router.get("/{tx_id}", response_model=TransactionResponse, summary="Retrieve single transaction details and SHAP explanation")
def get_transaction(tx_id: str, db: Session = Depends(get_db)):
    """Fetch complete transaction details including plugin breakdown and SHAP feature attributions."""
    return AMLService.get_by_id(db, tx_id)
