import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal, init_db
from app.schemas.transaction import TransactionCreate
from app.services.aml_service import AMLService
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")


def seed_aml_data():
    init_db()
    db = SessionLocal()

    logger.info("Seeding realistic AML and PaySim transactions...")

    # 1. Normal legitimate transactions
    legitimate_samples = [
        TransactionCreate(
            step=1, type="PAYMENT", amount=45.50,
            name_orig="C100000001", old_balance_orig=1500.0, new_balance_orig=1454.50,
            name_dest="M900000001", old_balance_dest=0.0, new_balance_dest=0.0
        ),
        TransactionCreate(
            step=1, type="PAYMENT", amount=120.00,
            name_orig="C100000002", old_balance_orig=450.0, new_balance_orig=330.0,
            name_dest="M900000002", old_balance_dest=0.0, new_balance_dest=0.0
        ),
        TransactionCreate(
            step=2, type="CASH_IN", amount=5000.00,
            name_orig="C100000003", old_balance_orig=200.0, new_balance_orig=5200.0,
            name_dest="C100000003", old_balance_dest=200.0, new_balance_dest=5200.0
        ),
        TransactionCreate(
            step=2, type="PAYMENT", amount=89.90,
            name_orig="C100000004", old_balance_orig=2300.0, new_balance_orig=2210.10,
            name_dest="M900000003", old_balance_dest=0.0, new_balance_dest=0.0
        ),
    ]

    # 2. Classic High-Value PaySim Laundering (Account Balance Drain via TRANSFER + CASH_OUT)
    drain_laundering = [
        TransactionCreate(
            step=3, type="TRANSFER", amount=350000.00,
            name_orig="C_VICTIM_01", old_balance_orig=350000.00, new_balance_orig=0.0,
            name_dest="C_MULE_01", old_balance_dest=0.0, new_balance_dest=350000.00,
            is_fraud_ground_truth=1
        ),
        TransactionCreate(
            step=3, type="CASH_OUT", amount=350000.00,
            name_orig="C_MULE_01", old_balance_orig=350000.00, new_balance_orig=0.0,
            name_dest="M_EXCHANGER_99", old_balance_dest=0.0, new_balance_dest=0.0,
            is_fraud_ground_truth=1
        ),
    ]

    # 3. Structuring / Smurfing Pattern (Amounts just under reporting threshold $10,000)
    structuring_samples = [
        TransactionCreate(
            step=4, type="TRANSFER", amount=9800.00,
            name_orig="C_SMURF_BOSS", old_balance_orig=50000.0, new_balance_orig=40200.0,
            name_dest="C_MULE_ALPHA", old_balance_dest=50.0, new_balance_dest=9850.0
        ),
        TransactionCreate(
            step=4, type="TRANSFER", amount=9500.00,
            name_orig="C_SMURF_BOSS", old_balance_orig=40200.0, new_balance_orig=30700.0,
            name_dest="C_MULE_BETA", old_balance_dest=100.0, new_balance_dest=9600.0
        ),
        TransactionCreate(
            step=4, type="TRANSFER", amount=9900.00,
            name_orig="C_SMURF_BOSS", old_balance_orig=30700.0, new_balance_orig=20800.0,
            name_dest="C_MULE_GAMMA", old_balance_dest=0.0, new_balance_dest=9900.0
        ),
    ]

    # 4. Circular Laundering Ring / Round-Tripping (A -> B -> C -> A)
    circular_ring = [
        TransactionCreate(
            step=5, type="TRANSFER", amount=180000.00,
            name_orig="C_RING_ACC_A", old_balance_orig=200000.0, new_balance_orig=20000.0,
            name_dest="C_RING_ACC_B", old_balance_dest=5000.0, new_balance_dest=185000.0
        ),
        TransactionCreate(
            step=5, type="TRANSFER", amount=175000.00,
            name_orig="C_RING_ACC_B", old_balance_orig=185000.0, new_balance_orig=10000.0,
            name_dest="C_RING_ACC_C", old_balance_dest=1000.0, new_balance_dest=176000.0
        ),
        TransactionCreate(
            step=6, type="TRANSFER", amount=170000.00,
            name_orig="C_RING_ACC_C", old_balance_orig=176000.0, new_balance_orig=6000.0,
            name_dest="C_RING_ACC_A", old_balance_dest=20000.0, new_balance_dest=190000.0
        ),
    ]

    all_seed = legitimate_samples + drain_laundering + structuring_samples + circular_ring

    for tx in all_seed:
        saved = AMLService.process_and_save_transaction(db, tx)
        logger.info(
            f"Seeded Tx: {saved.type} | Amount: ₹{saved.amount:,.2f} | "
            f"Risk: {saved.risk_score:.2f} ({saved.risk_level}) | Suspicious: {saved.is_suspicious}"
        )

    db.close()
    logger.info(f"Seeding completed! Ingested {len(all_seed)} realistic transactions.")


if __name__ == "__main__":
    seed_aml_data()
