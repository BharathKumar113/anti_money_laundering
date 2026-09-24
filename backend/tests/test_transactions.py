import io


def test_ingest_legitimate_transaction(client):
    tx_payload = {
        "step": 1,
        "type": "PAYMENT",
        "amount": 54.20,
        "name_orig": "C123456789",
        "old_balance_orig": 1000.0,
        "new_balance_orig": 945.80,
        "name_dest": "M987654321",
        "old_balance_dest": 0.0,
        "new_balance_dest": 0.0,
    }
    response = client.post("/api/v1/transactions/", json=tx_payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["amount"] == 54.20
    assert data["risk_score"] < 0.40
    assert data["is_suspicious"] is False
    assert data["risk_level"] == "LOW"


def test_ingest_suspicious_transaction(client):
    tx_payload = {
        "step": 2,
        "type": "TRANSFER",
        "amount": 400000.00,
        "name_orig": "C_SUSPECT_01",
        "old_balance_orig": 400000.00,
        "new_balance_orig": 0.00,
        "name_dest": "C_MULE_99",
        "old_balance_dest": 0.0,
        "new_balance_dest": 400000.00,
    }
    response = client.post("/api/v1/transactions/", json=tx_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["is_suspicious"] is True
    assert data["risk_score"] >= 0.70
    assert data["risk_level"] in ("HIGH", "CRITICAL")
    assert len(data["flag_reasons"]) > 0
    assert "shap_values" in data
    assert len(data["shap_values"]) > 0


def test_bulk_transactions_ingestion(client):
    bulk_payload = {
        "transactions": [
            {
                "step": 1,
                "type": "PAYMENT",
                "amount": 20.0,
                "name_orig": "C101",
                "old_balance_orig": 100.0,
                "new_balance_orig": 80.0,
                "name_dest": "M101",
                "old_balance_dest": 0.0,
                "new_balance_dest": 0.0,
            },
            {
                "step": 1,
                "type": "TRANSFER",
                "amount": 250000.0,
                "name_orig": "C102",
                "old_balance_orig": 250000.0,
                "new_balance_orig": 0.0,
                "name_dest": "C103",
                "old_balance_dest": 0.0,
                "new_balance_dest": 250000.0,
            },
        ]
    }
    response = client.post("/api/v1/transactions/bulk", json=bulk_payload)
    assert response.status_code == 201
    items = response.json()
    assert len(items) == 2


def test_list_and_filter_transactions(client):
    response = client.get("/api/v1/transactions/?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    assert isinstance(data["items"], list)


def test_upload_paysim_csv(client):
    csv_content = (
        "step,type,amount,nameOrig,oldbalanceOrg,newbalanceOrig,nameDest,oldbalanceDest,newbalanceDest,isFraud,isFlaggedFraud\n"
        "1,PAYMENT,9839.64,C1231006815,170136.0,160296.36,M1979787155,0.0,0.0,0,0\n"
        "1,TRANSFER,181.0,C1305486145,181.0,0.0,C553264065,0.0,0.0,1,0\n"
    )
    files = {"file": ("sample_paysim.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    response = client.post("/api/v1/transactions/upload-csv?max_rows=50", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["processed_rows"] == 2
